"use client";

import { useCallback, useEffect, useState } from "react";

import BounceLoader from "./components/BounceLoader";
import CalendarHeader from "./components/CalendarHeader";
import ConfirmDialog from "./components/ConfirmDialog";
import FilterPanel from "./components/FilterPanel";
import IconRail from "./components/IconRail";
import NowBar from "./components/NowBar";
import Sidebar from "./components/Sidebar";
import TaskDetail from "./components/TaskDetail";
import TaskDialog from "./components/TaskDialog";
import Toasts, { type Toast } from "./components/Toasts";
import WeekGrid from "./components/WeekGrid";
import { addDays, dayNumber, nowMinutes, todayKey, weekOf } from "./lib/date";
import {
  createTask,
  getStats,
  nextUpNow,
  overdueTasks,
  queryTasks,
  seedTasks,
  tasksInRange,
  type TaskQuery,
} from "./lib/tasks";
import {
  loadTasks,
  loadTheme,
  saveTasks,
  saveTheme,
  type Theme,
} from "./lib/storage";
import type {
  Priority,
  SortOption,
  StatusFilter,
  Task,
  TaskDraft,
} from "./lib/types";

export default function Home() {
  // The single source of truth. Everything on screen is derived from this.
  const [tasks, setTasks] = useState<Task[]>([]);
  // Nothing depending on localStorage or the current date can render before
  // mount, or the server HTML and the client's first render would disagree.
  const [ready, setReady] = useState(false);

  const [theme, setTheme] = useState<Theme>("light");
  const [anchorDate, setAnchorDate] = useState("");
  const [currentMinutes, setCurrentMinutes] = useState(0);

  const [status, setStatus] = useState<StatusFilter>("All");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("Newest");
  const [search, setSearch] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --- Persistence -------------------------------------------------------

  // Runs once on mount. localStorage lives in the browser, not on the server,
  // which is why it is read here rather than during render.
  //
  // The lint rule below normally catches state that could just be calculated
  // during render. This is the case its own docs allow: a one-time read from
  // an external system that cannot happen any earlier.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = loadTasks();
    // A missing key means a first visit, so seed. An empty array means the
    // user deleted everything, so respect that and stay empty.
    setTasks(stored ?? seedTasks());
    setTheme(loadTheme() ?? "light");
    setAnchorDate(todayKey());
    setCurrentMinutes(nowMinutes());
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Saves on every change. The `ready` guard matters: without it this fires on
  // the first render and overwrites saved tasks with the empty starting array.
  useEffect(() => {
    if (!ready) return;
    saveTasks(tasks);
  }, [tasks, ready]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme, ready]);

  // Keeps the red "now" line creeping down the grid.
  useEffect(() => {
    const id = window.setInterval(() => setCurrentMinutes(nowMinutes()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // --- Toasts ------------------------------------------------------------

  const pushToast = useCallback((message: string, tone: Toast["tone"]) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  // --- Task actions ------------------------------------------------------
  // Each handler builds a new array rather than changing the existing one.
  // Mutating state in place would not tell React anything had changed.

  function handleSaveTask(draft: TaskDraft) {
    if (editingTask !== null) {
      const id = editingTask.id;
      setTasks((current) =>
        current.map((task) => (task.id === id ? { ...task, ...draft } : task)),
      );
      pushToast("Task updated.", "info");
      return;
    }

    const task = createTask(draft);
    setTasks((current) => [task, ...current]);
    // Follow the task to its week, so a task dated later is not added
    // "successfully" and then nowhere in sight.
    setAnchorDate(task.dueDate);
    setSelectedId(task.id);
    pushToast("Task added.", "info");
  }

  function handleToggleComplete(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function handleConfirmDelete() {
    const id = pendingDeleteId;
    if (id === null) return;

    setTasks((current) => current.filter((task) => task.id !== id));
    setPendingDeleteId(null);
    if (selectedId === id) setSelectedId(null);
    pushToast("Task deleted.", "danger");
  }

  // Clicking the task that is already open closes the panel, so the calendar
  // and the sidebar both double as a way out of it.
  function handleSelect(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  function openAddDialog() {
    setEditingTask(null);
    setDialogOpen(true);
  }

  function openEditDialog(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingTask(null);
  }

  function handleResetFilters() {
    setStatus("All");
    setPriority("All");
    setCategory("All");
    setSort("Newest");
    setSearch("");
  }

  // Press "n" to add a task, unless the user is typing into a field.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "n" || event.metaKey || event.ctrlKey) return;

      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (dialogOpen || pendingDeleteId !== null) return;

      event.preventDefault();
      setEditingTask(null);
      setDialogOpen(true);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogOpen, pendingDeleteId]);

  // --- Derived data ------------------------------------------------------
  // None of this is stored in state; it is recalculated from `tasks` on every
  // render, so the numbers can never drift away from the list.

  if (!ready) {
    return (
      <div className="loading">
        <BounceLoader />
        <p>Loading your tasks…</p>
      </div>
    );
  }

  const weekDays = weekOf(anchorDate);

  const query: TaskQuery = {
    // The grid shows a whole week, so the date filter is applied per column
    // rather than here.
    date: null,
    status: "All",
    priority,
    category,
    search,
    sort,
  };

  // Everything matching the filters except status, so the status options can
  // show honest counts of what each would reveal.
  const scopedTasks = queryTasks(tasks, query);
  const visibleTasks = scopedTasks.filter((task) => {
    if (status === "Pending") return !task.completed;
    if (status === "Completed") return task.completed;
    return true;
  });

  const weekTasks = tasksInRange(scopedTasks, weekDays);
  const weekStats = getStats(weekTasks);
  const counts: Record<StatusFilter, number> = {
    All: weekStats.total,
    Pending: weekStats.pending,
    Completed: weekStats.completed,
  };

  const overallStats = getStats(tasks);
  const overdueCount = overdueTasks(tasks).length;
  const upNext = nextUpNow(tasks);
  // Looked up in the visible list rather than in `tasks`, so the panel can only
  // ever describe a task that is actually on screen: filter one out and its
  // details close with it instead of lingering over a calendar that lost it.
  const selectedTask =
    visibleTasks.find((task) => task.id === selectedId) ?? null;
  const taskPendingDeletion =
    tasks.find((task) => task.id === pendingDeleteId) ?? null;

  return (
    <div className={`shell ${selectedTask !== null ? "has-detail" : ""}`}>
      <IconRail
        today={dayNumber(todayKey())}
        onAddTask={openAddDialog}
        onOpenFilters={() => setFiltersOpen(true)}
      />

      <Sidebar
        tasks={visibleTasks}
        weekDays={weekDays}
        stats={overallStats}
        overdueCount={overdueCount}
        search={search}
        onSearchChange={setSearch}
        onAddTask={openAddDialog}
        onToggleComplete={handleToggleComplete}
        onSelect={handleSelect}
        onDelete={setPendingDeleteId}
      />

      <main className="canvas">
        <CalendarHeader
          days={weekDays}
          status={status}
          counts={counts}
          theme={theme}
          onShiftWeek={(days) =>
            setAnchorDate((current) => addDays(current, days))
          }
          onToday={() => setAnchorDate(todayKey())}
          onStatusChange={setStatus}
          onToggleTheme={() =>
            setTheme((current) => (current === "dark" ? "light" : "dark"))
          }
          onOpenFilters={() => setFiltersOpen(true)}
        />

        <WeekGrid
          days={weekDays}
          tasks={visibleTasks}
          selectedId={selectedId}
          currentMinutes={currentMinutes}
          onSelect={handleSelect}
          onToggleComplete={handleToggleComplete}
        />

        <NowBar
          task={upNext}
          onComplete={handleToggleComplete}
          onEdit={openEditDialog}
        />
      </main>

      {selectedTask !== null ? (
        <TaskDetail
          task={selectedTask}
          onEdit={openEditDialog}
          onToggleComplete={handleToggleComplete}
          onDelete={setPendingDeleteId}
          onClose={() => setSelectedId(null)}
        />
      ) : null}

      {/* Conditional rendering: dialogs only exist in the tree while open, so
          each one mounts with fresh state every time. */}
      {filtersOpen ? (
        <FilterPanel
          status={status}
          priority={priority}
          category={category}
          sort={sort}
          search={search}
          counts={counts}
          onStatusChange={setStatus}
          onPriorityChange={setPriority}
          onCategoryChange={setCategory}
          onSortChange={setSort}
          onSearchChange={setSearch}
          onReset={handleResetFilters}
          onClose={() => setFiltersOpen(false)}
        />
      ) : null}

      {dialogOpen ? (
        <TaskDialog
          task={editingTask}
          defaultDate={todayKey()}
          onSave={handleSaveTask}
          onClose={closeDialog}
        />
      ) : null}

      {taskPendingDeletion !== null ? (
        <ConfirmDialog
          title="Delete task"
          message={`"${taskPendingDeletion.title}" will be removed for good.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      ) : null}

      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
