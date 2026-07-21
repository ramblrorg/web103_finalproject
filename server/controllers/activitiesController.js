import { pool } from "../config/database.js";

// TODO: placeholder query, adjust columns/table once the activities schema is finalized
const getAllActivities = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM activities");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TODO: placeholder query, adjust columns/table once the activities schema is finalized
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM activities WHERE id = $1", [id]);
    if (!rows.length) return res.status(404).json({ error: "Activity not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TODO: not implemented yet
const createActivity = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

// TODO: not implemented yet
const updateActivity = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

// TODO: not implemented yet
const deleteActivity = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

export { getAllActivities, getActivityById, createActivity, updateActivity, deleteActivity };
