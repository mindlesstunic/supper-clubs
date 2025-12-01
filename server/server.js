// ========================================
// SUPPER CLUBS BACKEND SERVER
// ========================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  //1. Get token from header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; //Bearer Token

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  //2. Verify token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // 3. Attach user info to request
    req.user = decoded;
    next(); // Continue to route handler
  });
};

// Check if user has required role

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).jsin({ error: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};
// Middleware
app.use(cors());
app.use(express.json());

// ========================================
// API ROUTES
// ========================================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Get current user info (protected route)

app.get(
  "/api/auth/me",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    res.json({
      message: "You are authenticated!",
      user: req.user,
    });
  }
);
// ========================================
// AUTH ROUTES
// ========================================

// Login endpoint

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //1.Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    //2. Verify password

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    //3. Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    //4. Send response

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all upcoming events (main endpoint)
app.get("/api/events", async (req, res) => {
  try {
    // Get all upcoming events with club and host info
    const eventsResult = await pool.query(
      `
        SELECT 
          events.*,
          clubs.id as club_id,
          clubs.name as club_name,
          clubs.location_area,
          clubs.location_city,
          clubs.phone,
          hosts.name as host_name,
          hosts.bio as host_bio,
          hosts.photo as host_photo
        FROM events
        JOIN clubs ON events.club_id = clubs.id
        JOIN hosts ON clubs.host_id = hosts.id
        WHERE events.date >= CURRENT_DATE
        ORDER BY events.date ASC, events.time ASC
      `
    );

    // Get menu items for all upcoming events
    const menuResult = await pool.query(
      `
        SELECT event_id, dish_name
        FROM event_menu_items
        WHERE event_id = ANY(
          SELECT id FROM events WHERE date >= CURRENT_DATE
        )
        ORDER BY event_id, display_order
      `
    );

    // Get photos for all upcoming events
    const photosResult = await pool.query(
      `
        SELECT event_id, photo_url
        FROM event_photos
        WHERE event_id = ANY(
          SELECT id FROM events WHERE date >= CURRENT_DATE
        )
        ORDER BY event_id, display_order
      `
    );

    // Group menu items by event_id
    const menuByEvent = {};
    menuResult.rows.forEach((item) => {
      if (!menuByEvent[item.event_id]) menuByEvent[item.event_id] = [];
      menuByEvent[item.event_id].push(item.dish_name);
    });

    // Group photos by event_id
    const photosByEvent = {};
    photosResult.rows.forEach((photo) => {
      if (!photosByEvent[photo.event_id]) photosByEvent[photo.event_id] = [];
      photosByEvent[photo.event_id].push(photo.photo_url);
    });

    // Format events
    const events = eventsResult.rows.map((event) => {
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      return {
        id: event.id,
        date: formattedDate,
        time: event.time,
        name: event.name,
        cuisine: event.cuisine,
        description: event.description,
        tags: event.tags,
        includes: event.includes,
        photos: photosByEvent[event.id] || [],
        menu: menuByEvent[event.id] || [],
        pricePerPerson: event.price_per_person,
        totalSeats: event.total_seats,
        availableSeats: event.available_seats,
        duration: event.duration,
        alcoholServed: event.alcohol_served,
        ageRestriction: event.age_restriction,
        club: {
          id: event.club_id,
          name: event.club_name,
          location: {
            area: event.location_area,
            city: event.location_city,
          },
          phone: event.phone,
        },
        host: {
          name: event.host_name,
          bio: event.host_bio,
          photo: event.host_photo,
        },
      };
    });

    res.json(events);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎉 Events API: http://localhost:${PORT}/api/events`);
});
