import { pool } from "../config/database.js";

// No auth yet, so "the current user" is just the one seeded user.
// TODO: once auth exists, resolve the user from the session/token instead.
const getCurrentUser = async (req, res) => {
  const getQuery = "SELECT * FROM users ORDER BY id ASC LIMIT 1";
  try {
    const { rows } = await pool.query(getQuery);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// At the moment, this only makes updates to the first user in the database, since we don't have auth yet. Once auth is implemented, this should be updated to resolve the user from the session/token instead.
// This also only updates the displayName and homeCurrency fields, since those are the only fields that are editable for a user in this app. If more fields are added to the user model in the future, this function should be updated to handle those fields (example password).
const updateCurrentUser = async (req, res) => {
  const { displayName, homeCurrency } = req.body;

  // To follow PATCH protocol, we use COALESCE to only update fields that are provided in the request body. If a field is not provided, it will retain its current value.
  const updateQuery = `
    UPDATE users
    SET display_name = COALESCE($1, display_name),
       home_currency = COALESCE($2, home_currency)
    WHERE id = (SELECT id FROM users ORDER BY id ASC LIMIT 1)
    RETURNING *
  `;

  try {
    const { rows } = await pool.query(updateQuery, [displayName, homeCurrency]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { getCurrentUser, updateCurrentUser };
