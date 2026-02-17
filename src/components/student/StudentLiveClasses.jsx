import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDoc,
  doc
} from "firebase/firestore";
import { FaVideo, FaChalkboardTeacher, FaUsers, FaClock } from "react-icons/fa";
import { auth, db } from "../../firebase";

export default function StudentLiveClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "liveClasses"),
      (snap) => {
        setClasses(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(cls => cls.status === "live")
        );
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  async function joinClass(cls) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // 🔹 get student profile
      const studentSnap = await getDoc(doc(db, "students", user.uid));
      const studentName = studentSnap.exists()
        ? studentSnap.data().fullname
        : "Student";

      // 🔹 save attendance WITH NAME
      await addDoc(
        collection(db, "liveClasses", cls.id, "attendance"),
        {
          studentId: user.uid,
          studentName: studentName,
          joinedAt: serverTimestamp(),
        }
      );

      window.open(cls.meetLink, "_blank");
    } catch (err) {
      console.error("Error joining class:", err);
      alert("Failed to join class. Please try again.");
    }
  }

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
            Loading Live Classes...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      {/* Animated Background Blobs */}
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
        {/* Header */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 30,
          borderRadius: 20,
          marginBottom: 30,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FaVideo style={{ fontSize: 30, color: "#667eea" }} />
            <h1 style={{
              margin: 0,
              fontSize: 32,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Live Classes
            </h1>
          </div>
          {classes.length > 0 && (
            <div style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#10b981",
              fontSize: 14,
              fontWeight: "600"
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
                animation: "pulse 2s ease-in-out infinite"
              }} />
              {classes.length} {classes.length === 1 ? "class" : "classes"} live now
            </div>
          )}
        </div>

        {/* Empty State */}
        {classes.length === 0 && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 60,
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎥</div>
            <h2 style={{
              fontSize: 28,
              marginBottom: 16,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              No Live Classes
            </h2>
            <p style={{ color: "#64748b", fontSize: 16 }}>
              Check back later when your teacher starts a class
            </p>
          </div>
        )}

        {/* Classes List */}
        {classes.map((cls, index) => (
          <div
            key={cls.id}
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              padding: 30,
              borderRadius: 20,
              marginBottom: 20,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
              transition: "all 0.3s"
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
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap"
            }}>
              <div style={{ flex: 1, minWidth: 250 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16
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
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: 22,
                      color: "#1e293b",
                      fontWeight: "700"
                    }}>
                      {cls.title}
                    </h3>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 4,
                      color: "#10b981",
                      fontSize: 13,
                      fontWeight: "600"
                    }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#10b981",
                        animation: "pulse 2s ease-in-out infinite"
                      }} />
                      LIVE NOW
                    </div>
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}>
                  {cls.teacherName && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      color: "#64748b",
                      fontSize: 15
                    }}>
                      <FaChalkboardTeacher style={{ color: "#667eea" }} />
                      <span>{cls.teacherName}</span>
                    </div>
                  )}
                  {cls.description && (
                    <p style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: 15,
                      lineHeight: 1.6
                    }}>
                      {cls.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => joinClass(cls)}
                style={{
                  padding: "16px 32px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: "700",
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.3s",
                  alignSelf: "center"
                }}
                onMouseEnter={e => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(16,185,129,0.4)";
                }}
                onMouseLeave={e => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(16,185,129,0.3)";
                }}
              >
                <FaVideo />
                Join Class
              </button>
            </div>
          </div>
        ))}
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
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}