import { pool } from "../config/database.js";

//function to confirm tripid and userid are valid and exist in the database

// TODO: placeholder query, adjust columns/table once the packing list schema is finalized
const getAllPackingListItems = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM packing_list_items");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /packing-list-items/:id  - Retrieve a specific packing list item by its ID
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

// POST /packing-list-items - Create a new packing list item
const createPackingListItem = async (req, res) => {
  //get tripid and userid from req.body, validate they exist in the database, get characteristics of packing list item from req.body
  // then insert into packing_list_items table with characteristics of name, is_packed, and is_auto_generated
  //try catch statement where we will insert item into table, with characteristics of name
  res.status(501).json({ error: "Not implemented" });
};

// PUT /packing-list-items/:id - Update an existing packing list item
const updatePackingListItem = async (req, res) => {
  //get tripid and userid from req.body, validate they exist in the database, get characteristics of packing list item from req.body
  //then update packing_list_items table with characteristics of name, is_packed, is_auto_generated, and tripid
  //try catch statement where we will update item in table, with characteristics of name, is_packed, is_auto_generated, and tripid
  res.status(501).json({ error: "Not implemented" });
};

// DELETE /packing-list-items/:id - Delete a packing list item
const deletePackingListItem = async (req, res) => {
  //get tripid and userid from req.body, validate they exist in the database, get packing list item from req.body
  //then delete packing_list_item from packing_list_items table
  //try catch statement where we will delete item in table
  res.status(501).json({ error: "Not implemented" });
};

export {
  getAllPackingListItems,
  getPackingListItemById,
  createPackingListItem,
  updatePackingListItem,
  deletePackingListItem,
};
