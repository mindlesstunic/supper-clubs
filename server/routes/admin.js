const express = require("express");
const pool = require("../config/database");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// All admin routes require admin role
router.use(authenticateToken, requireRole("admin"));

// Get pending host applications
router.get("/applications", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
          host_applications.*,
          users.email,
          users.created_at as registered_at
         FROM host_applications
         JOIN users ON host_applications.user_id = users.id
         WHERE users.role = 'pending'
         ORDER BY host_applications.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Approve host application
router.post("/applications/:id/approve", async (req, res) => {
  try {
    const applicationId = req.params.id;

    // Get application details
    const appResult = await pool.query(
      `SELECT * FROM host_applications WHERE id = $1`,
      [applicationId]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    const application = appResult.rows[0];

    // Check if already approved
    const existingHost = await pool.query(
      `SELECT id FROM hosts WHERE user_id = $1`,
      [application.user_id]
    );

    if (existingHost.rows.length > 0) {
      return res.status(400).json({ error: "Already approved" });
    }

    // Update user role to 'host'
    await pool.query(`UPDATE users SET role = 'host' WHERE id = $1`, [
      application.user_id,
    ]);

    // Create host profile
    const hostResult = await pool.query(
      `INSERT INTO hosts (user_id, name, bio, photo, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
      [
        application.user_id,
        application.name,
        application.bio,
        null,
        application.phone,
      ]
    );

    // Delete application (no longer needed)
    await pool.query(`DELETE FROM host_applications WHERE id = $1`, [
      applicationId,
    ]);

    res.json({
      message: "Host approved successfully",
      host: hostResult.rows[0],
    });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
