/**
 * Intervention signatures and contradiction control — D-029, LOCKED.
 *
 * "Every Opportunity must expose an intervention signature sufficient to
 *  determine whether it conflicts with another Opportunity."
 *
 * Minimum signature: typed subject · affected dimensions · direction per
 * dimension · effect window. The ORIGINATING MECHANISM populates it, because a
 * mechanism cannot detect a conflict with another mechanism — it never sees the
 * other side. That is why this is a cross-cutting rule rather than a per-
 * mechanism one: mechanism-local control is not merely weaker, it is
 * structurally impossible.
 *
 * Double counting (D-020) and contradiction (D-029) are SEPARATE controls:
 *   D-020 asks "is this the same money twice?"  — invisible unless audited
 *   D-029 asks "can both actions be taken?"     — immediately visible
 *
 * Code standards 10g-1, 10g-2, 10g-4.
 */

/**
 * W-31 asked whether this vocabulary is locked or extensible. Part 2.3 answered
 * it by demonstration: Mechanism 03 added seven dimensions, so it must be
 * extensible. It is a string, and the constants below are the known members.
 */
export const DIMENSION = {
  ORDER_QUANTITY: "order_quantity",
  ORDER_FREQUENCY: "order_frequency",
  REORDER_POINT: "reorder_point",
  /** Mechanism 01's lever. reorder_point = lead_time_demand + safety_stock. */
  LEAD_TIME_DEMAND: "lead_time_demand",
  SAFETY_STOCK: "safety_stock",
  ON_HAND_LEVEL: "on_hand_level",
  SUPPLIER_SHARE: "supplier_share",
  UNIT_PRICE: "unit_price",
  MASTER_LEAD_TIME: "master_lead_time",
} as const;

export type Direction = "INCREASE" | "DECREASE" | "SET";

export interface SubjectRef {
  /** Typed, per D-029's minimum signature — an item and a supplier are not comparable. */
  readonly type: "ITEM" | "SUPPLIER" | "ITEM_SUPPLIER";
  readonly itemId?: string;
  readonly supplierId?: string;
}

export interface DimensionEffect {
  readonly dimension: string;
  readonly direction: Direction;
  readonly windowFrom: Date;
  readonly windowTo: Date;
}

export interface InterventionSignature {
  readonly subject: SubjectRef;
  readonly effects: readonly DimensionEffect[];
}

export class MissingSignatureError extends Error {
  constructor(id: string) {
    super(
      `Opportunity ${id} declares no intervention signature and CANNOT BE PRESENTED. ` +
        `A mechanism that cannot declare a signature cannot be integrated — that is the ` +
        `enforcement, and it is structural rather than procedural (D-029).`,
    );
    this.name = "MissingSignatureError";
  }
}

export function assertPresentable(id: string, sig: InterventionSignature | null | undefined): asserts sig is InterventionSignature {
  if (!sig || sig.effects.length === 0) throw new MissingSignatureError(id);
}

function sameSubject(a: SubjectRef, b: SubjectRef): boolean {
  if (a.itemId && b.itemId && a.itemId === b.itemId) return true;
  if (a.supplierId && b.supplierId && a.supplierId === b.supplierId) return true;
  return false;
}

const windowsOverlap = (a: DimensionEffect, b: DimensionEffect) => a.windowFrom <= b.windowTo && b.windowFrom <= a.windowTo;

const opposed = (a: Direction, b: Direction) =>
  (a === "INCREASE" && b === "DECREASE") || (a === "DECREASE" && b === "INCREASE");

export interface Contradiction {
  readonly leftId: string;
  readonly rightId: string;
  readonly dimension: string;
  readonly why: string;
}

/**
 * Conflict requires ALL FOUR to intersect: subject, dimension, opposed
 * direction, and overlapping window. Fewer than four is not a contradiction.
 *
 * This is what lets Mechanism 01 and Mechanism 03's buffer subtype COMPOSE
 * rather than falsely conflict: the reorder point decomposes into lead-time
 * demand and safety stock, so the two act on DIFFERENT dimensions of the same
 * parameter. Treating the pair as inherently contradictory would suppress a
 * legitimate combined correction.
 */
export function detectContradictions(
  opportunities: readonly { id: string; signature: InterventionSignature }[],
): readonly Contradiction[] {
  const found: Contradiction[] = [];
  for (let i = 0; i < opportunities.length; i++) {
    for (let j = i + 1; j < opportunities.length; j++) {
      const a = opportunities[i]!;
      const b = opportunities[j]!;
      if (!sameSubject(a.signature.subject, b.signature.subject)) continue;
      for (const ea of a.signature.effects) {
        for (const eb of b.signature.effects) {
          if (ea.dimension !== eb.dimension) continue;
          if (!opposed(ea.direction, eb.direction)) continue;
          if (!windowsOverlap(ea, eb)) continue;
          found.push({
            leftId: a.id,
            rightId: b.id,
            dimension: ea.dimension,
            why:
              `Both act on ${ea.dimension} for the same subject in overlapping windows, in ` +
              `opposite directions (${ea.direction} vs ${eb.direction}). Both cannot be executed.`,
          });
        }
      }
    }
  }
  return found;
}

/**
 * D-029's allowed resolutions. Which one applies when is W-24, deliberately
 * deferred to the first real conflict — so this type constrains the answer
 * without inventing it.
 */
export type Resolution = "NET" | "SUSPEND" | "SUPERSEDE" | "ADJUDICATE";

export class UnresolvedContradictionError extends Error {
  constructor(c: Contradiction) {
    super(
      `Opportunities ${c.leftId} and ${c.rightId} contradict on ${c.dimension} and must resolve ` +
        `— net, suspend, supersede or adjudicate — BEFORE presentation. Presenting both would ` +
        `produce recommendations that cannot both be executed (D-029).`,
    );
    this.name = "UnresolvedContradictionError";
  }
}
