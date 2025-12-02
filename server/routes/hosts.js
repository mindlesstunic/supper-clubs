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
      events = eventsResult.rows;
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