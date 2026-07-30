import { pool } from "../config/database.js";
import { isValidId } from "../helpers/validation.js";
import { getCurrentUserId } from "../helpers/currentUser.js";
import { getOwnedTrip } from "../helpers/tripOwnership.js";

//helper function to check if the user owns the trip before allowing them to create, update, or delete an expense
const getOwnedExpenses = async (expenseId, userId) => {
  const { rows } = await pool.query (
    `SELECT expenses.*
     FROM expenses
     JOIN trips ON expenses.trip_id = trips.id
     WHERE expenses.id = $1 AND trips.user_id = $2`,
    [expenseId, userId],
  );
  return rows[0] ?? null;
};

// GET /api/trips/:tripId/expenses/summary - returns total expenses, and remaining budget for trip
const getAllExpenses = async (req, res) => {
  const { tripId } = req.params;
  if (!isValidId(tripId)) return res.status(400).json({ error: "Invalid trip id" });

  try {
    const userId = await getCurrentUserId();
    if (!userId) return res.status(404).json({ error: "User not found" });

    const trip = await getOwnedTrip(tripId, userId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const { rows } = await pool.query(
      `SELECT 
      SUM(amount_usd) AS total_expenses,
      (t.budget_usd - SUM(amount_usd)) AS remaining_budget
      FROM trips t
      LEFT JOIN expenses e ON t.id = e.trip_id
      GROUP BY t.id, t.budget_usd
      HAVING t.id = $1`,
      [tripId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/expenses/:id — get an expense by its ID
const getExpenseById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid expense id" });

  try {
    const userId = await getCurrentUserId();
    if (!userId) return res.status(404).json({ error: "User not found" });

    const expenses = await getOwnedExpenses(id, userId);
    if (!expenses) return res.status(404).json({ error: "Expense not found" });

    const { rows } = await pool.query("SELECT * FROM expenses WHERE id = $1", [id]);
    if (!rows.length) return res.status(404).json({ error: "Expense not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/trips/:tripId/expenses — add an expense to a trip; amount_usd, category, status, description, and spent_at are required fields.
const createExpense = async (req, res) => {
  const { tripId } = req.params;
  const { amount_usd, category, status, description, spent_at } = req.body;
  if (!isValidId(tripId)) return res.status(400).json({ error: "Invalid trip id" });
  if (!amount_usd) return res.status(400).json({ error: "Amount in USD is required" });
  if (!category) return res.status(400).json({ error: "Category is required" });
  
  try {
    const userId = await getCurrentUserId();
    if (!userId) return res.status(404).json({ error: "User not found" });

    const trip = await getOwnedTrip(tripId, userId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const { rows } = await pool.query(
      `INSERT INTO expenses 
      (trip_id, amount_usd, category, status, description, spent_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [tripId, amount_usd, category, status, description, spent_at],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  //get tripid and userid from req.body, validate they exist in the database, get characteristics of expense from req.body
  //then insert into expenses table with characteristics of with characteristics of amount_usd (nn), category (lodging, travel, activity, food), status (actual/estimated), description, and spent_at
  //try catch statement where we will insert item into table with all characteristics
};

// PATCH /api/expenses/:id
const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { amount_usd, category, status, description, spent_at } = req.body;

  if (!amount_usd) return res.status(400).json({ error: "Amount in USD is required" });
  if (!category) return res.status(400).json({ error: "Category is required" });
  
  try {
    const userId = await getCurrentUserId();
    if (!userId) return res.status(404).json({ error: "User not found" });

    const expense = await getOwnedExpenses(id, userId);
    if (!expense) return res.status(404).json({ error: "Expense not found" });

    const { rows } = await pool.query(
      `UPDATE expenses
       SET amount_usd = COALESCE($1, amount_usd), 
       category = COALESCE($2, category), 
       status = COALESCE($3, status), 
       description = COALESCE($4, description), 
       spent_at = COALESCE($5, spent_at)
       WHERE id = $6
       RETURNING *`,
      [amount_usd, category, status, description, spent_at, id],
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  //get tripid and userid from req.body, validate they exist in the database, get characteristics of expense from req.body
  //then update expenses table with characteristics of amount_usd (nn), category (lodging, travel, activity, food), status (actual/estimated), description, and spent_at
  //try catch statement where we will update item in table with all characteristics
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid expense id" });

  try {
    const userId = await getCurrentUserId();
    if (!userId) return res.status(404).json({ error: "User not found" });

    const expense = await getOwnedExpenses(id, userId);
    if (!expense) return res.status(404).json({ error: "Expense not found" });

    await pool.query("DELETE FROM expenses WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  //get tripid and userid from req.body, validate they exist in the database, get expense from req.body
  //then delete expense from expenses table
  //try catch statement where we will delete item in table
};

export { getAllExpenses, getExpenseById, createExpense, updateExpense, deleteExpense };
