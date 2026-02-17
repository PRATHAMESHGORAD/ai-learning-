import { pool } from "./db.js";

export async function logDailyActivity(userId, updates) {
  const {
    aiQuestions = 0,
    quizzesTaken = 0,
    correctAnswers = 0,
    practiceSeconds = 0,
  } = updates;

  const query = `
    INSERT INTO daily_activity (user_id, date, ai_questions, quizzes_taken, correct_answers, practice_seconds)
    VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      ai_questions = daily_activity.ai_questions + EXCLUDED.ai_questions,
      quizzes_taken = daily_activity.quizzes_taken + EXCLUDED.quizzes_taken,
      correct_answers = daily_activity.correct_answers + EXCLUDED.correct_answers,
      practice_seconds = daily_activity.practice_seconds + EXCLUDED.practice_seconds;
  `;

  await pool.query(query, [
    userId,
    aiQuestions,
    quizzesTaken,
    correctAnswers,
    practiceSeconds,
  ]);
}
