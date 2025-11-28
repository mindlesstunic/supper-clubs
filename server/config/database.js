// ========================================
// DATABASE CONNECTION CONFIGURATION
// ========================================

const { Pool } = require("pg");

// Use DATABASE_URL from environment (production) or local config (development)
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://raghuveerbongu@localhost:5432/supper_clubs",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error connecting to database:", err.stack);
  } else {
    console.log("✅ Connected to PostgreSQL database!");
    release();
  }
});

module.exports = pool;
