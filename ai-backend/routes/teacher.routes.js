import express from "express";
import { getStudentPerformance } from "../controllers/teacher.controller.js";

const router = express.Router();

router.get("/students/:studentId/performance", getStudentPerformance);

export default router;
