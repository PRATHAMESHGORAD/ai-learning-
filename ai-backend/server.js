import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { pool } from "./db.js";
import { logDailyActivity } from "./logDailyActivity.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studyPlannerRoutes from "./routes/studyPlanner.routes.js";

dotenv.config();

console.log("GROQ KEY PRESENT:", !!process.env.GROQ_API_KEY);

const app = express();

/* ✅ FIXED CORS (ALLOW GET + POST) */
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =====================================================
   ✅ NEW: DAILY PROGRESS API (ADDED, NOT REMOVED)
===================================================== */
app.get("/api/progress/daily/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `
     SELECT 
  date::date AS date,
  ai_questions,
  quizzes_taken,
  correct_answers,
  practice_seconds
FROM daily_activity
WHERE user_id = $1
ORDER BY date ASC

      `,
      [userId]
    );

    const formatted = result.rows.map(row => ({
  ...row,
  date: row.date.toISOString().split("T")[0], // ← FIX
}));

res.json(formatted);

  } catch (err) {
    console.error("DAILY PROGRESS ERROR:", err);
    res.status(500).json({ error: "Failed to load progress" });
  }
});
app.get("/api/progress/summary/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        SUM(ai_questions) AS total_ai,
        SUM(quizzes_taken) AS total_quizzes,
        SUM(correct_answers) AS total_correct,
        SUM(practice_seconds) AS total_seconds
      FROM daily_activity
      WHERE user_id = $1
      `,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ error: "Failed to load summary" });
  }
});

/* =====================================================
   🧠 AI TUTOR ROUTE (UNCHANGED LOGIC)
===================================================== */
app.post("/api/log-quiz", async (req, res) => {
  const { userId, correctAnswers, practiceSeconds } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    await pool.query(
      `
      INSERT INTO daily_activity (
        user_id,
        date,
        quizzes_taken,
        correct_answers,
        practice_seconds
      )
      VALUES ($1, CURRENT_DATE, 1, $2, $3)
      ON CONFLICT (user_id, date)
      DO UPDATE SET
        quizzes_taken = daily_activity.quizzes_taken + 1,
        correct_answers = daily_activity.correct_answers + $2,
        practice_seconds = daily_activity.practice_seconds + $3
      `,
      [userId, correctAnswers || 0, practiceSeconds || 120]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("LOG QUIZ ERROR:", err);
    res.status(500).json({ error: "Failed to log quiz" });
  }
});




app.post("/api/ai-tutor", async (req, res) => {
  console.log("📩 REQUEST BODY:", req.body);

  try {
    const { messages, mode } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "Messages must be an array",
      });
    }

    


    /* ===========================
       🟢 TEACH MODE
    ============================ */
    if (!mode || mode === "teach") {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 300,
        messages: [
          {
  role: "system",
  content: `
You are an AI tutor.

Formatting Rules:
- Use clear headings (## Title)
- Use bullet points
- Keep paragraphs short
- Use proper code blocks with language (like \`\`\`js)
- Explain step-by-step
- Use examples when helpful
- Make answers visually structured and easy to scan

Keep explanations simple but structured.
  `,
},

          ...messages,
        ],
      });

      const reply = completion?.choices?.[0]?.message?.content;

      if (!reply) {
        return res.status(500).json({ error: "Empty AI reply" });
      }

      /* ✅ LOG DAILY ACTIVITY (ADDED, NOT CHANGED) */
     const userId = req.body.userId;

if (!userId) {
  return res.status(400).json({ error: "Missing userId" });
}


