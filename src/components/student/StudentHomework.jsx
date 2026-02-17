import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  query,
  deleteDoc,
  where
} from "firebase/firestore";
import { FaBook, FaCheckCircle, FaClock, FaEdit, FaTrash, FaFileAlt, FaExternalLinkAlt } from "react-icons/fa";
import { auth, db } from "../../firebase";
import HomeworkSubmit from "./StudentHomeworkSubmit";

export default function StudentHomework() {
  const [activeHomework, setActiveHomework] = useState(null);
  const [homeworks, setHomeworks] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!auth.currentUser) return;

    const user = auth.currentUser;

    const q = query(
      collection(db, "homeworks"),
      where("studentId", "==", user.uid)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const hwList = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setHomeworks(hwList);

      const statusMap = {};

      for (let hw of hwList) {
        const subRef = doc(
          db,
          "homeworks",
          hw.id,
          "submissions",
          user.uid
        );

        const subSnap = await getDoc(subRef);

        statusMap[hw.id] = subSnap.exists()
          ? { id: subSnap.id, ...subSnap.data() }
          : null;
      }

      setSubmissions(statusMap);
      setLoading(false);
    });

    return () => unsub();
  }, []);

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
            Loading Homework...
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
            <FaBook style={{ fontSize: 30, color: "#667eea" }} />
            <h1 style={{
              margin: 0,
              fontSize: 32,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Homework
            </h1>
          </div>
        </div>

        {homeworks.length === 0 && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 60,
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>📚</div>
            <h2 style={{
              fontSize: 28,
              marginBottom: 16,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              No Homework Assigned
            </h2>
            <p style={{ color: "#64748b", fontSize: 16 }}>
              You're all caught up! Check back later for new assignments
            </p>
          </div>
        )}

        {homeworks.map((hw, index) => {
          const submission = submissions[hw.id];
          let statusText = "Uncompleted";
          let statusColor = "#ef4444";
          let statusBg = "linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)";

          if (submission && !submission.checked) {
            statusText = "Submitted";
            statusColor = "#f59e0b";
            statusBg = "linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)";
          }

          if (submission && submission.checked) {
            statusText = "Checked";
            statusColor = "#10b981";
            statusBg = "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)";
          }

          return (
            <div key={hw.id} style={{ marginBottom: 20 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  padding: 30,
                  borderRadius: 20,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                  transition: "all 0.3s",
                  cursor: !submission ? "pointer" : "default"
                }}
                onClick={() => {
                  if (!submission) {
                    setActiveHomework(hw.id);
                  }
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
                        <FaFileAlt />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: 20,
                          color: "#1e293b",
                          fontWeight: "700"
                        }}>
                          {hw.title}
                        </h3>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 4,
                          color: "#64748b",
                          fontSize: 14
                        }}>
                          <FaClock style={{ fontSize: 12 }} />
                          Due: {hw.dueDate?.seconds ? new Date(hw.dueDate.seconds * 1000).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <a
                        href={hw.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          color: "#667eea",
                          fontSize: 14,
                          fontWeight: "600",
                          textDecoration: "none",
                          width: "fit-content"
                        }}
                      >
                        <FaExternalLinkAlt style={{ fontSize: 12 }} />
                        View Homework Assignment
                      </a>

                      {submission?.submissionUrl && (
                        <a
                          href={submission.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            color: "#10b981",
                            fontSize: 14,
                            fontWeight: "600",
                            textDecoration: "none",
                            width: "fit-content"
                          }}
                        >
                          <FaCheckCircle style={{ fontSize: 12 }} />
                          View My Submission
                        </a>
                      )}

                      {submission && !submission.checked && (
                        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHomework(hw.id);
                            }}
                            style={{
                              padding: "8px 16px",
                              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: 8,
                              fontWeight: "600",
                              fontSize: 13,
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              transition: "all 0.3s"
                            }}
                          >
                            <FaEdit />
                            Edit Submission
                          </button>

                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const confirm = window.confirm("Delete this submission?");
                              if (!confirm) return;

                              await deleteDoc(doc(db, "homeworks", hw.id, "submissions", user.uid));

                              setSubmissions(prev => {
                                const copy = { ...prev };
                                delete copy[hw.id];
                                return copy;
                              });

                              setActiveHomework(null);
                            }}
                            style={{
                              padding: "8px 16px",
                              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: 8,
                              fontWeight: "600",
                              fontSize: 13,
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              transition: "all 0.3s"
                            }}
                          >
                            <FaTrash />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: "700",
                    background: statusBg,
                    color: statusColor,
                    minWidth: 120,
                    textAlign: "center",
                    alignSelf: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}>
                    {statusText}
                  </div>
                </div>

                {activeHomework === hw.id && (
                  <div style={{
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: "2px solid #e2e8f0"
                  }}>
                    <HomeworkSubmit
                      homeworkId={hw.id}
                      existingSubmission={submission}
                      onClose={() => setActiveHomework(null)}
                      onSubmitted={() => {
                        const user = auth.currentUser;
                        if (!user) return;

                        getDoc(doc(db, "homeworks", hw.id, "submissions", user.uid)).then(snap => {
                          if (snap.exists()) {
                            setSubmissions(prev => ({
                              ...prev,
                              [hw.id]: { id: snap.id, ...snap.data() }
                            }));
                          }
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
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