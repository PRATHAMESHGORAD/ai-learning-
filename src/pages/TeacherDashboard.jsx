import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import LiveClasses from "../components/teacher/LiveClasses";
import TeacherHomework from "../components/teacher/TeacherHomework";
import TeacherStudentPerformance from "../components/teacher/TeacherStudentPerformance";
import TeacherSettings from "../components/teacher/TeacherSettings";
import TeacherMessages from "../components/teacher/TeacherMessages";
import MyStudents from "../components/teacher/MyStudents";  // ✅ NEW

import {
  FaBook,
  FaVideo,
  FaUsers,
  FaMoneyBill,
  FaCog,
  FaBars,
  FaTimes,
  FaComments,
  FaSignOutAlt,
  FaBell,
  FaArrowLeft,
} from "react-icons/fa";

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

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState("students");
  const [menuOpen, setMenuOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fullName, setFullName] = useState("Teacher");
  const [email, setEmail] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    async function fetchTeacher() {
      const user = auth.currentUser;
      if (!user) { navigate("/teacher/login"); return; }
      setEmail(user.email);
      const snap = await getDoc(doc(db, "teachers", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setFullName(data.name || "Teacher");
        setInviteCode(data.inviteCode || "");
      }
    }
    fetchTeacher();
  }, [navigate]);

  useEffect(() => {
    if (currentView === "students") loadStudents();
  }, [currentView]);

  async function loadStudents() {
    setLoadingStudents(true);
    const teacherId = auth.currentUser.uid;
    try {
      const q = query(collection(db, "students"), where("teacherId", "==", teacherId));
      const snapshot = await getDocs(q);
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoadingStudents(false);
    }
  }

  function viewPerformance(student) {
    setSelectedStudent(student);
    setCurrentView("studentPerformance");
  }

  function backToStudents() {
    setSelectedStudent(null);
    setCurrentView("students");
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function logout() {
    auth.signOut();
    navigate("/teacher/login");
  }

  // ✅ All gradient pages — no padding, no background
  const needsPadding = !["live", "homework", "settings", "messages", "students","studentPerformance"].includes(currentView);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f8f9fa",
      overflow: "hidden"
    }}>

      {/* ===== NAVBAR ===== */}
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
                width: "42px", height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
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

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "42px", height: "42px",
              borderRadius: "10px",
              background: "#f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.3s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#e2e8f0"}
              onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}
            >
              <FaBell style={{ color: "#64748b", fontSize: "18px" }} />
              <div style={{
                position: "absolute", top: "8px", right: "8px",
                width: "8px", height: "8px",
                borderRadius: "50%",
                background: "#ef4444",
                border: "2px solid white"
              }} />
            </div>

            <div
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
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
                style={{ width: "38px", height: "38px", borderRadius: "10px", border: "2px solid #e2e8f0" }}
              />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "14px", lineHeight: "1.2" }}>
                  {fullName}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.2" }}>
                  Teacher
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== PROFILE POPUP ===== */}
      {profileOpen && (
        <div ref={profileRef} style={{
          position: "fixed",
          right: "32px", top: "80px",
          width: "320px",
          padding: "24px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          zIndex: 500,
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
              alt="profile"
              style={{
                width: "80px", height: "80px",
                borderRadius: "16px",
                border: "3px solid #667eea",
                boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
              }}
            />
            <h3 style={{ margin: "16px 0 4px 0", fontSize: "20px", color: "#1e293b", fontWeight: "600" }}>
              {fullName}
            </h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>{email}</p>
          </div>

          <div style={{
            padding: "16px",
            background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
            borderRadius: "12px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "11px", fontWeight: "600", color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px"
            }}>
              Your Teacher Code
            </div>
            <div style={{
              fontSize: "22px", fontWeight: "700",
              letterSpacing: "4px", fontFamily: "monospace",
              color: "#667eea", marginBottom: "12px"
            }}>
              {inviteCode || "No Code"}
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(inviteCode); alert("Code copied!"); }}
              style={{
                padding: "8px 20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white", border: "none", borderRadius: "8px",
                cursor: "pointer", fontWeight: "600", fontSize: "13px",
                boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
              }}
            >
              Copy Code
            </button>
          </div>

          <button
            onClick={logout}
            style={{
              width: "100%",
              display: "flex", justifyContent: "center", alignItems: "center", gap: "10px",
              padding: "14px",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "white", border: "none", borderRadius: "12px",
              cursor: "pointer", fontWeight: "600", fontSize: "15px",
              boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
              transition: "all 0.3s"
            }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 16px rgba(239,68,68,0.4)"; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)"; }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}

      {/* ===== MAIN LAYOUT ===== */}
      <div style={{
        display: "flex", flex: 1,
        overflow: "hidden",
        height: "calc(100vh - 70px)"
      }}>

        {/* ===== SIDEBAR ===== */}
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
              color: "#94a3b8", fontSize: "11px", fontWeight: "600",
              textTransform: "uppercase", letterSpacing: "1px"
            }}>
              Main Menu
            </div>

            <MenuItem icon={<FaUsers />} label="My Students"
              onClick={() => setCurrentView("students")}
              active={currentView === "students" || currentView === "studentPerformance"} />
            <MenuItem icon={<FaVideo />} label="Live Classes"
              onClick={() => setCurrentView("live")}
              active={currentView === "live"} />
            <MenuItem icon={<FaBook />} label="Homework"
              onClick={() => setCurrentView("homework")}
              active={currentView === "homework"} />
           

            <div style={{
              margin: "28px 0 16px 20px",
              color: "#94a3b8", fontSize: "11px", fontWeight: "600",
              textTransform: "uppercase", letterSpacing: "1px"
            }}>
              Communication
            </div>

            <MenuItem icon={<FaComments />} label="Messages"
              onClick={() => setCurrentView("messages")}
              active={currentView === "messages"} />

            <div style={{
              margin: "28px 0 16px 20px",
              color: "#94a3b8", fontSize: "11px", fontWeight: "600",
              textTransform: "uppercase", letterSpacing: "1px"
            }}>
              Account
            </div>

            <MenuItem icon={<FaCog />} label="Settings"
              onClick={() => setCurrentView("settings")}
              active={currentView === "settings"} />
          </div>
        )}

        {/* ===== MAIN CONTENT ===== */}
        <div style={{
          flex: 1,
          padding: needsPadding ? "32px" : "0",
          overflow: needsPadding ? "auto" : "hidden",
          display: "flex",
          flexDirection: "column",
          background: needsPadding ? "#f8f9fa" : "transparent"
        }}>

          {/* ✅ MY STUDENTS — now uses beautiful component */}
          {currentView === "students" && (
            <MyStudents
              students={students}
              loading={loadingStudents}
              inviteCode={inviteCode}
              onViewPerformance={viewPerformance}
            />
          )}

          {/* STUDENT PERFORMANCE */}
          {currentView === "studentPerformance" && selectedStudent && (
  <div style={{ height: "100%", position: "relative" }}>
    {/* Back button floats over the gradient */}
    <div style={{
      position: "absolute", top: 20, left: 20, zIndex: 100
    }}>
      <button
        onClick={backToStudents}
        style={{
          padding: "10px 20px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          color: "#667eea",
          border: "2px solid rgba(102,126,234,0.3)",
          borderRadius: 12,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
          fontWeight: "700", fontSize: 14,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transition: "all 0.3s"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "white";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(102,126,234,0.2)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.95)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
      >
        <FaArrowLeft /> Back to Students
      </button>
    </div>
    <TeacherStudentPerformance
      studentId={selectedStudent.id}
      studentName={selectedStudent.fullname || selectedStudent.name}
    />
  </div>
)}

          {/* LIVE CLASSES */}
          {currentView === "live" && <LiveClasses />}

          {/* HOMEWORK */}
          {currentView === "homework" && <TeacherHomework />}

          {/* MESSAGES */}
          {currentView === "messages" && <TeacherMessages />}

          {/* SETTINGS */}
          {currentView === "settings" && <TeacherSettings />}

          {/* EARNINGS */}
          {currentView === "earnings" && (
            <div style={{
              background: "white", padding: 60, borderRadius: 16,
              textAlign: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)"
            }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>💰</div>
              <h2 style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 8, fontSize: 26
              }}>
                Earnings Coming Soon
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 15 }}>
                Track your earnings and payment history here
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(102,126,234,0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(102,126,234,0.5); }
      `}</style>
    </div>
  );
}