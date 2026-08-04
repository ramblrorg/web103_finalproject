import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { fetchTrips } from "../services/trips.js";
import { getDestinationsForTrip } from "../services/destinations.js";
import { getActivitiesForDestination } from "../services/activities.js";
import { formatDateRange, toDateInputValue } from "../helpers/tripFormat.js";
import { formatDuration, formatTime } from "../helpers/activityFormat.js";
import itineraryHero from "../assets/itineraries-hero.png";
import placeholderImg from "../assets/trip-placeholder.svg";
import "../css/Itineraries.css";

const Icon = ({ name }) => {
  const paths = {
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4m8-4v4M4 9h16" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15 9-2 4-4 2 2-4z" /></>,
    route: <><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 6h3a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

const dateValue = (value) => toDateInputValue(value) || "";

const TripImage = ({ trip }) => {
  const [failed, setFailed] = useState(false);
  const source = trip?.image_url && !failed ? trip.image_url : placeholderImg;

  return (
    <img
      src={source}
      alt={trip?.title ? `${trip.title} trip` : "Trip"}
      onError={() => setFailed(true)}
    />
  );
};

const formatFullDate = (value) => {
  const normalized = dateValue(value);
  if (!normalized) return "Date not set";
  return new Date(`${normalized}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const compareActivities = (a, b) => {
  const firstDate = dateValue(a.scheduled_date);
  const secondDate = dateValue(b.scheduled_date);
  if (firstDate !== secondDate) return firstDate.localeCompare(secondDate);

  const firstTime = a.start_time || "99:99:99";
  const secondTime = b.start_time || "99:99:99";
  return firstTime.localeCompare(secondTime);
};

const loadItineraryData = async () => {
  const trips = await fetchTrips();

  const tripGroups = await Promise.all(
    trips.map(async (trip) => {
      const destinations = await getDestinationsForTrip(trip.id);
      const destinationGroups = await Promise.all(
        destinations.map(async (destination) => {
          const activities = await getActivitiesForDestination(destination.id);
          return { destination, activities };
        }),
      );

      return { trip, destinations: destinationGroups };
    }),
  );

  return tripGroups;
};

const Itineraries = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("scheduled");

  const loadData = async () => {
    try {
      setStatus("loading");
      setError("");
      setGroups(await loadItineraryData());
      setStatus("ready");
    } catch (err) {
      setError(err.message || "We couldn't load your itineraries.");
      setStatus("error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const data = useMemo(() => {
    const allActivities = [];
    const tripSections = [];

    groups.forEach(({ trip, destinations }) => {
      const destinationSections = destinations.map(({ destination, activities }) => {
        const enriched = activities.map((activity) => ({
          ...activity,
          trip,
          destination,
        }));

        enriched.forEach((activity) => allActivities.push(activity));

        const scheduled = enriched
          .filter((activity) => activity.scheduled_date)
          .sort(compareActivities);
        const unscheduled = enriched.filter((activity) => !activity.scheduled_date);

        return { destination, scheduled, unscheduled };
      });

      // Keep every trip in the centralized view, even when it has no
      // destinations or activities yet.
      tripSections.push({ trip, destinations: destinationSections });
    });

    const scheduledCount = allActivities.filter((activity) => activity.scheduled_date).length;
    const unscheduledCount = allActivities.length - scheduledCount;

    return {
      tripSections,
      total: allActivities.length,
      scheduledCount,
      unscheduledCount,
      destinationCount: groups.reduce(
        (count, group) => count + group.destinations.length,
        0,
      ),
    };
  }, [groups]);

  const openActivities = (tripId, destinationId) => {
    navigate(`/trips/${tripId}/destinations/${destinationId}/activities`);
  };

  const renderActivity = (activity) => (
    <article className="itinerary-activity" key={activity.id}>
      <div className="itinerary-activity__time">
        <span>{formatTime(activity.start_time) || "Any time"}</span>
        {formatDuration(activity.duration_minutes) && (
          <small>{formatDuration(activity.duration_minutes)}</small>
        )}
      </div>

      <div className="itinerary-activity__marker" aria-hidden="true">
        <span />
      </div>

      <div className="itinerary-activity__body">
        <h4>{activity.name}</h4>
        {activity.notes && <p>{activity.notes}</p>}
      </div>
    </article>
  );

  return (
    <div className="page">
      <Sidebar />

      <main className="itineraries">
        <header className="itineraries__hero">
          <img
            className="itineraries__hero-image"
            src={itineraryHero}
            alt="Traveler looking over a mountain coastline at sunset"
          />
          <div className="itineraries__hero-overlay" />
          <div className="itineraries__hero-content">
            <p className="itineraries__eyebrow">Every plan, in one place</p>
            <h1>Your itineraries</h1>
            <p>
              See what’s coming up across every trip, then jump into a destination whenever you’re ready to keep planning.
            </p>
            <button type="button" className="itineraries__trips-link" onClick={() => navigate("/trips")}>
              View my trips
              <Icon name="arrow" />
            </button>
          </div>
        </header>

        {status === "loading" && (
          <section className="itineraries__state" aria-live="polite">
            <span className="itineraries__loader" />
            <h2>Gathering your plans…</h2>
            <p>We’re bringing activities from all of your destinations together.</p>
          </section>
        )}

        {status === "error" && (
          <section className="itineraries__state itineraries__state--error">
            <h2>We couldn’t load your itineraries.</h2>
            <p>{error}</p>
            <button type="button" className="btn btn--secondary" onClick={loadData}>Try again</button>
          </section>
        )}

        {status === "ready" && (
          <>
            <section className="itineraries__summary" aria-label="Itinerary summary">
              <div>
                <Icon name="route" />
                <strong>{data.total}</strong>
                <span>{data.total === 1 ? "Activity" : "Activities"}</span>
              </div>
              <div>
                <Icon name="calendar" />
                <strong>{data.scheduledCount}</strong>
                <span>Scheduled</span>
              </div>
              <div>
                <Icon name="clock" />
                <strong>{data.unscheduledCount}</strong>
                <span>Unscheduled</span>
              </div>
              <div>
                <Icon name="compass" />
                <strong>{data.destinationCount}</strong>
                <span>{data.destinationCount === 1 ? "Destination" : "Destinations"}</span>
              </div>
            </section>

            <div className="itineraries__tabs" role="tablist" aria-label="Itinerary view">
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "scheduled"}
                className={activeView === "scheduled" ? "itineraries__tab itineraries__tab--active" : "itineraries__tab"}
                onClick={() => setActiveView("scheduled")}
              >
                Scheduled
                <span>{data.scheduledCount}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "unscheduled"}
                className={activeView === "unscheduled" ? "itineraries__tab itineraries__tab--active" : "itineraries__tab"}
                onClick={() => setActiveView("unscheduled")}
              >
                Unscheduled
                <span>{data.unscheduledCount}</span>
              </button>
            </div>

            {groups.length === 0 ? (
              <section className="itineraries__empty">
                <Icon name="compass" />
                <h2>Your itinerary is ready for its first trip.</h2>
                <p>Create a trip and it will appear here automatically.</p>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => navigate("/trips/new")}
                >
                  Plan a trip
                </button>
              </section>
            ) : (
              <div className="itineraries__groups">
                {data.tripSections.map(({ trip, destinations }) => {
                  const visibleDestinations = destinations.filter((destination) =>
                    activeView === "scheduled"
                      ? destination.scheduled.length > 0
                      : destination.unscheduled.length > 0,
                  );

                  return (
                    <section className="itinerary-trip" key={trip.id}>
                      <div className="itinerary-trip__heading">
                        <div className="itinerary-trip__identity">
                          <div className="itinerary-trip__image">
                            <TripImage trip={trip} />
                          </div>
                          <div>
                            <p>{formatDateRange(trip.start_date, trip.end_date)}</p>
                            <h2>{trip.title}</h2>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/trips/${trip.id}`)}
                        >
                          Trip details <Icon name="arrow" />
                        </button>
                      </div>

                      {visibleDestinations.length === 0 ? (
                        <div className="itinerary-trip__empty">
                          <Icon
                            name={
                              destinations.length === 0
                                ? "pin"
                                : activeView === "scheduled"
                                  ? "calendar"
                                  : "clock"
                            }
                          />
                          <div>
                          {(() => {
                              const totalActivities = destinations.reduce(
                                (total, destination) =>
                                  total +
                                  destination.scheduled.length +
                                  destination.unscheduled.length,
                                0,
                              );

                              const hasNoActivities = totalActivities === 0;

                              return (
                                <>
                                  <h3>
                                    {destinations.length === 0
                                      ? "No destinations added yet"
                                      : hasNoActivities
                                        ? "No activities added yet"
                                        : activeView === "scheduled"
                                          ? "No scheduled activities yet"
                                          : "No unscheduled activities"}
                                  </h3>

                                  <p>
                                    {destinations.length === 0
                                      ? "Open this trip to add its first destination."
                                      : hasNoActivities
                                        ? "Open one of this trip’s destinations to add its first activity."
                                        : activeView === "scheduled"
                                          ? "This trip has activities, but none of them have been scheduled yet."
                                          : "All activities in this trip currently have dates."}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/trips/${trip.id}`)}
                          >
                            Open trip <Icon name="arrow" />
                          </button>
                        </div>
                      ) : (
                        <div className="itinerary-trip__destinations">
                          {visibleDestinations.map(
                            ({ destination, scheduled, unscheduled }) => {
                              const activities =
                                activeView === "scheduled" ? scheduled : unscheduled;

                              return (
                                <section
                                  className="itinerary-destination"
                                  key={destination.id}
                                >
                                  <div className="itinerary-destination__heading">
                                    <div>
                                      <span>
                                        <Icon name="pin" /> {destination.country}
                                      </span>
                                      <h3>{destination.city}</h3>
                                      <p>
                                        {formatDateRange(
                                          destination.start_date,
                                          destination.end_date,
                                        )}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openActivities(trip.id, destination.id)
                                      }
                                    >
                                      Open activities <Icon name="arrow" />
                                    </button>
                                  </div>

                                  {activeView === "scheduled" ? (
                                    <div className="itinerary-destination__days">
                                      {Object.entries(
                                        activities.reduce((days, activity) => {
                                          const date = dateValue(
                                            activity.scheduled_date,
                                          );
                                          if (!days[date]) days[date] = [];
                                          days[date].push(activity);
                                          return days;
                                        }, {}),
                                      ).map(([date, dayActivities]) => (
                                        <div className="itinerary-day" key={date}>
                                          <div className="itinerary-day__date">
                                            <span>{formatFullDate(date)}</span>
                                            <small>
                                              {dayActivities.length}{" "}
                                              {dayActivities.length === 1
                                                ? "plan"
                                                : "plans"}
                                            </small>
                                          </div>
                                          <div className="itinerary-day__activities">
                                            {dayActivities.map(renderActivity)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="itinerary-unscheduled-list">
                                      {activities.map((activity) => (
                                        <article
                                          className="itinerary-unscheduled"
                                          key={activity.id}
                                        >
                                          <span aria-hidden="true" />
                                          <div>
                                            <h4>{activity.name}</h4>
                                            <p>
                                              {activity.notes ||
                                                "Ready to schedule whenever your plans come together."}
                                            </p>
                                          </div>
                                        </article>
                                      ))}
                                    </div>
                                  )}
                                </section>
                              );
                            },
                          )}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}

          </>
        )}
      </main>
    </div>
  );
};

export default Itineraries;
