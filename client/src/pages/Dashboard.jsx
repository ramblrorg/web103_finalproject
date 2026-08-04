import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { fetchTrips } from "../services/trips.js";
import { fetchCurrentUser } from "../services/users.js";
import {
  formatBudget,
  formatDateRange,
  toDateInputValue,
} from "../helpers/tripFormat.js";
import placeholderImg from "../assets/trip-placeholder.svg";
import "../css/Dashboard.css";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1707343848552-893e05dba6ac?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const GREETINGS = [
  "Welcome back",
  "Bonjour",
  "Hola",
  "Ciao",
  "Salaam",
  "こんにちは",
];

const useTypingGreeting = () => {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentGreeting = GREETINGS[greetingIndex];
    const isComplete = displayedText === currentGreeting;
    const delay = isDeleting ? 42 : isComplete ? 1550 : 78;

    const timeoutId = window.setTimeout(() => {
      if (!isDeleting && isComplete) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && displayedText.length === 0) {
        setIsDeleting(false);
        setGreetingIndex((current) => (current + 1) % GREETINGS.length);
        return;
      }

      setDisplayedText(
        isDeleting
          ? currentGreeting.slice(0, displayedText.length - 1)
          : currentGreeting.slice(0, displayedText.length + 1),
      );
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [displayedText, greetingIndex, isDeleting]);

  return displayedText;
};

const getFirstName = (name) => {
  const value = name?.trim();
  return value ? value.split(/\s+/)[0] : "Traveler";
};

const toDate = (value) => {
  const normalized = toDateInputValue(value);
  return normalized ? new Date(`${normalized}T00:00:00`) : null;
};

const today = () => {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
};

const getTripState = (trip) => {
  const currentDate = today();
  const start = toDate(trip.start_date);
  const end = toDate(trip.end_date);

  if (end && end < currentDate) return "completed";
  if (start && start <= currentDate && (!end || end >= currentDate)) return "active";
  if (start && start > currentDate) return "upcoming";
  return "unscheduled";
};

const daysUntil = (trip) => {
  const start = toDate(trip.start_date);
  if (!start) return null;
  return Math.ceil((start.getTime() - today().getTime()) / 86400000);
};

