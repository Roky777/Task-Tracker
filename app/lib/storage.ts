/**
 * localStorage lives in the browser, not on the server, so every function here
 * must only ever be called from a Client Component's effect or event handler.
 *
 * localStorage also only stores strings, which is why tasks go through
 * JSON.stringify on the way out and JSON.parse on the way back in.
 */

import { CATEGORIES, PRIORITIES, type Task } from "./types";

const TASKS_KEY = "task-tracker.tasks.v1";
const THEME_KEY = "task-tracker.theme.v1";

export type Theme = "light" | "dark";

/**
 * Anything can end up in localStorage — a half-written value, data from an older
 * version of the app, or something another tab wrote. An unguarded JSON.parse
 * would throw inside the mount effect and leave the page permanently broken, so
 * every field is checked and bad records are dropped rather than trusted.
 */
function isValidTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const task = value as Record<string, unknown>;

  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.description === "string" &&
    typeof task.completed === "boolean" &&
    typeof task.dueDate === "string" &&
    typeof task.createdAt === "string" &&
    typeof task.dueTime === "string" &&
    PRIORITIES.includes(task.priority as never) &&
    CATEGORIES.includes(task.category as never)
  );
}

/** Returns null when nothing has been saved yet, so callers can seed instead. */
export function loadTasks(): Task[] | null {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    // Tasks saved before dueTime existed are given a default rather than
    // thrown away, so an earlier version's data still loads.
    const migrated = parsed.map((task) =>
      typeof task === "object" &&
      task !== null &&
      typeof (task as Record<string, unknown>).dueTime !== "string"
        ? { ...task, dueTime: "09:00" }
        : task,
    );

    return migrated.filter(isValidTask);
  } catch {
    // Corrupt entry — treat it as a fresh start rather than crashing the app.
    return null;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // Private browsing and full quotas both throw here. Losing persistence is
    // survivable; taking the UI down with it is not.
  }
}

export function loadTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore — the theme still applies for this session.
  }
}
