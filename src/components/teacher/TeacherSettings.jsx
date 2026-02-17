import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "firebase/firestore";
import {
  FaCog,
  FaUser,
  FaEnvelope,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaComments,
  FaGraduationCap,
  FaBriefcase,
  FaBook
} from "react-icons/fa";

export default function TeacherSettings() {
  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    loadTeacherData();
  }, []);

  async function loadTeacherData() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
      if (teacherDoc.exists()) {
        setTeacher({ id: teacherDoc.id, ...teacherDoc.data() });
      }

      const statsDoc = await getDoc(doc(db, "teacherStats", user.uid));
      if (statsDoc.exists()) {
        setStats(statsDoc.data());
      } else {
        setStats({ averageRating: 0, totalReviews: 0, ratingDistribution: {} });
      }

      const reviewsQuery = query(
        collection(db, "reviews"),
        where("teacherId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const reviewsSnap = await getDocs(reviewsQuery);
      setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Load teacher data error:", err);
    } finally {
      setLoading(false);
    }
  }

  function copyInviteCode() {
    if (teacher?.inviteCode) {
      navigator.clipboard.writeText(teacher.inviteCode);
      alert("✅ Invite code copied!");
    }
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
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 60,
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          textAlign: "center"
        }}>
          <div style={{
            width: 60, height: 60,
            border: "4px solid rgba(102,126,234,0.2)",
            borderTop: "4px solid #667eea",
            borderRadius: "50%",
            animation: "tsSpin 1s linear infinite",
            margin: "0 auto 24px"
          }} />
          <h2 style={{
            fontSize: 24, margin: 0,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Loading Settings...
          </h2>
        </div>
        <style>{`@keyframes tsSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!teacher) return null;

  return (
    <div style={{
      height: "100%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      {/* Background Blobs */}
      <div style={{
        position: "absolute",
        top: "-10%", right: "-5%",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        filter: "blur(80px)",
        animation: "tsFloat 20s ease-in-out infinite",
        pointerEvents: "none", zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "-15%", left: "-10%",
        width: "700px", height: "700px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        filter: "blur(100px)",
        animation: "tsFloat 25s ease-in-out infinite reverse",
        pointerEvents: "none", zIndex: 0
      }} />

      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "32px 24px 80px",
        position: "relative",
        zIndex: 10
      }}>

        {/* ===== HEADER ===== */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 30, borderRadius: 20,
          marginBottom: 24,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 50, height: 50, borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 24,
              boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
            }}>
              <FaCog />
            </div>
            <h1 style={{
              margin: 0, fontSize: 32,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "700"
            }}>
              Settings
            </h1>
          </div>
        </div>

        {/* ===== TAB NAVIGATION ===== */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: "8px",
          borderRadius: 16,
          marginBottom: 24,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          display: "flex",
          gap: 8
        }}>
          {[
            { key: "profile", icon: <FaUser />, label: "Profile" },
            { key: "reviews", icon: <FaComments />, label: `Reviews (${reviews.length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: "12px 20px",
                background: activeTab === tab.key
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
                color: activeTab === tab.key ? "white" : "#64748b",
                border: "none",
                borderRadius: 10,
                fontWeight: "600",
                fontSize: 15,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.3s",
                boxShadow: activeTab === tab.key
                  ? "0 4px 12px rgba(102,126,234,0.3)" : "none"
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.key)
                  e.currentTarget.style.background = "rgba(102,126,234,0.08)";
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.key)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ===== PROFILE TAB ===== */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Profile Info Card */}
            <div style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              padding: 30, borderRadius: 20,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              animation: "tsSlideIn 0.4s ease-out"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: 22, flexShrink: 0
                }}>
                  <FaUser />
                </div>
                <h2 style={{ margin: 0, fontSize: 22, color: "#1e293b", fontWeight: "700" }}>
                  Profile Information
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Name */}
                <InfoRow icon={<FaUser />} label="Name" value={teacher.name || "Not set"} />
                {/* Email */}
                <InfoRow icon={<FaEnvelope />} label="Email" value={teacher.email || "Not set"} />
                {/* Qualification */}
                <InfoRow icon={<FaGraduationCap />} label="Qualification" value={teacher.qualification || "Not set"} />
                {/* Experience */}
                <InfoRow icon={<FaBriefcase />} label="Experience" value={`${teacher.experience || 0} years`} />
              </div>

              {/* Subjects */}
              {teacher.subjects && teacher.subjects.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    marginBottom: 12, color: "#64748b", fontSize: 12,
                    fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px"
                  }}>
                    <FaBook style={{ color: "#667eea" }} /> Subjects
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {teacher.subjects.map((subject, i) => (
                      <span key={i} style={{
                        padding: "8px 16px",
                        background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
                        color: "#667eea",
                        borderRadius: 20,
                        fontSize: 14,
                        fontWeight: "600",
                        border: "1px solid rgba(102,126,234,0.2)"
                      }}>
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {teacher.bio && (
                <div style={{ marginTop: 20 }}>
                  <div style={{
                    fontSize: 12, color: "#64748b", fontWeight: "600",
                    textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10
                  }}>
                    Bio
                  </div>
                  <p style={{
                    margin: 0,
                    padding: "16px 20px",
                    background: "#f8f9ff",
                    borderRadius: 12,
                    border: "2px solid #e2e8f0",
                    color: "#1e293b",
                    lineHeight: 1.7,
                    fontSize: 15
                  }}>
                    {teacher.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Invite Code Card */}
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: 40, borderRadius: 20,
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(102,126,234,0.4)",
              animation: "tsSlideIn 0.4s ease-out 0.1s both"
            }}>
              <h2 style={{ margin: "0 0 10px 0", color: "white", fontSize: 22 }}>
                Your Teacher Code
              </h2>
              <p style={{ margin: "0 0 28px 0", color: "rgba(255,255,255,0.85)", fontSize: 15 }}>
                Share this code with students so they can connect to you
              </p>

              <div style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                padding: "24px 40px",
                borderRadius: 16,
                marginBottom: 28,
                border: "1px solid rgba(255,255,255,0.2)"
              }}>
                <div style={{
                  fontSize: 48,
                  fontWeight: "bold",
                  letterSpacing: 8,
                  fontFamily: "monospace",
                  color: "white",
                  textShadow: "0 2px 8px rgba(0,0,0,0.2)"
                }}>
                  {teacher.inviteCode || "NO CODE"}
                </div>
              </div>

              <button
                onClick={copyInviteCode}
                style={{
                  padding: "14px 36px",
                  background: "white",
                  color: "#667eea",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: "700",
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  transition: "all 0.3s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
                }}
              >
                📋 Copy Code
              </button>
            </div>
          </div>
        )}

        {/* ===== REVIEWS TAB ===== */}
        {activeTab === "reviews" && (
          <ReviewsTab reviews={reviews} stats={stats} />
        )}
      </div>

      <style>{`
        @keyframes tsFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes tsSpin { to { transform: rotate(360deg); } }
        @keyframes tsSlideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tsPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}

// ========================================
// INFO ROW COMPONENT
// ========================================
function InfoRow({ icon, label, value }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 18px",
      background: "#f8f9ff",
      borderRadius: 12,
      border: "2px solid #e2e8f0"
    }}>
      <div style={{ color: "#667eea", fontSize: 18, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.3px" }}>
          {label}
        </div>
        <div style={{ fontSize: 16, fontWeight: "600", color: "#1e293b" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ========================================
// REVIEWS TAB
// ========================================
function ReviewsTab({ reviews, stats }) {
  const [filter, setFilter] = useState("all");

  const filteredReviews = filter === "all"
    ? reviews
    : reviews.filter(r => Number(r.rating) === Number(filter));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Rating Summary Card */}
      <div style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        padding: 30, borderRadius: 20,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        animation: "tsSlideIn 0.4s ease-out"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 50, height: 50, borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 22
          }}>
            <FaStar />
          </div>
          <h2 style={{ margin: 0, fontSize: 22, color: "#1e293b", fontWeight: "700" }}>
            Rating Overview
          </h2>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
          flexWrap: "wrap"
        }}>
          {/* Average Rating Circle */}
          <div style={{
            textAlign: "center",
            padding: "24px 32px",
            background: "linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)",
            borderRadius: 20,
            border: "2px solid rgba(102,126,234,0.15)",
            minWidth: 140
          }}>
            <div style={{
              fontSize: 56, fontWeight: "800",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
              marginBottom: 10
            }}>
              {stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
            </div>
            <StarRating rating={stats?.averageRating || 0} size={20} />
            <div style={{ marginTop: 10, color: "#64748b", fontSize: 13, fontWeight: "600" }}>
              {stats?.totalReviews || 0} review{stats?.totalReviews !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Distribution Bars */}
          <div style={{ flex: 1, minWidth: 200 }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats?.ratingDistribution?.[star] || 0;
              const pct = stats?.totalReviews > 0
                ? (count / stats.totalReviews) * 100
                : 0;
              return (
                <div key={star} style={{
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 10
                }}>
                  <div style={{
                    fontSize: 13, fontWeight: "600", color: "#64748b",
                    width: 40, display: "flex", alignItems: "center", gap: 4
                  }}>
                    {star} <FaStar style={{ color: "#ffc107", fontSize: 11 }} />
                  </div>
                  <div style={{
                    flex: 1, height: 10, background: "#f1f5f9",
                    borderRadius: 6, overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: 6,
                      transition: "width 0.6s ease"
                    }} />
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", width: 28, textAlign: "right", fontWeight: "600" }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        padding: "14px 20px", borderRadius: 16,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        display: "flex", gap: 10, flexWrap: "wrap"
      }}>
        {[
          { key: "all", label: "All", count: reviews.length },
          ...[5, 4, 3, 2, 1].map(s => ({
            key: s.toString(),
            label: `${s} ⭐`,
            count: stats?.ratingDistribution?.[s] || 0
          }))
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "10px 18px",
              background: filter === f.key
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#f1f5f9",
              color: filter === f.key ? "white" : "#64748b",
              border: "none", borderRadius: 10,
              fontWeight: "600", fontSize: 14,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.3s",
              boxShadow: filter === f.key ? "0 4px 12px rgba(102,126,234,0.3)" : "none"
            }}
            onMouseEnter={e => {
              if (filter !== f.key) e.currentTarget.style.background = "#e2e8f0";
            }}
            onMouseLeave={e => {
              if (filter !== f.key) e.currentTarget.style.background = "#f1f5f9";
            }}
          >
            {f.label}
            <span style={{
              padding: "2px 8px",
              background: filter === f.key ? "rgba(255,255,255,0.25)" : "#e2e8f0",
              borderRadius: 10, fontSize: 12, fontWeight: "700"
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 60, borderRadius: 20,
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📝</div>
          <h2 style={{
            fontSize: 24, marginBottom: 12,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            No Reviews Yet
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 15 }}>
            {filter === "all" ? "No reviews yet" : `No ${filter}-star reviews`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredReviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

// ========================================
// REVIEW CARD
// ========================================
function ReviewCard({ review, index }) {
  const date = review.createdAt?.toDate
    ? review.createdAt.toDate()
    : new Date();

  return (
    <div style={{
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(20px)",
      padding: 24, borderRadius: 20,
      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      transition: "all 0.3s",
      animation: `tsSlideIn 0.5s ease-out ${index * 0.06}s both`
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 48px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.15)";
      }}
    >
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 16, gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: "700", fontSize: 20, flexShrink: 0,
            boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
          }}>
            {review.studentName?.charAt(0).toUpperCase() || "S"}
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: 16, color: "#1e293b", marginBottom: 6 }}>
              {review.studentName || "Anonymous"}
            </div>
            <StarRating rating={review.rating || 0} size={16} />
          </div>
        </div>
        <div style={{
          fontSize: 12, color: "#94a3b8", fontWeight: "600",
          background: "#f8f9ff", padding: "6px 12px",
          borderRadius: 20, whiteSpace: "nowrap"
        }}>
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {review.comment && review.comment.trim() ? (
        <div style={{
          padding: "14px 18px",
          background: "linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)",
          borderRadius: 12,
          borderLeft: "4px solid #667eea"
        }}>
          <p style={{ margin: 0, lineHeight: 1.7, color: "#1e293b", fontSize: 15 }}>
            "{review.comment}"
          </p>
        </div>
      ) : (
        <div style={{
          padding: "12px 16px",
          background: "#f8f9fa",
          borderRadius: 12,
          borderLeft: "4px solid #e2e8f0"
        }}>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14, fontStyle: "italic" }}>
            No comment provided
          </p>
        </div>
      )}
    </div>
  );
}

// ========================================
// STAR RATING
// ========================================
function StarRating({ rating, size = 18 }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars)
      stars.push(<FaStar key={i} style={{ color: "#ffc107", fontSize: size }} />);
    else if (i === fullStars && hasHalf)
      stars.push(<FaStarHalfAlt key={i} style={{ color: "#ffc107", fontSize: size }} />);
    else
      stars.push(<FaRegStar key={i} style={{ color: "#e2e8f0", fontSize: size }} />);
  }

  return <div style={{ display: "flex", gap: 2 }}>{stars}</div>;
}