const sortTrips = (trips) =>
  [...trips].sort((a, b) => {
    const first = toDate(a.start_date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const second = toDate(b.start_date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return first - second;
  });

const Icon = ({ name }) => {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    trips: <path d="M4 7h16v11H4zM8 7V5h8v2M8 18v1m8-1v1" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    calendar: <path d="M6 3v3m12-3v3M4 8h16M5 5h14v15H5z" />,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15 9-2 4-4 2 2-4z" /></>,
    wallet: <><path d="M4 7h15v11H4z" /><path d="M4 7V5h12v2m0 5h3" /></>,
    plane: <path d="m3 13 18-8-6 14-3-6z" />,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

const TripImage = ({ trip }) => {
  const [failed, setFailed] = useState(false);
  const src = trip?.image_url && !failed ? trip.image_url : placeholderImg;

  return <img src={src} alt="" onError={() => setFailed(true)} />;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const typedGreeting = useTypingGreeting();

  const loadDashboard = async () => {
    try {
      setStatus("loading");
      setError("");
      const [tripData, userData] = await Promise.all([
        fetchTrips(),
        fetchCurrentUser(),
      ]);
      setTrips(tripData);
      setUser(userData);
      setStatus("ready");
    } catch (err) {
      setError(err.message || "We couldn't load your dashboard.");
      setStatus("error");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const data = useMemo(() => {
    const upcoming = sortTrips(
      trips.filter((trip) => ["active", "upcoming"].includes(getTripState(trip))),
    );
    const completed = trips.filter((trip) => getTripState(trip) === "completed");
    const totalBudget = trips.reduce((sum, trip) => {
      const budget = Number(trip.budget);
      return Number.isFinite(budget) ? sum + budget : sum;
    }, 0);

    return {
      upcoming,
      completed,
      totalBudget,
      preview: upcoming.slice(0, 3),
    };
  }, [trips]);

  return (
    <div className="page">
      <Sidebar />

      <main className="travel-home">
        <section className="travel-hero">
          <img
            className="travel-hero__image"
            src={heroImageFailed ? placeholderImg : HERO_IMAGE}
            alt="Everest Base Camp mountain landscape in Nepal"
            referrerPolicy="no-referrer"
            onError={() => setHeroImageFailed(true)}
          />
          <div className="travel-hero__overlay" />
          <div className="travel-hero__content">
            <p className="travel-hero__eyebrow">Your next chapter starts here</p>
            <h1 aria-label={`Welcome back, ${getFirstName(user?.display_name)}`}>
              <span className="travel-hero__typed" aria-hidden="true">
                {typedGreeting}
                <span className="travel-hero__cursor" />
              </span>
              <span className="travel-hero__name">
                {getFirstName(user?.display_name)}.
              </span>
            </h1>
            <p>
              Keep every journey organized, from the first idea to the final memory.
            </p>
            <div className="travel-hero__actions">
              <button type="button" className="travel-button travel-button--light" onClick={() => navigate("/trips/new")}>
                <Icon name="plus" />
                Plan a new trip
              </button>
              <button type="button" className="travel-button travel-button--ghost" onClick={() => navigate("/trips")}>
                Browse my trips
                <Icon name="arrow" />
              </button>
            </div>
          </div>
          <p className="travel-hero__credit">Everest Base Camp, Nepal</p>
        </section>

        {status === "loading" && (
          <div className="travel-status">Gathering your latest travel plans…</div>
        )}

        {status === "error" && (
          <div className="travel-status travel-status--error">
            <div>
              <strong>We couldn't load your dashboard.</strong>
              <p>{error}</p>
            </div>
            <button type="button" className="btn btn--secondary" onClick={loadDashboard}>Try again</button>
          </div>
        )}

        {status === "ready" && (
          <>
            <section className="travel-section travel-section--intro">
              <div className="travel-section__heading">
                <div>
                  <p className="travel-kicker">Start here</p>
                  <h2>What would you like to do?</h2>
                </div>
                <p>Jump back into planning without searching through the whole app.</p>
              </div>

              <nav className="travel-actions" aria-label="Dashboard shortcuts">
                <button type="button" onClick={() => navigate("/trips/new")}>
                  <span className="travel-actions__number">01</span>
                  <span className="travel-actions__copy">
                    <strong>Plan a new trip</strong>
                    <small>Start somewhere new</small>
                  </span>
                  <span className="travel-actions__arrow" aria-hidden="true">→</span>
                </button>

                <button type="button" onClick={() => navigate("/trips")}>
                  <span className="travel-actions__number">02</span>
                  <span className="travel-actions__copy">
                    <strong>View my trips</strong>
                    <small>Browse your travel collection</small>
                  </span>
                  <span className="travel-actions__arrow" aria-hidden="true">→</span>
                </button>

                {data.upcoming[0] && (
                  <button
                    type="button"
                    onClick={() => navigate(`/trips/${data.upcoming[0].id}`)}
                  >
                    <span className="travel-actions__number">03</span>
                    <span className="travel-actions__copy">
                      <strong>Continue planning</strong>
                      <small>{data.upcoming[0].title}</small>
                    </span>
                    <span className="travel-actions__arrow" aria-hidden="true">→</span>
                  </button>
                )}
              </nav>
            </section>

            <section className="travel-section travel-section--trips">
              <div className="travel-section__heading travel-section__heading--row">
                <div>
                  <p className="travel-kicker">Coming up</p>
                  <h2>Your next journeys</h2>
                </div>
                <button type="button" className="travel-text-link" onClick={() => navigate("/trips")}>View all trips <Icon name="arrow" /></button>
              </div>

              {data.preview.length === 0 ? (
                <div className="travel-empty">
                  <Icon name="plane" />
                  <h3>No upcoming trips yet</h3>
                  <p>Start planning whenever inspiration strikes.</p>
                  <button type="button" className="btn btn--primary" onClick={() => navigate("/trips/new")}>Plan a trip</button>
                </div>
              ) : (
                <div className="travel-trip-list">
                  {data.preview.map((trip) => {
                    const remaining = daysUntil(trip);
                    return (
                      <article key={trip.id} className="travel-trip" onClick={() => navigate(`/trips/${trip.id}`)}>
                        <div className="travel-trip__image"><TripImage trip={trip} /></div>
                        <div className="travel-trip__body">
                          <span>{getTripState(trip) === "active" ? "Happening now" : remaining === 1 ? "Tomorrow" : remaining > 1 ? `In ${remaining} days` : "Upcoming"}</span>
                          <h3>{trip.title}</h3>
                          <p><Icon name="calendar" /> {formatDateRange(trip.start_date, trip.end_date)}</p>
                        </div>
                        <span className="travel-trip__arrow"><Icon name="arrow" /></span>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="travel-story">
              <div className="travel-story__copy">
                <p className="travel-kicker">Your travel story</p>
                <h2>A simple look at everywhere you’ve been—and everywhere you’re going.</h2>
                <p>
                  Keep the details organized here, then spend less time managing and more time enjoying the journey.
                </p>
              </div>

              <div className="travel-snapshot">
                <div>
                  <Icon name="trips" />
                  <strong>{trips.length}</strong>
                  <span>
                    Total {trips.length === 1 ? "Trip" : "Trips"}
                  </span>
                </div>
                <div><Icon name="calendar" /><strong>{data.upcoming.length}</strong><span>Upcoming</span></div>
                <div><Icon name="compass" /><strong>{data.completed.length}</strong><span>Completed</span></div>
                <div><Icon name="wallet" /><strong>{formatBudget(data.totalBudget) || "$0"}</strong><span>Planned budget</span></div>
              </div>
            </section>

            <div className="travel-closing">
  

              <div className="travel-closing">
                <p className="travel-closing__quote">
                  Every destination has a story, and every journey leaves a memory behind.
                  Thanks for letting Ramblr be part of yours.
                </p>

                <p className="travel-closing__tagline">
                  Travel well. Ramble often.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
