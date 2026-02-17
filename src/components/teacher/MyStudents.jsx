import { useState } from "react";
import {
  FaUsers,
  FaSearch,
  FaChartBar,
  FaCalendarAlt,
  FaEnvelope
} from "react-icons/fa";

export default function MyStudents({
  students,
  loading,
  inviteCode,
  onViewPerformance
}) {

  const [search, setSearch] = useState("");
  const [focusedSearch, setFocusedSearch] = useState(false);

  const filtered = students.filter(s => {
    const val = search.toLowerCase();
    return (
      (s.fullname || s.name || "").toLowerCase().includes(val) ||
      (s.email || "").toLowerCase().includes(val)
    );
  });

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
          padding: 60, borderRadius: 24,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
        }}>
          <div style={{
            width: 60, height: 60,
            border: "4px solid rgba(102,126,234,0.2)",
            borderTop: "4px solid #667eea",
            borderRadius: "50%",
            animation: "msSpin 1s linear infinite",
            margin: "0 auto 24px"
          }} />
          <h2 style={{
            fontSize: 24, margin: 0,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Loading Students...
          </h2>
        </div>
        <style>{`@keyframes msSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
        animation: "msFloat 20s ease-in-out infinite",
        pointerEvents: "none", zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "-15%", left: "-10%",
        width: "700px", height: "700px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        filter: "blur(100px)",
        animation: "msFloat 25s ease-in-out infinite reverse",
        pointerEvents: "none", zIndex: 0
      }} />

      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "32px 24px 80px",
        position: "relative",
        zIndex: 10
      }}>

        {/* ===== HEADER CARD ===== */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: "24px 28px",
          borderRadius: 20,
          marginBottom: 24,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20
        }}>
          {/* Left: Title */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaUsers style={{ fontSize: 26, color: "#667eea" }} />
              <h1 style={{
                margin: 0, fontSize: 28, fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                My Students
              </h1>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              color: students.length > 0 ? "#10b981" : "#94a3b8",
              fontSize: 14, fontWeight: "600"
            }}>
              {students.length > 0 && (
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#10b981",
                  animation: "msPulse 2s ease-in-out infinite"
                }} />
              )}
              {students.length > 0
                ? `${students.length} student${students.length !== 1 ? "s" : ""} connected`
                : "No students yet"}
            </div>
          </div>

          {/* Right: Invite Code Box */}
          <div style={{
            padding: "16px 24px",
            background: "linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)",
            borderRadius: 16,
            textAlign: "center",
            border: "2px solid rgba(102,126,234,0.15)"
          }}>
            <p style={{
              margin: "0 0 6px 0", fontSize: 11, color: "#94a3b8",
              fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px"
            }}>
              Share This Code
            </p>
            <div style={{
              fontSize: 22, fontWeight: "700", letterSpacing: "4px",
              fontFamily: "monospace",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              {inviteCode || "No Code"}
            </div>
          </div>
        </div>

        {/* ===== SEARCH BAR (only show if students exist) ===== */}
        {students.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: "16px 20px",
            borderRadius: 16,
            marginBottom: 24,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: focusedSearch
              ? "2px solid #667eea"
              : "2px solid transparent",
            transition: "border 0.3s"
          }}>
            <FaSearch style={{ color: "#94a3b8", fontSize: 16, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocusedSearch(true)}
              onBlur={() => setFocusedSearch(false)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 15,
                color: "#1e293b",
                background: "transparent"
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 8,
                  padding: "4px 10px",
                  cursor: "pointer",
                  color: "#64748b",
                  fontSize: 13,
                  fontWeight: "600"
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* ===== EMPTY STATE ===== */}
        {students.length === 0 && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 60, borderRadius: 20,
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>👥</div>
            <h2 style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 12, fontSize: 26
            }}>
              No Students Yet
            </h2>
            <p style={{ color: "#94a3b8", marginBottom: 16, fontSize: 15 }}>
              Share your teacher code with students to connect
            </p>
            <div style={{
              display: "inline-block",
              padding: "16px 32px",
              background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
              borderRadius: 16,
              border: "2px solid rgba(102,126,234,0.2)"
            }}>
              <div style={{
                fontFamily: "monospace",
                fontSize: 28,
                fontWeight: "800",
                letterSpacing: 6,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                {inviteCode}
              </div>
            </div>
          </div>
        )}

        {/* ===== NO SEARCH RESULTS ===== */}
        {students.length > 0 && filtered.length === 0 && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 60, borderRadius: 20,
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
            <h2 style={{
              fontSize: 22, marginBottom: 10,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              No Results Found
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 15 }}>
              No students match "{search}"
            </p>
          </div>
        )}

        {/* ===== STUDENT GRID ===== */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20
        }}>
          {filtered.map((student, index) => (
            <div
              key={student.id}
              style={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
                padding: 24, borderRadius: 20,
                boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                transition: "all 0.3s",
                animation: `msSlideIn 0.5s ease-out ${index * 0.06}s both`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 16px 50px rgba(102,126,234,0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.15)";
              }}
            >
              {/* Avatar + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 58, height: 58, borderRadius: 16, flexShrink: 0,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, color: "white", fontWeight: "800",
                  boxShadow: "0 4px 12px rgba(102,126,234,0.35)"
                }}>
                  {(student.fullname || student.name || "?").charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <h3 style={{
                    margin: "0 0 4px 0", fontSize: 17,
                    color: "#1e293b", fontWeight: "700",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>
                    {student.fullname || student.name || "Unknown Student"}
                  </h3>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    color: "#64748b", fontSize: 13,
                    overflow: "hidden"
                  }}>
                    <FaEnvelope style={{ fontSize: 11, flexShrink: 0, color: "#94a3b8" }} />
                    <span style={{
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>
                      {student.email || "No email"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connected Date */}
              {student.connectedAt && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 14px",
                  background: "linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)",
                  borderRadius: 10,
                  marginBottom: 16,
                  border: "1px solid rgba(102,126,234,0.12)"
                }}>
                  <FaCalendarAlt style={{ color: "#667eea", fontSize: 13 }} />
                  <span style={{ fontSize: 13, color: "#64748b", fontWeight: "500" }}>
                    Connected: {new Date(student.connectedAt.seconds * 1000).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </span>
                </div>
              )}

              {/* View Performance Button */}
              <button
                onClick={() => onViewPerformance(student)}
                style={{
                  width: "100%", padding: "13px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white", border: "none", borderRadius: 12,
                  fontSize: 14, fontWeight: "700", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                  transition: "all 0.3s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(102,126,234,0.45)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(102,126,234,0.3)";
                }}
              >
                <FaChartBar /> View Performance
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes msFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes msSpin { to { transform: rotate(360deg); } }
        @keyframes msSlideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes msPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}