import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import Profile from './pages/Profile.jsx';
import Trips from './pages/Trips.jsx';
import TripForm from './pages/TripForm.jsx';
import TripDestinations from './pages/TripDestinations.jsx';
import Activities from './pages/Activities.jsx';

const App = () => {
  let element = useRoutes([
    { path: '/', element: <Navigate to="/trips" replace /> },
    { path: '/profile', element: <Profile /> },
    { path: '/trips', element: <Trips /> },
    { path: '/trips/new', element: <TripForm /> },
    { path: '/trips/:id/edit', element: <TripForm /> },
    { path: '/trips/:tripId', element: <TripDestinations /> },
    { path: '/trips/:tripId/destinations/:destinationId/activities', element: <Activities /> },
  ]);

  return <div className="app">{element}</div>;
};

export default App;