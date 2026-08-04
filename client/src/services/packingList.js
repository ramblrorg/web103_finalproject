// Thin wrapper around the Packing List API (server/routes/packingList.js
// and server/routes/packingListForTrip.js — T6). Endpoints mirror the
// actual backend routes, which use "packing-list" rather than the
// "packing-items" naming in the issue description.

const BASE_URL = import.meta.env.PROD
  ? "https://ramblr-r5x1.onrender.com"
  : "/api";

const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

// GET /api/trips/:tripId/packing-list
export const getPackingListForTrip = async (tripId) => {
  const res = await fetch(`${BASE_URL}/trips/${tripId}/packing-list`);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || "Failed to load packing list.");
  return data;
};

// POST /api/trips/:tripId/packing-list
export const createPackingListItem = async (tripId, { name }) => {
  const res = await fetch(`${BASE_URL}/trips/${tripId}/packing-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || "Failed to add item.");
  return data;
};

// POST /api/trips/:tripId/packing-list/generate
export const generatePackingList = async (tripId) => {
  const res = await fetch(`${BASE_URL}/trips/${tripId}/packing-list/generate`, {
    method: "POST",
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || "Failed to generate essentials.");
  return data;
};

// PATCH /api/packing-list/:id
export const updatePackingListItem = async (itemId, updates) => {
  const res = await fetch(`${BASE_URL}/packing-list/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || "Failed to update item.");
  return data;
};

// DELETE /api/packing-list/:id
export const deletePackingListItem = async (itemId) => {
  const res = await fetch(`${BASE_URL}/packing-list/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error(data.error || "Failed to delete item.");
  }
};
