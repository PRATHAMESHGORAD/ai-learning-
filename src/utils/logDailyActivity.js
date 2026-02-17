import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getTodayKey } from "./getTodayKey";

export async function logDailyActivity(uid, updates) {
  if (!uid) return;

  const today = getTodayKey();

  const ref = doc(
    db,
    "students",
    uid,
    "progress",
    "dailyLogs",
    today
  );

  await setDoc(
    ref,
    {
      ...updates,
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );
}
