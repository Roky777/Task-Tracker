"use client";

import { useState } from "react";

import Modal from "./Modal";
import {
  CATEGORIES,
  PRIORITIES,
  type Category,
  type Priority,
  type Task,
  type TaskDraft,
} from "../lib/types";

type TaskDialogProps = {
  /** A task when editing, null when adding. */
  task: Task | null;
  defaultDate: string;
  onSave: (draft: TaskDraft) => void;
  onClose: () => void;
};

/**
 * One dialog for both adding and editing. The only difference is where the
 * initial field values come from, so there is no reason to write it twice.
 */
export default function TaskDialog({
  task,
  defaultDate,
  onSave,
  onClose,
}: TaskDialogProps) {
  const editing = task !== null;

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "Medium");
  const [category, setCategory] = useState<Category>(task?.category ?? "Work");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? defaultDate);
  const [dueTime, setDueTime] = useState(task?.dueTime ?? "09:00");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Without this the browser reloads and the task is lost before React sees it.
    event.preventDefault();

    if (title.trim() === "") {
      setError("A task needs a title.");
      return;
    }
    if (dueDate === "") {
      setError("Pick a due date so the task lands on the calendar.");
      return;
    }

    onSave({
      title,
      description,
      priority,
      category,
      dueDate,
      dueTime: dueTime === "" ? "09:00" : dueTime,
    });
    onClose();
  }

  return (
    <Modal title={editing ? "Edit task" : "Add task"} onClose={onClose}>
      <form className="dialog-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Title</span>
          <input
            type="text"
            value={title}
            autoFocus
            placeholder="What needs doing?"
            onChange={(event) => {
              setTitle(event.target.value);
              // Clear the error the moment they start fixing it.
              if (error !== "") setError("");
            }}
            aria-invalid={error !== ""}
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            rows={3}
            value={description}
            placeholder="Any details worth remembering"
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <fieldset className="field">
          <legend>Priority</legend>
          <div className="segmented">
            {PRIORITIES.map((option) => (
              <button
                key={option}
                type="button"
                className={`segment tone-${option.toLowerCase()} ${
                  priority === option ? "active" : ""
                }`}
                onClick={() => setPriority(option)}
                aria-pressed={priority === option}>
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="field-row">
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Time</span>
            <input
              type="time"
              value={dueTime}
              onChange={(event) => setDueTime(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as Category)
              }>
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error !== "" ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="form-actions">
          <button type="button" className="outline-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="solid-button">
            {editing ? "Save changes" : "Add task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
