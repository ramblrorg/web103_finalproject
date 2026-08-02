import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// TEMPORARY: previewing TripDestinations directly since routing isn't wired
// up on this branch yet. Revert to <App /> once this page is wired into
// real routing (after the sidebar/router PR merges).
import TripDestinations from './pages/TripDestinations'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TripDestinations tripId={1} />
    </BrowserRouter>
  </React.StrictMode>
)