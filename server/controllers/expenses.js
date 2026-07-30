import { pool } from "../config/database.js";
//function to confirm tripid and userid are valid and exist in the database

// TODO: placeholder query, adjust columns/table once the expenses schema is finalized
const getAllExpenses = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM expenses");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TODO: placeholder query, adjust columns/table once the expenses schema is finalized
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM expenses WHERE id = $1", [id]);
    if (!rows.length) return res.status(404).json({ error: "Expense not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/expenses/
const createExpense = async (req, res) => {
  //get tripid and userid from req.body, validate they exist in the database, get characteristics of expense from req.body
  //then insert into expenses table with characteristics of with characteristics of amount_usd (nn), category (lodging, travel, activity, food), status (actual/estimated), description, and spent_at
  //try catch statement where we will insert item into table with all characteristics
  res.status(501).json({ error: "Not implemented" });
};

// PUT /api/expenses/:tripId
const updateExpense = async (req, res) => {
  //get tripid and userid from req.body, validate they exist in the database, get characteristics of expense from req.body
  //then update expenses table with characteristics of amount_usd (nn), category (lodging, travel, activity, food), status (actual/estimated), description, and spent_at
  //try catch statement where we will update item in table with all characteristics
};

// DELETE /api/expenses/:tripId
const deleteExpense = async (req, res) => {
  //get tripid and userid from req.body, validate they exist in the database, get expense from req.body
  //then delete expense from expenses table
  //try catch statement where we will delete item in table
  res.status(501).json({ error: "Not implemented" });
};

export { getAllExpenses, getExpenseById, createExpense, updateExpense, deleteExpense };
