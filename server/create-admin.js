
require("dotenv").config();

const readline = require("readline/promises");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    const name = await rl.question("Admin name: ");
    const email = (
      await rl.question("Admin email: ")
    ).trim().toLowerCase();

    const password = await rl.question(
      "Admin password (input will be visible): "
    );

    if (
      !name.trim() ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      password.length < 12
    ) {
      throw new Error(
        "Enter a name, valid email and password of at least 12 characters"
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email });

    if (existing) {
      throw new Error(
        "This email already exists. Use a new email for the admin account."
      );
    }

    const user = await User.create({
      name: name.trim(),
      email,
      password: await bcrypt.hash(password, 12),
      role: "admin"
    });

    console.log(`Admin account created: ${user.email}`);
  } finally {
    rl.close();

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

main().catch((error) => {
  console.error("Admin setup failed:", error.message);
  process.exitCode = 1;
});
