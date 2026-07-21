import { pool } from "../config/database.js";

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

// TODO: not implemented yet
const createExpense = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

// TODO: not implemented yet
const updateExpense = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

// TODO: not implemented yet
const deleteExpense = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

export { getAllExpenses, getExpenseById, createExpense, updateExpense, deleteExpense };
