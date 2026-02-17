import { db } from "../firebase";
import { doc, setDoc, increment, serverTimestamp } from "firebase/firestore";

export async function updateProgress(uid, updates) {
  if (!uid) return;

  const ref = doc(db, "students", uid, "progress", "summary");

  await setDoc(
    ref,
    {
      ...updates,
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );
}
