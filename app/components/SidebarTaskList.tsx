"use client";

import TaskCheckbox from "./TaskCheckbox";
import { CloseIcon } from "./Icons";
import { timeLabel } from "../lib/date";
import type { Task } from "../lib/types";

type SidebarTaskListProps = {
  tasks: Task[];
  emptyMessage: string;
  /** Shows the date beside each task, for sections spanning several days. */
  showDate?: boolean;
  onToggleComplete: (id: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function SidebarTaskList({
  tasks,
  emptyMessage,
  showDate = false,
  onToggleComplete,
  onSelect,
  onDelete,
}: SidebarTaskListProps) {
  if (tasks.length === 0) {
    return <p className="panel-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="panel-tasks">
      {tasks.map((task) => (
        <li key={task.id} className={`panel-task ${task.completed ? "done" : ""}`}>
          <TaskCheckbox
            checked={task.completed}
            label={
              task.completed
                ? `Mark "${task.title}" as pending`
                : `Mark "${task.title}" as completed`
            }
            onChange={() => onToggleComplete(task.id)}
          />

          <button
            type="button"
            className="panel-task-text"
            onClick={() => onSelect(task.id)}>
            <span className={task.completed ? "struck" : ""}>{task.title}</span>
            <span className="panel-task-meta">
              {showDate ? `${task.dueDate} · ` : ""}
              {timeLabel(task.dueTime)}
            </span>
          </button>

          <button
            type="button"
            className="panel-task-delete"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete "${task.title}"`}>
            <CloseIcon size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}
