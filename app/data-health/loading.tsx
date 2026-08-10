import { LoadingState } from "../_ui/states";

/** Shown while the page's real database work runs. Never a blank screen. */
export default function Loading() {
  return <LoadingState title="Data health" rows={5} />;
}
