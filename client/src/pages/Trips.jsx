import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { fetchTrips, deleteTrip } from "../services/trips.js";
import { formatDateRange, formatBudget, getStatusLabel } from "../helpers/tripFormat.js";
import placeholderImg from "../assets/trip-placeholder.svg";
import "../css/Trips.css";

// Quick-pick budget ranges shown as chips above the grid. "Custom" reveals
// the min/max inputs for anything these presets don't cover.
const BUDGET_PRESETS = [
  { label: "Any budget", min: "", max: "" },
  { label: "Under $1,000", min: "", max: "1000" },
  { label: "$1,000–$3,000", min: "1000", max: "3000" },
  { label: "$3,000+", min: "3000", max: "" },
];

// Renders trip.image_url when set, falling back to the single shared
// placeholder image when it's null OR the URL 404s/fails to load -- tracked
// locally so one broken image doesn't affect other cards.
const TripCover = ({ trip, children }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const src = trip.image_url && !imageFailed ? trip.image_url : placeholderImg;

  return (
    <div className="trip-card__cover">
      <img
        className="trip-card__cover-img"
        src={src}
        alt=""
        onError={() => setImageFailed(true)}
      />
      {children}
    </div>
  );
};

const Trips = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");

  //Budget Filter
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [showCustomRange, setShowCustomRange] = useState(false);

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
  const activePreset = BUDGET_PRESETS.find((p) => p.min === minBudget && p.max === maxBudget);

  const applyPreset = (preset) => {
    setMinBudget(preset.min);
    setMaxBudget(preset.max);
    setShowCustomRange(false);
  };

  const clearFilter = () => {
    setMinBudget("");
    setMaxBudget("");
    setShowCustomRange(false);
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
      loadTrips(); 
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
            <div className="trips__filter-chips">
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={`chip${activePreset?.label === preset.label && !showCustomRange ? " chip--active" : ""}`}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                className={`chip${showCustomRange ? " chip--active" : ""}`}
                onClick={() => setShowCustomRange((v) => !v)}
              >
                Custom range
              </button>
            </div>

            {showCustomRange && (
              <div className="trips__filter-custom">
                <label className="trips__filter-field">
                  <span>Min</span>
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
                  <span>Max</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="Any"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                  />
                </label>
              </div>
            )}

            {hasActiveFilter && (
              <button type="button" className="trips__filter-clear" onClick={clearFilter}>
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
            <div className="trips__empty-icon" aria-hidden="true">🧳</div>
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
                      <TripCover trip={trip}>
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

                        {statusLabel && <span className="trip-card__status">{statusLabel}</span>}
                      </TripCover>

                      <div className="trip-card__body">
                        <h3 className="trip-card__title">{trip.title}</h3>
                        <p className="trip-card__dates">
                          {formatDateRange(trip.start_date, trip.end_date)}
                        </p>
                        {budgetLabel && (
                          <div className="trip-card__footer">
                            <span className="trip-card__budget">{budgetLabel}</span>
                          </div>
                        )}
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
