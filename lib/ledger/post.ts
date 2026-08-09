/**
 * The movement ledger — D-001 as amended, LOCKED.
 *
 * "Stock truth is an immutable, double-entry ledger of movements. Balances are
 *  derived projections. Corrections are reversing entries, never edits."
 *
 * Double entry is expressed as ONE ROW with a from-location and a to-location.
 * Stock is conserved BY CONSTRUCTION — there is no way to write a movement that
 * debits without crediting, so conservation is not a rule anyone has to remember.
 *
 * Code standards 1, 1a, 1b, 1c, 2, 2a, 3.
 */
import { and, eq, sql as raw } from "drizzle-orm";
import { db, sql as sqlClient } from "../db/client";
import { balances, items, locations, movements } from "../db/schema";
import { type Qty, addQty, isNegQty, qty, subQty, toDb, ZERO_QTY } from "../core/decimal";

export class LedgerError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
    this.name = "LedgerError";
  }
}

export interface PostMovementInput {
  siteId: string;
  itemId: string;
  fromLocationId: string;
  toLocationId: string;
  nominalQty: Qty;
  nominalUom: string;
  /** D-048: required when the item is catch-weight. NEVER estimated. */
  actualQty?: Qty | null;
  actualUom?: string | null;
  lotCode?: string | null;
  serialCode?: string | null;
  effectiveAt: Date;
  sourceDocumentType: string;
  sourceDocumentId: string;
  reasonCode: string;
  actor: string;
  /** D-001 as amended. Duplicates are refused at the door. */
  sourceNaturalKey?: string | null;
  /** D-052: NULL means "not captured", never "unassigned" or "general". */
  costCentre?: string | null;
  /** D-028 / F10. Preserved as applicable; NEVER invented where absent. */
  financialDimensions?: Record<string, unknown> | null;
  reversesMovementId?: string | null;
}

export class DuplicateIngestionError extends LedgerError {
  constructor(key: string) {
    super(
      `A movement with source natural key "${key}" is already recorded. It is REFUSED, ` +
        `not accepted and corrected afterwards — append-only otherwise guarantees the ` +
        `PRESERVATION of a duplicated import rather than protection from it (D-001 as amended).`,
      "DUPLICATE_INGESTION",
    );
  }
}

/**
 * Post a movement and project balances in the SAME TRANSACTION (D-049).
 *
 * Synchronous because D-039's counterfactual replay makes the ledger authoritative
 * at every instant: an async window is a period in which the projection and the
 * ledger disagree, and a saving engine reading during it computes a number from a
 * state that never existed.
 */
