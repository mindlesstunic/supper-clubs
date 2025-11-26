// ========================================
// SUPPER CLUBS BACKEND SERVER
// ========================================

const express = require("express");
const cors = require("cors");
const pool = require("./config/database"); // Import database connection

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ========================================
// API ROUTES
// ========================================

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Get club data from database
app.get("/api/clubs/:id", async (req, res) => {
  const clubId = req.params.id;

  try {
    // Query database for club with host info (JOIN query!)
    const result = await pool.query(
      `
      SELECT 
        clubs.*,
        hosts.name as host_name,
        hosts.bio as host_bio,
        hosts.photo as host_photo
      FROM clubs
      JOIN hosts ON clubs.host_id = hosts.id
      WHERE clubs.id = $1
    `,
      [clubId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Club not found" });
    }

    const club = result.rows[0];

    // Format response to match frontend expectations
    const clubData = {
      id: club.id,
      name: club.name,
      rating: parseFloat(club.rating),
      reviewCount: club.review_count,
      location: {
        area: club.location_area,
        city: club.location_city,
      },
      contact: {
        phone: club.phone,
      },
      host: {
        name: club.host_name,
        bio: club.host_bio,
        photo: club.host_photo,
      },
    };

    res.json(clubData);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/// Get events for a club with menu and photos
app.get("/api/clubs/:id/events", async (req, res) => {
  const clubId = req.params.id;

  try {
    // Get events
    const eventsResult = await pool.query(
      `
        SELECT * FROM events
        WHERE club_id = $1
        ORDER BY date ASC
      `,
      [clubId]
    );

    // Get menu items for all events
    const menuResult = await pool.query(
      `
        SELECT event_id, dish_name
        FROM event_menu_items
        WHERE event_id = ANY(SELECT id FROM events WHERE club_id = $1)
        ORDER BY event_id, display_order
      `,
      [clubId]
    );

    // Get photos for all events
    const photosResult = await pool.query(
      `
        SELECT event_id, photo_url
        FROM event_photos
        WHERE event_id = ANY(SELECT id FROM events WHERE club_id = $1)
        ORDER BY event_id, display_order
      `,
      [clubId]
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
        cuisine: event.cuisine,
        photos: photosByEvent[event.id] || [],
        menu: menuByEvent[event.id] || [],
        pricePerPerson: event.price_per_person,
        totalSeats: event.total_seats,
        availableSeats: event.available_seats,
        duration: event.duration,
        alcoholServed: event.alcohol_served,
        ageRestriction: event.age_restriction,
        specialActivities: null,
      };
    });

    res.json(events);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ========================================
//Get All Events
// ========================================

// Get all upcoming events (from all clubs)
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

    // Get menu items for all events
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

    // Get photos for all events
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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🏠 Club endpoint: http://localhost:${PORT}/api/clubs/1`);
  console.log(`✅ CORS enabled`);
});
