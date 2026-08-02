const BASE_URL = "/api";

// GET /api/trips/:id
export const getTrip = async (tripId) => {
  const response = await fetch(`${BASE_URL}/trips/${tripId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
};