if (userId) {
  await pool.query(
    `
    INSERT INTO daily_activity (user_id, date, ai_questions, practice_seconds)
    VALUES ($1, CURRENT_DATE, 1, 60)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      ai_questions = daily_activity.ai_questions + 1,
      practice_seconds = daily_activity.practice_seconds + 60
    `,
    [userId]
  );
}




      return res.json({ reply });
    }

    

    /* ===========================
       🟣 QUIZ MODE (UNCHANGED)
    ============================ */
    if (mode === "quiz") {
      const userOnlyMessages = messages.filter(
        (m) => m.role === "user"
      );

      if (userOnlyMessages.length === 0) {
        return res.status(400).json({
          error: "No topic available to generate quiz",
        });
      }

      const quizSeed = Math.floor(Math.random() * 1_000_000);

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 600,
        messages: [
          {
            role: "system",
            content: `
You are an exam generator.

STRICT RULES:
- ONLY valid JSON
- NO explanations
- NO markdown
- EXACTLY 3 questions

Quiz seed: ${quizSeed}

FORMAT:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A","B","C","D"],
      "correctIndex": 0
    }
  ]
}
            `,
          },
          ...userOnlyMessages,
        ],
      });

      const raw = completion?.choices?.[0]?.message?.content;

      if (!raw) {
        return res.status(500).json({
          error: "Empty quiz response from AI",
        });
      }

      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");

      if (start === -1 || end === -1) {
        return res.status(500).json({
          error: "Invalid quiz format from AI",
        });
      }

      const quizJson = JSON.parse(raw.slice(start, end + 1));
      return res.json(quizJson);
    }

    return res.status(400).json({
      error: "Invalid mode",
    });
  } catch (err) {
    console.error("🔥 AI ERROR:", err);
    return res.status(500).json({
      error: "AI processing failed",
    });
  }
});




app.post("/api/progress/time", async (req, res) => {
  const { userId, practiceSeconds } = req.body;

  if (!userId || !practiceSeconds) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  await pool.query(
    `
    INSERT INTO daily_activity (user_id, date, practice_seconds)
    VALUES ($1, CURRENT_DATE, $2)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      practice_seconds = daily_activity.practice_seconds + $2
    `,
    [userId, practiceSeconds]
  );

  res.json({ success: true });
});

app.get("/api/progress/time/:userId", async (req, res) => {
  const { userId } = req.params;


  try {
    const result = await pool.query(
      `
      SELECT
        SUM(practice_seconds) FILTER (WHERE date = CURRENT_DATE) AS today,
        SUM(practice_seconds) FILTER (
          WHERE date >= CURRENT_DATE - INTERVAL '6 days'
        ) AS week,
        SUM(practice_seconds) AS overall
      FROM daily_activity
      WHERE user_id = $1
      `,
      [userId]
    );

    res.json({
      today: Number(result.rows[0].today || 0),
      week: Number(result.rows[0].week || 0),
      overall: Number(result.rows[0].overall || 0),
    });
  } catch (err) {
    console.error("TIME SUMMARY ERROR:", err);
    res.status(500).json({ error: "Failed to load time summary" });
  }
});
app.get("/api/progress/monthly/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(`
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
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error("MONTHLY ERROR:", err);
    res.status(500).json({ error: "Failed to load monthly progress" });
  }
});

/* =====================================================
   📝 STUDENT-TEACHER CONNECTION
   =====================================================
   Called when student enters teacher code
*/

app.post('/api/student/connect-teacher', async (req, res) => {
  const { studentId, teacherId } = req.body;
  
  if (!studentId || !teacherId) {
    return res.status(400).json({ error: 'Missing studentId or teacherId' });
  }
  
  try {
    // Update or create student_stats with teacher connection
    await pool.query(`
      INSERT INTO student_stats (
        student_id, 
        teacher_id, 
        first_activity_at,
        last_updated_at,
        status
      )
      VALUES ($1, $2, NOW(), NOW(), 'active')
      ON CONFLICT (student_id) 
      DO UPDATE SET 
        teacher_id = $2,
        last_updated_at = NOW()
    `, [studentId, teacherId]);
    
    console.log(`✅ Student ${studentId} connected to teacher ${teacherId}`);
    res.json({ success: true });
    
  } catch (err) {
    console.error('❌ CONNECTION ERROR:', err);
    res.status(500).json({ error: 'Failed to connect to teacher' });
  }
});


app.use("/api/teacher", teacherRoutes);

app.listen(5000, () => {
  console.log(
    "✅ Groq AI Backend running at http://localhost:5000"
  );
});


