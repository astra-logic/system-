/**
 * THE STATUS SYSTEM — the product's core visual vocabulary.
 *
 * Four states, four meanings, identical in every area. This is what makes the
 * product feel like one system rather than seven modules.
 *
 * ⚠ ⚪ CAN'T SAY IS NEUTRAL, NEVER RED.
 *
 *   "No" and "I don't know" are different instructions to a person. A manager
 *   who sees red goes and buys material; if the truth was "we don't have your
 *   recipe", they spent money for nothing. Every treatment below keeps them
 *   apart in colour, in mark and in word — three signals, so the distinction
 *   survives colour-blindness and a bad monitor alike.
 */
import type { ReactNode } from "react";

/** The four. No area invents a fifth. */
export type Status = "yes" | "at-risk" | "no" | "cant-say";

export const STATUS_MARK: Record<Status, string> = {
  yes: "🟢", "at-risk": "🟡", no: "🔴", "cant-say": "⚪",
};

export const STATUS_WORD: Record<Status, string> = {
  yes: "Yes", "at-risk": "At risk", no: "No", "cant-say": "Can't say",
};

/** The badge class each state maps to. ⚪ is `unknown` — hueless by design. */
const BADGE_CLASS: Record<Status, string> = {
  yes: "ok", "at-risk": "warn", no: "bad", "cant-say": "unknown",
};

/* -------------------------------------------------------------------------- */

/** A compact status marker for a table cell or a row. */
export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  return (
    <span className={`badge ${BADGE_CLASS[status]}`}>
      {STATUS_MARK[status]} {label ?? STATUS_WORD[status]}
    </span>
  );
}

/**
 * LAYER 1 — the answer.
 *
 * One mark, one word, one sentence. By contract this block carries no numbers,
 * no item codes and no dates: those are Layer 2. If a number is creeping into
 * `line`, it belongs one layer down.
 */
export function StatusBlock({
  status, line, children,
}: {
  status: Status;
  /** One sentence. No numbers, no codes, no dates. */
  line: string;
  /** Answer-level notices only — said once, never repeated per subject. */
  children?: ReactNode;
}) {
  return (
    <div className={`card status-block ${status}`}>
      <div className="status-head">
        <span className="status-mark" aria-hidden="true">{STATUS_MARK[status]}</span>
        <span className="status-word">{STATUS_WORD[status]}</span>
      </div>
      <p className="status-line">{line}</p>
      {children}
    </div>
  );
}

/**
 * The ⚪ treatment, as a first-class state rather than an absence.
 *
 * It must say three things, and Block 12 §9.4 explains why each matters:
 *   1. what is missing — the specific input, never "insufficient data"
 *   2. whether it is FIXABLE or only WAITING — a missing delivery time is a
 *      five-second fix; absent usage history is time passing, and telling the
 *      user to fix it would be dishonest
 *   3. what closing it unlocks — a gap with a stated gain is an onboarding
 *      step; a gap without one is a complaint
 */
export function CantSay({
  subject, missing, unlocks, fix,
}: {
  subject: string;
  /** What is missing, in the factory's language. */
  missing: string;
  /** What answering it would let the system do. */
  unlocks?: string;
  /** Where to supply it. Omit when the gap only closes with time. */
  fix?: { label: string; href: string };
}) {
  return (
    <div className="risk-row">
      <span className="mark" aria-hidden="true">{STATUS_MARK["cant-say"]}</span>
      <div>
        <div className="subject">{subject}</div>
        <div className="detail">{missing}</div>
        {fix ? (
          <div className="action">
            <a href={fix.href}>{fix.label}</a>
            {unlocks ? <span className="note" style={{ display: "inline", marginLeft: 6 }}>— {unlocks}</span> : null}
          </div>
        ) : (
          <div className="warn-line neutral">Nothing to fix. {unlocks ?? "This will resolve on its own."}</div>
        )}
      </div>
      <div className="trailing" />
    </div>
  );
}

/**
 * A problem that must not be buried in a table (Interface Contract Law 4).
 *
 * Subject, what is wrong, what to do, and what happens if you don't — the
 * §7.1 shape, in one row the user cannot miss.
 */
export function RiskRow({
  status, subject, detail, consequence, action, trailing,
}: {
  status: Status;
  subject: string;
  /** What is wrong, in one line. */
  detail: string;
  /** What happens if it is ignored. Omitted only when genuinely unknown. */
  consequence?: string;
  action?: { label: string; href: string };
  trailing?: ReactNode;
}) {
  return (
    <div className="risk-row">
      <span className="mark" aria-hidden="true">{STATUS_MARK[status]}</span>
      <div>
        <div className="subject">{subject}</div>
        <div className="detail">{detail}</div>
        {consequence ? <div className="consequence">{consequence}</div> : null}
        {action ? <div className="action"><a href={action.href}>{action.label}</a></div> : null}
      </div>
      <div className="trailing">{trailing}</div>
    </div>
  );
}
