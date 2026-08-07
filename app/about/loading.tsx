import Loader from "../components/Loader";

/**
 * App Router convention: this is shown automatically while /about is being
 * fetched, with no state or Suspense boundary to wire up by hand.
 */
export default function AboutLoading() {
  return (
    <div className="loading">
      <Loader />
      <p>Loading…</p>
    </div>
  );
}
