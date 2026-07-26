import { Link, useLocation } from "react-router-dom";
import "../css/Sidebar.css";

// Simple inline stroke icons so the sidebar doesn't need an icon library dependency.
const icons = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.2" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.2" />
    </svg>
  ),
  trips: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="6.5" width="14" height="9.5" rx="1.5" />
      <path d="M7 6.5V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M3 11h14" />
    </svg>
  ),
  itinerary: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3.5" width="14" height="13" rx="1.5" />
      <path d="M3 7.5h14" />
      <path d="M7 2v3M13 2v3" />
      <path d="M6.5 11h2M6.5 13.5h5" />
    </svg>
  ),
  budget: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6.5v7M12 8.2c-.4-.6-1.1-1-2-1-1.2 0-2.1.7-2.1 1.6 0 .9.9 1.3 2.1 1.6 1.2.3 2.1.8 2.1 1.7 0 .9-.9 1.6-2.1 1.6-.9 0-1.6-.4-2-1" />
    </svg>
  ),
  packing: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="4" width="13" height="13" rx="1.5" />
      <path d="M4 8.5h12" />
      <path d="M6.5 11.5l1.3 1.3 2.2-2.6" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="7" r="3.2" />
      <path d="M3.8 16.5a6.3 6.3 0 0 1 12.4 0" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 3.5H4.8A1.3 1.3 0 0 0 3.5 4.8v10.4a1.3 1.3 0 0 0 1.3 1.3H8" />
      <path d="M12.5 13.5 16.5 10 12.5 6.5" />
      <path d="M7 10h9.3" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { label: "My Trips", path: "/trips", icon: "trips" },
  { label: "Itinerary", path: "/itinerary", icon: "itinerary" },
  { label: "Budget", path: "/budget", icon: "budget" },
  { label: "Packing List", path: "/packing-list", icon: "packing" },
  { label: "Profile", path: "/profile", icon: "profile" },
];

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark" aria-hidden="true">
          ✈
        </span>
        <span className="sidebar__brand-name">TripPlan</span>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar__link${pathname === item.path ? " sidebar__link--active" : ""}`}
          >
            <span className="sidebar__icon">{icons[item.icon]}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <button type="button" className="sidebar__link sidebar__logout">
        <span className="sidebar__icon">{icons.logout}</span>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
