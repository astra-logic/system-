import { LoadingState } from "../_ui/states";

/** Shown while the page's real database work runs. Never a blank screen. */
export default function Loading() {
  /* ⚠ Must match the page's own <h1> exactly. A skeleton that says something
     different makes the heading appear to change under the user as the page
     resolves — a flicker that reads as a bug, not as loading. */
  return <LoadingState title="Can I make it?" rows={3} />;
}
