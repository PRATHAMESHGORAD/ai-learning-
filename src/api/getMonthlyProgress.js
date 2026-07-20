export async function getMonthlyProgress(uid) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/progress/monthly/${uid}`
  );

  if (!res.ok) {
    throw new Error("Failed to load monthly progress");
  }

  return res.json();
}
