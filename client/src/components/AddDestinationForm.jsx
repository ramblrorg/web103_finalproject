import { useState } from "react";
import { createDestination } from "../services/destinations.js";
import "../css/Profile.css";
import "../css/AddDestinationForm.css";

// arrivalDate/departureDate here are plain "YYYY-MM-DD" strings from <input type="date">,
// so this cheap string comparison is enough to catch the obvious case; the
// trip-date-range check is left to the backend's existing validation.
const getDateOrderError = (arrivalDate, departureDate) => {
  if (arrivalDate && departureDate && departureDate < arrivalDate) {
    return "Departure date cannot be before arrival date.";
  }
  return null;
};

const emptyForm = { city: "", country: "", arrivalDate: "", departureDate: "", arrivalOrder: "" };

const AddDestinationForm = ({ tripId, onCreated, onCancel }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const dateOrderError = getDateOrderError(form.arrivalDate, form.departureDate);
    if (dateOrderError) return setError(dateOrderError);

    try {
      setIsSubmitting(true);
      await createDestination(tripId, {
        city: form.city,
        country: form.country,
        startDate: form.arrivalDate || undefined,
        endDate: form.departureDate || undefined,
        arrivalOrder: form.arrivalOrder || undefined,
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal__header">
          <h2>Add Destination</h2>
          <button type="button" className="modal__close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <form className="profile__form" onSubmit={handleSubmit}>
          {error && (
            <div className="profile__form-error" role="alert">
              {error}
            </div>
          )}

          <label className="field">
            <span className="field__label">City</span>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Sapporo"
              required
              disabled={isSubmitting}
            />
          </label>

          <label className="field">
            <span className="field__label">Country</span>
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="Japan"
              required
              disabled={isSubmitting}
            />
          </label>

          <label className="field">
            <span className="field__label">Arrival Date</span>
            <input
              type="date"
              value={form.arrivalDate}
              onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })}
              disabled={isSubmitting}
            />
          </label>

          <label className="field">
            <span className="field__label">Departure Date</span>
            <input
              type="date"
              value={form.departureDate}
              onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
              disabled={isSubmitting}
            />
          </label>

          <label className="field">
            <span className="field__label">Arrival Order</span>
            <input
              type="number"
              value={form.arrivalOrder}
              onChange={(e) => setForm({ ...form, arrivalOrder: e.target.value })}
              disabled={isSubmitting}
            />
          </label>

          <div className="profile__form-actions">
            <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Destination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDestinationForm;
