const express = require("express");
const pool = require("../config/database");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Get all upcoming events (main endpoint)
router.get("/", async (req, res) => {
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

// Get single event by ID
router.get("/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    const result = await pool.query(
      `SELECT events.*, 
          clubs.name as club_name,
          clubs.location_area,
          clubs.location_city
         FROM events
         JOIN clubs ON events.club_id = clubs.id
         WHERE events.id = $1`,
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new event(hosts and admins only)

router.post(
  "/",
  authenticateToken,
  requireRole("admin", "hosts"),
  async (req, res) => {
    try {
      const {
        club_id,
        date,
        time,
        name,
        cuisine,
        description,
        tags,
        includes,
        price_per_person,
        total_seats,
        duration,
        alcohol_served,
        age_restriction,
        photos, //Array of phot URLs
        menu_items, //Array of dish names
      } = req.body;

      // Authorization: Check if user owns this club(skip for admin)
      if (req.user.role !== "admin") {
        const clubCheck = await pool.query(
          `SELECT clubs.id FROM clubs
            JOIN hosts ON clubs.host_id = hosts.id
            WHERE clubs.id = $1 aND hosts.user_id = $2`,
          [club_id, req.user.userId]
        );
        if (clubCheck.rows.lenght === 0) {
          return res.status(403).json({ error: "You don't own this club" });
        }
      }
      //1. Insert event
      const eventResult = await pool.query(
        `INSERT INTO events(
            club_id, date, time, name, cuisine, description,
            tags, includes, price_per_person, total_seats, available_seats, duration, alcohol_served, age_restriction
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11, $12, $13)
             RETURNING *`,
        [
          club_id,
          date,
          time,
          name,
          cuisine,
          description,
          tags,
          includes,
          price_per_person,
          total_seats,
          duration,
          alcohol_served,
          age_restriction,
        ]
      );

      const newEvent = eventResult.rows[0];

      //2. Insert photos (if provided)
      if (photos && photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          await pool.query(
            `INSERT INTO event_photos (event_id, photo_url, display_order)
                VALUES ($1, $2, $3)`,
            [newEvent.id, photos[i], i + 1]
          );
        }
      }

      //3. Insert menu items(if provided)
      if (menu_items && menu_items.length > 0) {
        for (let i = 0; i < menu_items.length; i++) {
          await pool.query(
            `INSERT INTO event_menu_items (event_id, dish_name, display_order)
             VALUES ($1, $2, $3)`,
            [newEvent.id, menu_items[i], i + 1]
          );
        }
      }

      res.status(201).json({
        message: "Event created Successfully",
        event: { ...newEvent, photos: photos || [], menu: menu_items || [] },
      });
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

//Update event
router.put(
  "/:id",
  authenticateToken,
  requireRole("admin", "host"),
  async (req, res) => {
    try {
      const eventId = req.params.id;

      // Check if event exists and user owns it
      const eventCheck = await pool.query(
        `SELECT events.*, clubs.host_id
            FROM events
            JOIN clubs ON events.club_id = clubs.id
            WHERE events.id = $1`,
        [eventId]
      );

      if (eventCheck.rows.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      //Authorization check (skip for admin)
      if (req.user.role !== "admin") {
        const hostCheck = await pool.query(
          `SELECT id FROM hosts WHERE id =$1 AND user_id = $2`,
          [eventCheck.rows[0].host_id, req.user.userId]
        );

        if (hostCheck.rows.length === 0) {
          return res.status(403).json({ error: "Not your event" });
        }
      }
      // Update only provided fields
      const {
        name,
        date,
        time,
        cuisine,
        description,
        price_per_person,
        total_seats,
        available_seats,
        tags,
        includes,
        duration,
        alcohol_served,
        age_restriction,
      } = req.body;

      const result = await pool.query(
        `UPDATE events SET
              name = COALESCE($1, name),
              date = COALESCE($2, date),
              time = COALESCE($3, time),
              cuisine = COALESCE($4, cuisine),
              description = COALESCE($5, description),
              price_per_person = COALESCE($6, price_per_person),
              total_seats = COALESCE($7, total_seats),
              available_seats = COALESCE($8, available_seats),
              tags = COALESCE($9, tags),
              includes = COALESCE($10, includes),
              duration = COALESCE($11, duration),
              alcohol_served = COALESCE($12, alcohol_served),
              age_restriction = COALESCE($13, age_restriction)
            WHERE id = $14
            RETURNING *`,
        [
          name,
          date,
          time,
          cuisine,
          description,
          price_per_person,
          total_seats,
          available_seats,
          tags,
          includes,
          duration,
          alcohol_served,
          age_restriction,
          eventId,
        ]
      );

      res.json({ message: "Event updated", event: result.rows[0] });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete event
router.delete(
  "/:id",
  authenticateToken,
  requireRole("admin", "host"),
  async (req, res) => {
    try {
      const eventId = req.params.id;

      // Check if event exists and get host info
      const eventCheck = await pool.query(
        `SELECT events.*, clubs.host_id 
         FROM events 
         JOIN clubs ON events.club_id = clubs.id
         WHERE events.id = $1`,
        [eventId]
      );

      if (eventCheck.rows.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Authorization check (skip for admin)
      if (req.user.role !== "admin") {
        const hostCheck = await pool.query(
          `SELECT id FROM hosts WHERE id = $1 AND user_id = $2`,
          [eventCheck.rows[0].host_id, req.user.userId]
        );

        if (hostCheck.rows.length === 0) {
          return res.status(403).json({ error: "Not your event" });
        }
      }

      // Delete photos and menu first (foreign key constraint)
      await pool.query("DELETE FROM event_photos WHERE event_id = $1", [
        eventId,
      ]);
      await pool.query("DELETE FROM event_menu_items WHERE event_id = $1", [
        eventId,
      ]);

      // Delete event
      await pool.query("DELETE FROM events WHERE id = $1", [eventId]);

      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
