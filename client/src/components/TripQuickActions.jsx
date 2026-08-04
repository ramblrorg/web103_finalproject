import { useNavigate } from "react-router-dom";
import { PackingIcon, BudgetIcon } from "../assets/icons/index.js";
import "../css/TripQuickActions.css";

// Right-side panel on the Trip Dashboard, styled after the wireframe's
// "quick actions" list. Packing List is live; Expenses has no backend yet
// (unassigned ticket) so it's rendered as a disabled placeholder -- it
// exists here purely so the layout/entry point is already in place once
// that ticket is picked up.
const TripQuickActions = ({ tripId }) => {
  const navigate = useNavigate();

  return (
    <aside className="quick-actions">
      <h2 className="quick-actions__heading">Quick Actions</h2>

      <div className="quick-actions__list">
        <button
          type="button"
          className="quick-actions__item"
          onClick={() => navigate(`/trips/${tripId}/packing-list`)}
        >
          <span className="quick-actions__icon quick-actions__icon--packing">
            <PackingIcon />
          </span>
          <span className="quick-actions__text">
            <span className="quick-actions__title">Packing List</span>
            <span className="quick-actions__subtitle">View and manage packing items</span>
          </span>
          <span className="quick-actions__chevron" aria-hidden="true">
            ›
          </span>
        </button>

        <button
          type="button"
          className="quick-actions__item"
          onClick={() => navigate(`/trips/${tripId}/expenses`)}
        >
          <span className="quick-actions__icon quick-actions__icon--expenses">
            <BudgetIcon />
          </span>
          <span className="quick-actions__text">
            <span className="quick-actions__title">
              Expenses
            </span>
            <span className="quick-actions__subtitle">Track spending and budget</span>
          </span>
          <span className="quick-actions__chevron" aria-hidden="true">
            ›
          </span>
        </button>
      </div>
    </aside>
  );
};

export default TripQuickActions;
