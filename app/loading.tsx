import { LoadingState } from "./_ui/states";

/** Shown while Today's real database work runs. Never a blank screen. */
export default function Loading() {
  return <LoadingState title="Today" rows={5} />;
}
