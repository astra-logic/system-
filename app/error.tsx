"use client";
/**
 * The root error boundary.
 *
 * ⚠ Next.js requires this to be a client component — it is the only one in the
 * application, and it exists so a thrown error never reaches the user as an
 * unstyled stack trace.
 *
 * The exception message is deliberately NOT shown: exception text names tables,
 * columns and constraints, which is exactly the internal architecture the
 * vocabulary rule keeps out of the interface.
 */
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Visible to an operator in the server log; never to the user.
    console.error(error);
  }, [error]);

  return (
    <>
      <h1>Something went wrong</h1>
      <div className="state error" role="alert">
        <p className="state-title">We couldn&apos;t load this page</p>
        <p className="state-body">
          The problem is on our side. <strong>Nothing was changed</strong> — your stock, orders and
          settings are exactly as they were.
        </p>
        <button className="btn btn-secondary" onClick={reset}>Try again</button>
      </div>
    </>
  );
}
