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

// GET /api/destinations/:destinationId/activities
export const getActivitiesForDestination = async (destinationId) => {
  const res = await fetch(
    `${BASE_URL}/destinations/${destinationId}/activities`,
  );
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || "Failed to load activities.");
  return data;
};

// POST /api/destinations/:destinationId/activities
export const createActivity = async (destinationId, activity) => {
  const res = await fetch(
    `${BASE_URL}/destinations/${destinationId}/activities`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activity),
    },
  );
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || "Failed to create activity.");
  return data;
};

// PATCH /api/activities/:id
// Pass scheduledDate: null explicitly to unschedule -- the backend only
// touches scheduled_date when the key is present in the body at all.
export const updateActivity = async (activityId, updates) => {
  const res = await fetch(`${BASE_URL}/activities/${activityId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || "Failed to update activity.");
  return data;
};

// DELETE /api/activities/:id
export const deleteActivity = async (activityId) => {
  const res = await fetch(`${BASE_URL}/activities/${activityId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await parseJsonSafe(res);
    throw new Error(data.error || "Failed to delete activity.");
  }
};
