import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaRedo, FaArrowLeft } from "react-icons/fa";
import { FaChalkboardTeacher, FaUserGraduate, FaBook } from "react-icons/fa";
export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = auth.currentUser;
  const stored = user ? localStorage.getItem(`ai_chats_${user.uid}`) : null;

  const messages = (() => {
    if (location.state?.messages) {
      console.log("✅ Using messages from navigation");
      return location.state.messages;
    }

    if (stored) {
      const chats = JSON.parse(stored);
      const sortedChats = chats.sort((a, b) => b.lastUpdated - a.lastUpdated);
      const mostRecentChat = sortedChats[0];
      console.log("🎯 Using most recent chat:", mostRecentChat.title);
      return mostRecentChat?.messages?.filter(m => m.role === "user");
    }

    return null;
  })();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!messages || messages.length === 0) {
      setLoading(false);
      return;
    }

    async function loadQuiz() {
      try {
        const res = await fetch("http://localhost:5000/api/ai-tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            mode: "quiz",
          }),
        });

        const data = await res.json();

        if (!res.ok || !Array.isArray(data.questions)) {
          throw new Error(data?.error || "Invalid quiz response");
        }

        setQuestions(data.questions);
      } catch (err) {
        console.error("QUIZ ERROR:", err);
        alert("Failed to generate quiz. Ask a topic first.");
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, []);

  function selectOption(qIndex, oIndex) {
    if (answers[qIndex] !== undefined) return;
    setAnswers({ ...answers, [qIndex]: oIndex });
  }

  async function finishQuiz() {
    let sc = 0;

    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) sc++;
    });

    setScore(sc);

    const user = auth.currentUser;
    if (!user) return;

    try {
      await fetch("http://localhost:5000/api/log-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          correctAnswers: sc,
          totalQuestions: questions.length,
          practiceSeconds: questions.length * 30,
        }),
      });
    } catch (err) {
      console.error("QUIZ PROGRESS ERROR:", err);
    }
  }

  function getOptionStyle(qIndex, oIndex) {
    const baseStyle = {
      padding: "16px 20px",
      border: "2px solid #e2e8f0",
      borderRadius: 12,
      marginTop: 12,
      cursor: answers[qIndex] === undefined ? "pointer" : "default",
      transition: "all 0.3s",
      fontSize: 15,
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: 12
    };

    if (answers[qIndex] === undefined) {
      return {
        ...baseStyle,
        background: "white"
      };
    }

    if (oIndex === questions[qIndex].correctIndex) {
      return {
        ...baseStyle,
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        borderColor: "#10b981",
        boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
      };
    }

    if (answers[qIndex] === oIndex) {
      return {
        ...baseStyle,
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        color: "white",
        borderColor: "#ef4444",
        boxShadow: "0 4px 12px rgba(239,68,68,0.3)"
      };
    }

    return {
      ...baseStyle,
      background: "#f8f9fa",
      opacity: 0.6
    };
  }

  function retakeQuiz() {
    setAnswers({});
    setScore(null);
  }

  if (!messages || messages.length === 0) {
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
          filter: "blur(80px)"
        }} />
        
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 60,
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          textAlign: "center",
          maxWidth: 500,
          position: "relative",
          zIndex: 10
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📝</div>
          <h2 style={{
            fontSize: 28,
            marginBottom: 16,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            No Topic Found
          </h2>
          <p style={{ color: "#64748b", marginBottom: 30, fontSize: 16 }}>
            Start a conversation with AI Tutor first to generate quiz questions
          </p>
          <button
            onClick={() => navigate("/student/dashboard")}
            style={{
              padding: "14px 32px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontWeight: "600",
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              transition: "all 0.3s"
            }}
            onMouseEnter={e => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(102,126,234,0.4)";
            }}
            onMouseLeave={e => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(102,126,234,0.3)";
            }}
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
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
            Generating Your Quiz...
          </h2>
          <p style={{ color: "#64748b", marginTop: 12 }}>
            Creating personalized questions for you
          </p>
        </div>
      </div>
    );
  }

  const progress = (Object.keys(answers).length / questions.length) * 100;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div style={{
      height: "100%",
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  
  <FaTrophy style={{ fontSize: 30, color: "#667eea" }} />

  <h1 style={{
    margin: 0,
    fontSize: 32,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  }}>
    Quiz Time
  </h1>

</div>

            <button
              onClick={() => setCurrentView("ai")}
              style={{
                padding: "10px 20px",
                background: "#f1f5f9",
                color: "#64748b",
                border: "none",
                borderRadius: 10,
                fontWeight: "600",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.3s"
              }}
              onMouseEnter={e => e.target.style.background = "#e2e8f0"}
              onMouseLeave={e => e.target.style.background = "#f1f5f9"}
            >
              <FaArrowLeft />
              Back
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
              fontSize: 14,
              color: "#64748b",
              fontWeight: "600"
            }}>
              <span>Progress</span>
              <span>{Object.keys(answers).length} / {questions.length} answered</span>
            </div>
            <div style={{
              width: "100%",
              height: 10,
              background: "#e2e8f0",
              borderRadius: 10,
              overflow: "hidden"
            }}>
              <div style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                transition: "width 0.5s ease",
                borderRadius: 10
              }} />
            </div>
          </div>
        </div>

        {/* Score Display */}
        {score !== null && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 50,
            borderRadius: 20,
            marginBottom: 30,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            textAlign: "center",
            animation: "scaleIn 0.5s ease-out"
          }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>
              {score === questions.length ? "🏆" : score >= questions.length * 0.7 ? "⭐" : "💪"}
            </div>
            <h2 style={{
              fontSize: 36,
              marginBottom: 16,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {score === questions.length ? "Perfect Score!" : score >= questions.length * 0.7 ? "Great Job!" : "Keep Practicing!"}
            </h2>
            <div style={{
              fontSize: 48,
              fontWeight: "700",
              color: "#667eea",
              marginBottom: 12
            }}>
              {score} / {questions.length}
            </div>
            <p style={{ color: "#64748b", fontSize: 18, marginBottom: 30 }}>
              {Math.round((score / questions.length) * 100)}% Correct
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={retakeQuiz}
                style={{
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: "600",
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.3s"
                }}
                onMouseEnter={e => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(102,126,234,0.4)";
                }}
                onMouseLeave={e => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(102,126,234,0.3)";
                }}
              >
                <FaRedo />
                Retake Quiz
              </button>
            </div>
          </div>
        )}

        {/* Questions */}
        {questions.map((q, qi) => (
          <div
            key={qi}
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              padding: 30,
              borderRadius: 20,
              marginBottom: 20,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              animation: `slideIn 0.5s ease-out ${qi * 0.1}s both`
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              marginBottom: 20
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "700",
                fontSize: 18,
                flexShrink: 0
              }}>
                {qi + 1}
              </div>
              <h3 style={{
                margin: 0,
                fontSize: 20,
                color: "#1e293b",
                lineHeight: 1.4,
                flex: 1
              }}>
                {q.question}
              </h3>
            </div>

            {q.options.map((op, oi) => (
              <div
                key={oi}
                onClick={() => selectOption(qi, oi)}
                style={getOptionStyle(qi, oi)}
                onMouseEnter={e => {
                  if (answers[qi] === undefined) {
                    e.currentTarget.style.borderColor = "#667eea";
                    e.currentTarget.style.background = "#f8f9ff";
                  }
                }}
                onMouseLeave={e => {
                  if (answers[qi] === undefined) {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "white";
                  }
                }}
              >
                {answers[qi] !== undefined && (
                  <span>
                    {oi === questions[qi].correctIndex ? (
                      <FaCheckCircle style={{ fontSize: 20 }} />
                    ) : answers[qi] === oi ? (
                      <FaTimesCircle style={{ fontSize: 20 }} />
                    ) : null}
                  </span>
                )}
                <span style={{ flex: 1 }}>{op}</span>
              </div>
            ))}
          </div>
        ))}

        {/* Submit Button */}
        {allAnswered && score === null && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 30,
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            textAlign: "center",
            marginBottom: 40
          }}>
            <button
              onClick={finishQuiz}
              style={{
                padding: "16px 48px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontWeight: "700",
                fontSize: 18,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.3s"
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
              <FaTrophy />
              Submit Quiz
            </button>
          </div>
        )}
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
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}