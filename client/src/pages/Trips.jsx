import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { fetchTrips, deleteTrip } from "../services/trips.js";
import { formatDateRange, formatBudget, getStatusLabel } from "../helpers/tripFormat.js";
import "../css/Trips.css";

const Trips = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");

  // Budget filter -- applied client-side since T2's list endpoint doesn't
  // take query params. Kept as raw strings so the inputs can be empty.
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  // Delete confirmation.
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState("idle"); // idle | deleting | error
  const [deleteError, setDeleteError] = useState("");

  // Which card's kebab menu is open, if any.
  const [openMenuId, setOpenMenuId] = useState(null);

  const loadTrips = () => {
    setLoadStatus("loading");
    setLoadError("");
    fetchTrips()
      .then((data) => {
        setTrips(data);
        setLoadStatus("ready");
      })
      .catch((err) => {
        setLoadError(err.message || "Something went wrong loading your trips.");
        setLoadStatus("error");
      });
  };

  useEffect(() => {
    loadTrips();
  }, []);

  // Close any open card menu when clicking elsewhere on the page.
  useEffect(() => {
    if (!openMenuId) return;
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [openMenuId]);

  const filteredTrips = useMemo(() => {
    const min = minBudget !== "" ? Number(minBudget) : null;
    const max = maxBudget !== "" ? Number(maxBudget) : null;
    if (min === null && max === null) return trips;

    // A trip with no budget set can't be confirmed as "within range", so it
    // drops out of the list while a filter is active rather than guessing.
    return trips.filter((trip) => {
      if (trip.budget === null || trip.budget === undefined) return false;
      const budget = Number(trip.budget);
      if (min !== null && budget < min) return false;
      if (max !== null && budget > max) return false;
      return true;
    });
  }, [trips, minBudget, maxBudget]);

  const hasActiveFilter = minBudget !== "" || maxBudget !== "";
  const clearFilter = () => {
    setMinBudget("");
    setMaxBudget("");
  };

  const goToCreateTrip = () => navigate("/trips/new");
  const goToEditTrip = (trip) => {
    setOpenMenuId(null);
    navigate(`/trips/${trip.id}/edit`);
  };

  const openDeleteConfirm = (trip) => {
    setDeleteTarget(trip);
    setDeleteStatus("idle");
    setDeleteError("");
    setOpenMenuId(null);
  };

  const closeDeleteConfirm = () => {
    if (deleteStatus === "deleting") return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteStatus("deleting");
    setDeleteError("");

    try {
      await deleteTrip(deleteTarget.id);
      setDeleteTarget(null);
      loadTrips(); // refresh the list from the server after delete
    } catch (err) {
      setDeleteStatus("error");
      setDeleteError(err.message || "Failed to delete trip. Please try again.");
    }
  };

  const handleCardClick = (trip) => {
    navigate(`/trips/${trip.id}`);
  };

  return (
    <div className="page">
      <Sidebar />

      <main className="trips">
        <header className="trips__header">
          <div>
            <h1>My Trips</h1>
            <p className="trips__subtitle">All your adventures in one place.</p>
          </div>
          <button type="button" className="btn btn--primary" onClick={goToCreateTrip}>
            + New Trip
          </button>
        </header>

        {loadStatus === "ready" && trips.length > 0 && (
          <div className="trips__filter">
            <label className="trips__filter-field">
              <span>Min budget</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="0"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
              />
            </label>
            <label className="trips__filter-field">
              <span>Max budget</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="Any"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
              />
            </label>
            {hasActiveFilter && (
              <button type="button" className="btn btn--secondary" onClick={clearFilter}>
                Clear filter
              </button>
            )}
          </div>
        )}

        {loadStatus === "loading" && (
          <div className="trips__card trips__status">Loading your trips…</div>
        )}

        {loadStatus === "error" && (
          <div className="trips__card trips__status trips__status--error">
            <p>{loadError}</p>
            <button type="button" className="btn btn--secondary" onClick={loadTrips}>
              Try again
            </button>
          </div>
        )}

        {loadStatus === "ready" && trips.length === 0 && (
          <div className="trips__empty">
            <p className="trips__empty-title">No trips yet</p>
            <p className="trips__empty-subtitle">
              Start planning your next adventure by creating your first trip.
            </p>
            <button type="button" className="btn btn--primary" onClick={goToCreateTrip}>
              + Create a New Trip
            </button>
          </div>
        )}

        {loadStatus === "ready" && trips.length > 0 && (
          <>
            {filteredTrips.length === 0 ? (
              <div className="trips__card trips__status">
                No trips match this budget range.
              </div>
            ) : (
              <div className="trips__grid">
                {filteredTrips.map((trip) => {
                  const budgetLabel = formatBudget(trip.budget);
                  const statusLabel = getStatusLabel(trip.start_date, trip.end_date);

                  return (
                    <div
                      key={trip.id}
                      className="trip-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCardClick(trip)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleCardClick(trip);
                      }}
                    >
                      <div className="trip-card__top">
                        <h3 className="trip-card__title">{trip.title}</h3>

                        <div className="trip-card__menu">
                          <button
                            type="button"
                            className="trip-card__menu-btn"
                            aria-label={`Options for ${trip.title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === trip.id ? null : trip.id);
                            }}
                          >
                            ⋮
                          </button>
                          {openMenuId === trip.id && (
                            <div className="trip-card__dropdown" onClick={(e) => e.stopPropagation()}>
                              <button type="button" onClick={() => goToEditTrip(trip)}>
                                Edit
                              </button>
                              <button
                                type="button"
                                className="trip-card__dropdown-danger"
                                onClick={() => openDeleteConfirm(trip)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="trip-card__dates">
                        {formatDateRange(trip.start_date, trip.end_date)}
                      </p>

                      <div className="trip-card__footer">
                        {budgetLabel && <span className="trip-card__budget">{budgetLabel}</span>}
                        {statusLabel && <span className="trip-card__status">{statusLabel}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button type="button" className="trips__create-cta" onClick={goToCreateTrip}>
              + Create a New Trip
            </button>
          </>
        )}
      </main>

      {deleteTarget && (
        <div className="modal-overlay" onClick={closeDeleteConfirm}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Delete “{deleteTarget.title}”?</h2>
            <p className="modal__body-text">
              This will permanently delete this trip along with any destinations and planning
              data attached to it. This action can’t be undone.
            </p>

            {deleteStatus === "error" && (
              <div className="form-error" role="alert">
                {deleteError}
              </div>
            )}

            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={closeDeleteConfirm}
                disabled={deleteStatus === "deleting"}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={confirmDelete}
                disabled={deleteStatus === "deleting"}
              >
                {deleteStatus === "deleting" ? "Deleting…" : "Delete Trip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