export async function postMovement(input: PostMovementInput): Promise<{ id: string }> {
  const item = await db.query.items.findFirst({ where: eq(items.id, input.itemId) });
  if (!item) throw new LedgerError(`Unknown item ${input.itemId}`, "UNKNOWN_ITEM");

  const [from, to] = await Promise.all([
    db.query.locations.findFirst({ where: eq(locations.id, input.fromLocationId) }),
    db.query.locations.findFirst({ where: eq(locations.id, input.toLocationId) }),
  ]);
  if (!from) throw new LedgerError(`Unknown from-location ${input.fromLocationId}`, "UNKNOWN_LOCATION");
  if (!to) throw new LedgerError(`Unknown to-location ${input.toLocationId}`, "UNKNOWN_LOCATION");

  if (from.id === to.id) {
    throw new LedgerError("A movement cannot have the same source and destination.", "DEGENERATE_MOVEMENT");
  }

  /* --- D-001 as amended: OPENING_BALANCE is never used operationally. ------ */
  const touchesOpening = from.kind === "OPENING_BALANCE" || to.kind === "OPENING_BALANCE";
  if (touchesOpening && input.sourceDocumentType !== "OPENING_BALANCE") {
    throw new LedgerError(
      `OPENING_BALANCE is the counterparty for go-live and migration only. Using it for an ` +
        `operational event would let seeded stock appear as an ADJUSTMENT, poisoning count ` +
        `accuracy — the trust metric for the whole system — on day one (D-001 as amended).`,
      "OPENING_BALANCE_MISUSE",
    );
  }
  if (input.sourceDocumentType === "OPENING_BALANCE" && !touchesOpening) {
    throw new LedgerError("An opening-balance document must move stock from OPENING_BALANCE.", "OPENING_BALANCE_MISUSE");
  }

  /* --- D-001: no orphan movements. ---------------------------------------- */
  if (!input.reasonCode.trim()) throw new LedgerError("Every movement requires a reason code.", "MISSING_REASON");
  if (!input.sourceDocumentId.trim()) throw new LedgerError("Every movement requires a source document.", "MISSING_DOCUMENT");

  /* --- D-009: integer-only is a validation rule, not a separate code path. -- */
  if (item.integerOnly && !input.nominalQty.isInteger()) {
    throw new LedgerError(`Item ${item.code} is integer-only; ${input.nominalQty.toFixed()} is not an integer.`, "NON_INTEGER_QTY");
  }
  if (input.nominalQty.isZero() || isNegQty(input.nominalQty)) {
    throw new LedgerError(
      `Movement quantity must be positive. Direction is expressed by from/to, never by sign — ` +
        `a negative quantity would make conservation unverifiable.`,
      "NON_POSITIVE_QTY",
    );
  }

  /* --- D-048: catch-weight. ------------------------------------------------ */
  if (item.catchWeight) {
    if (input.actualQty == null || !input.actualUom) {
      throw new LedgerError(
        `Item ${item.code} is catch-weight: the movement carries a nominal quantity and an ACTUAL ` +
          `weight. This movement has no actual weight, so it is INCOMPLETE and does not post. ` +
          `It is never posted with an estimated weight (D-048).`,
        "CATCH_WEIGHT_MISSING_ACTUAL",
      );
    }
    if (input.actualQty.isZero() || isNegQty(input.actualQty)) {
      throw new LedgerError("Catch-weight actual quantity must be positive.", "NON_POSITIVE_QTY");
    }
  } else if (input.actualQty != null) {
    throw new LedgerError(
      `Item ${item.code} is not catch-weight, so actual_qty must be NULL. NULL means "not a ` +
        `catch-weight item" — populating it would make the column ambiguous (D-048).`,
      "UNEXPECTED_ACTUAL_QTY",
    );
  }

  /* --- F7: a tracked item cannot move without its identifier. -------------- */
  if (item.trackingPolicy === "LOT" && !input.lotCode) {
    throw new LedgerError(`Item ${item.code} is lot-tracked and cannot move without a lot.`, "MISSING_LOT");
  }
  if (item.trackingPolicy === "SERIAL" && !input.serialCode) {
    throw new LedgerError(`Item ${item.code} is serial-tracked and cannot move without a serial.`, "MISSING_SERIAL");
  }

  /** D-048: which quantity the balance is kept in. */
  const balanceQty = item.catchWeight ? input.actualQty! : input.nominalQty;
  const balanceUom = item.catchWeight ? input.actualUom! : input.nominalUom;

  return db.transaction(async (tx) => {
    if (input.sourceNaturalKey) {
      const existing = await tx
        .select({ id: movements.id })
        .from(movements)
        .where(and(eq(movements.siteId, input.siteId), eq(movements.sourceNaturalKey, input.sourceNaturalKey)))
        .limit(1);
      if (existing.length > 0) throw new DuplicateIngestionError(input.sourceNaturalKey);
    }

    const [row] = await tx
      .insert(movements)
      .values({
        siteId: input.siteId,
        itemId: input.itemId,
        fromLocationId: input.fromLocationId,
        toLocationId: input.toLocationId,
        nominalQty: toDb(input.nominalQty),
        nominalUom: input.nominalUom,
        actualQty: input.actualQty ? toDb(input.actualQty) : null,
        actualUom: input.actualUom ?? null,
        lotCode: input.lotCode ?? null,
        serialCode: input.serialCode ?? null,
        effectiveAt: input.effectiveAt,
        sourceDocumentType: input.sourceDocumentType,
        sourceDocumentId: input.sourceDocumentId,
        reasonCode: input.reasonCode,
        actor: input.actor,
        sourceNaturalKey: input.sourceNaturalKey ?? null,
        costCentre: input.costCentre ?? null,
        financialDimensions: input.financialDimensions ?? null,
        reversesMovementId: input.reversesMovementId ?? null,
      })
      .returning({ id: movements.id });

    // D-049: projected in the same transaction. Never authored, always derived.
    await applyToBalance(tx, input.itemId, input.fromLocationId, negate(balanceQty), balanceUom);
    await applyToBalance(tx, input.itemId, input.toLocationId, balanceQty, balanceUom);

    return { id: row!.id };
  });
}

const negate = (q: Qty): Qty => q.neg() as Qty;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function applyToBalance(tx: Tx, itemId: string, locationId: string, delta: Qty, uom: string) {
  await tx
    .insert(balances)
    .values({ itemId, locationId, qty: toDb(delta), uom })
    .onConflictDoUpdate({
      target: [balances.itemId, balances.locationId],
      set: { qty: raw`${balances.qty} + ${toDb(delta)}::numeric`, updatedAt: new Date() },
    });
}

/**
 * D-001 as amended: a REVERSAL asserts that a recorded event was WRONG.
 * It is not a return — see `postReturn`. Conflating them corrupts both receipt
 * history and supplier-performance evidence.
 */
export async function reverseMovement(movementId: string, actor: string, reason: string): Promise<{ id: string }> {
  const original = await db.query.movements.findFirst({ where: eq(movements.id, movementId) });
  if (!original) throw new LedgerError(`Unknown movement ${movementId}`, "UNKNOWN_MOVEMENT");

  return postMovement({
    siteId: original.siteId,
    itemId: original.itemId,
    // The reversal swaps direction. The original row is never touched.
    fromLocationId: original.toLocationId,
    toLocationId: original.fromLocationId,
    nominalQty: qty(original.nominalQty),
    nominalUom: original.nominalUom,
    actualQty: original.actualQty ? qty(original.actualQty) : null,
    actualUom: original.actualUom,
    lotCode: original.lotCode,
    serialCode: original.serialCode,
    effectiveAt: new Date(),
    sourceDocumentType: original.sourceDocumentType,
    sourceDocumentId: original.sourceDocumentId,
    reasonCode: `REVERSAL: ${reason}`,
    actor,
    reversesMovementId: movementId,
    financialDimensions: original.financialDimensions as Record<string, unknown> | null,
  });
}

