"use client";

import CollapsibleSection from "./CollapsibleSection";
import SidebarTaskList from "./SidebarTaskList";
import { PlusIcon, SearchIcon } from "./Icons";
import { tasksInLastDays, tasksInRange } from "../lib/tasks";
import type { Task, TaskStats } from "../lib/types";

type SidebarProps = {
  tasks: Task[];
  weekDays: string[];
  stats: TaskStats;
  overdueCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  onAddTask: () => void;
  onToggleComplete: (id: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function Sidebar({
  tasks,
  weekDays,
  stats,
  overdueCount,
  search,
  onSearchChange,
  onAddTask,
  onToggleComplete,
  onSelect,
  onDelete,
}: SidebarProps) {
  // Each section slices the same array a different way, rather than keeping
  // three separate lists in state that could fall out of sync.
  const thisWeek = tasksInRange(tasks, weekDays);
  const last30 = tasksInLastDays(tasks, 30);
  const last90 = tasksInLastDays(tasks, 90);

  return (
    <aside className="panel">
      <header className="panel-head">
        <h1 className="panel-brand">Task Tracker</h1>
        <div className="panel-head-actions">
          <label className="panel-search">
            <SearchIcon size={16} />
            <input
              type="search"
              value={search}
              placeholder="Search"
              aria-label="Search tasks"
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="panel-icon-button"
            onClick={onAddTask}
            aria-label="Add task">
            <PlusIcon size={17} />
          </button>
        </div>
      </header>

      <CollapsibleSection title="Notifications" count={overdueCount}>
        {overdueCount === 0 ? (
          <p className="panel-empty">Nothing overdue. You are on top of it.</p>
        ) : (
          <p className="panel-empty">
            {overdueCount} {overdueCount === 1 ? "task is" : "tasks are"} past
            their due date.
          </p>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="This week"
        defaultOpen
        action={
          <button
            type="button"
            className="panel-toggle"
            onClick={onAddTask}
            aria-label="Add task to this week">
            <PlusIcon size={13} />
          </button>
        }>
        <SidebarTaskList
          tasks={thisWeek}
          emptyMessage="No tasks this week yet."
          onToggleComplete={onToggleComplete}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Last 30 Days" count={last30.length}>
        <SidebarTaskList
          tasks={last30}
          showDate
          emptyMessage="Nothing in the last 30 days."
          onToggleComplete={onToggleComplete}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Last 90 Days" count={last90.length}>
        <SidebarTaskList
          tasks={last90}
          showDate
          emptyMessage="Nothing in the last 90 days."
          onToggleComplete={onToggleComplete}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </CollapsibleSection>

      <div className="panel-promo">
        <p className="promo-kicker">Your progress</p>
        <p className="promo-title">
          {stats.completed} of {stats.total} done
        </p>
        <div
          className="promo-bar"
          role="progressbar"
          aria-valuenow={stats.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall completion">
          <span style={{ width: `${stats.percent}%` }} />
        </div>
        <p className="promo-note">
          {stats.pending === 0
            ? "Everything is finished."
            : `${stats.pending} still to go — keep going.`}
        </p>
      </div>
    </aside>
  );
}
