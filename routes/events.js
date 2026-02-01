import express from "express";
import db from "../db/conn.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get a list of all events
router.get("/", async (req, res) => {
  try {
    const collection = await db.collection("events");
    const results = await collection.find({}).toArray();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get a single event by ID
router.get("/:id", async (req, res) => {
  try {
    const collection = await db.collection("events");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);

    if (!result) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// Create a new event
router.post("/", async (req, res) => {
  const newEvent = {
    eventName: req.body.eventName,
    eventDate: req.body.eventDate,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    location: req.body.location,
    description: req.body.description,
    participantsLimit: req.body.participantsLimit,
  };

  try {
    const collection = await db.collection("events");
    const result = await collection.insertOne(newEvent);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  }
});

// Update an existing event by eventName
router.patch("/update/:eventName", async (req, res) => {
  const query = { eventName: req.params.eventName };
  const updates = {
    $set: {
      eventName: req.body.eventName,
      eventDate: req.body.eventDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      location: req.body.location,
      description: req.body.description,
      participantsLimit: req.body.participantsLimit,
    },
  };

  try {
    const collection = await db.collection("events");
    const result = await collection.updateOne(query, updates);

    if (result.modifiedCount === 0) {
      res.status(404).json({ error: "Event not found or no changes made" });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update event" });
  }
});

router.delete("/delete/:eventName", async (req, res) => {
  const query = { eventName: req.params.eventName };

  try {
    const collection = await db.collection("events");
    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.status(200).json({ message: "Event deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
