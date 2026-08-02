import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import AddDestinationForm from "../components/AddDestinationForm.jsx";
import { getDestinationsForTrip, updateDestination, deleteDestination } from "../services/destinations.js";
import { getTrip } from "../services/trips.js";
// .page, .btn*, .profile__card, .profile__form, .field* are shared utility
// classes that happen to live in Profile.css -- reused here rather than
// duplicated, same reasoning as importing it for .page originally.
import "../css/Profile.css";
import "../css/Destinations.css";

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

const toRequestBody = (form) => ({
  city: form.city,
  country: form.country,
  startDate: form.arrivalDate || undefined,
  endDate: form.departureDate || undefined,
  arrivalOrder: form.arrivalOrder || undefined,
});

// e.g. "Sep 1 – Sep 20, 2026"
const formatTripDateRange = (startDate, endDate) => {
  const shortDate = { month: "short", day: "numeric" };
  const start = startDate ? new Date(startDate).toLocaleDateString(undefined, shortDate) : null;
  const end = endDate
    ? new Date(endDate).toLocaleDateString(undefined, { ...shortDate, year: "numeric" })
    : null;
  if (start && end) return `${start} – ${end}`;
  return start || end || null;
};

const TripDestinations = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deleteError, setDeleteError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripData, destinationsData] = await Promise.all([
        getTrip(tripId),
        getDestinationsForTrip(tripId),
      ]);
      setTrip(tripData);
      setDestinations(destinationsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tripId]);

  const handleDestinationCreated = async () => {
    setShowAddForm(false);
    await loadData();
  };

  const startEditing = (destination) => {
    setEditingId(destination.id);
    setEditError(null);
    setEditForm({
      city: destination.city,
      country: destination.country,
      arrivalDate: destination.start_date ? destination.start_date.slice(0, 10) : "",
      departureDate: destination.end_date ? destination.end_date.slice(0, 10) : "",
      arrivalOrder: destination.arrival_order ?? "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(emptyForm);
    setEditError(null);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setEditError(null);

    const dateOrderError = getDateOrderError(editForm.arrivalDate, editForm.departureDate);
    if (dateOrderError) return setEditError(dateOrderError);

    try {
      setIsSavingEdit(true);
      await updateDestination(editingId, toRequestBody(editForm));
      cancelEditing();
      await loadData();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (destination) => {
    const confirmed = window.confirm(
      `Delete ${destination.city}, ${destination.country}? Its activities will be removed too.`,
    );
    if (!confirmed) return;

    setDeleteError(null);
    try {
      setDeletingId(destination.id);
      await deleteDestination(destination.id);
      await loadData();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="destinations">
          <div className="profile__card profile__loading">Loading destinations…</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Sidebar />
        <main className="destinations">
          <div className="profile__card profile__error-card">
            <p>{error}</p>
            <button type="button" className="btn btn--secondary" onClick={loadData}>
              Try again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Sidebar />

      <main className="destinations">
        <header className="destinations__trip-header">
          <h1>{trip.title}</h1>
          {formatTripDateRange(trip.start_date, trip.end_date) && (
            <p className="profile__subtitle">{formatTripDateRange(trip.start_date, trip.end_date)}</p>
          )}
        </header>

        <div className="destinations__header">
          <h2>Destinations</h2>
          <button type="button" className="btn btn--primary" onClick={() => setShowAddForm(true)}>
            + Add Destination
          </button>
        </div>

        {deleteError && (
          <div className="profile__form-error" role="alert">
            {deleteError}
          </div>
        )}

        {destinations.length === 0 ? (
          <div className="profile__card destinations__empty">No destinations yet. Add one to get started.</div>
        ) : (
          <div className="destinations__list">
            {destinations.map((destination) =>
              editingId === destination.id ? (
                <div className="profile__card" key={destination.id}>
                  <form className="profile__form" onSubmit={handleEditSubmit}>
                    {editError && (
                      <div className="profile__form-error" role="alert">
                        {editError}
                      </div>
                    )}

                    <label className="field">
                      <span className="field__label">City</span>
                      <input
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        required
                        disabled={isSavingEdit}
                      />
                    </label>

                    <label className="field">
                      <span className="field__label">Country</span>
                      <input
                        value={editForm.country}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        required
                        disabled={isSavingEdit}
                      />
                    </label>

                    <label className="field">
                      <span className="field__label">Arrival Date</span>
                      <input
                        type="date"
                        value={editForm.arrivalDate}
                        onChange={(e) => setEditForm({ ...editForm, arrivalDate: e.target.value })}
                        disabled={isSavingEdit}
                      />
                    </label>

                    <label className="field">
                      <span className="field__label">Departure Date</span>
                      <input
                        type="date"
                        value={editForm.departureDate}
                        onChange={(e) => setEditForm({ ...editForm, departureDate: e.target.value })}
                        disabled={isSavingEdit}
                      />
                    </label>

                    <label className="field">
                      <span className="field__label">Arrival Order</span>
                      <input
                        type="number"
                        value={editForm.arrivalOrder}
                        onChange={(e) => setEditForm({ ...editForm, arrivalOrder: e.target.value })}
                        disabled={isSavingEdit}
                      />
                    </label>

                    <div className="profile__form-actions">
                      <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={cancelEditing}
                        disabled={isSavingEdit}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn--primary" disabled={isSavingEdit}>
                        {isSavingEdit ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="profile__card destinations__row" key={destination.id}>
                  <div>
                    <div className="destinations__row-main">
                      <span className="destinations__city">
                        {destination.city}, {destination.country}
                      </span>
                      {destination.currency_code && (
                        <span className="destinations__currency">{destination.currency_code}</span>
                      )}
                    </div>
                  </div>

                  <div className="destinations__dates">
                    {destination.start_date && destination.start_date.slice(0, 10)}
                    {destination.end_date && ` – ${destination.end_date.slice(0, 10)}`}
                  </div>

                  <div className="destinations__actions">
                    <button type="button" className="btn btn--secondary" onClick={() => startEditing(destination)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn--secondary destinations__delete"
                      onClick={() => handleDelete(destination)}
                      disabled={deletingId === destination.id}
                    >
                      {deletingId === destination.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </main>

      {showAddForm && (
        <AddDestinationForm
          tripId={tripId}
          onCreated={handleDestinationCreated}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default TripDestinations;
