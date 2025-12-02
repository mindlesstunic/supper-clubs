require("dotenv").config();
// ========================================
// SUPPER CLUBS BACKEND SERVER
// ========================================

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

//Import routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const adminRoutes = require("./routes/admin");
const clubsRoutes = require("./routes/clubs");
const hostsRoutes = require("./routes/hosts");

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// API ROUTES

// Health check endpoint

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// AUTH ROUTES

app.use("/api/auth", authRoutes);

// EVENT ROUTES

app.use("/api/events", eventRoutes);

// ADMIN ROUTES
app.use("/api/admin", adminRoutes);

// HOSTS ROUTES
app.use("/api/hosts", hostsRoutes);

// CLUBS ROUTES
app.use("/api/clubs", clubsRoutes);


// START SERVER

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎉 Events API: http://localhost:${PORT}/api/events`);
});
