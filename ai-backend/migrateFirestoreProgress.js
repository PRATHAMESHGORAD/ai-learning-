import admin from "firebase-admin";
import { pool } from "./db.js";
import serviceAccount from "./firebase-admin.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function migrateUser(uid) {
  const snap = await admin
    .firestore()
    .collection("students")
    .doc(uid)
    .collection("progress")
    .doc("dailyLogs")
    .collection("dailyLogs")
    .get();

  for (const doc of snap.docs) {
    const d = doc.data();
    const date = doc.id;

    await pool.query(
      `
      INSERT INTO daily_activity
        (user_id, date, ai_questions, quizzes_taken, correct_answers, practice_seconds)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (user_id, date) DO NOTHING
      `,
      [
        uid,
        date,
        d.aiQuestions || 0,
        d.quizzesTaken || 0,
        d.correctAnswers || 0,
        d.practiceSeconds || 0,
      ]
    );
  }

  console.log("✅ Migrated", uid);
}

export async function migrateAllUsers() {
  const users = await admin.auth().listUsers();
  for (const u of users.users) {
    await migrateUser(u.uid);
  }
}
