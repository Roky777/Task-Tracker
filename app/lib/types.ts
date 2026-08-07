/**
 * Shared shapes for the whole app. Keeping these in one place means a typo in a
 * priority string or filter name is a compile error, not a silently unstyled badge.
 */

export const PRIORITIES = ["High", "Medium", "Low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const CATEGORIES = [
  "Work",
  "Study",
  "Personal",
  "Health",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUS_FILTERS = ["All", "Pending", "Completed"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export const SORT_OPTIONS = ["Newest", "Oldest", "Title"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  /** Local calendar day, stored as "YYYY-MM-DD" so it never shifts timezone. */
  dueDate: string;
  /** Time of day as 24-hour "HH:MM"; this is what places it on the week grid. */
  dueTime: string;
  createdAt: string;
};

/** The fields the form collects. Everything else is generated on save. */
export type TaskDraft = Pick<
  Task,
  "title" | "description" | "priority" | "category" | "dueDate" | "dueTime"
>;

export type TaskStats = {
  total: number;
  completed: number;
  pending: number;
  percent: number;
};
