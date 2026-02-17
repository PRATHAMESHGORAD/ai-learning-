# 🎓 AI Learning Platform

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

> An intelligent full-stack learning platform that connects **students with teachers**, powered by AI tutoring, real-time messaging, quizzes, live classes, homework management, and detailed progress tracking.

</div>

---

## 🖥️ Live Demo

> Add your deployed link here

---

## 📸 Screenshots

> Add screenshots of your app here

---

## ✨ Features

### 👨‍🎓 For Students
| Feature | Description |
|---------|-------------|
| 🤖 AI Tutor Chat | Ask questions and get instant AI-powered answers |
| 📝 Quiz System | Take quizzes and get instant scored results |
| 📊 Progress Tracking | Activity heatmap, monthly charts, learning statistics |
| 💬 Teacher Messaging | Real-time chat with your connected teacher |
| 🎥 Live Classes | Join live sessions hosted by your teacher |
| 📚 Homework | View, submit, and track assignments |
| ⭐ Teacher Reviews | Rate and review your teachers |
| ⚙️ Settings | Connect to teacher via invite code |

### 👩‍🏫 For Teachers
| Feature | Description |
|---------|-------------|
| 💬 Student Messaging | Real-time chat with students |
| 🎥 Live Classes | Create and host live sessions |
| 📚 Homework | Assign, review and grade submissions |
| 📊 Student Progress | Monitor student activity and performance |
| 🔑 Invite Code | Generate codes for students to connect |

---

## 🛠️ Tech Stack

> ⚠️ GitHub shows "JavaScript 99%" because React JSX files are detected as JavaScript. This is normal — the project is fully built with React!

### Frontend
| Technology | Purpose |
|-----------|---------|
| ⚛️ React 18 (JSX) | UI Framework |
| ⚡ Vite | Build Tool |
| 🔀 React Router DOM | Client-side Routing |
| 📊 Chart.js + react-chartjs-2 | Charts & Graphs |
| 🎨 React Icons | Icon Library |

### Backend
| Technology | Purpose |
|-----------|---------|
| 🟢 Node.js | Runtime Environment |
| 🚂 Express.js | Web Framework |
| 🐘 PostgreSQL | Relational Database (Progress & Stats) |
| 🔥 Firebase Firestore | Real-time Database (Chats, Classes) |
| 🔐 Firebase Auth | User Authentication |
| 🤖 Groq AI | AI Tutor Responses |

---

## 📁 Project Structure

```
ai-learning-platform/
│
├── 📂 src/
│   ├── 📂 components/
│   │   ├── 📂 student/
│   │   │   ├── AiTutor.jsx
│   │   │   ├── Quiz.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── ActivityHeatmap.jsx
│   │   │   ├── MonthlyPerformanceChart.jsx
│   │   │   ├── StudentMessages.jsx
│   │   │   ├── StudentLiveClasses.jsx
│   │   │   ├── StudentHomework.jsx
│   │   │   ├── StudentSettings.jsx
│   │   │   └── Teachers.jsx
│   │   ├── 📂 teacher/
│   │   │   └── TeacherMessages.jsx
│   │   └── 📂 chat/
│   │       └── ChatRoom.jsx
│   │
│   ├── 📂 pages/
│   │   ├── StudentDashboard.jsx
│   │   ├── TeacherDashboard.jsx
│   │   ├── StudentAuth.jsx
│   │   ├── TeacherAuth.jsx
│   │   └── Landing.jsx
│   │
│   ├── 📂 api/
│   │   ├── getTimeSummary.js
│   │   ├── getDailyProgress.js
│   │   └── getMonthlyProgress.js
│   │
│   ├── firebase.js
│   └── App.jsx
│
├── 📂 ai-backend/
│   ├── 📂 routes/
│   │   ├── progress.js
│   │   └── student.js
│   ├── 📂 db/
│   │   └── postgres.js
│   ├── .env           ← Never commit this!
│   └── server.js
│
├── .env               ← Never commit this!
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### ✅ Prerequisites

- [Node.js](https://nodejs.org/) v18 or above
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/) v14 or above
- A [Firebase](https://firebase.google.com/) account
- A [Groq](https://console.groq.com/) account for AI features

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/PRATHAMESHGORAD/ai-learning-.git
cd ai-learning-
```

