
const express = require("express");
const mongoose = require("mongoose");

const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/registrations/my
router.get("/my", protect, async (req, res) => {
  try {
    const registrations = await Registration.find({
      student: req.user._id
    })
      .populate("event")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch registrations"
    });
  }
});

// POST /api/registrations/:eventId
router.post("/:eventId", protect, async (req, res) => {
  let reservedEventId = null;

  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID"
      });
    }

    const existing = await Registration.findOne({
      student: req.user._id,
      event: eventId
    });

    if (existing && existing.status === "registered") {
      return res.status(409).json({
        message: "You are already registered for this event"
      });
    }

    // Atomically reserve one seat if capacity remains.
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        date: { $gt: new Date() },
        $expr: { $lt: ["$registeredCount", "$capacity"] }
      },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!event) {
      const found = await Event.findById(eventId);

      if (!found) {
        return res.status(404).json({
          message: "Event not found"
        });
      }

      if (found.date <= new Date()) {
        return res.status(400).json({
          message: "Registration is closed for this event"
        });
      }

      return res.status(409).json({
        message: "Sorry, this event is full"
      });
    }

    reservedEventId = event._id;

    let registration;

    if (existing) {
      existing.status = "registered";
      registration = await existing.save();
    } else {
      registration = await Registration.create({
        student: req.user._id,
        event: event._id
      });
    }

    reservedEventId = null;

    res.status(201).json({
      message: "Event registration successful",
      registration
    });
  } catch (error) {
    // Release the reserved seat if saving the registration fails.
    if (reservedEventId) {
      await Event.updateOne(
        {
          _id: reservedEventId,
          registeredCount: { $gt: 0 }
        },
        { $inc: { registeredCount: -1 } }
      ).catch(() => {});
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You are already registered for this event"
      });
    }

    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Unable to register for this event"
    });
  }
});

// DELETE /api/registrations/:eventId
router.delete("/:eventId", protect, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID"
      });
    }

    const registration = await Registration.findOneAndUpdate(
      {
        student: req.user._id,
        event: eventId,
        status: "registered"
      },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        message: "Active registration not found"
      });
    }

    await Event.updateOne(
      {
        _id: eventId,
        registeredCount: { $gt: 0 }
      },
      { $inc: { registeredCount: -1 } }
    );

    res.json({
      message: "Registration cancelled successfully"
    });
  } catch (error) {
    console.error("Cancellation error:", error.message);

    res.status(500).json({
      message: "Unable to cancel registration"
    });
  }
});

module.exports = router;
