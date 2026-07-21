import { pool } from "../config/database.js";

// TODO: placeholder query, adjust columns/table once the trips schema is finalized
const getAllTrips = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM trips");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TODO: placeholder query, adjust columns/table once the trips schema is finalized
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM trips WHERE id = $1", [id]);
    if (!rows.length) return res.status(404).json({ error: "Trip not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TODO: not implemented yet
const createTrip = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

// TODO: not implemented yet
const updateTrip = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

// TODO: not implemented yet
const deleteTrip = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

export { getAllTrips, getTripById, createTrip, updateTrip, deleteTrip };
