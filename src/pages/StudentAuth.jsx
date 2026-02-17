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
    if (!fullname.trim()) {
      alert("Please enter your full name");
      return;
    }
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        role: "student",
        name: fullname,
        email: email,
        teacherId: null,
        createdAt: new Date()
      });

      // Legacy students collection (keep for compatibility)
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
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

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
    if (mode === "login") {
      handleLogin();
    } else {
      handleSignup();
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        padding: "50px 40px",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "480px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            fontSize: 64,
            marginBottom: 16,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            <FaGraduationCap />
          </div>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "8px"
          }}>
            {mode === "login" ? "Welcome Back!" : "Create Account"}
          </h1>
          <p style={{ color: "#666", fontSize: "16px" }}>
            {mode === "login" 
              ? "Login to continue your learning journey" 
              : "Start your AI-powered learning experience"}
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "32px",
          background: "#f0f0f0",
          padding: "6px",
          borderRadius: "12px"
        }}>
          <button
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: "12px",
              background: mode === "login" 
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                : "transparent",
              color: mode === "login" ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
              transition: "all 0.3s"
            }}
          >
            Login
          </button>

          <button
            onClick={() => setMode("signup")}
            style={{
              flex: 1,
              padding: "12px",
              background: mode === "signup" 
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                : "transparent",
              color: mode === "signup" ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
              transition: "all 0.3s"
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          {mode === "signup" && (
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#999",
                fontSize: "18px"
              }}>
                <FaUser />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px 16px 16px 48px",
                  borderRadius: "12px",
                  border: "2px solid #e0e0e0",
                  fontSize: "16px",
                  transition: "border 0.3s",
                  outline: "none"
                }}
                onFocus={e => e.target.style.border = "2px solid #667eea"}
                onBlur={e => e.target.style.border = "2px solid #e0e0e0"}
              />
            </div>
          )}

          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#999",
              fontSize: "18px"
            }}>
              <FaEnvelope />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "16px 16px 16px 48px",
                borderRadius: "12px",
                border: "2px solid #e0e0e0",
                fontSize: "16px",
                transition: "border 0.3s",
                outline: "none"
              }}
              onFocus={e => e.target.style.border = "2px solid #667eea"}
              onBlur={e => e.target.style.border = "2px solid #e0e0e0"}
            />
          </div>

          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#999",
              fontSize: "18px"
            }}>
              <FaLock />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "16px 16px 16px 48px",
                borderRadius: "12px",
                border: "2px solid #e0e0e0",
                fontSize: "16px",
                transition: "border 0.3s",
                outline: "none"
              }}
              onFocus={e => e.target.style.border = "2px solid #667eea"}
              onBlur={e => e.target.style.border = "2px solid #e0e0e0"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "18px",
              background: loading 
                ? "#ccc" 
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "12px",
              fontSize: "17px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
              marginTop: "12px",
              boxShadow: loading ? "none" : "0 8px 20px rgba(102,126,234,0.4)",
              transition: "all 0.3s"
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
            {loading 
              ? "Please wait..." 
              : mode === "login" 
                ? "Login to Continue" 
                : "Create My Account"}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "24px",
          color: "#666",
          fontSize: "14px"
        }}>
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => setMode("signup")}
                style={{
                  color: "#667eea",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Sign up here
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setMode("login")}
                style={{
                  color: "#667eea",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Login here
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}