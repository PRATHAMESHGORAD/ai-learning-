import * as repo from "../repositories/teacher.repository.js";

export async function getStudentPerformance(teacherId, studentId) {

  const linked = await repo.checkTeacherStudentLink(
    teacherId,
    studentId
  );

  if (!linked) {
    throw new Error("Unauthorized access");
  }

  const summary = await repo.getStudentSummary(studentId);
  const heatmap = await repo.getHeatmap(studentId);
  const monthly = await repo.getMonthly(studentId);

  const accuracy =
    summary.total_questions > 0
      ? (summary.total_correct / summary.total_questions) * 100
      : 0;

  return {
    summary: {
      ...summary,
      accuracy: Number(accuracy.toFixed(2)),
    },
    heatmap,
    monthly,
  };
}
