import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  FaCalculator,
  FaMicroscope,
  FaLaptopCode,
  FaGraduationCap,
  FaBrain,
  FaUniversity
} from "react-icons/fa";

export default function StudentExam() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const exams = [
    { value: "JEE", icon: <FaCalculator />, color: "#667eea" },
    { value: "NEET", icon: <FaMicroscope />, color: "#764ba2" },
    { value: "MHT-CET", icon: <FaGraduationCap />, color: "#f093fb" },
    { value: "NIMCET", icon: <FaLaptopCode />, color: "#4facfe" },
    { value: "GATE", icon: <FaBrain />, color: "#43e97b" },
    { value: "PG-NEET", icon: <FaMicroscope />, color: "#fa709a" },
    { value: "CODING", icon: <FaLaptopCode />, color: "#30cfd0" },
    { value: "Other", icon: <FaUniversity />, color: "#c471f5" }
  ];

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) navigate("/student/login");
      else setCurrentUser(u);
    });
    return () => unsub();
  }, [navigate]);

  async function saveExam() {
    if (!currentUser) return;
    if (!selected) {
      alert("Please select your exam");
      return;
    }

    setSaving(true);

    try {
      await setDoc(
        doc(db, "students", currentUser.uid),
        {
          exam: selected,
          examCompleted: true,
        },
        { merge: true }
      );

      navigate("/student/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error saving exam");
      setSaving(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "60px 20px",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Background Circles */}
      <div style={{
        position: "absolute",
        top: "-100px",
        right: "-100px",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.1)"
      }} />

      <div style={{
        position: "absolute",
        bottom: "-150px",
        left: "-150px",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.1)"
      }} />

      <div style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "1100px",
        margin: "0 auto"
      }}>

        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "60px",
          color: "white"
        }}>
          <div style={{
            fontSize: 72,
            marginBottom: 24,
            animation: "float 3s ease-in-out infinite"
          }}>
            🎯
          </div>

          <h1 style={{
            fontSize: "48px",
            fontWeight: "800",
            marginBottom: "16px",
            textShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}>
            Which Exam Are You Preparing For?
          </h1>

          <p style={{
            fontSize: "20px",
            opacity: 0.95
          }}>
            We'll tailor your learning path accordingly
          </p>
        </div>

        {/* Exam Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
          marginBottom: "60px"
        }}>
          {exams.map((exam) => (
            <ExamCard
              key={exam.value}
              exam={exam}
              selected={selected === exam.value}
              onClick={() => setSelected(exam.value)}
            />
          ))}
        </div>

        {/* Continue Button */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={saveExam}
            disabled={!selected || saving}
            style={{
              padding: "20px 50px",
              background: !selected ? "#ccc" : "white",
              color: !selected ? "#999" : "#667eea",
              borderRadius: "16px",
              border: "none",
              fontSize: "20px",
              fontWeight: "bold",
              cursor: !selected ? "not-allowed" : "pointer",
              boxShadow: selected ? "0 12px 32px rgba(0,0,0,0.3)" : "none",
              transition: "all 0.3s"
            }}
          >
            {saving ? "Saving..." : "Finish →"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

/* Card Component */
function ExamCard({ exam, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: selected
          ? `linear-gradient(135deg, ${exam.color} 0%, #333 120%)`
          : "rgba(255,255,255,0.95)",
        padding: "30px",
        borderRadius: "20px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.3s",
        transform: selected ? "translateY(-8px) scale(1.03)" : "translateY(0)",
        boxShadow: selected
          ? "0 20px 40px rgba(0,0,0,0.3)"
          : "0 8px 20px rgba(0,0,0,0.2)"
      }}
    >
      <div style={{
        fontSize: 40,
        marginBottom: 16,
        color: selected ? "white" : exam.color
      }}>
        {exam.icon}
      </div>

      <div style={{
        fontSize: "20px",
        fontWeight: "bold",
        color: selected ? "white" : "#333"
      }}>
        {exam.value}
      </div>
    </div>
  );
}
