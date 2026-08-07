/**
 * Date helpers.
 *
 * Everything is keyed on a local "YYYY-MM-DD" string rather than a Date object
 * or an ISO timestamp. `new Date("2026-04-15")` parses as UTC midnight, which is
 * the previous day for anyone west of Greenwich, so building keys by hand from
 * the local getters is the only way the calendar agrees with the user's clock.
 */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Date -> "YYYY-MM-DD" in the user's own timezone. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "YYYY-MM-DD" -> Date at local midnight. */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/** Shifts a date key by a number of days, e.g. addDays(key, -7) for last week. */
export function addDays(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** The seven date keys of the Mon–Sun week containing `key`. */
export function weekOf(key: string): string[] {
  const date = fromDateKey(key);
  // getDay() is 0 for Sunday, so map Sunday to 6 to make Monday the first day.
  const offsetToMonday = (date.getDay() + 6) % 7;
  const monday = addDays(key, -offsetToMonday);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function dayNumber(key: string): number {
  return fromDateKey(key).getDate();
}

export function weekdayLabel(key: string): string {
  return WEEKDAYS[fromDateKey(key).getDay()];
}

export function monthLabel(key: string): string {
  return MONTHS[fromDateKey(key).getMonth()];
}

/** "15 April, 2026" — the long form used in the detail panel. */
export function longDate(key: string): string {
  const date = fromDateKey(key);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

/**
 * Labels a week for the strip header. A week can straddle two months, in which
 * case both are shown ("Mar — Apr") rather than silently picking one.
 */
export function weekLabel(days: string[]): string {
  const first = monthLabel(days[0]);
  const last = monthLabel(days[days.length - 1]);
  return first === last ? first : `${first.slice(0, 3)} — ${last.slice(0, 3)}`;
}

/** "September 2023 (W2)" — the heading above the week grid. */
export function weekHeading(days: string[]): string {
  const first = fromDateKey(days[0]);
  // Which week of the month the Monday falls in: days 1–7 are W1, 8–14 W2, etc.
  const weekOfMonth = Math.ceil(first.getDate() / 7);
  return `${MONTHS[first.getMonth()]} ${first.getFullYear()} (W${weekOfMonth})`;
}

/** "HH:MM" -> minutes since midnight, which is what the grid positions on. */
export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/** 24-hour "HH:MM" -> "9 AM" / "12:15 PM", dropping ":00" on the hour. */
export function timeLabel(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours < 12 ? "AM" : "PM";
  // 0 and 12 both display as 12 on a twelve-hour clock.
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === 0
    ? `${hour12} ${suffix}`
    : `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function hourLabel(hour: number): string {
  return timeLabel(`${String(hour).padStart(2, "0")}:00`);
}

/** True when `key` falls in the last `days` days, today included. */
export function isWithinLastDays(key: string, days: number): boolean {
  const today = todayKey();
  return key <= today && key >= addDays(today, -(days - 1));
}

/** A pending task whose due date has already passed. */
export function isOverdue(dueDate: string, completed: boolean): boolean {
  return !completed && dueDate < todayKey();
}

export function isToday(key: string): boolean {
  return key === todayKey();
}
