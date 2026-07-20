export async function getStudentPerformance(teacherId, studentId) {
  const res = await fetch(
   `${import.meta.env.VITE_API_URL}/api/teacher/students/${studentId}/performance?teacherId=${teacherId}`
  );

  if (!res.ok) throw new Error("Failed to load performance");

  return res.json();
}
