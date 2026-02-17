import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  serverTimestamp,
  updateDoc,
  addDoc,
  getDoc,
  setDoc,
  getDocs,
  orderBy,
  limit
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { FaStar, FaStarHalfAlt, FaRegStar, FaComment } from "react-icons/fa";
import { FaChalkboardTeacher, FaUserGraduate, FaBook } from "react-icons/fa";
export default function Teachers() {
  const [allTeachers, setAllTeachers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Review modal state
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "teachers"),
      where("isActive", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const list = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            
            // Get rating stats
            const stats = await getTeacherStats(docSnap.id);
            
            // Get recent reviews
            const recentReviews = await getRecentReviews(docSnap.id);

            return {
              id: docSnap.id,
              name: data.name || "Teacher",
              email: data.email || "",
              qualification: data.qualification || "Not specified",
              experience: typeof data.experience === "number" ? data.experience : 0,
              subjects: Array.isArray(data.subjects) ? data.subjects : [],
              bio: data.bio || "",
              photo: data.photo || "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
              // Rating data
              averageRating: stats.averageRating || 0,
              totalReviews: stats.totalReviews || 0,
              recentReviews: recentReviews || []
            };
          })
        );

        setAllTeachers(list);
        setTeachers(list);
        setLoading(false);
      },
      (err) => {
        console.error("Teachers error:", err);
        setError("Failed to load teachers");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  async function getTeacherStats(teacherId) {
    try {
      const statsDoc = await getDoc(doc(db, "teacherStats", teacherId));
      
      if (statsDoc.exists()) {
        const data = statsDoc.data();
        return {
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0
        };
      } else {
        return { averageRating: 0, totalReviews: 0 };
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
      return { averageRating: 0, totalReviews: 0 };
    }
  }

  async function getRecentReviews(teacherId) {
    try {
      const q = query(
        collection(db, "reviews"),
        where("teacherId", "==", teacherId),
        orderBy("createdAt", "desc"),
        limit(2)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error("Recent review fetch error:", err);
      return [];
    }
  }

  useEffect(() => {
    const value = search.toLowerCase();
    const filtered = allTeachers.filter((t) => {
      const subjects = t.subjects.join(" ").toLowerCase();
      const name = t.name.toLowerCase();
      const qualification = t.qualification.toLowerCase();
      return subjects.includes(value) || name.includes(value) || qualification.includes(value);
    });
    setTeachers(filtered);
  }, [search, allTeachers]);

  async function startChat(teacher) {
    const user = auth.currentUser;
    if (!user) return;

    const studentSnap = await getDoc(doc(db, "students", user.uid));
    const studentName = studentSnap.exists() ? studentSnap.data().fullname : "Student";

    await addDoc(collection(db, "chats"), {
      studentId: user.uid,
      studentName: studentName,
      teacherId: teacher.id,
      teacherName: teacher.name,
      lastMessage: "",
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    alert("Chat created. Open Messages.");
  }

  function openReviewModal(teacher) {
    setSelectedTeacher(teacher);
    setShowReviewModal(true);
  }

  function openAllReviews(teacher) {
    setSelectedTeacher(teacher);
    setShowAllReviews(true);
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
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
          padding: 40,
          borderRadius: 20,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
        }}>
          <div style={{
            width: 60,
            height: 60,
            border: "4px solid rgba(16,185,129,0.2)",
            borderTop: "4px solid #10b981",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }} />
          <h2 style={{
            margin: 0,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",

            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Loading teachers...
          </h2>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 40,
          borderRadius: 20,
          textAlign: "center"
        }}>
          <p style={{ color: "red", fontSize: 18 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
     background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",

      position: "relative",
      overflow: "auto",
      padding: "40px 20px"
    }}>
      {/* Animated Background Blobs */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        filter: "blur(80px)",
        animation: "float 20s ease-in-out infinite",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-15%",
        left: "-10%",
        width: "700px",
        height: "700px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        filter: "blur(100px)",
        animation: "float 25s ease-in-out infinite reverse",
        pointerEvents: "none"
      }} />

      <div style={{ 
        maxWidth: 1400, 
        margin: "0 auto", 
        position: "relative", 
        zIndex: 10,
        paddingBottom: "120px"
      }}>
        {/* Header */}
        
          
        {/* Header */}
<div style={{
  background: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(20px)",
  padding: 30,
  borderRadius: 20,
  marginBottom: 30,
  boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
}}>
  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
    {/* Icon */}
    <div style={{
  width: 50,
  height: 50,
  borderRadius: "12px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontSize: 24,
  boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
}}>
  <FaChalkboardTeacher />
</div>
    
    <h1 style={{
      margin: 0,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontSize: 36,
      fontWeight: "700"
    }}>
      Available Teachers
    </h1>
  </div>

  <input
    type="text"
    placeholder="Search by subject, name, or qualification"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      width: "100%",
      maxWidth: "500px",
      padding: "14px 20px",
      borderRadius: "12px",
      border: "2px solid #e2e8f0",
      fontSize: "16px",
      transition: "all 0.3s",
      outline: "none"
    }}
    onFocus={e => e.target.style.borderColor = "#667eea"}
    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
  />
</div>

        {teachers.length === 0 && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 60,
            borderRadius: 20,
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>👨‍🏫</div>
            <p style={{ fontSize: 18, color: "#64748b" }}>No teachers available.</p>
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}>
          {teachers.map((t) => {
            const isStudent = auth.currentUser && auth.currentUser.uid !== t.id;

            return (
              <div
                key={t.id}
                style={{
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  transition: "all 0.3s",
                  cursor: "pointer"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 15px 50px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.15)";
                }}
              >
                <img
                  src={t.photo}
                  alt={t.name}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "16px",
                  }}
                />

                <h3 style={{ marginBottom: "12px", fontSize: 20 }}>{t.name}</h3>

                {/* ⭐ RATING DISPLAY */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px"
                }}>
                  <StarRating rating={t.averageRating} />
                  <span style={{ fontWeight: "600", color: "#333" }}>
                    {t.averageRating.toFixed(1)}
                  </span>
                  <span style={{ color: "#666", fontSize: "14px" }}>
                    ({t.totalReviews} {t.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>

                <p style={{ fontSize: "14px", marginBottom: "8px", color: "#64748b" }}>
                  <b>Qualification:</b> {t.qualification}
                </p>

                <p style={{ fontSize: "14px", marginBottom: "8px", color: "#64748b" }}>
                  <b>Subjects:</b>{" "}
                  {t.subjects.length > 0 ? t.subjects.join(", ") : "Not specified"}
                </p>

                <p style={{ fontSize: "14px", marginBottom: "12px", color: "#64748b" }}>
                  <b>Experience:</b> {t.experience} years
                </p>

                {/* ⭐ SHOW RECENT REVIEWS */}
                {t.recentReviews && t.recentReviews.length > 0 && (
                  <div style={{ marginTop: "12px", marginBottom: "12px" }}>
                    {t.recentReviews.map(r => (
                      <div key={r.id} style={{
                        background: "#f8f9fa",
                        padding: "10px",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        fontSize: "13px",
                        border: "1px solid #e2e8f0"
                      }}>
                        <strong style={{ color: "#1e293b" }}>{r.studentName}</strong>
                        <div style={{ margin: "4px 0" }}>
                          <StarRating rating={r.rating} size={14} />
                        </div>
                        <p style={{ margin: "6px 0 0 0", color: "#64748b", lineHeight: "1.4" }}>
                          {r.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {t.bio && (
                  <p style={{ 
                    fontSize: "13px", 
                    color: "#64748b", 
                    marginBottom: "16px",
                    lineHeight: "1.5",
                    padding: "12px",
                    background: "#f8f9fa",
                    borderRadius: "8px"
                  }}>
                    {t.bio}
                  </p>
                )}

                {/* ✅ ACTIONS */}
                {isStudent && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button
                      onClick={() => startChat(t)}
                      style={{
                        padding: "12px",
                        width: "100%",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "15px",
                        boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                        transition: "all 0.3s"
                      }}
                      onMouseEnter={e => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 6px 16px rgba(16,185,129,0.4)";
                      }}
                      onMouseLeave={e => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 12px rgba(16,185,129,0.3)";
                      }}
                    >
                      💬 Start Chat
                    </button>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => openReviewModal(t)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "#fbbf24",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: "all 0.3s"
                        }}
                        onMouseEnter={e => e.target.style.background = "#f59e0b"}
                        onMouseLeave={e => e.target.style.background = "#fbbf24"}
                      >
                        ⭐ Write Review
                      </button>

                      {t.totalReviews > 0 && (
                        <button
                          onClick={() => openAllReviews(t)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            background: "#6366f1",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "14px",
                            transition: "all 0.3s"
                          }}
                          onMouseEnter={e => e.target.style.background = "#4f46e5"}
                          onMouseLeave={e => e.target.style.background = "#6366f1"}
                        >
                          📖 Read Reviews
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALS */}
      {showReviewModal && selectedTeacher && (
        <WriteReviewModal
          teacher={selectedTeacher}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedTeacher(null);
          }}
        />
      )}

      {showAllReviews && selectedTeacher && (
        <AllReviewsModal
          teacher={selectedTeacher}
          onClose={() => {
            setShowAllReviews(false);
            setSelectedTeacher(null);
          }}
        />
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

// ========================================
// STAR RATING COMPONENT
// ========================================
function StarRating({ rating, size = 18 }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FaStar key={i} style={{ color: "#ffc107", fontSize: size }} />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<FaStarHalfAlt key={i} style={{ color: "#ffc107", fontSize: size }} />);
    } else {
      stars.push(<FaRegStar key={i} style={{ color: "#ddd", fontSize: size }} />);
    }
  }

  return <div style={{ display: "flex", gap: "2px" }}>{stars}</div>;
}

// ========================================
// WRITE REVIEW MODAL
// ========================================
function WriteReviewModal({ teacher, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReview() {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      alert("Please write a comment");
      return;
    }

    setSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please login");
        return;
      }

      // Check if user already reviewed
      const existingReview = await getDocs(
        query(
          collection(db, "reviews"),
          where("teacherId", "==", teacher.id),
          where("studentId", "==", user.uid)
        )
      );

      if (!existingReview.empty) {
        alert("You have already reviewed this teacher");
        setSubmitting(false);
        return;
      }

      // Get student name
      const studentSnap = await getDoc(doc(db, "students", user.uid));
      const studentName = studentSnap.exists() ? studentSnap.data().fullname : "Student";

      // Add review
      await addDoc(collection(db, "reviews"), {
        teacherId: teacher.id,
        studentId: user.uid,
        studentName: studentName,
        rating: rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      });

      // Update teacher stats
      await updateTeacherStats(teacher.id);

      alert("Review submitted successfully!");
      onClose();

    } catch (err) {
      console.error("Submit review error:", err);
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateTeacherStats(teacherId) {
    try {
      // Get all reviews for this teacher
      const reviewsSnap = await getDocs(
        query(collection(db, "reviews"), where("teacherId", "==", teacherId))
      );

      const reviews = reviewsSnap.docs.map(d => d.data());
      const totalReviews = reviews.length;
      const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalReviews > 0 ? sumRating / totalReviews : 0;

      // Rating distribution
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(r => {
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      });

      await setDoc(doc(db, "teacherStats", teacherId), {
        averageRating: averageRating,
        totalReviews: totalReviews,
        ratingDistribution: distribution,
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (err) {
      console.error("Update stats error:", err);
      throw err;
    }
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "16px",
        maxWidth: "600px",
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <h2 style={{ marginBottom: "24px" }}>Write a Review for {teacher.name}</h2>

        {/* Star Rating Selector */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600" }}>
            Your Rating
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  fontSize: 40,
                  cursor: "pointer",
                  color: (hoverRating || rating) >= star ? "#ffc107" : "#ddd",
                  transition: "color 0.2s"
                }}
              />
            ))}
          </div>
          {rating > 0 && (
            <p style={{ marginTop: "8px", color: "#666" }}>
              You selected: {rating} star{rating > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Comment */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600" }}>
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this teacher..."
            style={{
              width: "100%",
              minHeight: "150px",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #e0e0e0",
              fontSize: "15px",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "14px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "16px"
            }}
          >
            Cancel
          </button>

          <button
            onClick={submitReview}
            disabled={submitting || rating === 0 || !comment.trim()}
            style={{
              flex: 1,
              padding: "14px",
              background: submitting || rating === 0 || !comment.trim() ? "#ccc" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: submitting || rating === 0 || !comment.trim() ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "16px"
            }}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// ALL REVIEWS MODAL
// ========================================
function AllReviewsModal({ teacher, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const q = query(
        collection(db, "reviews"),
        where("teacherId", "==", teacher.id),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setReviews(list);
    } catch (err) {
      console.error("Load reviews error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "16px",
        maxWidth: "700px",
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <div>
            <h2 style={{ marginBottom: "8px" }}>Reviews for {teacher.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <StarRating rating={teacher.averageRating} size={20} />
              <span style={{ fontSize: "20px", fontWeight: "600" }}>
                {teacher.averageRating.toFixed(1)}
              </span>
              <span style={{ color: "#666" }}>
                ({teacher.totalReviews} reviews)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Close
          </button>
        </div>

        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", padding: "40px 0" }}>
            No reviews yet. Be the first to review!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {reviews.map(review => (
              <div
                key={review.id}
                style={{
                  padding: "20px",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px"
                }}>
                  <div>
                    <div style={{ fontWeight: "600", marginBottom: "6px" }}>
                      {review.studentName}
                    </div>
                    <StarRating rating={review.rating} size={16} />
                  </div>
                  <div style={{ fontSize: "13px", color: "#999" }}>
                    {review.createdAt?.toDate
                      ? new Date(review.createdAt.toDate()).toLocaleDateString()
                      : "Recently"}
                  </div>
                </div>

                <p style={{
                  lineHeight: "1.6",
                  color: "#333",
                  fontSize: "15px"
                }}>
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}