/**
 * Not found. Plain language, and a way back to something useful — a dead end
 * that only says "404" makes the user feel they broke something.
 */
export default function NotFound() {
  return (
    <>
      <h1>That page doesn&apos;t exist</h1>
      <div className="state">
        <p className="state-title">We couldn&apos;t find what you were looking for</p>
        <p className="state-body">The link may be out of date, or the page may have moved.</p>
        <a className="btn btn-secondary" href="/">Go to Today</a>
      </div>
    </>
  );
}
