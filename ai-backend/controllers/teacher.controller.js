import * as teacherService from "../services/teacher.service.js";

export async function getStudentPerformance(req, res) {
  try {
    const { teacherId } = req.query;
    const { studentId } = req.params;

    if (!teacherId || !studentId) {
      return res.status(400).json({ error: "Missing IDs" });
    }

    const data = await teacherService.getStudentPerformance(
      teacherId,
      studentId
    );

    res.json(data);
  } catch (err) {
    console.error("TEACHER PERFORMANCE ERROR:", err);
    res.status(500).json({ error: "Failed to load performance" });
  }
}
