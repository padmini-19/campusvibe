
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email"]
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },

    rollNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: ""
    },

    department: {
      type: String,
      trim: true,
      default: ""
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
