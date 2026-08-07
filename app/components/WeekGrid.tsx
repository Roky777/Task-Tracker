"use client";

import { useEffect, useRef, type CSSProperties } from "react";

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

/**
 * The grid covers the whole day, 12am to 11:59pm, so every hour is reachable
 * and no task can ever fall outside the window.
 */
const START_HOUR = 0;
const END_HOUR = 24;
/** One pixel per minute, which makes the day exactly 1440px tall. */
const PX_PER_MINUTE = 1;
/** Breathing room under the last hour so a late block is not cut off. */
const BOTTOM_PAD = 28;

const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, index) => START_HOUR + index,
);

const GRID_HEIGHT = (END_HOUR - START_HOUR) * 60 * PX_PER_MINUTE + BOTTOM_PAD;

/** Converts minutes-since-midnight into a pixel offset inside the grid. */
function offsetFor(minutes: number): number {
  return (minutes - START_HOUR * 60) * PX_PER_MINUTE;
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // A full day is 1440px tall, so opening at the top would show hours of empty
  // night. Scroll to roughly the current time once, on first render only —
  // after that the user's own scroll position is left alone.
  useEffect(() => {
    if (hasScrolled.current || scrollRef.current === null) return;
    hasScrolled.current = true;

    // Put "now" a little below the top edge rather than flush against it.
    const target = offsetFor(currentMinutes) - 120;
    scrollRef.current.scrollTop = Math.max(0, target);
  }, [currentMinutes]);

  return (
    <div className="calendar">
      <div className="calendar-scroll" ref={scrollRef}>
        {/* The day headings live inside the scroller and stick to its top.
            Kept outside it they would drift out of line with the columns as
            soon as a scrollbar took width off the grid. */}
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

        <div className="calendar-body" style={{ height: GRID_HEIGHT }}>
          <div className="calendar-gutter">
            {HOURS.map((hour) => (
              <span
                key={hour}
                className="hour-label"
                style={{ top: offsetFor(hour * 60) }}>
                {hourLabel(hour)}
              </span>
            ))}
          </div>

          <div className="calendar-columns">
            {/* Hour rules are drawn once across all columns rather than per
                column, so they stay a single unbroken line. */}
            {HOURS.map((hour) => (
              <span
                key={hour}
                className="hour-rule"
                style={{ top: offsetFor(hour * 60) }}
              />
            ))}

            {showNowLine ? (
              <span
                className="now-line"
                style={{ top: offsetFor(currentMinutes) }}
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
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

function EventBlock({
  task,
  selected,
  onSelect,
  onToggleComplete,
}: EventBlockProps) {
  const top = offsetFor(toMinutes(task.dueTime));

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
