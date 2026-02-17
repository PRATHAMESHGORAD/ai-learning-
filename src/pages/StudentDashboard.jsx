import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  FaRobot,
  FaQuestionCircle,
  FaChartLine,
  FaChalkboardTeacher,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaComments,
  FaVideo,
  FaBook,
  FaBell
} from "react-icons/fa";

import StudentLiveClasses from "../components/student/StudentLiveClasses";
import StudentSettings from "../components/student/StudentSettings";
import StudentMessages from "../components/student/StudentMessages";
import StudentHomework from "../components/student/StudentHomework";
import AiTutor from "../components/student/AiTutor";
import Quiz from "../components/student/Quiz";
import Progress from "../components/student/Progress";
import Teachers from "../components/student/Teachers";

/* ---------------- MENU ITEM ---------------- */
function MenuItem({ icon, label, onClick, active }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "14px 18px",
        marginBottom: "6px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: active ? "600" : "500",
        color: active ? "white" : hover ? "#667eea" : "#64748b",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        borderRadius: "12px",
        background: active 
          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
          : hover ? "rgba(102,126,234,0.08)" : "transparent",
        transform: hover || active ? "translateX(4px)" : "translateX(0)",
        boxShadow: active ? "0 4px 12px rgba(102,126,234,0.25)" : "none"
      }}
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

