const express = require("express");
const pool = require("../config/database");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Get current host's profile, club, and events
router.get("/me", authenticateToken, requireRole("host"), async (req, res) => {
  try {
    // Get host profile
    const hostResult = await pool.query(
      `SELECT * FROM hosts WHERE user_id = $1`,
      [req.user.userId]
    );

    if (hostResult.rows.length === 0) {
      return res.status(404).json({ error: "Host profile not found" });
    }

    const host = hostResult.rows[0];

    // Get club
    const clubResult = await pool.query(
      `SELECT * FROM clubs WHERE host_id = $1`,
      [host.id]
    );

    const club = clubResult.rows[0] || null;

    // Get events (if club exists)
    let events = [];
    if (club) {
      const eventsResult = await pool.query(
        `SELECT * FROM events WHERE club_id = $1 ORDER BY date DESC`,
        [club.id]
      );

      // Get menu items and photos for all events
      const eventIds = eventsResult.rows.map((e) => e.id);

      if (eventIds.length > 0) {
        const menuResult = await pool.query(
          `SELECT event_id, dish_name FROM event_menu_items 
       WHERE event_id = ANY($1) ORDER BY event_id, display_order`,
          [eventIds]
        );

        const photosResult = await pool.query(
          `SELECT event_id, photo_url FROM event_photos 
       WHERE event_id = ANY($1) ORDER BY event_id, display_order`,
          [eventIds]
        );

        // Group by event_id
        const menuByEvent = {};
        menuResult.rows.forEach((item) => {
          if (!menuByEvent[item.event_id]) menuByEvent[item.event_id] = [];
          menuByEvent[item.event_id].push(item.dish_name);
        });

        const photosByEvent = {};
        photosResult.rows.forEach((photo) => {
          if (!photosByEvent[photo.event_id])
            photosByEvent[photo.event_id] = [];
          photosByEvent[photo.event_id].push(photo.photo_url);
        });

        // Attach to events
        events = eventsResult.rows.map((event) => ({
          ...event,
          menu_items: menuByEvent[event.id] || [],
          photos: photosByEvent[event.id] || [],
        }));
      } else {
        events = eventsResult.rows;
      }
    }

    res.json({
      host,
      club,
      events,
    });
  } catch (error) {
    console.error("Get host data error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
