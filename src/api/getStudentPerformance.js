export async function getStudentPerformance(teacherId, studentId) {
  const res = await fetch(
    `http://localhost:5000/api/teacher/students/${studentId}/performance?teacherId=${teacherId}`
  );

  if (!res.ok) throw new Error("Failed to load performance");

  return res.json();
}
