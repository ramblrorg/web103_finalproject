import { Link, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import PackingListSection from "../components/PackingListSection.jsx";
import "../css/Profile.css";
import "../css/PackingList.css";

const PackingList = () => {
  const { tripId } = useParams();

  return (
    <div className="page">
      <Sidebar />

      <main className="packing-page">
        <Link to={`/trips/${tripId}`} className="packing-page__back">
          ← Back to Trip Dashboard
        </Link>

        <PackingListSection tripId={tripId} />
      </main>
    </div>
  );
};

export default PackingList;