import { useEffect, useState } from "react";
import { getCurrentWeather } from "../helpers/weather.js";
import { getCityPhoto } from "../helpers/cityPhoto.js";
import { formatDateRange } from "../helpers/tripFormat.js";
import "../css/AboutDestination.css";

const PinIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 18s6-5.2 6-9.8A6 6 0 0 0 4 8.2C4 12.8 10 18 10 18Z" />
    <circle cx="10" cy="8" r="2.1" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="14" height="13" rx="1.5" />
    <path d="M3 8h14M7 2.5v3M13 2.5v3" />
  </svg>
);

const WeatherIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="7.5" cy="7" r="2.8" />
    <path d="M7.5 1.8v1.2M7.5 12v1.2M2.3 7h1.2M11.5 7h1.2M4 3.5l.9.9M10.1 3.5l-.9.9" />
    <path d="M9.5 15.5h4a2.5 2.5 0 0 0 .4-4.96 3.5 3.5 0 0 0-6.66-1.2" />
  </svg>
);

const CurrencyIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="10" cy="10" r="7.2" />
    <path d="M10 6.2v7.6M12.2 7.8c-.4-.7-1.2-1.1-2.2-1.1-1.3 0-2.3.7-2.3 1.7 0 2.3 4.5 1.1 4.5 3.4 0 1-1 1.7-2.3 1.7-1 0-1.8-.4-2.2-1.1" />
  </svg>
);

const QuickInfoRow = ({ icon, children }) => (
  <li className="about-destination__row">
    <span className="about-destination__row-icon">{icon}</span>
    <span>{children}</span>
  </li>
);

// Sidebar "About" card next to the activity list. Photo/description aren't
// part of the data model, so the photo is looked up live from Wikipedia by
// city name (see helpers/cityPhoto.js) and the rest sticks to real
// destination data (activity count, date range, currency) plus a
// best-effort live weather lookup (helpers/weather.js). Both lookups fail
// quietly -- a flaky third-party API should never break this page.
const AboutDestination = ({ destination, activityCount }) => {
  const [weather, setWeather] = useState({ status: "loading" });
  const [photo, setPhoto] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setWeather({ status: "loading" });

    getCurrentWeather(destination.city, destination.country)
      .then((result) => {
        if (cancelled) return;
        setWeather(result ? { status: "ready", ...result } : { status: "unavailable" });
      })
      .catch(() => {
        if (!cancelled) setWeather({ status: "unavailable" });
      });

    return () => {
      cancelled = true;
    };
  }, [destination.city, destination.country]);

  useEffect(() => {
    let cancelled = false;
    setPhoto({ status: "loading" });

    getCityPhoto(destination.city, destination.country)
      .then((url) => {
        if (cancelled) return;
        setPhoto(url ? { status: "ready", url } : { status: "unavailable" });
      })
      .catch(() => {
        if (!cancelled) setPhoto({ status: "unavailable" });
      });

    return () => {
      cancelled = true;
    };
  }, [destination.city, destination.country]);

  return (
    <aside className="about-destination">
      <div className="about-destination__photo" aria-hidden="true">
        {photo.status === "ready" ? (
          <img className="about-destination__photo-img" src={photo.url} alt="" />
        ) : (
          <span className="about-destination__photo-glyph">✈</span>
        )}
      </div>

      <h2 className="about-destination__title">About {destination.city}</h2>
      <p className="about-destination__blurb">
        Everything planned for your stay in {destination.city}, {destination.country}.
      </p>

      <div className="about-destination__divider" />

      <h3 className="about-destination__section-title">Quick Info</h3>
      <ul className="about-destination__list">
        <QuickInfoRow icon={<PinIcon />}>
          {activityCount} {activityCount === 1 ? "Activity" : "Activities"}
        </QuickInfoRow>
        <QuickInfoRow icon={<CalendarIcon />}>
          {formatDateRange(destination.start_date, destination.end_date)}
        </QuickInfoRow>
        <QuickInfoRow icon={<WeatherIcon />}>
          {weather.status === "ready" && `${weather.tempF}°F / ${weather.tempC}°C`}
          {weather.status === "loading" && "Checking weather…"}
          {weather.status === "unavailable" && "Weather unavailable"}
        </QuickInfoRow>
        {destination.currency_code && (
          <QuickInfoRow icon={<CurrencyIcon />}>{destination.currency_code}</QuickInfoRow>
        )}
      </ul>
    </aside>
  );
};

export default AboutDestination;
