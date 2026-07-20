export async function getTimeSummary(userId) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/progress/time/${userId}`
  );

  if (!res.ok) throw new Error("Failed to load time summary");

  return res.json();
}
