
require("dotenv").config();
const eventRoutes = require("./routes/events");
const registrationRoutes = require("./routes/registrations");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json({ limit: "100kb" }));

// Simple custom request-logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "College Event Management API is running!",
    status: "success"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    server: "running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

app.use("/api/auth", authRoutes);

// Handle unknown API routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.JWT_SECRET ||
        process.env.JWT_SECRET === "replace_this_with_a_long_random_secret_before_use") {
      throw new Error("Set a secure JWT_SECRET in your .env file");
    }

    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/collegeFest"
    );

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start:", error.message);
    process.exit(1);
  }
}

startServer();
