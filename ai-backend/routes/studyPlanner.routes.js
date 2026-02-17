console.log("✅ Study Planner Routes Loaded");

import express from "express";
import Groq from "groq-sdk";
import { pool } from "../db.js";

const router = express.Router();

router.post("/generate-study-plan", async (req, res) => {
  res.json({ message: "Route working" });
});

export default router;
