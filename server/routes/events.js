
const express = require("express");
const mongoose = require("mongoose");

const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

const categories = [
  "Technical",
  "Cultural",
  "Sports",
  "Workshop"
];

function validateEvent(body) {
  const {
    title,
    description,
    category,
    date,
    venue,
    capacity,
    imageUrl
  } = body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 100 ||
    typeof description !== "string" ||
    !description.trim() ||
    description.length > 2000 ||
    !categories.includes(category) ||
    typeof venue !== "string" ||
    !venue.trim() ||
    venue.trim().length > 150 ||
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 100000
  ) {
    return "Enter valid event details and capacity";
  }

  if (!date || !Number.isFinite(Date.parse(date))) {
    return "Enter a valid event date";
  }

  if (imageUrl !== undefined && typeof imageUrl !== "string") {
    return "Image URL must be text";
  }

  if (typeof imageUrl === "string" && imageUrl.length > 1000) {
    return "Image URL is too long";
  }

  return null;
}

// GET /api/events — list and search events
router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      if (!categories.includes(req.query.category)) {
        return res.status(400).json({
          message: "Invalid category"
        });
      }

      filter.category = req.query.category;
    }

    if (req.query.search) {
      const search = String(req.query.search).trim().slice(0, 80);
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { venue: { $regex: escaped, $options: "i" } }
      ];
    }

    const events = await Event.find(filter)
      .sort({ date: 1 })
      .limit(100)
      .select("-__v");

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch events" });
  }
});

// GET /api/events/:id — event details
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch event" });
  }
});

// POST /api/events — admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const problem = validateEvent(req.body);

    if (problem) {
      return res.status(400).json({ message: problem });
    }

    const event = await Event.create({
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      category: req.body.category,
      date: new Date(req.body.date),
      venue: req.body.venue.trim(),
      capacity: req.body.capacity,
      imageUrl: req.body.imageUrl || "",
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Event created successfully",
      event
    });
  } catch (error) {
    console.error("Create event error:", error.message);
    res.status(500).json({ message: "Unable to create event" });
  }
});

// PUT /api/events/:id — admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const problem = validateEvent(req.body);

    if (problem) {
      return res.status(400).json({ message: problem });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (req.body.capacity < event.registeredCount) {
      return res.status(400).json({
        message: "Capacity cannot be below the current registration count"
      });
    }

    event.title = req.body.title.trim();
    event.description = req.body.description.trim();
    event.category = req.body.category;
    event.date = new Date(req.body.date);
    event.venue = req.body.venue.trim();
    event.capacity = req.body.capacity;
    event.imageUrl = req.body.imageUrl || "";

    await event.save();

    res.json({
      message: "Event updated successfully",
      event
    });
  } catch (error) {
    console.error("Update event error:", error.message);
    res.status(500).json({ message: "Unable to update event" });
  }
});

// DELETE /api/events/:id — admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const activeRegistrations = await Registration.countDocuments({
      event: event._id,
      status: "registered"
    });

    if (activeRegistrations > 0) {
      return res.status(409).json({
        message: "Cancel active registrations before deleting this event"
      });
    }

    await Event.findByIdAndDelete(event._id);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete event" });
  }
});

module.exports = router;
