import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { getStudentPerformance } from "../../api/getStudentPerformance";
import ActivityHeatmap from "../../components/student/ActivityHeatmap";
import MonthlyPerformanceChart from "../../components/student/MonthlyPerformanceChart";

import {
  FaChartBar,
  FaFire,
  FaClock,
  FaTrophy,
  FaRobot,
  FaClipboardCheck,
  FaCheckCircle,
  FaCalendarAlt
} from "react-icons/fa";

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

export default function TeacherStudentPerformance({ studentId, studentName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const teacher = auth.currentUser;
        if (!teacher) return;
        const result = await getStudentPerformance(teacher.uid, studentId);
        setData(result);
      } catch (err) {
        console.error("PERFORMANCE LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentId]);

  if (loading) {
    return (
      <div style={{
        height: "100%",
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
          padding: 40, borderRadius: 20,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
        }}>
          <div style={{
            width: 60, height: 60,
            border: "4px solid rgba(102,126,234,0.2)",
            borderTop: "4px solid #667eea",
            borderRadius: "50%",
            animation: "spSpin 1s linear infinite",
            margin: "0 auto 20px"
          }} />
          <h2 style={{
            margin: 0,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Loading performance...
          </h2>
        </div>
        <style>{`@keyframes spSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 60, borderRadius: 20,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📊</div>
          <h2 style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 8
          }}>No Data Available</h2>
          <p style={{ color: "#94a3b8" }}>This student hasn't started learning yet</p>
        </div>
      </div>
    );
  }

  const totalSeconds = data.summary.total_seconds || 0;
  const milestone = getMilestone(totalSeconds);
  const accuracy = data.summary.accuracy || 0;

  return (
    <div style={{
      height: "100%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      {/* Background Blobs */}
      <div style={{
        position: "absolute",
        top: "-10%", right: "-5%",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        filter: "blur(80px)",
        animation: "spFloat 20s ease-in-out infinite",
        pointerEvents: "none", zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "-15%", left: "-10%",
        width: "700px", height: "700px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        filter: "blur(100px)",
        animation: "spFloat 25s ease-in-out infinite reverse",
        pointerEvents: "none", zIndex: 0
      }} />

      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 24px 80px",
        position: "relative",
        zIndex: 10
      }}>

        {/* ===== HEADER ===== */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 30, borderRadius: 20,
          marginBottom: 24,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "14px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 24,
              boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
            }}>
              <FaChartBar />
            </div>
            <div>
              <h1 style={{
                margin: 0,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                fontSize: 28, fontWeight: "700"
              }}>
                {studentName ? `${studentName}'s Performance` : "Student Performance"}
              </h1>
              {data.summary.last_active && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  marginTop: 6, color: "#94a3b8", fontSize: 13, fontWeight: "500"
                }}>
                  <FaCalendarAlt style={{ fontSize: 12 }} />
                  Last active: {data.summary.last_active}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== TOP STATS CARDS ===== */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: 24
        }}>
          {/* Total Time */}
          <StatCard
            icon={<FaClock style={{ fontSize: 24, color: "#667eea" }} />}
            title="Total Learning Time"
            value={formatTimeDisplay(totalSeconds)}
            sub="Since they started learning"
            gradient={false}
            valueColor="#667eea"
          />

          {/* Today */}
          <StatCard
            icon={<FaFire style={{ fontSize: 24, color: "#f59e0b" }} />}
            title="Accuracy Rate"
            value={`${accuracy}%`}
            sub="Quiz correct answers"
            gradient={false}
            valueColor="#f59e0b"
          />

          {/* Milestone */}
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: 28, borderRadius: 20,
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
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <FaTrophy style={{ fontSize: 22 }} />
              <h3 style={{ margin: 0, fontSize: 15, opacity: 0.9 }}>Achievement</h3>
            </div>
            <div style={{ fontSize: 38, marginBottom: 8 }}>{milestone.icon}</div>
            <div style={{ fontSize: 22, fontWeight: "700", marginBottom: 4 }}>{milestone.text}</div>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>{milestone.desc}</p>
          </div>
        </div>

        {/* ===== SUMMARY STATS ROW ===== */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 24
        }}>
          <MiniStatCard
            icon="🤖"
            title="AI Questions Asked"
            value={data.summary.total_ai || 0}
            color="#667eea"
          />
          <MiniStatCard
            icon="📝"
            title="Quizzes Taken"
            value={data.summary.total_quizzes || 0}
            color="#10b981"
          />
          <MiniStatCard
            icon="✅"
            title="Correct Answers"
            value={data.summary.total_correct || 0}
            color="#f59e0b"
          />
          <MiniStatCard
            icon="⏱️"
            title="Practice Time"
            value={formatTimeDisplay(totalSeconds)}
            color="#8b5cf6"
          />
        </div>

        {/* ===== ACTIVITY HEATMAP ===== */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 30, borderRadius: 20,
          marginBottom: 24,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}>
          <h2 style={{
            margin: "0 0 20px 0", fontSize: 20, fontWeight: "700",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            🔥 Activity Heatmap
          </h2>
          <ActivityHeatmap userId={studentId} />
        </div>

        {/* ===== MONTHLY CHART ===== */}
        {data.monthly && data.monthly.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 30, borderRadius: 20,
            marginBottom: 24,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
          }}>
            <h2 style={{
              margin: "0 0 20px 0", fontSize: 20, fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              📊 Monthly Performance
            </h2>
            <MonthlyPerformanceChart data={data.monthly} />
          </div>
        )}

        
      </div>

      <style>{`
        @keyframes spFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes spSpin { to { transform: rotate(360deg); } }
        @keyframes spSlideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

// ===== LARGE STAT CARD =====
function StatCard({ icon, title, value, sub, valueColor }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(20px)",
      padding: 28, borderRadius: 20,
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        {icon}
        <h3 style={{ margin: 0, fontSize: 15, color: "#64748b", fontWeight: "600" }}>{title}</h3>
      </div>
      <div style={{
        fontSize: 44, fontWeight: "700",
        color: valueColor,
        marginBottom: 8, lineHeight: 1
      }}>
        {value}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>{sub}</p>
    </div>
  );
}

// ===== MINI STAT CARD =====
function MiniStatCard({ icon, title, value, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(20px)",
      padding: 22, borderRadius: 16,
      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      transition: "all 0.3s",
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
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "#64748b", fontWeight: "600" }}>{title}</h3>
      <div style={{ fontSize: 32, fontWeight: "700", color }}>{value}</div>
    </div>
  );
}