const express = require("express");
const pool = require("../config/database");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Create club (hosts only)
router.post(
  "/",
  authenticateToken,
  requireRole("admin", "host"),
  async (req, res) => {
    try {
      const { name, location_area, location_city } = req.body;

      // Get host_id for this user
      const hostResult = await pool.query(
        `SELECT id, phone FROM hosts WHERE user_id = $1`,
        [req.user.userId]
      );

      if (hostResult.rows.length === 0) {
        return res.status(400).json({ error: "Host profile not found" });
      }

      const hostId = hostResult.rows[0].id;
      // Get host's phone
      const hostPhone = hostResult.rows[0].phone || null;

      // Check if host already has a club
      const existingClub = await pool.query(
        `SELECT id FROM clubs WHERE host_id = $1`,
        [hostId]
      );

      if (existingClub.rows.length > 0) {
        return res.status(400).json({ error: "You already have a club" });
      }

      // Create club with phone
      const result = await pool.query(
        `INSERT INTO clubs (host_id, name, location_area, location_city, phone)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING *`,
        [hostId, name, location_area, location_city, hostPhone]
      );

      res.status(201).json({
        message: "Club created successfully",
        club: result.rows[0],
      });
    } catch (error) {
      console.error("Create club error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
