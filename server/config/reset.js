// Where all the database reset and seeding logic is located. This file is run with the command `npm run reset-db` in the terminal.

import "./dotenv.js";
import { pool } from "./database.js";
import { users } from "../data/users.js";

// Down: DROP TABLE IF EXISTS users;
// Up: CREATE TABLE users (...) below.
const createUsersTableQuery = `
  DROP TABLE IF EXISTS users;

  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    display_name VARCHAR NOT NULL,
    home_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
`;

const createUsersTable = async () => {
  try {
    await pool.query(createUsersTableQuery);
    console.log("✅ users table created successfully");
  } catch (error) {
    console.error("⚠️ Error creating users table:", error);
  }
};

const insertUserQuery =
  "INSERT INTO users (display_name, home_currency) VALUES ($1, $2)";

const seedUsers = async () => {
  await createUsersTable();

  for (const user of users) {
    try {
      await pool.query(insertUserQuery, [user.displayName, user.homeCurrency]);
      console.log(`✅ Seeded user: ${user.displayName}`);
    } catch (error) {
      console.error(`⚠️ Error seeding user ${user.displayName}:`, error);
    }
  }
};

const seedDBs = async () => {
  try {
    await seedUsers();
    console.log("Database seeding complete.");
  } catch (err) {
    console.error("Database seeding failed:", err);
    process.exitCode = 1;
  }
};

seedDBs();
