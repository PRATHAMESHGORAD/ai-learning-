import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, updateDoc ,setDoc} from "firebase/firestore";
import { 
  FaGraduationCap, 
  FaSchool, 
  FaUniversity, 
  FaMicroscope,
  FaPalette,
  FaCalculator,
  FaBookOpen,
  FaLaptopCode
} from "react-icons/fa";

export default function StudentEducation() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState("");
  const [customText, setCustomText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const educationOptions = [
    { value: "10th Grade", icon: <FaSchool />, color: "#667eea" },
    { value: "12th Grade", icon: <FaGraduationCap />, color: "#764ba2" },
    { value: "Diploma", icon: <FaBookOpen />, color: "#f093fb" },
    { value: "BSc", icon: <FaMicroscope />, color: "#4facfe" },
    { value: "BCom", icon: <FaCalculator />, color: "#43e97b" },
    { value: "BA", icon: <FaPalette />, color: "#fa709a" },
    { value: "Engineering", icon: <FaLaptopCode />, color: "#30cfd0" },
    { value: "Medical", icon: <FaMicroscope />, color: "#a8edea" },
    { value: "Arts", icon: <FaPalette />, color: "#fda085" },
    { value: "Science", icon: <FaMicroscope />, color: "#89f7fe" },
    { value: "Commerce", icon: <FaCalculator />, color: "#fbc2eb" },
    { value: "Other", icon: <FaUniversity />, color: "#c471f5" }
  ];

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) {
        navigate("/student/login");
      } else {
        setCurrentUser(u);
      }
    });
    return () => unsub();
  }, [navigate]);

  async function saveEducation() {
  if (!currentUser) {
    alert("No student logged in");
    return;
  }

  const finalValue = customText.trim() !== "" ? customText : selected;

  if (!finalValue) {
    alert("Please select or enter your education level");
    return;
  }

  setSaving(true);

  try {
    const ref = doc(db, "students", currentUser.uid);

    await setDoc(
      ref,
      {
        education: finalValue,
        educationCompleted: true,
      },
      { merge: true }
    );

    navigate("/student/exam");
  } catch (err) {
    console.error("Education save error:", err);
    alert("Error saving education. Please try again.");
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
      {/* Decorative Background Elements */}
      <div style={{
        position: "absolute",
        top: "-100px",
        right: "-100px",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        zIndex: 1
      }} />
      <div style={{
        position: "absolute",
        bottom: "-150px",
        left: "-150px",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        zIndex: 1
      }} />

      {/* Main Content */}
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
            🎓
          </div>
          
          <h1 style={{
            fontSize: "48px",
            fontWeight: "800",
            marginBottom: "16px",
            textShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}>
            What's Your Education Level?
          </h1>
          
          <p style={{
            fontSize: "20px",
            opacity: 0.95,
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Help us personalize your learning experience
          </p>
        </div>

        {/* Education Options Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px",
          marginBottom: "50px"
        }}>
          {educationOptions.map((option) => (
            <EducationCard
              key={option.value}
              option={option}
              selected={selected === option.value}
              onClick={() => {
                setSelected(option.value);
                setCustomText(option.value);
              }}
            />
          ))}
        </div>

        {/* Custom Input Section */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          padding: "40px",
          borderRadius: "24px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          marginBottom: "40px"
        }}>
          <h3 style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "20px"
          }}>
            Or Enter Your Own
          </h3>
          
          <input
            type="text"
            placeholder="e.g., BBA, MCA, Ph.D., etc."
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              setSelected("");
            }}
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "18px 24px",
              borderRadius: "16px",
              border: "3px solid #e0e0e0",
              fontSize: "18px",
              fontWeight: "500",
              textAlign: "center",
              transition: "all 0.3s",
              outline: "none"
            }}
            onFocus={e => {
              e.target.style.border = "3px solid #667eea";
              e.target.style.boxShadow = "0 8px 24px rgba(102,126,234,0.3)";
            }}
            onBlur={e => {
              e.target.style.border = "3px solid #e0e0e0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Continue Button */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={saveEducation}
            disabled={saving || (!selected && !customText.trim())}
            style={{
              padding: "20px 50px",
              background: saving || (!selected && !customText.trim())
                ? "#ccc"
                : "white",
              color: saving || (!selected && !customText.trim())
                ? "#999"
                : "#667eea",
              borderRadius: "16px",
              border: "none",
              cursor: saving || (!selected && !customText.trim())
                ? "not-allowed"
                : "pointer",
              fontSize: "20px",
              fontWeight: "bold",
              boxShadow: saving || (!selected && !customText.trim())
                ? "none"
                : "0 12px 32px rgba(0,0,0,0.3)",
              transition: "all 0.3s",
              display: "inline-flex",
              alignItems: "center",
              gap: "12px"
            }}
            onMouseEnter={e => {
              if (!saving && (selected || customText.trim())) {
                e.target.style.transform = "translateY(-4px)";
                e.target.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)";
              }
            }}
            onMouseLeave={e => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 12px 32px rgba(0,0,0,0.3)";
            }}
          >
            {saving ? (
              <>
                <div className="spinner" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <span style={{ fontSize: "24px" }}>→</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Indicator */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginTop: "50px"
        }}>
          <div style={{
            width: "50px",
            height: "6px",
            borderRadius: "3px",
            background: "white",
            opacity: 1
          }} />
          <div style={{
            width: "50px",
            height: "6px",
            borderRadius: "3px",
            background: "white",
            opacity: 0.3
          }} />
        </div>
      </div>

      {/* CSS for animations and spinner */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Education Card Component
function EducationCard({ option, selected, onClick }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: selected 
          ? `linear-gradient(135deg, ${option.color} 0%, ${adjustColor(option.color, -20)} 100%)`
          : "rgba(255,255,255,0.95)",
        padding: "32px 24px",
        borderRadius: "20px",
        textAlign: "center",
        cursor: "pointer",
        border: selected ? "none" : "3px solid rgba(255,255,255,0.3)",
        boxShadow: selected || hover
          ? "0 20px 40px rgba(0,0,0,0.3)"
          : "0 8px 20px rgba(0,0,0,0.2)",
        transition: "all 0.3s ease",
        transform: selected || hover ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Icon */}
      <div style={{
        fontSize: 48,
        marginBottom: 16,
        color: selected ? "white" : option.color,
        transition: "all 0.3s",
        transform: hover ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)"
      }}>
        {option.icon}
      </div>

      {/* Label */}
      <div style={{
        fontSize: "18px",
        fontWeight: "bold",
        color: selected ? "white" : "#333",
        transition: "color 0.3s"
      }}>
        {option.value}
      </div>

      {/* Selection Indicator */}
      {selected && (
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          animation: "checkmark 0.3s ease"
        }}>
          ✓
        </div>
      )}

      {/* Hover Glow Effect */}
      {hover && !selected && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${option.color}15 0%, ${option.color}05 100%)`,
          borderRadius: "20px",
          pointerEvents: "none"
        }} />
      )}

      <style>{`
        @keyframes checkmark {
          0% { transform: scale(0) rotate(-45deg); }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

// Helper function to darken colors
function adjustColor(color, amount) {
  const clamp = (num) => Math.min(255, Math.max(0, num));
  const num = parseInt(color.replace("#", ""), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00FF) + amount);
  const b = clamp((num & 0x0000FF) + amount);
  return "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}