/**
 * Pure task logic — no React, no browser APIs. Every function here takes data in
 * and returns new data out, which keeps state updates in the page immutable and
 * makes each rule easy to reason about on its own.
 */

import { addDays, isWithinLastDays, todayKey, toMinutes } from "./date";
import {
  PRIORITIES,
  type Priority,
  type SortOption,
  type StatusFilter,
  type Task,
  type TaskDraft,
  type TaskStats,
} from "./types";

/** High sorts above Medium sorts above Low, whatever order the array is in. */
const PRIORITY_RANK: Record<Priority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

export function createTask(draft: TaskDraft): Task {
  return {
    ...draft,
    title: draft.title.trim(),
    description: draft.description.trim(),
    // randomUUID never collides; Date.now() does when two tasks are added in
    // the same millisecond, which duplicates React keys and breaks delete.
    id: crypto.randomUUID(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function getStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, pending, percent };
}

export function tasksOnDate(tasks: Task[], dateKey: string): Task[] {
  // Sorted by time so the day column reads top to bottom like a schedule.
  return tasks
    .filter((task) => task.dueDate === dateKey)
    .sort((a, b) => toMinutes(a.dueTime) - toMinutes(b.dueTime));
}

/** Tasks falling anywhere in the given set of days, e.g. the visible week. */
export function tasksInRange(tasks: Task[], dateKeys: string[]): Task[] {
  return tasks.filter((task) => dateKeys.includes(task.dueDate));
}

/** Tasks due in the last N days — powers the "Last 30 / 90 Days" sections. */
export function tasksInLastDays(tasks: Task[], days: number): Task[] {
  return tasks
    .filter((task) => isWithinLastDays(task.dueDate, days))
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
}

/**
 * The next pending task from now onwards, shown in the bar along the bottom.
 * Returns null once everything upcoming is done.
 */
export function nextUpNow(tasks: Task[]): Task | null {
  const today = todayKey();

  const upcoming = tasks
    .filter((task) => !task.completed && task.dueDate >= today)
    .sort((a, b) => {
      const byDate = a.dueDate.localeCompare(b.dueDate);
      return byDate !== 0 ? byDate : toMinutes(a.dueTime) - toMinutes(b.dueTime);
    });

  return upcoming[0] ?? null;
}

/** Pending tasks whose date has passed — the notification count. */
export function overdueTasks(tasks: Task[]): Task[] {
  const today = todayKey();
  return tasks.filter((task) => !task.completed && task.dueDate < today);
}

export type TaskQuery = {
  /** A "YYYY-MM-DD" key, or null to ignore the date entirely. */
  date: string | null;
  status: StatusFilter;
  priority: Priority | "All";
  category: string;
  search: string;
  sort: SortOption;
};

/**
 * Applies every active filter, then sorts. Each filter is a separate `filter()`
 * pass so a failing rule is obvious; the arrays are small enough that chaining
 * them costs nothing.
 */
export function queryTasks(tasks: Task[], query: TaskQuery): Task[] {
  const term = query.search.trim().toLowerCase();

  const filtered = tasks
    .filter((task) => query.date === null || task.dueDate === query.date)
    .filter((task) => {
      if (query.status === "Pending") return !task.completed;
      if (query.status === "Completed") return task.completed;
      return true;
    })
    .filter(
      (task) => query.priority === "All" || task.priority === query.priority,
    )
    .filter(
      (task) => query.category === "All" || task.category === query.category,
    )
    .filter((task) => {
      if (term === "") return true;
      return (
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term)
      );
    });

  return sortTasks(filtered, query.sort);
}

function sortTasks(tasks: Task[], sort: SortOption): Task[] {
  // Copy first: sort() mutates, and mutating state (even a filtered copy) is a
  // habit worth not forming.
  const copy = [...tasks];

  if (sort === "Title") {
    return copy.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sort === "Oldest") {
    return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type PriorityGroup = {
  priority: Priority;
  tasks: Task[];
};

/**
 * Buckets tasks under High / Medium / Low headings for the list gutter. Empty
 * groups are dropped so the gutter only labels rows that actually exist.
 */
export function groupByPriority(tasks: Task[]): PriorityGroup[] {
  return PRIORITIES.map((priority) => ({
    priority,
    tasks: tasks.filter((task) => task.priority === priority),
  }))
    .filter((group) => group.tasks.length > 0)
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}

/**
 * Seeds a first-time visitor so the dashboard has something to show. Dates are
 * relative to today, so the sample tasks always land in the visible week.
 */
export function seedTasks(): Task[] {
  const today = todayKey();
  const now = Date.now();

  const drafts: Array<TaskDraft & { completed: boolean }> = [
    {
      title: "Learn Next.js Components",
      description:
        "Complete the assignment on components, props and state, then review the parts that felt shaky.",
      priority: "High",
      category: "Study",
      dueDate: today,
      dueTime: "09:00",
      completed: false,
    },
    {
      title: "Explore Open Source Repositories",
      description:
        "Find three repositories related to your domain and read through how they structure their code.",
      priority: "Medium",
      category: "Study",
      dueDate: today,
      dueTime: "11:00",
      completed: true,
    },
    {
      title: "Write the project README",
      description:
        "Document the features, the tech stack and the setup steps so anyone can run the project locally.",
      priority: "Low",
      category: "Work",
      dueDate: today,
      dueTime: "14:30",
      completed: true,
    },
    {
      title: "Evening stretch session",
      description: "Twenty minutes away from the screen. Posture, then sleep.",
      priority: "Medium",
      category: "Health",
      dueDate: addDays(today, 1),
      dueTime: "18:00",
      completed: false,
    },
    {
      title: "Weekly design review",
      description: "Walk through the layout changes and collect feedback.",
      priority: "High",
      category: "Work",
      dueDate: addDays(today, 1),
      dueTime: "10:00",
      completed: false,
    },
    {
      title: "Plan next week",
      description: "Block out the deep-work slots before the calendar fills up.",
      priority: "Low",
      category: "Personal",
      dueDate: addDays(today, 2),
      dueTime: "16:00",
      completed: false,
    },
  ];

  return drafts.map((draft, index) => ({
    ...draft,
    id: `seed-${index + 1}`,
    // Stagger createdAt so "Newest" has a stable, meaningful order.
    createdAt: new Date(now - index * 60_000).toISOString(),
  }));
}
