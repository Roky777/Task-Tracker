"use client";

import { CheckIcon, CloseIcon, PencilIcon, TrashIcon, UndoIcon } from "./Icons";
import { isOverdue, longDate, timeLabel } from "../lib/date";
import type { Task } from "../lib/types";

type TaskDetailProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

/**
 * The full record of whichever task is selected. Everything else in the app
 * shows a title and a time, because that is all a calendar block or a list row
 * has room for — this is the only place the description is actually readable.
 */
export default function TaskDetail({
  task,
  onEdit,
  onToggleComplete,
  onDelete,
  onClose,
}: TaskDetailProps) {
  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <aside className="detail" aria-label="Task details">
      <header className="detail-head">
        <h2>Task details</h2>
        <button
          type="button"
          className="row-button"
          onClick={onClose}
          aria-label="Close details">
          <CloseIcon size={18} />
        </button>
      </header>

      <div className="detail-body">
        <div className="detail-tags">
          <span className={`detail-tag tone-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
          <span className="detail-tag">{task.category}</span>
          {task.completed ? (
            <span className="detail-tag done">Completed</span>
          ) : null}
          {overdue ? <span className="detail-tag overdue">Overdue</span> : null}
        </div>

        <h3 className={`detail-title ${task.completed ? "struck" : ""}`}>
          {task.title}
        </h3>

        <p className="detail-when">
          {longDate(task.dueDate)} · {timeLabel(task.dueTime)}
        </p>

        <div className="detail-section">
          <h4>Description</h4>
          {/* Descriptions are optional, and an empty one should read as a gap
              to fill rather than a broken panel. */}
          {task.description === "" ? (
            <p className="detail-empty">No description for this task yet.</p>
          ) : (
            <p className="detail-description">{task.description}</p>
          )}
        </div>
      </div>

      <footer className="detail-actions">
        <button
          type="button"
          className="solid-button"
          onClick={() => onEdit(task)}>
          <PencilIcon size={16} />
          Edit
        </button>

        <button
          type="button"
          className="outline-button"
          onClick={() => onToggleComplete(task.id)}>
          {task.completed ? <UndoIcon size={16} /> : <CheckIcon size={16} />}
          {task.completed ? "Reopen" : "Mark done"}
        </button>

        <button
          type="button"
          className="detail-delete"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete "${task.title}"`}>
          <TrashIcon size={16} />
        </button>
      </footer>
    </aside>
  );
}
