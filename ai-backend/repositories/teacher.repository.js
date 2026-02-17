import { pool } from "../db.js";

export async function checkTeacherStudentLink(teacherId, studentId) {
  const result = await pool.query(
    `
    SELECT 1
    FROM student_stats
    WHERE teacher_id = $1
    AND student_id = $2
    AND status = 'active'
    LIMIT 1
    `,
    [teacherId, studentId]
  );

  return result.rowCount > 0;
}


export async function getStudentSummary(studentId) {
  const result = await pool.query(
    `
    SELECT
      COALESCE(SUM(ai_questions),0) AS total_ai,
      COALESCE(SUM(quizzes_taken),0) AS total_quizzes,
      COALESCE(SUM(correct_answers),0) AS total_correct,
      COALESCE(SUM(correct_answers),0) AS total_questions,
      COALESCE(SUM(practice_seconds),0) AS total_seconds,
      MAX(date) AS last_active
    FROM daily_activity
    WHERE user_id = $1
    `,
    [studentId]
  );

  return result.rows[0];
}

export async function getHeatmap(studentId) {
  const result = await pool.query(
    `
    SELECT
      date,
      ai_questions,
      quizzes_taken,
      correct_answers,
      practice_seconds
    FROM daily_activity
    WHERE user_id = $1
    AND date >= CURRENT_DATE - INTERVAL '180 days'
    ORDER BY date ASC
    `,
    [studentId]
  );

  return result.rows;
}

export async function getMonthly(studentId) {
  const result = await pool.query(
    `
    SELECT
      to_char(date_trunc('month', date), 'Mon YYYY') AS month,
      date_trunc('month', date) AS month_sort,
      SUM(practice_seconds) AS practice_seconds,
      SUM(ai_questions) AS ai_questions,
      SUM(quizzes_taken) AS quizzes_taken,
      SUM(correct_answers) AS correct_answers
    FROM daily_activity
    WHERE user_id = $1
    GROUP BY month, month_sort
    ORDER BY month_sort ASC
    `,
    [studentId]
  );

  return result.rows;
}