/* ---------------- STUDENT DASHBOARD ---------------- */
export default function StudentDashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    const user = auth.currentUser;
    if (user) {
      localStorage.removeItem(`ai_chats_${user.uid}`);
    }
    auth.signOut();
    navigate("/student/login");
  }

  const [menuOpen, setMenuOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fullName, setFullName] = useState("Student");
  const [email, setEmail] = useState("");
  const [currentView, setCurrentView] = useState("ai");

  const profileRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/student/login");
        return;
      }

      setEmail(user.email || "");

      try {
        const snap = await getDoc(doc(db, "students", user.uid));
        if (snap.exists()) {
          setFullName(snap.data().fullname);
        } else {
          setFullName("Student");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setFullName("Student");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ 
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f8f9fa",
      overflow: "hidden"
    }}>
      {/* ---------------- NAVBAR (FIXED) ---------------- */}
      <nav style={{
        width: "100%",
        height: "70px",
        background: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "relative",
        zIndex: 300,
        borderBottom: "1px solid #e5e7eb",
        flexShrink: 0
      }}>
        <div style={{
          width: "100%",
          maxWidth: "1600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px"
        }}>
          {/* LEFT - Logo & Menu Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ 
                fontSize: "22px",
                cursor: "pointer",
                color: "#64748b",
                padding: "10px",
                borderRadius: "10px",
                transition: "all 0.3s",
                background: menuOpen ? "rgba(102,126,234,0.1)" : "transparent"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(102,126,234,0.1)"}
              onMouseLeave={e => {
                if (!menuOpen) e.currentTarget.style.background = "transparent";
              }}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
              }}>
                🎓
              </div>
              <h2 style={{ 
                margin: 0,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "22px",
                fontWeight: "700"
              }}>
                AI Learning
              </h2>
            </div>
          </div>

          {/* RIGHT - Notifications & Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Notification Bell */}
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.3s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#e2e8f0"}
            onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}
            >
              <FaBell style={{ color: "#64748b", fontSize: "18px" }} />
              <div style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ef4444",
                border: "2px solid white"
              }} />
            </div>

            {/* Profile Section */}
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "6px 12px 6px 6px",
                borderRadius: "12px",
                transition: "all 0.3s",
                background: profileOpen ? "#f1f5f9" : "transparent"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={e => {
                if (!profileOpen) e.currentTarget.style.background = "transparent";
              }}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
                alt="profile"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  border: "2px solid #e2e8f0"
                }}
              />
              <div style={{ textAlign: "left" }}>
                <div style={{ 
                  fontWeight: "600",
                  color: "#1e293b",
                  fontSize: "14px",
                  lineHeight: "1.2"
                }}>
                  {fullName}
                </div>
                <div style={{ 
                  fontSize: "12px",
                  color: "#94a3b8",
                  lineHeight: "1.2"
                }}>
                  Student
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ---------------- PROFILE POPUP ---------------- */}
      {profileOpen && (
        <div
          ref={profileRef}
          style={{
            position: "fixed",
            right: "32px",
            top: "80px",
            width: "320px",
            padding: "24px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            zIndex: 500,
            border: "1px solid #e5e7eb"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
              alt="profile"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "16px",
                border: "3px solid #667eea",
                boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
              }}
            />
            <h3 style={{ 
              margin: "16px 0 4px 0",
              fontSize: "20px",
              color: "#1e293b",
              fontWeight: "600"
            }}>
              {fullName}
            </h3>
            <p style={{ 
              margin: 0,
              fontSize: "14px",
              color: "#94a3b8"
            }}>
              {email}
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "20px"
          }}>
            <div style={{
              padding: "16px",
              background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#667eea" }}>12</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Courses</div>
            </div>
            <div style={{
              padding: "16px",
              background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#667eea" }}>87%</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Progress</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              padding: "14px",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
              boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
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
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      )}

      {/* ---------------- MAIN LAYOUT (FIXED HEIGHT) ---------------- */}
      <div style={{ 
        display: "flex",
        flex: 1,
        overflow: "hidden",
        height: "calc(100vh - 70px)"
      }}>
        {/* SIDEBAR (FIXED, NO SCROLL) */}
        {menuOpen && (
          <div style={{
            width: "280px",
            background: "white",
            padding: "24px 16px",
            boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
            overflowY: "auto",
            borderRight: "1px solid #e5e7eb",
            flexShrink: 0
          }}>
            <div style={{ 
              margin: "0 0 20px 20px",
              color: "#94a3b8",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}>
              Main Menu
            </div>

            <MenuItem 
              icon={<FaRobot />}
              label="AI Tutor"
              onClick={() => setCurrentView("ai")}
              active={currentView === "ai"}
            />
            <MenuItem 
              icon={<FaQuestionCircle />}
              label="Quiz"
              onClick={() => setCurrentView("quiz")}
              active={currentView === "quiz"}
            />
            <MenuItem 
              icon={<FaChartLine />}
              label="Progress"
              onClick={() => setCurrentView("progress")}
              active={currentView === "progress"}
            />
            <MenuItem 
              icon={<FaChalkboardTeacher />}
              label="Teachers"
              onClick={() => setCurrentView("teachers")}
              active={currentView === "teachers"}
            />

            <div style={{ 
              margin: "28px 0 16px 20px",
              color: "#94a3b8",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}>
              Communication
            </div>

            <MenuItem 
              icon={<FaComments />}
              label="Messages"
              onClick={() => setCurrentView("messages")}
              active={currentView === "messages"}
            />
            <MenuItem 
              icon={<FaVideo />}
              label="Live Classes"
              onClick={() => setCurrentView("live")}
              active={currentView === "live"}
            />
            <MenuItem 
              icon={<FaBook />}
              label="Homework"
              onClick={() => setCurrentView("homework")}
              active={currentView === "homework"}
            />

            <div style={{ 
              margin: "28px 0 16px 20px",
              color: "#94a3b8",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}>
              Account
            </div>

            <MenuItem 
              icon={<FaCog />}
              label="Settings"
              onClick={() => setCurrentView("settings")}
              active={currentView === "settings"}
            />
          </div>
        )}

        {/* MAIN CONTENT (SCROLLABLE) */}
        {/* MAIN CONTENT (SCROLLABLE) */}
{/* MAIN CONTENT (SCROLLABLE) */}
<div style={{
  flex: 1,
  padding: currentView === "ai" || currentView === "quiz" || currentView === "progress" || currentView === "teachers" || currentView === "messages" || currentView === "live" || currentView === "homework" || currentView === "settings" ? "0" : "32px",  // ✅ FIXED
  overflow: currentView === "ai" || currentView === "quiz" || currentView === "progress" || currentView === "teachers" || currentView === "messages" || currentView === "live" || currentView === "homework" || currentView === "settings" ? "hidden" : "auto",  // ✅ FIXED
  display: "flex",
  flexDirection: "column",
  background: (currentView === "quiz" || currentView === "progress" || currentView === "teachers" || currentView === "messages" || currentView === "live" || currentView === "homework" || currentView === "settings") ? "transparent" : "#f8f9fa",  // ✅ FIXED
  position: "relative"
}}>
          {currentView === "ai" && <AiTutor />}
          {currentView === "quiz" && <Quiz />}
          {currentView === "progress" && <Progress />}
          {currentView === "teachers" && <Teachers />}
          {currentView === "messages" && <StudentMessages />}
          {currentView === "live" && <StudentLiveClasses />}
          {currentView === "homework" && <StudentHomework />}
          {currentView === "settings" && <StudentSettings />}
        </div>
      </div>

      <style>{`
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(102,126,234,0.3);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(102,126,234,0.5);
        }
      `}</style>
    </div>
  );
}