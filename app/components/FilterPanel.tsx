"use client";

import Drawer from "./Drawer";
import {
  CATEGORIES,
  PRIORITIES,
  SORT_OPTIONS,
  STATUS_FILTERS,
  type Priority,
  type SortOption,
  type StatusFilter,
} from "../lib/types";

type FilterPanelProps = {
  status: StatusFilter;
  priority: Priority | "All";
  category: string;
  sort: SortOption;
  search: string;
  counts: Record<StatusFilter, number>;
  onStatusChange: (value: StatusFilter) => void;
  onPriorityChange: (value: Priority | "All") => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  onClose: () => void;
};

export default function FilterPanel({
  status,
  priority,
  category,
  sort,
  search,
  counts,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onSortChange,
  onSearchChange,
  onReset,
  onClose,
}: FilterPanelProps) {
  return (
    <Drawer title="Filter" side="right" onClose={onClose}>
      <section className="drawer-section">
        <h3>Status</h3>
        <div className="bracket-list">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              className={`bracket ${status === option ? "active" : ""}`}
              onClick={() => onStatusChange(option)}
              aria-pressed={status === option}>
              [ {option} ] <span className="bracket-count">{counts[option]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="drawer-section">
        <h3>Search</h3>
        <input
          type="search"
          className="plain-input"
          value={search}
          placeholder="Search title or description"
          aria-label="Search tasks"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </section>

      <section className="drawer-section">
        <h3>Priority</h3>
        <div className="chip-row">
          {/* "All" is prepended to the real priorities so the list stays in one
              place: the options come from PRIORITIES, not a second hardcoded list. */}
          {(["All", ...PRIORITIES] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${priority === option ? "active" : ""}`}
              onClick={() => onPriorityChange(option)}
              aria-pressed={priority === option}>
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="drawer-section">
        <h3>Category</h3>
        <div className="chip-row">
          {(["All", ...CATEGORIES] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${category === option ? "active" : ""}`}
              onClick={() => onCategoryChange(option)}
              aria-pressed={category === option}>
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="drawer-section">
        <h3>Sort by</h3>
        <div className="chip-row">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${sort === option ? "active" : ""}`}
              onClick={() => onSortChange(option)}
              aria-pressed={sort === option}>
              {option}
            </button>
          ))}
        </div>
      </section>

      <button type="button" className="outline-button" onClick={onReset}>
        Reset filters
      </button>
    </Drawer>
  );
}
