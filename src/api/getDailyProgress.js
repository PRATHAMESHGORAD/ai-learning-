export async function getDailyProgress(userId) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/progress/daily/${userId}`
  );

  if (!res.ok) {
    throw new Error("Failed to load daily progress");
  }

  return res.json();
}
