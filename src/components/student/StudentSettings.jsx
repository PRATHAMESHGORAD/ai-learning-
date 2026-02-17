import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { FaCog, FaUser, FaEnvelope, FaChalkboardTeacher, FaCheck, FaTimes, FaLink } from "react-icons/fa";

export default function StudentSettings() {
  const [student, setStudent] = useState(null);
  const [teacherCode, setTeacherCode] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectedTeacher, setConnectedTeacher] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const studentDoc = await getDoc(doc(db, 'students', user.uid));
      const studentData = { id: studentDoc.id, ...studentDoc.data() };
      setStudent(studentData);

      if (studentData.teacherId) {
        const teacherDoc = await getDoc(doc(db, 'teachers', studentData.teacherId));
        if (teacherDoc.exists()) {
          setConnectedTeacher(teacherDoc.data());
        }
      }
    } catch (err) {
      console.error("Error loading student:", err);
    } finally {
      setLoading(false);
    }
  }

  async function connectToTeacher(e) {
    e.preventDefault();
    setError("");
    setConnecting(true);

    try {
      const code = teacherCode.trim().toUpperCase();
      
      if (!code) {
        throw new Error('Please enter a teacher code');
      }

      const teachersRef = collection(db, 'teachers');
      const q = query(teachersRef, where('inviteCode', '==', code));
      
      const teacherSnap = await getDocs(q);
      
      if (teacherSnap.empty) {
        throw new Error('Invalid teacher code');
      }
      
      const teacherId = teacherSnap.docs[0].id;
      const teacherData = teacherSnap.docs[0].data();

      await updateDoc(doc(db, 'students', auth.currentUser.uid), {
        teacherId: teacherId,
        connectedAt: new Date()
      });

      const res = await fetch('http://localhost:5000/api/student/connect-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: auth.currentUser.uid,
          teacherId: teacherId
        })
      });

      if (!res.ok) throw new Error('Failed to sync database');

      setConnectedTeacher(teacherData);
      setTeacherCode("");
      alert(`✅ Connected to ${teacherData.name}!`);

    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  }

  async function disconnectTeacher() {
    if (!window.confirm('Disconnect from teacher?')) return;

    try {
      await updateDoc(doc(db, 'students', auth.currentUser.uid), {
        teacherId: null,
        connectedAt: null
      });

      setConnectedTeacher(null);
      alert('Disconnected successfully');
    } catch (err) {
      console.error("Error disconnecting:", err);
      alert('Failed to disconnect');
    }
  }

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden"
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
          animation: "float 6s ease-in-out infinite"
        }} />
        
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 60,
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          textAlign: "center",
          position: "relative",
          zIndex: 10
        }}>
          <div className="spinner" style={{
            width: 60,
            height: 60,
            border: "4px solid rgba(102,126,234,0.2)",
            borderTop: "4px solid #667eea",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 24px"
          }} />
          <h2 style={{
            fontSize: 24,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Loading Settings...
          </h2>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      <div style={{
        position: "fixed",
        top: "10%",
        right: "-5%",
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        filter: "blur(80px)",
        animation: "float 20s ease-in-out infinite",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "fixed",
        bottom: "10%",
        left: "-10%",
        width: "700px",
        height: "700px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        filter: "blur(100px)",
        animation: "float 25s ease-in-out infinite reverse",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "40px 20px",
        position: "relative",
        zIndex: 10,
        minHeight: "100%"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 30,
          borderRadius: 20,
          marginBottom: 30,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FaCog style={{ fontSize: 30, color: "#667eea" }} />
            <h1 style={{
              margin: 0,
              fontSize: 32,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Settings
            </h1>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 30,
            borderRadius: 20,
            marginBottom: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            animation: "slideIn 0.5s ease-out"
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 22,
              flexShrink: 0
            }}>
              <FaUser />
            </div>
            <h2 style={{
              margin: 0,
              fontSize: 24,
              color: "#1e293b",
              fontWeight: "700"
            }}>
              Profile
            </h2>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 16,
              background: "#f8f9ff",
              borderRadius: 12,
              border: "2px solid #e2e8f0"
            }}>
              <FaUser style={{ color: "#667eea", fontSize: 18 }} />
              <div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Name</div>
                <div style={{ fontSize: 16, fontWeight: "600", color: "#1e293b" }}>{student.fullname || student.name || "Student"}</div>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 16,
              background: "#f8f9ff",
              borderRadius: 12,
              border: "2px solid #e2e8f0"
            }}>
              <FaEnvelope style={{ color: "#667eea", fontSize: 18 }} />
              <div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 16, fontWeight: "600", color: "#1e293b" }}>{student.email}</div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 30,
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            animation: "slideIn 0.5s ease-out 0.1s both"
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 22,
              flexShrink: 0
            }}>
              <FaChalkboardTeacher />
            </div>
            <h2 style={{
              margin: 0,
              fontSize: 24,
              color: "#1e293b",
              fontWeight: "700"
            }}>
              Teacher Connection
            </h2>
          </div>

          {connectedTeacher ? (
            <div>
              <div style={{
                background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
                border: "2px solid #28a745",
                padding: 24,
                borderRadius: 16,
                marginBottom: 20,
                boxShadow: "0 4px 12px rgba(40,167,69,0.2)"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12
                }}>
                  <FaCheck style={{ color: "#28a745", fontSize: 24 }} />
                  <div style={{ fontSize: 20, fontWeight: "bold", color: "#155724" }}>
                    Connected to {connectedTeacher.name}
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#155724",
                  fontSize: 15
                }}>
                  <FaEnvelope style={{ fontSize: 14 }} />
                  {connectedTeacher.email}
                </div>
              </div>

              <button
                onClick={disconnectTeacher}
                style={{
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: "700",
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.3s"
                }}
                onMouseEnter={e => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(239,68,68,0.4)";
                }}
                onMouseLeave={e => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)";
                }}
              >
                <FaTimes />
                Disconnect from Teacher
              </button>
            </div>
          ) : (
            <div>
              <p style={{
                color: "#64748b",
                marginBottom: 20,
                fontSize: 15,
                lineHeight: 1.6
              }}>
                Enter your teacher's invite code to connect and access their classes, homework, and live sessions.
              </p>

              {error && (
                <div style={{
                  background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                  border: "2px solid #ef4444",
                  color: "#991b1b",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontWeight: "600"
                }}>
                  <FaTimes style={{ fontSize: 18 }} />
                  {error}
                </div>
              )}

              <form onSubmit={connectToTeacher}>
                <input
                  type="text"
                  placeholder="TEACH-XXXX"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
                  disabled={connecting}
                  style={{
                    width: "100%",
                    padding: "18px 24px",
                    fontSize: 20,
                    border: "2px solid #e2e8f0",
                    borderRadius: 12,
                    textTransform: "uppercase",
                    letterSpacing: 4,
                    fontFamily: "monospace",
                    textAlign: "center",
                    marginBottom: 16,
                    fontWeight: "700",
                    outline: "none",
                    transition: "border-color 0.3s",
                    boxSizing: "border-box"
                  }}
                  onFocus={e => e.target.style.borderColor = "#667eea"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />

                <button
                  type="submit"
                  disabled={connecting || !teacherCode}
                  style={{
                    width: "100%",
                    padding: "16px 32px",
                    background: connecting || !teacherCode
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 18,
                    fontWeight: "700",
                    cursor: connecting || !teacherCode ? "not-allowed" : "pointer",
                    boxShadow: connecting || !teacherCode ? "none" : "0 4px 12px rgba(102,126,234,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={e => {
                    if (!connecting && teacherCode) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 16px rgba(102,126,234,0.4)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!connecting && teacherCode) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 12px rgba(102,126,234,0.3)";
                    }
                  }}
                >
                  <FaLink />
                  {connecting ? "Connecting..." : "Connect to Teacher"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}