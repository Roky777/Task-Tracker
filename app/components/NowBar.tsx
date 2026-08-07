"use client";

import { CheckIcon, PencilIcon } from "./Icons";
import { longDate, timeLabel, isToday } from "../lib/date";
import type { Task } from "../lib/types";

type NowBarProps = {
  /** The next pending task, or null when there is nothing left to do. */
  task: Task | null;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
};

/** Floating bar along the bottom of the calendar, showing what is next up. */
export default function NowBar({ task, onComplete, onEdit }: NowBarProps) {
  if (task === null) return null;

  return (
    <div className="now-bar">
      <span className={`now-tag ${isToday(task.dueDate) ? "live" : ""}`}>
        {isToday(task.dueDate) ? "Now" : "Next"}
      </span>

      <div className="now-text">
        <p className="now-title">{task.title}</p>
        <p className="now-meta">
          {timeLabel(task.dueTime)} · {longDate(task.dueDate)}
        </p>
      </div>

      <button
        type="button"
        className="now-secondary"
        onClick={() => onEdit(task)}
        aria-label={`Edit "${task.title}"`}>
        <PencilIcon size={16} />
      </button>

      <button
        type="button"
        className="now-primary"
        onClick={() => onComplete(task.id)}>
        <CheckIcon size={17} />
        Mark done
      </button>
    </div>
  );
}
