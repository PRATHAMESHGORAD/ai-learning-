import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getDailyLogs(uid) {
  if (!uid) return [];

  const ref = collection(
    db,
    "students",
    uid,
    "progress",
    "dailyLogs"
  );

  const snap = await getDocs(ref);

  return snap.docs.map(doc => ({
    date: doc.id,
    ...doc.data(),
  }));
}
