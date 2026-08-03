import { useState } from "react";
import { createActivity, updateActivity } from "../services/activities.js";
import { getScheduledDateRangeError } from "../helpers/activityFormat.js";
import { toDateInputValue } from "../helpers/tripFormat.js";
import "../css/Profile.css";
import "../css/AddDestinationForm.css";

const toForm = (activity) => ({
  name: activity?.name ?? "",
  scheduledDate: toDateInputValue(activity?.scheduled_date),
  startTime: activity?.start_time ? String(activity.start_time).slice(0, 5) : "",
  durationMinutes: activity?.duration_minutes ?? "",
  notes: activity?.notes ?? "",
});

// Handles both "Add Activity" (activity is null) and "Edit Activity"
// (activity is the record being edited). destination is passed in so the
// scheduled date can be checked against its start/end range client-side,
// matching the validation the backend also enforces.
const ActivityForm = ({ destinationId, destination, activity, onSaved, onCancel }) => {
  const isEditing = Boolean(activity);
  const [form, setForm] = useState(toForm(activity));
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const dateError = getScheduledDateRangeError(form.scheduledDate, destination);
    if (dateError) return setError(dateError);

    const body = {
      name: form.name,
      scheduledDate: form.scheduledDate || null,
      startTime: form.startTime || undefined,
      durationMinutes: form.durationMinutes === "" ? undefined : Number(form.durationMinutes),
      notes: form.notes || undefined,
    };

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await updateActivity(activity.id, body);
      } else {
        await createActivity(destinationId, body);
      }
      onSaved();
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
          <h2>{isEditing ? "Edit Activity" : "Add Activity"}</h2>
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
            <span className="field__label">Activity Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Sushi Dinner"
              required
              disabled={isSubmitting}
            />
          </label>

          <label className="field">
            <span className="field__label">Date</span>
            <input
              type="date"
              value={form.scheduledDate}
              min={toDateInputValue(destination?.start_date)}
              max={toDateInputValue(destination?.end_date)}
              onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              disabled={isSubmitting}
            />
            <span className="field__hint">Leave blank to keep this activity Unscheduled.</span>
          </label>

          <label className="field">
            <span className="field__label">Start Time</span>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              disabled={isSubmitting}
            />
          </label>

          <label className="field">
            <span className="field__label">Duration (minutes)</span>
            <input
              type="number"
              min="0"
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              placeholder="e.g. 90"
              disabled={isSubmitting}
            />
          </label>

          <label className="field">
            <span className="field__label">Notes</span>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional"
              disabled={isSubmitting}
            />
          </label>

          <div className="profile__form-actions">
            <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEditing ? "Save Changes" : "Add Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;
