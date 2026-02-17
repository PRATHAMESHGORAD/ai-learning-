export async function getMonthlyProgress(uid) {
  const res = await fetch(
    `http://localhost:5000/api/progress/monthly/${uid}`
  );

  if (!res.ok) {
    throw new Error("Failed to load monthly progress");
  }

  return res.json();
}
