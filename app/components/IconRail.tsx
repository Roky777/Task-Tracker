"use client";

import Link from "next/link";

import { InfoIcon, PanelIcon, PlusIcon, SlidersIcon, UsersIcon } from "./Icons";

type IconRailProps = {
  /** Day number shown in the calendar tile, so the rail reflects today. */
  today: number;
  onAddTask: () => void;
  onOpenFilters: () => void;
};

/** The narrow strip down the far left: brand, section icons, then add. */
export default function IconRail({
  today,
  onAddTask,
  onOpenFilters,
}: IconRailProps) {
  return (
    <nav className="rail" aria-label="Sections">
      <span className="rail-logo" aria-label="Task Tracker">
        <LogoMark />
      </span>

      <span className="rail-date" aria-label={`Today is day ${today}`}>
        {String(today).padStart(2, "0")}
      </span>

      <button
        type="button"
        className="rail-button active"
        aria-label="Calendar"
        aria-current="page">
        <PanelIcon size={19} />
      </button>

      <button
        type="button"
        className="rail-button"
        onClick={onOpenFilters}
        aria-label="Filters">
        <SlidersIcon size={19} />
      </button>

      <Link href="/about" className="rail-button" aria-label="About">
        <InfoIcon size={19} />
      </Link>

      <span className="rail-spacer" />

      <button
        type="button"
        className="rail-add"
        onClick={onAddTask}
        aria-label="Add task">
        <PlusIcon size={20} />
      </button>

      <span className="rail-avatar" aria-hidden="true">
        <UsersIcon size={16} />
      </span>
    </nav>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3v13a5 5 0 0 0 5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="15" cy="8" r="4" fill="currentColor" />
    </svg>
  );
}
