"use client";

import { useState, type ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  /** Rendered on the right of the header; usually an add button. */
  action?: ReactNode;
  children: ReactNode;
};

/**
 * The dark sidebar cards. Each one owns its own open/closed state, because
 * nothing outside needs to know whether a section is expanded.
 */
export default function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  action,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`panel-card ${open ? "open" : ""}`}>
      <div className="panel-card-head">
        <button
          type="button"
          className="panel-card-title"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}>
          <span>{title}</span>
          {count !== undefined && count > 0 ? (
            <span className="pill-count">{count}</span>
          ) : null}
        </button>

        <span className="panel-card-action">
          {action}
          <button
            type="button"
            className="panel-toggle"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}>
            {open ? "−" : "+"}
          </button>
        </span>
      </div>

      {/* Collapsed sections are removed entirely rather than hidden, so their
          contents are not read out by screen readers or tabbed into. */}
      {open ? <div className="panel-card-body">{children}</div> : null}
    </section>
  );
}
