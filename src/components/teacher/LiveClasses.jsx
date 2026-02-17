import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import ClassAttendance from "./ClassAttendance";
import {
  FaVideo,
  FaChalkboardTeacher,
  FaPlus,
  FaTrash,
  FaExternalLinkAlt,
  FaTimes
} from "react-icons/fa";

export default function LiveClasses() {
  const [title, setTitle] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewingAttendance, setViewingAttendance] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "liveClasses"), (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  async function deleteClass(classId) {
    if (!window.confirm("Are you sure you want to delete this live class?")) return;
    await deleteDoc(doc(db, "liveClasses", classId));
  }

  async function createClass() {
    const user = auth.currentUser;
    if (!user) return;
    if (!title || !meetLink) { alert("Please fill all fields"); return; }
    setCreating(true);
    try {
      await addDoc(collection(db, "liveClasses"), {
        title, meetLink,
        teacherId: user.uid,
        teacherName: user.email,
        status: "live",
        createdAt: serverTimestamp(),
        endedAt: null
      });
      setTitle(""); setMeetLink(""); setShowForm(false);
    } catch (err) {
      console.error("Error creating class:", err);
      alert("Failed to create class. Try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    /*
      FIX: height: 100% fills only the dashboard content box (not full page)
      position: relative so absolute blobs are clipped inside this div
      overflowY: auto so content scrolls within the content area
    */
    <div style={{
      height: "100%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      {/* FIX: position absolute (NOT fixed) — stays inside content area, no bleed */}
      <div style={{
        position: "absolute",
        top: "5%", right: "-5%",
        width: "500px", height: "500px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        filter: "blur(80px)",
        animation: "lcFloat 20s ease-in-out infinite",
        pointerEvents: "none", zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "5%", left: "-8%",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        filter: "blur(100px)",
        animation: "lcFloat 25s ease-in-out infinite reverse",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Content — scrolls within the gradient viewport */}
      <div style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "32px 24px",
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
          gap: 16
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaVideo style={{ fontSize: 26, color: "#667eea" }} />
              <h1 style={{
                margin: 0, fontSize: 28, fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                Live Classes
              </h1>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              color: classes.length > 0 ? "#10b981" : "#94a3b8",
              fontSize: 14, fontWeight: "600"
            }}>
              {classes.length > 0 && (
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#10b981",
                  animation: "lcPulse 2s ease-in-out infinite"
                }} />
              )}
              {classes.length > 0
                ? `${classes.length} class${classes.length !== 1 ? "es" : ""} active`
                : "No active classes"}
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "12px 22px",
              background: showForm ? "rgba(255,255,255,0.3)" : "white",
              color: showForm ? "white" : "#667eea",
              border: showForm ? "1px solid rgba(255,255,255,0.4)" : "2px solid #667eea",
              borderRadius: 12, fontWeight: "700", fontSize: 14,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.3s"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> New Class</>}
          </button>
        </div>

        {/* ===== CREATE FORM ===== */}
        {showForm && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 20, padding: 28, marginBottom: 24,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            animation: "lcSlideIn 0.3s ease-out"
          }}>
            <h3 style={{
              margin: "0 0 20px 0", fontSize: 18, fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              🎥 Start a New Live Class
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{
                  display: "block", marginBottom: 8, fontSize: 12, fontWeight: "600",
                  color: focusedField === "title" ? "#667eea" : "#64748b",
                  textTransform: "uppercase", letterSpacing: "0.5px", transition: "color 0.3s"
                }}>Class Title</label>
                <input
                  placeholder="e.g., Math - Algebra Chapter 3"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: 10,
                    border: focusedField === "title" ? "2px solid #667eea"
                      : title ? "2px solid #10b981" : "2px solid #e2e8f0",
                    fontSize: 14, outline: "none", transition: "all 0.3s",
                    background: focusedField === "title" ? "#fafbff" : "white",
                    color: "#1e293b", boxSizing: "border-box",
                    boxShadow: focusedField === "title" ? "0 0 0 3px rgba(102,126,234,0.1)" : "none"
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: "block", marginBottom: 8, fontSize: 12, fontWeight: "600",
                  color: focusedField === "link" ? "#667eea" : "#64748b",
                  textTransform: "uppercase", letterSpacing: "0.5px", transition: "color 0.3s"
                }}>Google Meet Link</label>
                <input
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={meetLink}
                  onChange={e => setMeetLink(e.target.value)}
                  onFocus={() => setFocusedField("link")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: 10,
                    border: focusedField === "link" ? "2px solid #667eea"
                      : meetLink ? "2px solid #10b981" : "2px solid #e2e8f0",
                    fontSize: 14, outline: "none", transition: "all 0.3s",
                    background: focusedField === "link" ? "#fafbff" : "white",
                    color: "#1e293b", boxSizing: "border-box",
                    boxShadow: focusedField === "link" ? "0 0 0 3px rgba(102,126,234,0.1)" : "none"
                  }}
                />
              </div>

              <button
                onClick={createClass}
                disabled={creating || !title || !meetLink}
                style={{
                  padding: "14px",
                  background: creating || !title || !meetLink
                    ? "#e2e8f0"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: creating || !title || !meetLink ? "#94a3b8" : "white",
                  border: "none", borderRadius: 10, fontWeight: "700", fontSize: 15,
                  cursor: creating || !title || !meetLink ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: creating || !title || !meetLink ? "none" : "0 4px 12px rgba(102,126,234,0.3)",
                  transition: "all 0.3s"
                }}
                onMouseEnter={e => {
                  if (!creating && title && meetLink) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(102,126,234,0.4)";
                  }
                }}
                onMouseLeave={e => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = creating || !title || !meetLink ? "none" : "0 4px 12px rgba(102,126,234,0.3)";
                }}
              >
                {creating ? (
                  <>
                    <div style={{
                      width: 18, height: 18,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTop: "2px solid white",
                      borderRadius: "50%", animation: "lcSpin 0.8s linear infinite"
                    }} />
                    Creating...
                  </>
                ) : (
                  <><FaVideo /> Go Live Now</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===== EMPTY STATE ===== */}
        {classes.length === 0 && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 60, borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎥</div>
            <h2 style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 8, fontSize: 24
            }}>
              No Live Classes Yet
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 24 }}>
              Start a new class and students can join instantly
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white", border: "none", borderRadius: 12,
                fontWeight: "600", fontSize: 15, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 12px rgba(102,126,234,0.3)", transition: "all 0.3s"
              }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; }}
            >
              <FaPlus /> Create First Class
            </button>
          </div>
        )}

        {/* ===== CLASS CARDS ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {classes.map((cls, index) => (
            <div key={cls.id}>
              <div
                style={{
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  padding: 28, borderRadius: 20,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  transition: "all 0.3s",
                  animation: `lcSlideIn 0.5s ease-out ${index * 0.1}s both`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 48px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.15)";
                }}
              >
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap", gap: 16
                }}>
                  {/* Left */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 200 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: 22, flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
                    }}>
                      <FaChalkboardTeacher />
                    </div>
                    <div>
                      <h3 style={{ margin: "0 0 6px 0", fontSize: 18, color: "#1e293b", fontWeight: "700" }}>
                        {cls.title}
                      </h3>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        color: cls.status === "live" ? "#10b981" : "#94a3b8",
                        fontSize: 13, fontWeight: "600"
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: cls.status === "live" ? "#10b981" : "#94a3b8",
                          animation: cls.status === "live" ? "lcPulse 2s ease-in-out infinite" : "none"
                        }} />
                        {cls.status === "live" ? "LIVE NOW" : cls.status?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setViewingAttendance(viewingAttendance === cls.id ? null : cls.id)}
                      style={{
                        padding: "10px 18px",
                        background: viewingAttendance === cls.id
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#f1f5f9",
                        color: viewingAttendance === cls.id ? "white" : "#64748b",
                        border: "none", borderRadius: 10, fontWeight: "600", fontSize: 13,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                        transition: "all 0.3s",
                        boxShadow: viewingAttendance === cls.id ? "0 4px 12px rgba(102,126,234,0.3)" : "none"
                      }}
                      onMouseEnter={e => { if (viewingAttendance !== cls.id) e.currentTarget.style.background = "#e2e8f0"; }}
                      onMouseLeave={e => { if (viewingAttendance !== cls.id) e.currentTarget.style.background = "#f1f5f9"; }}
                    >
                      👥 {viewingAttendance === cls.id ? "Hide" : "Attendance"}
                    </button>

                    <a
                      href={cls.meetLink}
                      target="_blank" rel="noreferrer"
                      style={{
                        padding: "10px 18px",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "white", border: "none", borderRadius: 10,
                        fontWeight: "600", fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                        textDecoration: "none",
                        boxShadow: "0 4px 12px rgba(16,185,129,0.3)", transition: "all 0.3s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(16,185,129,0.4)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.3)"; }}
                    >
                      <FaExternalLinkAlt /> Open Meet
                    </a>

                    <button
                      onClick={() => deleteClass(cls.id)}
                      style={{
                        padding: "10px 14px", background: "#fff5f5", color: "#ef4444",
                        border: "1px solid #fecaca", borderRadius: 10,
                        fontWeight: "600", fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.borderColor = "#ef4444";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "#fff5f5";
                        e.currentTarget.style.color = "#ef4444";
                        e.currentTarget.style.borderColor = "#fecaca";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendance Panel */}
              {viewingAttendance === cls.id && (
                <div style={{
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 20, padding: 24, marginTop: 12,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  animation: "lcSlideIn 0.3s ease-out"
                }}>
                  <h4 style={{
                    margin: "0 0 16px 0", fontSize: 15, fontWeight: "600",
                    color: "#667eea", display: "flex", alignItems: "center", gap: 8
                  }}>
                    👥 Class Attendance
                  </h4>
                  <ClassAttendance classId={cls.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes lcFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes lcSpin { to { transform: rotate(360deg); } }
        @keyframes lcSlideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lcPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}