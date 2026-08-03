// Trip dates come back from the API as YYYY-MM-DD strings (or null).
// <input type="date"> wants exactly that shape, so this just trims off
// any time/zone portion if one is ever present.
export const toDateInputValue = (value) => (value ? String(value).slice(0, 10) : "");

export const formatDateRange = (start, end) => {
  const fmt = (d) =>
    new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `Starts ${fmt(start)}`;
  if (end) return `Ends ${fmt(end)}`;
  return "Dates not set";
};

export const formatBudget = (budget) => {
  if (budget === null || budget === undefined || budget === "") return null;
  const num = Number(budget);
  if (Number.isNaN(num)) return null;
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

// Countdown/status chip shown on each card ("18 days left", "Happening now", etc).
// Missing dates just mean no chip -- see the null-guard at the top.
export const getStatusLabel = (start, end) => {
  if (!start) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = end ? new Date(`${end}T00:00:00`) : null;
  const msPerDay = 86400000;

  if (endDate && today > endDate) return "Trip completed";
  if (today >= startDate && (!endDate || today <= endDate)) return "Happening now";

  const diffDays = Math.round((startDate - today) / msPerDay);
  if (diffDays === 0) return "Starts today";
  return `${diffDays} day${diffDays === 1 ? "" : "s"} left`;
};

// Per-field validation for the create/edit trip form. Returns an object with
// only the fields that failed (e.g. { title: "..." }), so the form can show
// each error next to the input it belongs to instead of one generic banner.
export const validateTripForm = (form) => {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = "Trip title is required.";
  }

  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = "End date cannot be before the start date.";
  }

  if (form.budget !== "" && (Number.isNaN(Number(form.budget)) || Number(form.budget) < 0)) {
    errors.budget = "Budget must be zero or greater.";
  }

  // Optional field -- only validated if the user actually typed something.
  if (form.imageUrl && form.imageUrl.trim() && !/^https?:\/\/\S+\.\S+/i.test(form.imageUrl.trim())) {
    errors.imageUrl = "Enter a valid image URL (starting with http:// or https://).";
  }

  return errors;
};
