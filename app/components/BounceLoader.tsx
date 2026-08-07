/**
 * Ball-down-the-steps loader, used while tasks are read out of localStorage.
 *
 * There is no markup for the ball or the steps: `::before` is the ball, and
 * `::after` is a single 7px bar whose three box-shadows are the other steps.
 * Animating the shadow list is what makes the staircase appear to scroll past.
 */
export default function BounceLoader() {
  return <div className="ball-loader" role="status" aria-label="Loading" />;
}
