// ========================================
// DATABASE CONNECTION CONFIGURATION
// ========================================

const { Pool } = require("pg");

// Create connection pool
const pool = new Pool({
  user: "raghuveerbongu",
  host: "localhost",
  database: "supper_clubs",
  password: "",
  port: 5432,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error(" Error connecting to database:", err.stack);
  } else {
    console.log(" Connected to PostgreSQL database!");

    release();
  }
});

module.exports = pool;
