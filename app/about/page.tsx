import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Task Tracker",
  description: "What this app does and how it was built.",
};

/**
 * A second route, added to try out the App Router. This one is a Server
 * Component: it holds no state and touches no browser API, so there is no
 * reason to ship it to the client.
 */
export default function AboutPage() {
  return (
    <div className="prose-page">
      <article className="prose">
        <Link href="/" className="back-link">
          ← Back to tasks
        </Link>

        <h1>About Task Tracker</h1>
        <p className="lead">
          A single-page task manager built to practise the fundamentals of React
          and Next.js — components, props, state, events and rendering lists.
        </p>

        <h2>What you can do</h2>
        <ul>
          <li>
            Add tasks with a title, description, priority, category, date and
            time
          </li>
          <li>See the week laid out as a calendar, with tasks placed by time</li>
          <li>Mark tasks completed and back to pending again</li>
          <li>Edit any task, and delete with a confirmation step first</li>
          <li>Filter by status, priority and category, and search by text</li>
          <li>Group the sidebar by this week, the last 30 days and the last 90</li>
          <li>Switch between light and dark mode</li>
        </ul>

        <h2>How it works</h2>
        <p>
          All tasks live in a single <code>useState</code> array on the
          dashboard. Every action — adding, toggling, editing, deleting —
          produces a brand new array rather than changing the existing one, which
          is what lets React tell that something changed.
        </p>
        <p>
          The numbers you see are never stored. Statistics, filtered lists and
          per-day progress are all recalculated from that one array on each
          render, so they cannot fall out of step with it.
        </p>
        <p>
          Tasks are saved to the browser&apos;s <code>localStorage</code>, which
          only stores strings — hence <code>JSON.stringify</code> on the way out
          and <code>JSON.parse</code> on the way back in. Because
          <code> localStorage</code> exists in the browser and not on the server,
          the dashboard is a Client Component and reads it inside an effect after
          mount.
        </p>

        <h2>Built with</h2>
        <p>Next.js (App Router), React, TypeScript and plain CSS.</p>
      </article>
    </div>
  );
}
