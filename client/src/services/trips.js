// Thin wrapper around the Trips API (server/routes/trips.js — T2).
// No auth yet -- every request resolves against the current seeded user.

const BASE_URL = "/api/trips";

const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

// GET /api/trips
export const fetchTrips = async () => {
  const res = await fetch(BASE_URL);
  const body = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(body.error || "Failed to load trips.");
  }

  return body;
};

// GET /api/trips/:id
export const fetchTripById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  const body = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(body.error || "Failed to load trip.");
  }

  return body;
};

// POST /api/trips
export const createTrip = async ({ title, startDate, endDate, budget }) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, startDate, endDate, budget }),
  });
  const body = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(body.error || "Failed to create trip.");
  }

  return body;
};

// PATCH /api/trips/:id
export const updateTrip = async (id, { title, startDate, endDate, budget }) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, startDate, endDate, budget }),
  });
  const body = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(body.error || "Failed to update trip.");
  }

  return body;
};

// DELETE /api/trips/:id — server responds 204 No Content on success, so
// there's no body to parse there (parseJsonSafe would just swallow the
// empty-body JSON error, but we still guard on res.ok either way).
export const deleteTrip = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const body = await parseJsonSafe(res);
    throw new Error(body.error || "Failed to delete trip.");
  }
};

export { getAllTrips, getTripById, createTrip, updateTrip, deleteTrip };