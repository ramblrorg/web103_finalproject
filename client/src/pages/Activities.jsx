import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ActivityForm from "../components/ActivityForm.jsx";
import AboutDestination from "../components/AboutDestination.jsx";
import { getDestinationById } from "../services/destinations.js";
import { getActivitiesForDestination, updateActivity, deleteActivity } from "../services/activities.js";
import { formatDateRange } from "../helpers/tripFormat.js";
import { splitActivities, groupByDay, formatDayLabel, formatTime, formatDuration } from "../helpers/activityFormat.js";
import "../css/Profile.css";
import "../css/Activities.css";

const Activities = () => {
  const { tripId, destinationId } = useParams();

  const [destination, setDestination] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("scheduled");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [formMode, setFormMode] = useState(null); // null | "add" | activity object being edited

  const loadData = async () => {
    try {
      setLoading(true);
      const [destinationData, activitiesData] = await Promise.all([
        getDestinationById(destinationId),
        getActivitiesForDestination(destinationId),
      ]);
      setDestination(destinationData);
      setActivities(activitiesData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [destinationId]);

  const closeForm = () => setFormMode(null);
  const handleSaved = async () => {
    closeForm();
    await loadData();
  };

  const handleUnschedule = async (activity) => {
    setOpenMenuId(null);
    setActionError(null);
    try {
      setBusyId(activity.id);
      await updateActivity(activity.id, { scheduledDate: null });
      await loadData();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (activity) => {
    setOpenMenuId(null);
    const confirmed = window.confirm(`Delete "${activity.name}"? This can't be undone.`);
    if (!confirmed) return;

    setActionError(null);
    try {
      setBusyId(activity.id);
      await deleteActivity(activity.id);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="activities">
          <div className="profile__card profile__loading">Loading activities…</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Sidebar />
        <main className="activities">
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

  const { scheduled, unscheduled } = splitActivities(activities);
  const dayGroups = groupByDay(scheduled, destination.start_date);

  const renderMenu = (activity) => (
    <div className="activity-row__menu-wrap">
      <button
        type="button"
        className="activity-row__menu-trigger"
        aria-label="Activity options"
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(openMenuId === activity.id ? null : activity.id);
        }}
      >
        ⋮
      </button>
      {openMenuId === activity.id && (
        <div className="activity-row__menu">
          <button type="button" onClick={() => { setOpenMenuId(null); setFormMode(activity); }}>
            Edit
          </button>
          {activity.scheduled_date ? (
            <button type="button" onClick={() => handleUnschedule(activity)}>
              Move to Unscheduled
            </button>
          ) : (
            <button type="button" onClick={() => { setOpenMenuId(null); setFormMode(activity); }}>
              Schedule…
            </button>
          )}
          <button type="button" className="activity-row__menu-delete" onClick={() => handleDelete(activity)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );

  const renderRow = (activity) => (
    <div className="activity-row" key={activity.id}>
      <div className={`activity-row__time${activity.start_time ? "" : " activity-row__time--empty"}`}>
        {formatTime(activity.start_time) || "Any time"}
      </div>
      <div className="activity-row__main">
        <span className="activity-row__name">{activity.name}</span>
        {(activity.notes || formatDuration(activity.duration_minutes)) && (
          <span className="activity-row__sub">
            {[activity.notes, formatDuration(activity.duration_minutes)].filter(Boolean).join(" · ")}
          </span>
        )}
      </div>
      {busyId === activity.id ? <span className="activity-row__busy">Working…</span> : renderMenu(activity)}
    </div>
  );

  return (
    <div className="page" onClick={() => openMenuId && setOpenMenuId(null)}>
      <Sidebar />

      <main className="activities">
        <Link to={`/trips/${tripId}`} className="activities__back">
          ← Back to Trip Dashboard
        </Link>

        <div className="activities__header">
          <div>
            <p className="activities__breadcrumb">
              {destination.country} <span>→</span> {destination.city}
            </p>
            <h1>{destination.city}</h1>
            <p className="profile__subtitle">{formatDateRange(destination.start_date, destination.end_date)}</p>
          </div>
          <button type="button" className="btn btn--primary" onClick={(e) => { e.stopPropagation(); setFormMode("add"); }}>
            + Add Activity
          </button>
        </div>

        <div className="activities__layout">
          <div className="activities__main">
            <div className="activities__tabs">
              <button
                type="button"
                className={`activities__tab${activeTab === "scheduled" ? " activities__tab--active" : ""}`}
                onClick={() => setActiveTab("scheduled")}
              >
                Scheduled
              </button>
              <button
                type="button"
                className={`activities__tab${activeTab === "unscheduled" ? " activities__tab--active" : ""}`}
                onClick={() => setActiveTab("unscheduled")}
              >
                Unscheduled {unscheduled.length > 0 && <span className="activities__tab-count">{unscheduled.length}</span>}
              </button>
            </div>

            {actionError && (
              <div className="profile__form-error" role="alert">
                {actionError}
              </div>
            )}

            {activities.length === 0 ? (
              <div className="profile__card activities__empty">
                <span className="activities__empty-glyph" aria-hidden="true">🗺️</span>
                No activities yet for {destination.city}. Add one to start building the itinerary.
              </div>
            ) : activeTab === "scheduled" ? (
              dayGroups.length === 0 ? (
                <div className="profile__card activities__empty">
                  <span className="activities__empty-glyph" aria-hidden="true">🗓️</span>
                  Nothing scheduled yet — check the Unscheduled tab, or add a new activity.
                </div>
              ) : (
                <div className="activities__days">
                  {dayGroups.map((group) => (
                    <section className="activities__day" key={group.date}>
                      <h2 className="activities__day-label">{formatDayLabel(group.date, group.dayNumber)}</h2>
                      <div className="profile__card activities__list">
                        {group.activities.map(renderRow)}
                      </div>
                    </section>
                  ))}
                </div>
              )
            ) : unscheduled.length === 0 ? (
              <div className="profile__card activities__empty">
                <span className="activities__empty-glyph" aria-hidden="true">✅</span>
                Nothing unscheduled — everything has a date.
              </div>
            ) : (
              <div className="profile__card activities__list">{unscheduled.map(renderRow)}</div>
            )}

            <button
              type="button"
              className="activities__add-row"
              onClick={(e) => { e.stopPropagation(); setFormMode("add"); }}
            >
              + Add Activity
            </button>
          </div>

          <AboutDestination destination={destination} activityCount={activities.length} />
        </div>
      </main>

      {formMode && (
        <ActivityForm
          destinationId={destinationId}
          destination={destination}
          activity={formMode === "add" ? null : formMode}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};

export default Activities;
