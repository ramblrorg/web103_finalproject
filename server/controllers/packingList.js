import { pool } from "../config/database.js";

// TODO: placeholder query, adjust columns/table once the packing list schema is finalized
const getAllPackingListItems = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM packing_list_items");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TODO: placeholder query, adjust columns/table once the packing list schema is finalized
const getPackingListItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM packing_list_items WHERE id = $1", [id]);
    if (!rows.length) return res.status(404).json({ error: "Packing list item not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TODO: not implemented yet
const createPackingListItem = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

// TODO: not implemented yet
const updatePackingListItem = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

// TODO: not implemented yet
const deletePackingListItem = async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

export {
  getAllPackingListItems,
  getPackingListItemById,
  createPackingListItem,
  updatePackingListItem,
  deletePackingListItem,
};
