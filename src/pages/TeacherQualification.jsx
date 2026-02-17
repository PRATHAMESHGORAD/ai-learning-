import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { FaGraduationCap, FaBriefcase, FaBook, FaArrowRight, FaCheckCircle } from "react-icons/fa";

export default function TeacherQualification() {
  const navigate = useNavigate();

  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [subjects, setSubjects] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Animate steps in
  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 300);
    return () => clearTimeout(timer);
  }, []);

  async function saveQualification() {
    if (!currentUser) {
      alert("No teacher logged in. Please login again.");
      return;
    }
    if (!qualification || !experience || !subjects) {
      alert("Please fill all details.");
      return;
    }

    setSaving(true);

    try {
      const ref = doc(db, "teachers", currentUser.uid);
      await updateDoc(ref, {
        qualification,
        experience: Number(experience) || 0,
        subjects: subjects.split(",").map((s) => s.trim()).filter(Boolean),
        bio: `I teach ${subjects}`,
        photo: "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
        isActive: true,
        qualificationCompleted: true,
      });

      navigate("/teacher/dashboard");
    } catch (err) {
      console.error("Qualification save error:", err);
      alert("Error saving qualification. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    {
      key: "qualification",
      icon: <FaGraduationCap />,
      label: "Highest Qualification",
      placeholder: "e.g., BSc, MSc, PhD",
      type: "text",
      value: qualification,
      setter: setQualification,
      hint: "Your academic degree or certification"
    },
    {
      key: "experience",
      icon: <FaBriefcase />,
      label: "Years of Experience",
      placeholder: "e.g., 5",
      type: "number",
      value: experience,
      setter: setExperience,
      hint: "How many years have you been teaching?"
    },
    {
      key: "subjects",
      icon: <FaBook />,
      label: "Subjects You Teach",
      placeholder: "e.g., Math, Physics, Chemistry",
      type: "text",
      value: subjects,
      setter: setSubjects,
      hint: "Separate multiple subjects with commas"
    }
  ];

  const isComplete = qualification && experience && subjects;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      overflow: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px"
    }}>
      {/* Animated Background Blobs */}
      <div style={{
        position: "fixed",
        top: "-10%", right: "-5%",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        filter: "blur(80px)",
        animation: "floatBlob 20s ease-in-out infinite",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed",
        bottom: "-15%", left: "-10%",
        width: "700px", height: "700px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.04)",
        filter: "blur(100px)",
        animation: "floatBlob 25s ease-in-out infinite reverse",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed",
        top: "50%", left: "30%",
        width: "300px", height: "300px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        filter: "blur(60px)",
        animation: "floatBlob 15s ease-in-out infinite 2s",
        pointerEvents: "none"
      }} />

      {/* Main Card */}
      <div style={{
        width: "100%",
        maxWidth: "560px",
        position: "relative",
        zIndex: 10,
        animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both"
      }}>
        {/* Top Badge */}
        <div style={{
          textAlign: "center",
          marginBottom: 28,
          animation: "fadeIn 0.8s ease-out 0.2s both"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.25)",
            padding: "10px 22px",
            borderRadius: 100,
            color: "white",
            fontSize: 14,
            fontWeight: "600",
            letterSpacing: "0.3px"
          }}>
            <FaGraduationCap style={{ fontSize: 16 }} />
            Complete Your Teacher Profile
          </div>
        </div>

        {/* Main Card */}
        <div style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          padding: "40px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)",
        }}>
          {/* Header */}
          <div style={{ marginBottom: 36, textAlign: "center" }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 32,
              boxShadow: "0 8px 24px rgba(102,126,234,0.4)"
            }}>
              🎓
            </div>
            <h1 style={{
              margin: "0 0 8px 0",
              fontSize: 28,
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.2
            }}>
              Your Qualifications
            </h1>
            <p style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: 15,
              lineHeight: 1.5
            }}>
              Tell students about your expertise and teaching background
            </p>
          </div>

          {/* Progress dots */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 32
          }}>
            {fields.map((f, i) => (
              <div key={i} style={{
                width: f.value ? 28 : 8,
                height: 8,
                borderRadius: 4,
                background: f.value
                  ? "linear-gradient(90deg, #667eea, #764ba2)"
                  : focusedField === f.key ? "rgba(102,126,234,0.4)" : "#e2e8f0",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              }} />
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {fields.map((field, index) => (
              <div
                key={field.key}
                style={{
                  animation: `slideIn 0.5s ease-out ${0.1 + index * 0.1}s both`
                }}
              >
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: "600",
                  color: focusedField === field.key ? "#667eea" : "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  transition: "color 0.3s"
                }}>
                  <span style={{
                    color: focusedField === field.key ? "#667eea" : "#94a3b8",
                    fontSize: 14,
                    transition: "color 0.3s"
                  }}>
                    {field.icon}
                  </span>
                  {field.label}
                  {field.value && (
                    <FaCheckCircle style={{
                      color: "#10b981",
                      marginLeft: "auto",
                      fontSize: 16
                    }} />
                  )}
                </label>

                <div style={{ position: "relative" }}>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      width: "100%",
                      padding: "16px 18px",
                      borderRadius: 14,
                      border: focusedField === field.key
                        ? "2px solid #667eea"
                        : field.value
                          ? "2px solid #10b981"
                          : "2px solid #e2e8f0",
                      fontSize: 15,
                      outline: "none",
                      transition: "all 0.3s",
                      background: focusedField === field.key ? "#fafbff" : "white",
                      color: "#1e293b",
                      boxShadow: focusedField === field.key
                        ? "0 0 0 4px rgba(102,126,234,0.1)"
                        : "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <p style={{
                  margin: "6px 0 0 4px",
                  fontSize: 12,
                  color: focusedField === field.key ? "#667eea" : "#94a3b8",
                  transition: "color 0.3s"
                }}>
                  {field.hint}
                </p>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={saveQualification}
            disabled={saving || !isComplete}
            style={{
              width: "100%",
              marginTop: 32,
              padding: "18px 24px",
              background: saving || !isComplete
                ? "#e2e8f0"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: saving || !isComplete ? "#94a3b8" : "white",
              border: "none",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: "700",
              cursor: saving || !isComplete ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: saving || !isComplete
                ? "none"
                : "0 8px 24px rgba(102,126,234,0.4)",
              transition: "all 0.3s",
              letterSpacing: "0.3px"
            }}
            onMouseEnter={e => {
              if (!saving && isComplete) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(102,126,234,0.5)";
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = saving || !isComplete
                ? "none"
                : "0 8px 24px rgba(102,126,234,0.4)";
            }}
          >
            {saving ? (
              <>
                <div style={{
                  width: 20,
                  height: 20,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }} />
                Saving Profile...
              </>
            ) : (
              <>
                Complete Setup
                <FaArrowRight style={{ fontSize: 16 }} />
              </>
            )}
          </button>

          {/* Footer note */}
          <p style={{
            margin: "20px 0 0 0",
            textAlign: "center",
            fontSize: 13,
            color: "#94a3b8",
            lineHeight: 1.5
          }}>
            You can update your profile anytime from your dashboard settings
          </p>
        </div>

        {/* Bottom Step Indicator */}
        <div style={{
          textAlign: "center",
          marginTop: 24,
          color: "rgba(255,255,255,0.8)",
          fontSize: 13,
          fontWeight: "500",
          animation: "fadeIn 0.8s ease-out 0.4s both"
        }}>
          Step 2 of 2 — Almost there! 🎉
        </div>
      </div>

      <style>{`
        @keyframes floatBlob {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        input::placeholder {
          color: #cbd5e1;
        }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          opacity: 0;
        }
      `}</style>
    </div>
  );
}