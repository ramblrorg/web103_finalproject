import { Link, useLocation } from "react-router-dom";
import {
  DashboardIcon,
  TripsIcon,
  ItineraryIcon,
  ProfileIcon,
  LogoutIcon,
} from "../assets/icons/index.js";
import "../css/Sidebar.css";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", Icon: DashboardIcon },
  { label: "My Trips", path: "/trips", Icon: TripsIcon },
  { label: "Itineraries", path: "/itinerary", Icon: ItineraryIcon },
  { label: "Profile", path: "/profile", Icon: ProfileIcon },
];

const Sidebar = () => {
  const { pathname } = useLocation();

  const isActive = (path) => {
    if (path === "/trips") {
      return pathname === "/trips" || pathname.startsWith("/trips/");
    }

    return pathname === path;
  };

  return (
    <aside className="sidebar">
      <Link
        to="/dashboard"
        className="sidebar__brand"
        aria-label="Go to Ramblr dashboard"
      >
        <span
          className="sidebar__brand-logo"
          aria-hidden="true"
        />
        <span className="sidebar__brand-name">Ramblr</span>
      </Link>

      <nav className="sidebar__nav" aria-label="Primary navigation">
        {NAV_ITEMS.map(({ label, path, Icon }) => (
          <Link
            key={path}
            to={path}
            className={`sidebar__link${
              isActive(path) ? " sidebar__link--active" : ""
            }`}
          >
            <span className="sidebar__icon" aria-hidden="true">
              <Icon />
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__message">
          <span className="sidebar__message-top">Travel well.</span>
          <span className="sidebar__message-bottom">Ramble often.</span>
        </p>

        <button type="button" className="sidebar__link sidebar__logout">
          <span className="sidebar__icon" aria-hidden="true">
            <LogoutIcon />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
