
const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    status: {
      type: String,
      enum: ["registered", "cancelled"],
      default: "registered"
    }
  },
  { timestamps: true }
);

// A student can have only one registration record per event.
registrationSchema.index(
  { student: 1, event: 1 },
  { unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);
