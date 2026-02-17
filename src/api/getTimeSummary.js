export async function getTimeSummary(userId) {
  const res = await fetch(
    `http://localhost:5000/api/progress/time/${userId}`
  );

  if (!res.ok) throw new Error("Failed to load time summary");

  return res.json();
}