---

### Step 2 — Install Frontend Dependencies

```bash
npm install
```

---

### Step 3 — Install Backend Dependencies

```bash
cd ai-backend
npm install
```

---

### Step 4 — Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database**
5. Go to **Project Settings** → copy your config

---

### Step 5 — Setup PostgreSQL

```bash
psql -U postgres
```

```sql
CREATE DATABASE ai_learning;
\c ai_learning

CREATE TABLE daily_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  practice_seconds INT DEFAULT 0,
  ai_questions INT DEFAULT 0,
  quizzes_taken INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE TABLE monthly_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  month TEXT NOT NULL,
  practice_seconds INT DEFAULT 0,
  ai_questions INT DEFAULT 0,
  quizzes_taken INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  UNIQUE(user_id, month)
);
```

---

### Step 6 — Create .env Files

**Root folder `.env`** (Frontend):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**`ai-backend/.env`** (Backend):
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_learning
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_learning
DB_USER=postgres
DB_PASSWORD=your_password
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

---

### Step 7 — Run the App

Open **two terminals:**

**Terminal 1 — Frontend:**
```bash
npm run dev
```

**Terminal 2 — Backend:**
```bash
cd ai-backend
node server.js
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🔐 Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Frontend | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Frontend | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Frontend | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Frontend | Firebase Sender ID |
| `VITE_FIREBASE_APP_ID` | Frontend | Firebase App ID |
| `DATABASE_URL` | Backend | PostgreSQL Connection String |
| `GROQ_API_KEY` | Backend | Groq AI API Key |
| `PORT` | Backend | Backend Server Port |

> ⚠️ **NEVER commit your `.env` files to GitHub!**

---

## 🗄️ Database Structure

### 🔥 Firebase Firestore

| Collection | Description |
|------------|-------------|
| `students` | Student profiles |
| `teachers` | Teacher profiles |
| `chats` | Chat conversations |
| `chats/{id}/messages` | Messages in each chat |
| `reviews` | Teacher reviews |
| `teacherStats` | Teacher rating stats |
| `homework` | Homework assignments |
| `liveClasses` | Live class sessions |

### 🐘 PostgreSQL

| Table | Description |
|-------|-------------|
| `daily_progress` | Daily activity per student |
| `monthly_progress` | Monthly aggregated stats |

---

## 📦 Key Dependencies

### Frontend
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "firebase": "^10.0.0",
  "chart.js": "^4.0.0",
  "react-chartjs-2": "^5.0.0",
  "react-icons": "^4.0.0"
}
```

### Backend
```json
{
  "express": "^4.0.0",
  "pg": "^8.0.0",
  "cors": "^2.0.0",
  "dotenv": "^16.0.0",
  "groq-sdk": "latest"
}
```

---

## 🤝 Contributing

1. **Fork** the project
2. Create your branch: `git checkout -b feature/NewFeature`
3. Commit changes: `git commit -m "Add NewFeature"`
4. Push to branch: `git push origin feature/NewFeature`
5. Open a **Pull Request**

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Prathamesh Gorad**
- GitHub: [@PRATHAMESHGORAD](https://github.com/PRATHAMESHGORAD)

---

## 🙏 Acknowledgements

- [Firebase](https://firebase.google.com/) — Real-time database & auth
- [PostgreSQL](https://www.postgresql.org/) — Progress & analytics storage
- [Groq](https://console.groq.com/) — AI powered responses
- [Chart.js](https://www.chartjs.org/) — Beautiful charts
- [React Icons](https://react-icons.github.io/react-icons/) — Icons
- [Vite](https://vitejs.dev/) — Lightning fast build tool

---

<div align="center">
  <p>Made with ❤️ and lots of ☕ by Prathamesh Gorad</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>