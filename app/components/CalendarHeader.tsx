"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import ThemeSwitch from "./ThemeSwitch";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  InfoIcon,
  SlidersIcon,
  UsersIcon,
} from "./Icons";
import { weekHeading } from "../lib/date";
import type { Theme } from "../lib/storage";
import { STATUS_FILTERS, type StatusFilter } from "../lib/types";

type CalendarHeaderProps = {
  days: string[];
  status: StatusFilter;
  counts: Record<StatusFilter, number>;
  theme: Theme;
  onShiftWeek: (days: number) => void;
  onToday: () => void;
  onStatusChange: (status: StatusFilter) => void;
  onToggleTheme: () => void;
  onOpenFilters: () => void;
};

export default function CalendarHeader({
  days,
  status,
  counts,
  theme,
  onShiftWeek,
  onToday,
  onStatusChange,
  onToggleTheme,
  onOpenFilters,
}: CalendarHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // A dropdown should close when you click anywhere else, which means
  // listening on the document and checking whether the click landed inside.
  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="cal-head">
      <div className="cal-head-left">
        <button
          type="button"
          className="cal-arrow"
          onClick={() => onShiftWeek(-7)}
          aria-label="Previous week">
          <ArrowLeftIcon size={19} />
        </button>
        <button
          type="button"
          className="cal-arrow"
          onClick={() => onShiftWeek(7)}
          aria-label="Next week">
          <ArrowRightIcon size={19} />
        </button>

        <h2 className="cal-title">{weekHeading(days)}</h2>

        <button type="button" className="cal-today" onClick={onToday}>
          Today
        </button>
      </div>

      <div className="cal-head-right">
        <label className="cal-select">
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as StatusFilter)
            }>
            {STATUS_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option} ({counts[option]})
              </option>
            ))}
          </select>
          <ChevronDownIcon size={16} />
        </label>

        <div className="account" ref={menuRef}>
          <button
            type="button"
            className="account-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu">
            <UsersIcon size={16} />
            My Account
            <ChevronDownIcon size={15} />
          </button>

          {menuOpen ? (
            <div className="account-menu" role="menu">
              <div className="account-id">
                <span className="account-avatar" aria-hidden="true">
                  <UsersIcon size={17} />
                </span>
                <span>
                  <strong>Your tasks</strong>
                  <span className="account-sub">Saved in this browser</span>
                </span>
              </div>

              <div className="account-row">
                <span>Dark mode</span>
                <ThemeSwitch
                  checked={theme === "dark"}
                  label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  onChange={onToggleTheme}
                />
              </div>

              <button
                type="button"
                className="account-item"
                role="menuitem"
                onClick={() => {
                  onOpenFilters();
                  setMenuOpen(false);
                }}>
                <SlidersIcon size={17} />
                Filters &amp; sorting
              </button>

              <Link href="/about" className="account-item" role="menuitem">
                <InfoIcon size={17} />
                About this app
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