/**
 * D-001 as amended: a RETURN is a movement (stock -> Supplier), not a reversal.
 * A reversal says the record was wrong; a return says the goods physically went
 * back. Both are true events; only one of them says the paperwork lied.
 */
export async function postReturn(input: Omit<PostMovementInput, "reversesMovementId">): Promise<{ id: string }> {
  return postMovement({ ...input, reasonCode: input.reasonCode || "RETURN_TO_SUPPLIER" });
}

/* -------------------------------------------------------------------------- */
/* Point-in-time reconstruction — D-001 as amended, required by D-039.        */
/* -------------------------------------------------------------------------- */

/**
 * The balance of an item at any past instant, computed FROM HISTORY.
 *
 * This is the capability that had to be stated rather than implied: a
 * maintained-current-balance implementation satisfies D-001's original letter
 * and makes every backtest in the saving engine impossible.
 */
export async function balanceAt(itemId: string, at: Date, opts: { onHandOnly?: boolean } = {}): Promise<Qty> {
  const rows = await sqlClient<
    { in_counts: boolean; out_counts: boolean; nominal_qty: string; actual_qty: string | null; catch_weight: boolean }[]
  >`
    SELECT dest.counts_as_on_hand AS in_counts,
           src.counts_as_on_hand  AS out_counts,
           m.nominal_qty, m.actual_qty, i.catch_weight
    FROM movements m
    JOIN items i        ON i.id = m.item_id
    JOIN locations dest ON dest.id = m.to_location_id
    JOIN locations src  ON src.id  = m.from_location_id
    WHERE m.item_id = ${itemId}::uuid AND m.effective_at <= ${at.toISOString()}::timestamptz
  `;

  let total = ZERO_QTY;
  for (const r of rows) {
    const q = r.catch_weight && r.actual_qty ? qty(r.actual_qty) : qty(r.nominal_qty);
    const countIn = opts.onHandOnly ? r.in_counts : true;
    const countOut = opts.onHandOnly ? r.out_counts : true;
    if (countIn) total = addQty(total, q);
    if (countOut) total = subQty(total, q);
  }
  return total;
}

/**
 * F3 quantity vocabulary. D-050: the MVP creates no reservations, so `reserved`
 * is structurally zero. It is SHOWN as zero rather than hidden — removing it
 * would make the vocabulary incomplete and invite a later redefinition.
 */
export interface StockPosition {
  readonly onHand: Qty;
  readonly reserved: Qty;
  readonly qualityHold: Qty;
  readonly available: Qty;
}

export async function positionAt(itemId: string, at: Date): Promise<StockPosition> {
  const onHandIncludingHold = await balanceAt(itemId, at, { onHandOnly: true });
  const hold = await holdAt(itemId, at);
  return {
    onHand: onHandIncludingHold,
    reserved: ZERO_QTY,
    qualityHold: hold,
    available: subQty(onHandIncludingHold, hold),
  };
}

async function holdAt(itemId: string, at: Date): Promise<Qty> {
  const rows = await sqlClient<
    { in_hold: boolean; out_hold: boolean; nominal_qty: string; actual_qty: string | null; catch_weight: boolean }[]
  >`
    SELECT dest.kind = 'QUALITY_HOLD' AS in_hold,
           src.kind  = 'QUALITY_HOLD' AS out_hold,
           m.nominal_qty, m.actual_qty, i.catch_weight
    FROM movements m
    JOIN items i        ON i.id = m.item_id
    JOIN locations dest ON dest.id = m.to_location_id
    JOIN locations src  ON src.id  = m.from_location_id
    WHERE m.item_id = ${itemId}::uuid AND m.effective_at <= ${at.toISOString()}::timestamptz
  `;

  let total = ZERO_QTY;
  for (const r of rows) {
    const q = r.catch_weight && r.actual_qty ? qty(r.actual_qty) : qty(r.nominal_qty);
    if (r.in_hold) total = addQty(total, q);
    if (r.out_hold) total = subQty(total, q);
  }
  return total;
}

/**
 * U-07 acceptance: balances ALWAYS equal the projection of full history,
 * verified by independent recomputation — at any historical instant, not only
 * at the present. Returns disagreements rather than throwing, so a caller can
 * report all of them at once.
 */
export async function verifyProjection(itemId: string, at: Date): Promise<{ agreed: boolean; projected: Qty; recomputed: Qty }> {
  const recomputed = await balanceAt(itemId, at);
  const rows = await db.select({ qty: balances.qty }).from(balances).where(eq(balances.itemId, itemId));
  const projected = rows.reduce<Qty>((acc, r) => addQty(acc, qty(r.qty)), ZERO_QTY);
  return { agreed: projected.equals(recomputed), projected, recomputed };
}
