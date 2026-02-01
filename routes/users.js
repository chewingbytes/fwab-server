import { verifyToken } from "../authmiddleware.js";
import express from "express";
import db from "../db/conn.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const JWT_SECRET = process.env.JWT_TOKEN;

const router = express.Router();

const formatDate = (date) => {
  return new Date(date).toLocaleString("en-SG", { timeZone: "Asia/Singapore" });
};

router.post("/add-user", async (req, res) => {
  const password = "defaultstargazersPassword";
  const { username, email, roles } = req.body;

  try {
    const collection = await db.collection("users");

    const existingUser = await collection.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const message =
        existingUser.username === username
          ? "Username is already taken."
          : "Email is already registered.";
      return res.status(400).json({ error: message });
    }

    const newUser = {
      username,
      email,
      password,
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date()),
      roles: roles || "user",
    };

    const result = await collection.insertOne(newUser);
    res.status(201).json({ message: "User created successfully", result });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const collection = await db.collection("users");

    const user = await collection.findOne({ email, username });
    console.log("User found:", user);

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found or incorrect username/email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { username: user.username, email: user.email, roles: user.roles },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error); // Log any errors that occur
    res.status(500).json({ error: "Failed to login" });
  }
});

router.get("/user-auth", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

router.get("/", async (req, res) => {
  try {
    const collection = await db.collection("users");
    const results = await collection.find({}).toArray();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get a single user by ID
router.get("/:id", async (req, res) => {
  try {
    const collection = await db.collection("users");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);

    if (!result) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.post("/signup", async (req, res) => {
  const { username, email, password, roles } = req.body;

  try {
    const collection = await db.collection("users");

    // Check if username or email already exists
    const existingUser = await collection.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const message =
        existingUser.username === username
          ? "Username is already taken."
          : "Email is already registered.";
      return res.status(400).json({ error: message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      email,
      password: hashedPassword,
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date()),
      roles: roles || "user",
    };

    const result = await collection.insertOne(newUser);
    res.status(201).json({ message: "User created successfully", result });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.patch("/update/:email", async (req, res) => {
  const { email } = req.params;
  const { username, newEmail, roles } = req.body;

  try {
    const collection = await db.collection("users");

    const existingUser = await collection.findOne({
      $or: [{ username }, { email: newEmail }],
      email: { $ne: email },
    });

    if (existingUser) {
      const message =
        existingUser.username === username
          ? "Username is already taken."
          : "Email is already registered.";
      return res.status(400).json({ error: message });
    }

    const updates = {};
    if (username) updates.username = username;
    if (newEmail) updates.email = newEmail;
    if (roles) updates.roles = roles;
    updates.updatedAt = formatDate(new Date());

    const result = await collection.updateOne({ email }, { $set: updates });

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ error: "User not found or no changes made" });
    }

    const updatedUser = await collection.findOne({
      email: newEmail || email,
    });

    if (updatedUser) {
      res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
      const newToken = jwt.sign({ user: updatedUser }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", newToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/delete/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const collection = await db.collection("users");
    const result = await collection.deleteOne({ email });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully", result });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
