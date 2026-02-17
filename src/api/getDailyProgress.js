export async function getDailyProgress(userId) {
  const res = await fetch(
    `http://localhost:5000/api/progress/daily/${userId}`
  );

  if (!res.ok) {
    throw new Error("Failed to load daily progress");
  }

  return res.json();
}
