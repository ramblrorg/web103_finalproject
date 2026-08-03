import { toDateInputValue } from "./tripFormat.js";

// An activity belongs in Unscheduled whenever it has no scheduled_date yet.
export const isUnscheduled = (activity) => !activity.scheduled_date;

// Split the destination's activities into the two sections the UI shows.
// The API already orders rows by scheduled_date, start_time (NULLS LAST),
// so scheduled activities arrive pre-sorted -- this just partitions them.
export const splitActivities = (activities) => {
  const scheduled = [];
  const unscheduled = [];
  for (const activity of activities) {
    (isUnscheduled(activity) ? unscheduled : scheduled).push(activity);
  }
  return { scheduled, unscheduled };
};

// Group already-sorted scheduled activities into per-day buckets, in the
// order the days first appear (which is chronological, since the list is
// pre-sorted by scheduled_date). "Day N" is counted from the destination's
// start_date when we have one, so it lines up with the wireframe (Day 1,
// Day 2, ...) even if the first activity isn't on day 1; falls back to a
// plain running count if the destination has no start_date.
export const groupByDay = (scheduledActivities, destinationStartDate) => {
  const startDate = toDateInputValue(destinationStartDate);
  const groups = [];
  const groupsByDate = new Map();

  scheduledActivities.forEach((activity) => {
    const date = toDateInputValue(activity.scheduled_date);
    if (!groupsByDate.has(date)) {
      const dayNumber = startDate
        ? Math.round((new Date(`${date}T00:00:00`) - new Date(`${startDate}T00:00:00`)) / 86400000) + 1
        : groups.length + 1;
      const group = { date, dayNumber, activities: [] };
      groupsByDate.set(date, group);
      groups.push(group);
    }
    groupsByDate.get(date).activities.push(activity);
  });

  return groups;
};

export const formatDayLabel = (date, dayNumber) => {
  const label = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `Day ${dayNumber} · ${label}`;
};

// start_time comes back as "HH:MM:SS" (or null). Render it like the
// wireframe ("8:00 AM"); activities without a time still display, just
// without this label.
export const formatTime = (time) => {
  if (!time) return null;
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

export const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === "") return null;
  const num = Number(minutes);
  if (Number.isNaN(num) || num <= 0) return null;
  const hrs = Math.floor(num / 60);
  const mins = num % 60;
  if (hrs && mins) return `${hrs}h ${mins}m`;
  if (hrs) return `${hrs}h`;
  return `${mins}m`;
};

// Client-side mirror of the backend's destination-range check, so the form
// can show an inline error before hitting the API.
export const getScheduledDateRangeError = (scheduledDate, destination) => {
  if (!scheduledDate || !destination) return null;
  const start = toDateInputValue(destination.start_date);
  const end = toDateInputValue(destination.end_date);
  if (start && scheduledDate < start) return `Date must be on or after ${start}.`;
  if (end && scheduledDate > end) return `Date must be on or before ${end}.`;
  return null;
};
