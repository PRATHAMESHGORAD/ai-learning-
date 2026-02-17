import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { FaUserTie, FaEnvelope, FaLock, FaChalkboardTeacher } from "react-icons/fa";

/* ---------- Generate Teacher Code ---------- */
function generateTeacherCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TEACH-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function TeacherAuth() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- SIGNUP ---------- */
  async function handleSignup() {
    if (!fullname.trim()) return alert("Please enter full name");
    if (!email || !password) return alert("Enter email & password");
    if (password.length < 6) return alert("Password must be at least 6 characters");

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      const inviteCode = generateTeacherCode();

      await setDoc(doc(db, "teachers", user.uid), {
        name: fullname,
        email,
        inviteCode,
        qualificationCompleted: false,
        createdAt: serverTimestamp()
      });

      alert(`✅ Account created!\nYour Teacher Code: ${inviteCode}`);

      navigate("/teacher/qualification");

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- LOGIN ---------- */
  async function handleLogin() {
    if (!email || !password) return alert("Enter email & password");

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      const snap = await getDoc(doc(db, "teachers", user.uid));

      if (!snap.exists()) {
        alert("Account not found. Please sign up.");
        return;
      }

      const data = snap.data();

      if (data.qualificationCompleted) {
        navigate("/teacher/dashboard");
      } else {
        navigate("/teacher/qualification");
      }

    } catch (err) {
      alert("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    mode === "login" ? handleLogin() : handleSignup();
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #4e73df 0%, #1cc88a 100%)",
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
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            fontSize: 64,
            marginBottom: 16,
            background: "linear-gradient(135deg, #4e73df 0%, #1cc88a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            <FaChalkboardTeacher />
          </div>

          <h1 style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "8px"
          }}>
            {mode === "login" ? "Teacher Login" : "Create Teacher Account"}
          </h1>

          <p style={{ color: "#666" }}>
            {mode === "login"
              ? "Welcome back! Manage your students."
              : "Start teaching with AI-powered tools."}
          </p>
        </div>

        {/* MODE SWITCH */}
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
            style={toggleStyle(mode === "login")}
          >
            Login
          </button>

          <button
            onClick={() => setMode("signup")}
            style={toggleStyle(mode === "signup")}
          >
            Sign Up
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {mode === "signup" && (
            <InputField
              icon={<FaUserTie />}
              placeholder="Full Name"
              value={fullname}
              onChange={setFullname}
            />
          )}

          <InputField
            icon={<FaEnvelope />}
            placeholder="Email Address"
            value={email}
            onChange={setEmail}
            type="email"
          />

          <InputField
            icon={<FaLock />}
            placeholder="Password"
            value={password}
            onChange={setPassword}
            type="password"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "18px",
              background: loading
                ? "#ccc"
                : "linear-gradient(135deg, #4e73df 0%, #1cc88a 100%)",
              color: "white",
              borderRadius: "12px",
              fontSize: "17px",
              fontWeight: "bold",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s"
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login to Dashboard"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- Reusable Input ---------- */
function InputField({ icon, placeholder, value, onChange, type = "text" }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        position: "absolute",
        left: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#999"
      }}>
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "16px 16px 16px 48px",
          borderRadius: "12px",
          border: "2px solid #e0e0e0",
          fontSize: "16px",
          outline: "none"
        }}
      />
    </div>
  );
}

/* ---------- Toggle Style ---------- */
function toggleStyle(active) {
  return {
    flex: 1,
    padding: "12px",
    background: active
      ? "linear-gradient(135deg, #4e73df 0%, #1cc88a 100%)"
      : "transparent",
    color: active ? "white" : "#666",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  };
}
