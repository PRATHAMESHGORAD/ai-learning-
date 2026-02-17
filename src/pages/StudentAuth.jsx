import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FaUser, FaEnvelope, FaLock, FaGraduationCap } from "react-icons/fa";

export default function StudentAuth() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!fullname.trim()) { alert("Please enter your full name"); return; }
    if (!email || !password) { alert("Please enter email and password"); return; }
    if (password.length < 6) { alert("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        role: "student",
        name: fullname,
        email: email,
        teacherId: null,
        createdAt: new Date()
      });

      await setDoc(doc(db, "students", user.uid), {
        fullname,
        email,
        educationCompleted: false,
        examCompleted: false,
      });

      alert("✅ Account created successfully!");
      navigate("/student/education");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        alert("Email already exists. Please login.");
      } else {
        alert(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (!email || !password) { alert("Please enter email and password"); return; }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const ref = doc(db, "students", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : null;

      if (!data || data.educationCompleted !== true) {
        navigate("/student/education");
        return;
      }
      if (data.examCompleted !== true) {
        navigate("/student/exam");
        return;
      }
      navigate("/student/dashboard");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        alert("Account not found. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        alert("Incorrect password.");
      } else {
        alert(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (mode === "login") handleLogin();
    else handleSignup();
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      {/* Blobs */}
      <div style={{
        position: "fixed",
        top: "-10%", right: "-5%",
        width: "500px", height: "500px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        filter: "blur(80px)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed",
        bottom: "-10%", left: "-5%",
        width: "500px", height: "500px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        filter: "blur(80px)",
        pointerEvents: "none"
      }} />

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        {/* Top gradient bar */}
        <div style={{
          height: "6px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }} />

        <div style={{ padding: "40px 36px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: 70, height: 70,
              borderRadius: "20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 20px rgba(102,126,234,0.4)"
            }}>
              <FaGraduationCap style={{ fontSize: 32, color: "white" }} />
            </div>
            <h1 style={{
              fontSize: "26px",
              fontWeight: "700",
              margin: "0 0 8px 0",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {mode === "login" ? "Welcome Back!" : "Create Account"}
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              {mode === "login"
                ? "Login to continue your learning journey"
                : "Start your AI-powered learning experience"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div style={{
            display: "flex",
            background: "#f1f5f9",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "28px"
          }}>
            <button
              onClick={() => setMode("login")}
              style={{
                flex: 1,
                padding: "10px",
                background: mode === "login"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
                color: mode === "login" ? "white" : "#64748b",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.3s"
              }}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              style={{
                flex: 1,
                padding: "10px",
                background: mode === "signup"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
                color: mode === "signup" ? "white" : "#64748b",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.3s"
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {mode === "signup" && (
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <FaUser style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#667eea",
                    fontSize: "15px",
                    pointerEvents: "none"
                  }} />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 40px",
                      borderRadius: "10px",
                      border: "2px solid #e2e8f0",
                      fontSize: "15px",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.3s",
                      color: "#1e293b"
                    }}
                    onFocus={e => e.target.style.borderColor = "#667eea"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <FaEnvelope style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#667eea",
                  fontSize: "15px",
                  pointerEvents: "none"
                }} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 40px",
                    borderRadius: "10px",
                    border: "2px solid #e2e8f0",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.3s",
                    color: "#1e293b"
                  }}
                  onFocus={e => e.target.style.borderColor = "#667eea"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <FaLock style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#667eea",
                  fontSize: "15px",
                  pointerEvents: "none"
                }} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 40px",
                    borderRadius: "10px",
                    border: "2px solid #e2e8f0",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.3s",
                    color: "#1e293b"
                  }}
                  onFocus={e => e.target.style.borderColor = "#667eea"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                border: "none",
                marginTop: "8px",
                boxShadow: loading ? "none" : "0 8px 20px rgba(102,126,234,0.4)",
                transition: "all 0.3s",
                boxSizing: "border-box"
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 12px 28px rgba(102,126,234,0.5)";
                }
              }}
              onMouseLeave={e => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 20px rgba(102,126,234,0.4)";
              }}
            >
              {loading ? "Please wait..." : mode === "login" ? "Login to Continue" : "Create My Account"}
            </button>
          </form>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#64748b" }}>
            {mode === "login" ? (
              <p style={{ margin: 0 }}>
                Don't have an account?{" "}
                <span onClick={() => setMode("signup")} style={{ color: "#667eea", fontWeight: "600", cursor: "pointer" }}>
                  Sign up here
                </span>
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                Already have an account?{" "}
                <span onClick={() => setMode("login")} style={{ color: "#667eea", fontWeight: "600", cursor: "pointer" }}>
                  Login here
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}