const BASE_URL = import.meta.env.PROD
  ? "https://ramblr-r5x1.onrender.com"
  : "/api";

// GET /api/trips/:tripId/destinations
export const getDestinationsForTrip = async (tripId) => {
  const response = await fetch(`${BASE_URL}/trips/${tripId}/destinations`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
};

// POST /api/trips/:tripId/destinations
export const createDestination = async (tripId, destination) => {
  const response = await fetch(`${BASE_URL}/trips/${tripId}/destinations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(destination),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
};

// GET /api/destinations/:id
export const getDestinationById = async (destinationId) => {
  const response = await fetch(`${BASE_URL}/destinations/${destinationId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
};

// PATCH /api/destinations/:id
export const updateDestination = async (destinationId, updates) => {
  const response = await fetch(`${BASE_URL}/destinations/${destinationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
};

// DELETE /api/destinations/:id
export const deleteDestination = async (destinationId) => {
  const response = await fetch(`${BASE_URL}/destinations/${destinationId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Request failed");
  }
};
