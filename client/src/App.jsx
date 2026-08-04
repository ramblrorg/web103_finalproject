import React from "react";
import { Navigate, useRoutes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Trips from "./pages/Trips.jsx";
import TripForm from "./pages/TripForm.jsx";
import TripDestinations from "./pages/TripDestinations.jsx";
import Activities from "./pages/Activities.jsx";
import PackingList from "./pages/PackingList.jsx";
import TripExpenses from "./pages/TripExpenses.jsx";
import Itineraries from "./pages/Itineraries.jsx";

const App = () => {
  const element = useRoutes([
    { path: "/", element: <Navigate to="/dashboard" replace /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/profile", element: <Profile /> },
    { path: "/itinerary", element: <Itineraries /> },
    { path: "/trips", element: <Trips /> },
    { path: "/trips/new", element: <TripForm /> },
    { path: "/trips/:id/edit", element: <TripForm /> },
    { path: "/trips/:tripId", element: <TripDestinations /> },
    {
      path: "/trips/:tripId/destinations/:destinationId/activities",
      element: <Activities />,
    },
    {
      path: "/trips/:tripId/packing-list",
      element: <PackingList />,
    },
    {
      path: "/trips/:tripId/expenses",
      element: <TripExpenses />,
    },
  ]);

  return <div className="app">{element}</div>;
};

export default App;