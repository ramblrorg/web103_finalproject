import { useState } from "react";
import { createDestination } from "../services/destinations.js";
import { toDateInputValue } from "../helpers/tripFormat.js";
import {
  emptyDestinationForm,
  getDateOrderError,
  toDestinationRequestBody,
} from "../helpers/destinationForm.js";
import "../css/Profile.css";
import "../css/AddDestinationForm.css";

const AddDestinationForm = ({ tripId, trip, onCreated, onCancel }) => {
  const [form, setForm] = useState(emptyDestinationForm);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const dateOrderError = getDateOrderError(form.arrivalDate, form.departureDate);
    if (dateOrderError) return setError(dateOrderError);

    try {
      setIsSubmitting(true);
      await createDestination(tripId, toDestinationRequestBody(form));
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
              min={toDateInputValue(trip?.start_date)}
              max={toDateInputValue(trip?.end_date)}
              onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })}
              disabled={isSubmitting}
            />
          </label>

          <label className="field">
            <span className="field__label">Departure Date</span>
            <input
              type="date"
              value={form.departureDate}
              min={toDateInputValue(trip?.start_date)}
              max={toDateInputValue(trip?.end_date)}
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
