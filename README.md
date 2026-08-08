# Task Tracker

A task manager built with Next.js, laid out as a week planner: a dark task
panel down the left, and a calendar on the right where every task sits at its
own time of day.

## About

The app keeps every task in a single array in React state. Adding, completing,
editing and deleting all produce a **new** array rather than changing the old
one, which is what lets React tell that something has changed.

Nothing derived is ever stored. The statistics, the filtered lists, the
sidebar's date groupings and the calendar layout are all recalculated from that
one array on each render, so they cannot drift out of sync with it.

Tasks are saved to the browser's `localStorage`, so they survive a refresh.

## Features

- **Add tasks** with a title, description, priority, category, date and time
- **Week calendar** placing each task at its due time, with a live "now" line
- **Detail panel** opening beside the calendar with the selected task's full
  description, date, priority and category, and buttons to edit, complete or
  delete it
- **Mark complete / pending** from the calendar, the sidebar, or the bottom bar
- **Edit and delete**, with a confirmation step before anything is removed
- **Filters** by status, priority and category, plus text search and sorting
- **Sidebar groups** for this week, the last 30 days and the last 90 days
- **Statistics** — total, completed and pending, with a progress bar
- **Overdue detection** for pending tasks whose date has passed
- **Light and dark mode**, remembered between visits
- **Persistence** via `localStorage`, including a migration for older saved data
- **Keyboard shortcut** — press <kbd>n</kbd> to add a task
- **Responsive** down to phone width, and an `/about` route

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Plain CSS (no framework), with CSS custom properties for theming

## Getting Started

```bash
git clone <your-repo-url>
cd to-do-app
npm install
npm run dev
```

Then open <http://localhost:3000>.

```bash
npm run build   # production build
npm run lint    # eslint
```

## Project Structure

```
app/
├── page.tsx              # dashboard — owns all task state
├── layout.tsx            # root layout, fonts, metadata
├── globals.css           # design tokens + all component styles
├── about/
│   ├── page.tsx          # /about (a Server Component)
│   └── loading.tsx       # route-level loading UI
├── components/
│   ├── IconRail.tsx          # far-left icon strip
│   ├── Sidebar.tsx           # dark panel: search, notifications, groups
│   ├── CollapsibleSection.tsx
│   ├── SidebarTaskList.tsx
│   ├── CalendarHeader.tsx     # week nav, status select, account menu
│   ├── WeekGrid.tsx           # the calendar and its task blocks
│   ├── TaskDetail.tsx         # selected task: description + actions
│   ├── NowBar.tsx             # floating "up next" bar
│   ├── TaskDialog.tsx         # add + edit form
│   ├── FilterPanel.tsx        # filter / sort drawer
│   ├── ConfirmDialog.tsx      # delete confirmation
│   ├── TaskCheckbox.tsx       # tick box
│   ├── ThemeSwitch.tsx        # dark-mode toggle
│   ├── BounceLoader.tsx       # app loading state
│   ├── Loader.tsx             # route loading state
│   ├── Modal.tsx  Drawer.tsx  Toasts.tsx  Icons.tsx
└── lib/
    ├── types.ts          # Task, Priority, Category, filters
    ├── date.ts           # date-key and time helpers
    ├── tasks.ts          # pure task logic (stats, filtering, seeding)
    └── storage.ts        # localStorage read/write, guarded
```

## What I Learned

**Components and props.** The dashboard owns the task array; every other
component receives what it needs through props and reports back through
callbacks. Nothing else holds a copy of the tasks.

**Updating state immutably.** `map()` to toggle or edit a task, `filter()` to
delete, and the spread operator to add — each returning a new array. Changing
an object in place looks like it works and then quietly stops re-rendering.

**Deriving instead of storing.** It is tempting to keep a `completedCount` in
state. Calculating it during render instead means there is no second value to
keep up to date.

**`localStorage` and Next.js.** `localStorage` only exists in the browser, so
reading it during render crashes on the server. It has to happen in an effect
after mount, inside a Client Component. It also only stores strings, hence
`JSON.stringify` on the way out and `JSON.parse` on the way back in — and that
`JSON.parse` needs a `try/catch`, or one bad value breaks the app permanently.

**Two subtle bugs worth remembering.** `Date.now()` as an id collides when two
tasks are created in the same millisecond, which duplicates React keys and makes
delete remove the wrong row — `crypto.randomUUID()` doesn't. And the effect that
saves to `localStorage` runs on the first render too, so without a "has loaded
yet" guard it overwrites saved tasks with the empty starting array.

**Dates are harder than they look.** `new Date("2026-04-15")` parses as UTC
midnight, which is the day before for anyone west of Greenwich. Storing a local
`"YYYY-MM-DD"` string and building it from the local getters avoids the whole
problem.

**`overflow: hidden` changes what a flex item can do.** The sidebar cards would
not let the sidebar scroll: `overflow: hidden` drops a flex item's automatic
minimum size from its content height to zero, so the cards quietly shrank to fit
and clipped their own task lists instead of overflowing the panel. `flex-shrink:
0` on the card is the fix.

**Conditional rendering.** Completed tasks get a line through them, a different
button and a faded block; dialogs are removed from the tree entirely when
closed rather than hidden, so they always reopen with fresh state.

## Future Improvements

- Drag tasks between days and times on the calendar
- Undo after deleting, instead of only confirming beforehand
- Recurring tasks
- Sync to a real backend so tasks follow you between devices
- Month and day views alongside the week view
- Tests for the pure logic in `lib/`
