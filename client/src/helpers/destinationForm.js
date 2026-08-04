// Shared between AddDestinationForm.jsx (create) and TripDestinations.jsx
// (inline edit) -- both forms have the same fields and the same validation.

export const emptyDestinationForm = {
  city: "",
  country: "",
  arrivalDate: "",
  departureDate: "",
  arrivalOrder: "",
};

// arrivalDate/departureDate here are plain "YYYY-MM-DD" strings from <input type="date">,
// so this cheap string comparison is enough to catch the obvious case; the
// trip-date-range check is left to the backend's existing validation.
export const getDateOrderError = (arrivalDate, departureDate) => {
  if (arrivalDate && departureDate && departureDate < arrivalDate) {
    return "Departure date cannot be before arrival date.";
  }
  return null;
};

export const toDestinationRequestBody = (form) => ({
  city: form.city,
  country: form.country,
  startDate: form.arrivalDate || undefined,
  endDate: form.departureDate || undefined,
  arrivalOrder: form.arrivalOrder || undefined,
});
