const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

//Login

router.post("/login", async (req, res) => {
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

// Register new user (public - for host applications)
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, bio, phone } = req.body;

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with pending status
    const result = await pool.query(
      `INSERT INTO users (email, password, role)
         VALUES ($1, $2, 'pending')
         RETURNING id, email, role, created_at`,
      [email, hashedPassword]
    );

    // Save application details
    await pool.query(
      `INSERT INTO host_applications (user_id, name, bio, phone)
     VALUES ($1, $2, $3, $4)`,
      [result.rows[0].id, name, bio, phone]
    );

    res.status(201).json({
      message: "Registration successful. Awaiting admin approval.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get current user info (protected route)

router.get("/me", authenticateToken, requireRole("admin"), async (req, res) => {
  res.json({
    message: "You are authenticated!",
    user: req.user,
  });
});

module.exports = router;
