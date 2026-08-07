"use client";

import type { CSSProperties } from "react";

import {
  dayNumber,
  hourLabel,
  isToday,
  timeLabel,
  toMinutes,
  weekdayLabel,
} from "../lib/date";
import { tasksOnDate } from "../lib/tasks";
import type { Task } from "../lib/types";

type WeekGridProps = {
  days: string[];
  tasks: Task[];
  selectedId: string | null;
  /** Minutes since midnight, passed in so the line does not re-read the clock. */
  currentMinutes: number;
  onSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

/** The grid runs 7am to 9pm; anything outside is clamped to the edges. */
/** The day runs to midnight; it only starts at 7am to skip dead night hours. */
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 24;
const PX_PER_MINUTE = 1.1;
/** Breathing room under the last hour so a late block is not cut off. */
const BOTTOM_PAD = 28;

/**
 * Works out which hours the grid has to cover.
 *
 * The grid covers 7am to midnight by default. A fixed window would silently
 * hide anything outside it — a task at 05:00 would be given a negative offset
 * and never appear — so the start also stretches back to take in the earliest
 * task in view, and the current time when today is on screen.
 */
function hourRange(
  tasks: Task[],
  days: string[],
  nowMinutesOrNull: number | null,
) {
  let start = DEFAULT_START_HOUR;
  let end = DEFAULT_END_HOUR;

  function include(minutes: number) {
    const hour = Math.floor(minutes / 60);
    if (hour < start) start = hour;
    // +1 so the hour containing the item is fully drawn, not clipped at its top.
    if (hour + 1 > end) end = hour + 1;
  }

  for (const task of tasks) {
    if (days.includes(task.dueDate)) include(toMinutes(task.dueTime));
  }
  if (nowMinutesOrNull !== null) include(nowMinutesOrNull);

  return {
    startHour: Math.max(0, start),
    endHour: Math.min(24, Math.max(end, start + 1)),
  };
}

/** Converts minutes-since-midnight into a pixel offset inside the grid. */
function offsetFor(minutes: number, startHour: number): number {
  return (minutes - startHour * 60) * PX_PER_MINUTE;
}

export default function WeekGrid({
  days,
  tasks,
  selectedId,
  currentMinutes,
  onSelect,
  onToggleComplete,
}: WeekGridProps) {
  const showNowLine = days.some((day) => isToday(day));
  const { startHour, endHour } = hourRange(
    tasks,
    days,
    showNowLine ? currentMinutes : null,
  );

  const hours = Array.from(
    { length: endHour - startHour },
    (_, index) => startHour + index,
  );
  const gridHeight = (endHour - startHour) * 60 * PX_PER_MINUTE + BOTTOM_PAD;

  return (
    <div className="calendar">
      <div className="calendar-days">
        <span className="calendar-gutter-head" />
        {days.map((day) => (
          <div
            key={day}
            className={`calendar-day-head ${isToday(day) ? "today" : ""}`}>
            <span className="day-num">{dayNumber(day)}</span>
            <span className="day-name">{weekdayLabel(day).toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div className="calendar-scroll">
        <div className="calendar-body" style={{ height: gridHeight }}>
          <div className="calendar-gutter">
            {hours.map((hour) => (
              <span
                key={hour}
                className="hour-label"
                style={{ top: offsetFor(hour * 60, startHour) }}>
                {hourLabel(hour)}
              </span>
            ))}
          </div>

          <div className="calendar-columns">
            {/* Hour rules are drawn once across all columns rather than per
                column, so they stay a single unbroken line. */}
            {hours.map((hour) => (
              <span
                key={hour}
                className="hour-rule"
                style={{ top: offsetFor(hour * 60, startHour) }}
              />
            ))}

            {showNowLine ? (
              <span
                className="now-line"
                style={{ top: offsetFor(currentMinutes, startHour) }}
                aria-hidden="true">
                <span className="now-dot" />
              </span>
            ) : null}

            {days.map((day) => (
              <div
                key={day}
                className={`calendar-column ${isToday(day) ? "today" : ""}`}>
                {tasksOnDate(tasks, day).map((task) => (
                  <EventBlock
                    key={task.id}
                    task={task}
                    startHour={startHour}
                    selected={task.id === selectedId}
                    onSelect={onSelect}
                    onToggleComplete={onToggleComplete}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type EventBlockProps = {
  task: Task;
  /** The grid's first hour, which every block measures its offset from. */
  startHour: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

function EventBlock({
  task,
  startHour,
  selected,
  onSelect,
  onToggleComplete,
}: EventBlockProps) {
  const top = offsetFor(toMinutes(task.dueTime), startHour);

  return (
    <div
      className={`event tone-${task.priority.toLowerCase()} ${
        task.completed ? "done" : ""
      } ${selected ? "selected" : ""}`}
      style={{ "--top": `${top}px` } as CSSProperties}>
      <button
        type="button"
        className="event-body"
        onClick={() => onSelect(task.id)}>
        <span className={`event-title ${task.completed ? "struck" : ""}`}>
          {task.title}
        </span>
        <span className="event-time">{timeLabel(task.dueTime)}</span>
      </button>

      <button
        type="button"
        className="event-check"
        onClick={() => onToggleComplete(task.id)}
        aria-pressed={task.completed}
        aria-label={
          task.completed
            ? `Mark "${task.title}" as pending`
            : `Mark "${task.title}" as completed`
        }>
        ✓
      </button>
    </div>
  );
}
