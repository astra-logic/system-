/**
 * LOADING · EMPTY · ERROR · METRIC · DISCLOSURE
 *
 * None of the first three existed before Block 13. Every page is a server
 * component doing real database work, so a slow query rendered a BLANK WHITE
 * SCREEN and a thrown error rendered an unstyled stack trace.
 *
 * That matters more here than in most products: the whole thesis is that the
 * system says what it does not know. An unhandled crash is the loudest
 * possible violation of that promise.
 */
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/* Loading — a skeleton of the shape being loaded, never a bare spinner.       */
/* A spinner says "wait"; a skeleton says "here is what is coming".            */
/* -------------------------------------------------------------------------- */

export function LoadingState({ title, rows = 4 }: { title: string; rows?: number }) {
  return (
    <>
      <h1>{title}</h1>
      <div className="card" aria-busy="true" aria-live="polite">
        <span className="note" style={{ margin: 0 }}>Working this out…</span>
        <div className="skeleton" style={{ marginTop: 16 }}>
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className={`skeleton-bar ${i === 0 ? "tall w-60" : i % 2 ? "w-80" : "w-40"}`} />
          ))}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty — state, cause, and the next action. Never just "no data".           */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  title, body, action,
}: {
  /** What is true, in the user's terms. */
  title: string;
  /** Why it is true, and what would change it. */
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="state">
      <p className="state-title">{title}</p>
      <p className="state-body">{body}</p>
      {action ? <a className="btn btn-secondary" href={action.href}>{action.label}</a> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Error — human-readable, never a stack trace.                                */
/* -------------------------------------------------------------------------- */

/**
 * ⚠ Two things this must always do, and both are trust obligations:
 *   - say that NOTHING WAS CHANGED, because the user's first fear is that they
 *     broke something
 *   - offer a way forward that is not "try again" alone
 *
 * It must never expose an exception message: those name tables and columns.
 */
export function ErrorState({
  title = "We couldn't load this",
  body = "Something went wrong on our side. Nothing was changed.",
  retry,
}: {
  title?: string;
  body?: string;
  retry?: ReactNode;
}) {
  return (
    <div className="state error" role="alert">
      <p className="state-title">{title}</p>
      <p className="state-body">{body}</p>
      {retry}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Metric — one number that looks as important as it is.                       */
/* -------------------------------------------------------------------------- */

export function Metric({
  label, value, unit, note,
}: {
  label: string;
  /** Already formatted. This component never formats — lib/ui/format.ts does. */
  value: string;
  unit?: string;
  /** One line on how solid the figure is, where that changes the decision. */
  note?: string;
}) {
  return (
    <div>
      <span className="metric-label">{label}</span>
      <div className="figure">
        {value}
        {unit ? <span className="cur">{unit}</span> : null}
      </div>
      {note ? <p className="note" style={{ marginTop: 4 }}>{note}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Disclosure — Layers 3 and 4. Two levels, and no more.                       */
/* -------------------------------------------------------------------------- */

/**
 * A third disclosure level would let engineers defer decisions about what
 * matters, so the system deliberately offers only two:
 *
 *   "Why?"              Layer 3 — the reason
 *   "Show the numbers"  Layer 4 — the evidence
 *
 * Both expand IN PLACE. A modal loses the context that made the question worth
 * asking; a new page loses the list the user was scanning.
 */
export function Disclosure({
  summary, children, open = false,
}: {
  summary: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details className="disclosure" open={open}>
      <summary>{summary}</summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}

/* -------------------------------------------------------------------------- */
/* Page header                                                                 */
/* -------------------------------------------------------------------------- */

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <>
      <h1>{title}</h1>
      {sub ? <p className="sub">{sub}</p> : null}
    </>
  );
}
