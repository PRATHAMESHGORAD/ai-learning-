import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { FaUser, FaExternalLinkAlt, FaCheckCircle } from "react-icons/fa";

export default function TeacherHomeworkSubmissions({ homeworkId }) {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "homeworks", homeworkId, "submissions"),
      snap => {
        setSubs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );
    return () => unsub();
  }, [homeworkId]);

  if (subs.length === 0) return null;

  return (
    <div style={{
      marginTop: 20,
      paddingTop: 20,
      borderTop: "2px solid #f1f5f9"
    }}>
      {/* Submissions Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 14
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 13
        }}>
          <FaCheckCircle />
        </div>
        <h4 style={{
          margin: 0,
          fontSize: 14,
          fontWeight: "700",
          color: "#667eea"
        }}>
          Student Submissions ({subs.length})
        </h4>
      </div>

      {/* Submission Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {subs.map(s => (
          <div
            key={s.id}
            style={{
              background: "linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)",
              border: "1px solid rgba(102,126,234,0.15)",
              padding: "14px 16px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              transition: "all 0.3s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)";
              e.currentTarget.style.borderColor = "rgba(102,126,234,0.3)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)";
              e.currentTarget.style.borderColor = "rgba(102,126,234,0.15)";
            }}
          >
            {/* Student Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 16,
                fontWeight: "700",
                flexShrink: 0
              }}>
                {(s.studentName || s.studentId || "?")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: 14, color: "#1e293b" }}>
                  {s.studentName || s.studentId}
                </div>
                <div style={{
                  fontSize: 11,
                  color: "#10b981",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 2
                }}>
                  <FaCheckCircle style={{ fontSize: 10 }} />
                  Submitted
                  {s.submittedAt?.toDate && (
                    <span style={{ color: "#94a3b8", fontWeight: "400" }}>
                      · {new Date(s.submittedAt.toDate()).toLocaleDateString("en-US", {
                          month: "short", day: "numeric"
                        })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* View Button */}
            <a
              href={s.submissionUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: 8,
                fontWeight: "600",
                fontSize: 13,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(102,126,234,0.25)",
                transition: "all 0.3s",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(102,126,234,0.35)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(102,126,234,0.25)";
              }}
            >
              <FaExternalLinkAlt style={{ fontSize: 11 }} />
              View Submission
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}