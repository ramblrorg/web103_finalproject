import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import AddDestinationForm from "../components/AddDestinationForm.jsx";
import TripQuickActions from "../components/TripQuickActions.jsx";
import {
  getDestinationsForTrip,
  updateDestination,
  deleteDestination,
} from "../services/destinations.js";
import { fetchTripById } from "../services/trips.js";
import {
  formatDateRange,
  toDateInputValue,
} from "../helpers/tripFormat.js";
import "../css/Profile.css";
import "../css/Destinations.css";

const getDateOrderError = (arrivalDate, departureDate) => {
  if (arrivalDate && departureDate && departureDate < arrivalDate) {
    return "Departure date cannot be before arrival date.";
  }

  return null;
};

const emptyForm = {
  city: "",
  country: "",
  arrivalDate: "",
  departureDate: "",
  arrivalOrder: "",
};

const toRequestBody = (form) => ({
  city: form.city,
  country: form.country,
  startDate: form.arrivalDate || undefined,
  endDate: form.departureDate || undefined,
  arrivalOrder: form.arrivalOrder || undefined,
});

const TripDestinations = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();

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
        fetchTripById(tripId),
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
      arrivalDate: toDateInputValue(destination.start_date),
      departureDate: toDateInputValue(destination.end_date),
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

    const dateOrderError = getDateOrderError(
      editForm.arrivalDate,
      editForm.departureDate,
    );

    if (dateOrderError) {
      setEditError(dateOrderError);
      return;
    }

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

    if (!confirmed) {
      return;
    }

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
          <div className="profile__card profile__loading">
            Loading destinations…
          </div>
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

            <button
              type="button"
              className="btn btn--secondary"
              onClick={loadData}
            >
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
          <p className="profile__subtitle">
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
        </header>

        <div className="destinations__layout">
          <div className="destinations__main-col">
            <div className="destinations__header">
              <h2>Destinations</h2>

              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setShowAddForm(true)}
              >
                + Add Destination
              </button>
            </div>

            {deleteError && (
              <div className="profile__form-error" role="alert">
                {deleteError}
              </div>
            )}

            {destinations.length === 0 ? (
              <div className="profile__card destinations__empty">
                No destinations yet. Add one to get started.
              </div>
            ) : (
              <div className="destinations__list">
                {destinations.map((destination) =>
                  editingId === destination.id ? (
                    <div className="profile__card" key={destination.id}>
                      <form
                        className="profile__form"
                        onSubmit={handleEditSubmit}
                      >
                        {editError && (
                          <div className="profile__form-error" role="alert">
                            {editError}
                          </div>
                        )}

                        <label className="field">
                          <span className="field__label">City</span>
                          <input
                            value={editForm.city}
                            onChange={(event) =>
                              setEditForm({
                                ...editForm,
                                city: event.target.value,
                              })
                            }
                            required
                            disabled={isSavingEdit}
                          />
                        </label>

                        <label className="field">
                          <span className="field__label">Country</span>
                          <input
                            value={editForm.country}
                            onChange={(event) =>
                              setEditForm({
                                ...editForm,
                                country: event.target.value,
                              })
                            }
                            required
                            disabled={isSavingEdit}
                          />
                        </label>

                        <label className="field">
                          <span className="field__label">Arrival Date</span>
                          <input
                            type="date"
                            value={editForm.arrivalDate}
                            onChange={(event) =>
                              setEditForm({
                                ...editForm,
                                arrivalDate: event.target.value,
                              })
                            }
                            disabled={isSavingEdit}
                          />
                        </label>

                        <label className="field">
                          <span className="field__label">Departure Date</span>
                          <input
                            type="date"
                            value={editForm.departureDate}
                            onChange={(event) =>
                              setEditForm({
                                ...editForm,
                                departureDate: event.target.value,
                              })
                            }
                            disabled={isSavingEdit}
                          />
                        </label>

                        <label className="field">
                          <span className="field__label">Arrival Order</span>
                          <input
                            type="number"
                            value={editForm.arrivalOrder}
                            onChange={(event) =>
                              setEditForm({
                                ...editForm,
                                arrivalOrder: event.target.value,
                              })
                            }
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

                          <button
                            type="submit"
                            className="btn btn--primary"
                            disabled={isSavingEdit}
                          >
                            {isSavingEdit ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div
                      className="profile__card destinations__row destinations__row--clickable"
                      key={destination.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(
                          `/trips/${tripId}/destinations/${destination.id}/activities`,
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(
                            `/trips/${tripId}/destinations/${destination.id}/activities`,
                          );
                        }
                      }}
                    >
                      <div>
                        <div className="destinations__row-main">
                          <span className="destinations__city">
                            {destination.city}, {destination.country}
                          </span>

                          {destination.currency_code && (
                            <span className="destinations__currency">
                              {destination.currency_code}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="destinations__dates">
                        {formatDateRange(
                          destination.start_date,
                          destination.end_date,
                        )}
                      </div>

                      <div className="destinations__actions">
                        <button
                          type="button"
                          className="btn btn--secondary"
                          onClick={(event) => {
                            event.stopPropagation();
                            startEditing(destination);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn--secondary destinations__delete"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(destination);
                          }}
                          disabled={deletingId === destination.id}
                        >
                          {deletingId === destination.id
                            ? "Deleting…"
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <TripQuickActions tripId={tripId} />
        </div>
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