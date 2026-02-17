import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import ActivityHeatmap from "./ActivityHeatmap";
import { getTimeSummary } from "../../api/getTimeSummary";
import MonthlyPerformanceChart from "./MonthlyPerformanceChart";
import { getMonthlyProgress } from "../../api/getMonthlyProgress";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { FaChartBar, FaFire, FaClock, FaTrophy } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function formatTimeDisplay(seconds) {
  if (!seconds || seconds === 0) return "0h 0m";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function getMilestone(seconds) {
  const hours = seconds / 3600;
  if (hours >= 100) return { icon: "🏆", text: "Master Learner", desc: "100+ hours" };
  if (hours >= 50) return { icon: "⭐", text: "Dedicated Student", desc: "50+ hours" };
  if (hours >= 20) return { icon: "🎯", text: "Committed Learner", desc: "20+ hours" };
  if (hours >= 5) return { icon: "🌟", text: "Getting Started", desc: "5+ hours" };
  return { icon: "🚀", text: "Begin Your Journey", desc: "Start learning" };
}

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(null);
  const [monthly, setMonthly] = useState([]);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/progress/summary/${user.uid}`
        );
        
        const data = await res.json();

        setStats({
          totalAiMessages: Number(data.total_ai || 0),
          totalQuizzes: Number(data.total_quizzes || 0),
          totalCorrect: Number(data.total_correct || 0),
        });
      } catch (err) {
        console.error("SUMMARY LOAD ERROR:", err);
        setStats({
          totalAiMessages: 0,
          totalQuizzes: 0,
          totalCorrect: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    let intervalId;
    let midnightTimeout;

    async function loadTime() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const data = await getTimeSummary(user.uid);
        setTime(data);
      } catch (err) {
        console.error("TIME LOAD ERROR:", err);
      }
    }

    loadTime();
    intervalId = setInterval(loadTime, 5 * 60 * 1000);

    function scheduleNextMidnight() {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const msUntilMidnight = tomorrow - now;

      midnightTimeout = setTimeout(() => {
        loadTime();
        scheduleNextMidnight();
      }, msUntilMidnight);
    }

    scheduleNextMidnight();

    return () => {
      clearInterval(intervalId);
      clearTimeout(midnightTimeout);
    };
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      const data = await getMonthlyProgress(user.uid);
      setMonthly(data);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 40,
          borderRadius: 20,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
        }}>
          <div style={{
            width: 60,
            height: 60,
            border: "4px solid rgba(102,126,234,0.2)",
            borderTop: "4px solid #667eea",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }} />
          <h2 style={{
            margin: 0,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Loading progress...
          </h2>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const milestone = time ? getMilestone(time.overall) : { icon: "🚀", text: "Begin Your Journey", desc: "Start learning" };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflow: "auto",
      padding: "40px 20px"
    }}>
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        filter: "blur(80px)",
        animation: "float 20s ease-in-out infinite",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-15%",
        left: "-10%",
        width: "700px",
        height: "700px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        filter: "blur(100px)",
        animation: "float 25s ease-in-out infinite reverse",
        pointerEvents: "none"
      }} />

      <div style={{ 
        maxWidth: 1200, 
        margin: "0 auto", 
        position: "relative", 
        zIndex: 10,
        paddingBottom: "150px"
      }}>
        {/* Header */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 30,
          borderRadius: 20,
          marginBottom: 30,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
            }}>
              <FaChartBar />
            </div>

            <h1 style={{
              margin: 0,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: 32,
              fontWeight: "700"
            }}>
              Learning Progress
            </h1>
          </div>
        </div>

        {/* TIME STATS CARDS */}
        {time && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 30 }}>
            {/* Total Time */}
            <div style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              padding: 30,
              borderRadius: 20,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              transition: "all 0.3s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 48px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.15)";
            }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <FaClock style={{ fontSize: 24, color: "#667eea" }} />
                <h3 style={{ margin: 0, fontSize: 16, color: "#64748b" }}>Total Learning Time</h3>
              </div>
              <div style={{
                fontSize: 48,
                fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 8
              }}>
                {formatTimeDisplay(time.overall)}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#94a3b8" }}>Since you started learning</p>
            </div>

            {/* Today */}
            <div style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              padding: 30,
              borderRadius: 20,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              transition: "all 0.3s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 48px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.15)";
            }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <FaFire style={{ fontSize: 24, color: "#f59e0b" }} />
                <h3 style={{ margin: 0, fontSize: 16, color: "#64748b" }}>Today's Progress</h3>
              </div>
              <div style={{
                fontSize: 48,
                fontWeight: "700",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 8
              }}>
                {formatTimeDisplay(time.today)}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#94a3b8" }}>Keep up the momentum!</p>
            </div>

            {/* Milestone */}
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: 30,
              borderRadius: 20,
              boxShadow: "0 10px 40px rgba(102,126,234,0.3)",
              color: "white",
              transition: "all 0.3s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 48px rgba(102,126,234,0.4)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(102,126,234,0.3)";
            }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <FaTrophy style={{ fontSize: 24 }} />
                <h3 style={{ margin: 0, fontSize: 16, opacity: 0.95 }}>Achievement</h3>
              </div>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{milestone.icon}</div>
              <div style={{ fontSize: 24, fontWeight: "700", marginBottom: 4 }}>{milestone.text}</div>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>{milestone.desc}</p>
            </div>
          </div>
        )}

        {/* ACTIVITY HEATMAP */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 30,
          borderRadius: 20,
          marginBottom: 30,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}>
          <ActivityHeatmap />
        </div>

        {/* MONTHLY PERFORMANCE */}
        {monthly.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 30,
            borderRadius: 20,
            marginBottom: 30,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 24, color: "#1e293b", fontSize: 22 }}>📊 Monthly Performance</h2>
            <MonthlyPerformanceChart data={monthly} />
          </div>
        )}

        {/* STATS CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20
        }}>
          <StatCard
            icon="🤖"
            title="AI Questions Asked"
            value={stats.totalAiMessages}
            color="#667eea"
          />
          <StatCard
            icon="📝"
            title="Quizzes Taken"
            value={stats.totalQuizzes}
            color="#10b981"
          />
          <StatCard
            icon="✅"
            title="Correct Answers"
            value={stats.totalCorrect}
            color="#f59e0b"
          />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(20px)",
      padding: 24,
      borderRadius: 16,
      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      transition: "all 0.3s",
      cursor: "pointer",
      border: "2px solid transparent"
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 12px 48px rgba(0,0,0,0.2)";
      e.currentTarget.style.borderColor = color;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.15)";
      e.currentTarget.style.borderColor = "transparent";
    }}
    >
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ margin: "0 0 12px 0", fontSize: 14, color: "#64748b", fontWeight: "600" }}>{title}</h3>
      <h2 style={{
        margin: 0,
        fontSize: 40,
        fontWeight: "700",
        color: color
      }}>
        {value}
      </h2>
    </div>
  );
}