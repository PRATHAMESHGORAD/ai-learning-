import { Link } from "react-router-dom";
import { FaGraduationCap, FaChalkboardTeacher, FaRocket, FaChartLine } from "react-icons/fa";

export default function Landing() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative circles */}
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
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "80px 20px",
        textAlign: "center",
        color: "white"
      }}>
        {/* Logo/Title */}
        <div style={{
          fontSize: 64,
          marginBottom: 20,
          animation: "float 3s ease-in-out infinite"
        }}>
          🎓
        </div>

        <h1 style={{
          fontSize: "56px",
          fontWeight: "800",
          marginBottom: "24px",
          textShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}>
          AI Learning Platform
        </h1>

        <p style={{
          fontSize: "24px",
          marginBottom: "60px",
          opacity: 0.95,
          maxWidth: "700px",
          margin: "0 auto 60px"
        }}>
          Transform your learning experience with AI-powered tutoring, 
          real-time progress tracking, and personalized education
        </p>

        {/* Role Selection Cards */}
        <div style={{
          display: "flex",
          gap: "40px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "80px"
        }}>
          {/* Teacher Card */}
          <Link to="/teacher/login" style={{ textDecoration: "none" }}>
            <div style={{
              background: "rgba(255,255,255,0.95)",
              padding: "50px 40px",
              borderRadius: "24px",
              width: "320px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow = "0 30px 80px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.3)";
            }}
            >
              <div style={{
                fontSize: 64,
                marginBottom: 20,
                color: "#007bff"
              }}>
                <FaChalkboardTeacher />
              </div>
              
              <h2 style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "16px"
              }}>
                I'm a Teacher
              </h2>
              
              <p style={{
                color: "#666",
                fontSize: "16px",
                lineHeight: 1.6,
                marginBottom: "24px"
              }}>
                Manage students, track progress, assign homework, 
                and conduct live classes
              </p>

              <div style={{
                padding: "14px 28px",
                background: "#007bff",
                color: "white",
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "16px"
              }}>
                Enter as Teacher →
              </div>
            </div>
          </Link>

          {/* Student Card */}
          <Link to="/student/login" style={{ textDecoration: "none" }}>
            <div style={{
              background: "rgba(255,255,255,0.95)",
              padding: "50px 40px",
              borderRadius: "24px",
              width: "320px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow = "0 30px 80px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.3)";
            }}
            >
              <div style={{
                fontSize: 64,
                marginBottom: 20,
                color: "#28a745"
              }}>
                <FaGraduationCap />
              </div>
              
              <h2 style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "16px"
              }}>
                I'm a Student
              </h2>
              
              <p style={{
                color: "#666",
                fontSize: "16px",
                lineHeight: 1.6,
                marginBottom: "24px"
              }}>
                Learn with AI tutor, take quizzes, track progress, 
                and connect with teachers
              </p>

              <div style={{
                padding: "14px 28px",
                background: "#28a745",
                color: "white",
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "16px"
              }}>
                Enter as Student →
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "30px",
          maxWidth: "1000px",
          margin: "0 auto"
        }}>
          <FeatureBox
            icon={<FaRocket />}
            title="AI-Powered Learning"
            description="Get instant answers and explanations from our advanced AI tutor"
          />
          <FeatureBox
            icon={<FaChartLine />}
            title="Progress Tracking"
            description="Monitor your learning journey with detailed analytics"
          />
          <FeatureBox
            icon={<FaChalkboardTeacher />}
            title="Live Classes"
            description="Attend interactive sessions with your teachers"
          />
        </div>
      </div>

      {/* Add CSS animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

function FeatureBox({ icon, title, description }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(10px)",
      padding: "30px",
      borderRadius: "16px",
      textAlign: "center",
      border: "1px solid rgba(255,255,255,0.2)"
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 20, marginBottom: 12, fontWeight: "bold" }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  );
}