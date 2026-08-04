const BASE_URL = "/api";

// GET /api/trips/:tripId/expenses
export const getExpensesForTrip = async (tripId) => {
  const response = await fetch(`${BASE_URL}/trips/${tripId}/expenses`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
};

// GET /api/trips/:tripId/expenses/summary
export const getExpensesSummaryForTrip = async (tripId) => {
  const response = await fetch(`${BASE_URL}/trips/${tripId}/expenses/summary`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data[0];
}

// POST /api/trips/:tripId/expenses
export const createExpense = async (tripId, expense) => {
  const response = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
};

// PATCH /api/expenses/:id
export const updateExpense = async (expenseId, updates) => {
  const response = await fetch(`${BASE_URL}/expenses/${expenseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
};


// DELETE /api/expenses/:id
export const deleteExpense = async (expenseId) => {
  const response = await fetch(`${BASE_URL}/expenses/${expenseId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Request failed");
  }
};
