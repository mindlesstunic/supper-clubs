// ========================================
// SUPPER CLUBS BACKEND SERVER
// ========================================

// Import Express
const express = require("express");
const cors = require("cors");

//Create Express app
const app = express();

//Define port

const PORT = 3000;

//Middleware -Enable CORS

app.use(cors());

// Middleware - Parse JSON requests

app.use(express.json());

// ========================================
// API ROUTES
// ========================================

//Test endpoint -check if serever is running

app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Get club data (hardcoded for now)
app.get("/api/clubs/:id", (req, res) => {
  const clubId = req.params.id;

  // TODO: Later, this will fetch from database
  const clubData = {
    id: clubId,
    name: "Spice Route Stories",
    rating: 4.8,
    reviewCount: 23,
    location: {
      area: "Banjara Hills",
      city: "Hyderabad",
    },
    contact: {
      phone: "+91 98765 43210",
    },
  };

  res.json(clubData);
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🏠 Club endpoint: http://localhost:${PORT}/api/clubs/1`);
});
