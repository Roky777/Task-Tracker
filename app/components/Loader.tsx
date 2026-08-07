/**
 * Toppling-dominoes spinner, shown while tasks are read out of localStorage.
 *
 * Eight bars, each rotating a quarter turn on a staggered delay, so the tip
 * runs along the row. The staggering is done entirely with animation-delay in
 * CSS — the markup is just eight empty spans.
 */
export default function Loader() {
  return (
    <div className="spinner" role="status" aria-label="Loading">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
