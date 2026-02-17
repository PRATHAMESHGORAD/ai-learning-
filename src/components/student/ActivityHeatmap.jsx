import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { getDailyProgress } from "../../api/getDailyProgress";
import { FaFire, FaCalendar } from "react-icons/fa";

export default function ActivityHeatmap({ userId }) {
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        let uid = userId;

        if (!uid) {
          const user = auth.currentUser;
          if (!user) {
            setLoading(false);
            return;
          }
          uid = user.uid;
        }

        const data = await getDailyProgress(uid);

        const map = {};
        data.forEach(d => {
          map[d.date] = d;
        });

        setDays(map);
      } catch (err) {
        console.error("HEATMAP ERROR:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  function getColor(day) {
    const d = days[day];
    
    if (!d) return "#e5e7eb";

    const seconds = d.practice_seconds || 0;

    if (seconds === 0) return "#e5e7eb";
    if (seconds <= 300) return "#bbf7d0";
    if (seconds <= 900) return "#86efac";
    if (seconds <= 1800) return "#4ade80";
    if (seconds <= 3600) return "#22c55e";
    return "#16a34a";
  }

  function formatTime(seconds = 0) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (seconds === 0) return "No activity";
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  function getStreakCount() {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = days[dateStr];
      
      if (dayData && dayData.practice_seconds > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  const today = new Date();
  const dates = [];

  for (let i = 179; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const totalActiveDays = Object.values(days).filter(d => d.practice_seconds > 0).length;
  const streak = getStreakCount();

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Loading activity...</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FaCalendar style={{ fontSize: 24, color: "#667eea" }} />
          <h2 style={{ margin: 0, fontSize: 22, color: "#1e293b" }}>📅 Activity Overview (Last 180 Days)</h2>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{
            padding: "8px 16px",
            background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <FaFire style={{ color: "#f59e0b", fontSize: 18 }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: "700", color: "#667eea" }}>{streak}</div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: "600" }}>Day Streak</div>
            </div>
          </div>

          <div style={{
            padding: "8px 16px",
            background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <div style={{ fontSize: 18 }}>✅</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: "700", color: "#667eea" }}>{totalActiveDays}</div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: "600" }}>Active Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* LEGEND */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: "600" }}>Less</span>
        <div style={{ width: 16, height: 16, backgroundColor: "#e5e7eb", borderRadius: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
        <div style={{ width: 16, height: 16, backgroundColor: "#bbf7d0", borderRadius: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
        <div style={{ width: 16, height: 16, backgroundColor: "#86efac", borderRadius: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
        <div style={{ width: 16, height: 16, backgroundColor: "#4ade80", borderRadius: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
        <div style={{ width: 16, height: 16, backgroundColor: "#22c55e", borderRadius: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
        <div style={{ width: 16, height: 16, backgroundColor: "#16a34a", borderRadius: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: "600" }}>More</span>
      </div>

      {/* HEATMAP GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(16px, 1fr))",
        gap: 6,
        padding: 16,
        background: "#f8f9fa",
        borderRadius: 12,
        maxWidth: "100%",
        overflow: "hidden"
      }}>
        {dates.map(day => {
          const color = getColor(day);
          const data = days[day];
          const isHovered = hoveredDay === day;
          
          return (
            <div
              key={day}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                width: 16,
                height: 16,
                backgroundColor: color,
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.2s",
                transform: isHovered ? "scale(1.3)" : "scale(1)",
                boxShadow: isHovered ? "0 4px 12px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.1)",
                position: "relative",
                zIndex: isHovered ? 10 : 1
              }}
            />
          );
        })}
      </div>

      {/* HOVER TOOLTIP */}
      {hoveredDay && (
        <div style={{
          marginTop: 16,
          padding: 16,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 12,
          color: "white",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
        }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>
            {new Date(hoveredDay).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ fontSize: 24, fontWeight: "700" }}>
            {formatTime(days[hoveredDay]?.practice_seconds)}
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
            {days[hoveredDay]?.practice_seconds > 0 ? "🎯 Active Learning" : "💤 No Activity"}
          </div>
        </div>
      )}
    </div>
  );
}