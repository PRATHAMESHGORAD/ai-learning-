import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  where,
  query
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import TeacherHomeworkSubmissions from "./TeacherHomeworkSubmissions";
import {
  FaBook,
  FaPlus,
  FaTrash,
  FaExternalLinkAlt,
  FaTimes,
  FaEdit,
  FaCalendarAlt,
  FaUser,
  FaLink
} from "react-icons/fa";

export default function TeacherHomework() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [homeworks, setHomeworks] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "homeworks"),
      where("teacherId", "==", user.uid)
    );

    const unsub = onSnapshot(q, snap => {
      setHomeworks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "students"), snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  async function createHomework() {
    const user = auth.currentUser;
    if (!user) return;

    if (!title || !dueDate || !fileUrl) {
      alert("Title, due date and link required");
      return;
    }
    if (!selectedStudentId) {
      alert("Please select a student");
      return;
    }

    setCreating(true);
    try {
      let finalLink = fileUrl.trim();
      if (!finalLink.startsWith("http://") && !finalLink.startsWith("https://")) {
        finalLink = "https://" + finalLink;
      }

      await addDoc(collection(db, "homeworks"), {
        title,
        description,
        dueDate: new Date(dueDate),
        fileUrl: finalLink,
        teacherId: user.uid,
        studentId: selectedStudentId,
        createdAt: serverTimestamp()
      });

      setTitle("");
      setDescription("");
      setDueDate("");
      setFileUrl("");
      setSelectedStudentId("");
      setShowForm(false);
    } catch (err) {
      console.error("Create homework error:", err);
      alert("Failed to create homework.");
    } finally {
      setCreating(false);
    }
  }

  async function deleteHomework(id) {
    if (!window.confirm("Delete homework?")) return;
    try {
      await deleteDoc(doc(db, "homeworks", id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed – check permissions");
    }
  }

  async function updateHomeworkLink(id) {
    const newLink = prompt("Paste new homework link");
    if (!newLink) return;

    let finalLink = newLink.trim();
    if (!finalLink.startsWith("http://") && !finalLink.startsWith("https://")) {
      finalLink = "https://" + finalLink;
    }

    await updateDoc(doc(db, "homeworks", id), {
      fileUrl: finalLink,
      updatedAt: serverTimestamp()
    });

    alert("Homework updated");
  }

  const inputStyle = (field, value) => ({
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: focusedField === field
      ? "2px solid #667eea"
      : value
      ? "2px solid #10b981"
      : "2px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    transition: "all 0.3s",
    background: focusedField === field ? "#fafbff" : "white",
    color: "#1e293b",
    boxSizing: "border-box",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(102,126,234,0.1)" : "none",
    fontFamily: "inherit"
  });

  const labelStyle = (field) => ({
    display: "block",
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    color: focusedField === field ? "#667eea" : "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    transition: "color 0.3s"
  });

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
        top: "5%", right: "-5%",
        width: "500px", height: "500px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        filter: "blur(80px)",
        animation: "hwFloat 20s ease-in-out infinite",
        pointerEvents: "none", zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "5%", left: "-8%",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        filter: "blur(100px)",
        animation: "hwFloat 25s ease-in-out infinite reverse",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Content */}
      <div style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "32px 24px 80px",
        position: "relative",
        zIndex: 10
      }}>

        {/* ===== HEADER CARD ===== */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: "24px 28px",
          borderRadius: 20,
          marginBottom: 24,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaBook style={{ fontSize: 26, color: "#667eea" }} />
              <h1 style={{
                margin: 0, fontSize: 28, fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                Homework
              </h1>
            </div>
            <div style={{
              color: homeworks.length > 0 ? "#10b981" : "#94a3b8",
              fontSize: 14, fontWeight: "600",
              display: "flex", alignItems: "center", gap: 8
            }}>
              {homeworks.length > 0 && (
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#10b981",
                  animation: "hwPulse 2s ease-in-out infinite"
                }} />
              )}
              {homeworks.length > 0
                ? `${homeworks.length} assignment${homeworks.length !== 1 ? "s" : ""} assigned`
                : "No assignments yet"}
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "12px 22px",
              background: showForm
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "white",
              color: showForm ? "white" : "#667eea",
              border: showForm ? "none" : "2px solid #667eea",
              borderRadius: 12, fontWeight: "700", fontSize: 14,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.3s",
              boxShadow: showForm ? "0 4px 12px rgba(102,126,234,0.3)" : "none"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> New Assignment</>}
          </button>
        </div>

        {/* ===== CREATE FORM ===== */}
        {showForm && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 20, padding: 28, marginBottom: 24,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            animation: "hwSlideIn 0.3s ease-out"
          }}>
            <h3 style={{
              margin: "0 0 20px 0", fontSize: 18, fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              📝 Create New Assignment
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Title */}
              <div>
                <label style={labelStyle("title")}>Assignment Title</label>
                <input
                  placeholder="e.g., Math Worksheet Chapter 5"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle("title", title)}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle("description")}>Description (optional)</label>
                <textarea
                  placeholder="Add any instructions or notes..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  rows={3}
                  style={{
                    ...inputStyle("description", description),
                    resize: "vertical",
                    minHeight: 80
                  }}
                />
              </div>

              {/* Due Date + Student Row */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <label style={labelStyle("dueDate")}>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    onFocus={() => setFocusedField("dueDate")}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle("dueDate", dueDate)}
                  />
                </div>

                <div style={{ flex: "1 1 200px" }}>
                  <label style={labelStyle("student")}>Assign To</label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    onFocus={() => setFocusedField("student")}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle("student", selectedStudentId)}
                  >
                    <option value="">Select Student</option>
                    {students.map(stu => (
                      <option key={stu.id} value={stu.id}>
                        {stu.fullname || stu.name || stu.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Link */}
              <div>
                <label style={labelStyle("fileUrl")}>Homework Link</label>
                <input
                  placeholder="https://drive.google.com/... or any link"
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  onFocus={() => setFocusedField("fileUrl")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle("fileUrl", fileUrl)}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={createHomework}
                disabled={creating || !title || !dueDate || !fileUrl || !selectedStudentId}
                style={{
                  padding: "14px",
                  background: creating || !title || !dueDate || !fileUrl || !selectedStudentId
                    ? "#e2e8f0"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: creating || !title || !dueDate || !fileUrl || !selectedStudentId
                    ? "#94a3b8" : "white",
                  border: "none", borderRadius: 10, fontWeight: "700", fontSize: 15,
                  cursor: creating || !title || !dueDate || !fileUrl || !selectedStudentId
                    ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: creating || !title || !dueDate || !fileUrl || !selectedStudentId
                    ? "none" : "0 4px 12px rgba(102,126,234,0.3)",
                  transition: "all 0.3s"
                }}
                onMouseEnter={e => {
                  if (!creating && title && dueDate && fileUrl && selectedStudentId) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(102,126,234,0.4)";
                  }
                }}
                onMouseLeave={e => {
                  e.target.style.transform = "translateY(0)";
                }}
              >
                {creating ? (
                  <>
                    <div style={{
                      width: 18, height: 18,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "hwSpin 0.8s linear infinite"
                    }} />
                    Creating...
                  </>
                ) : (
                  <><FaBook /> Assign Homework</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===== EMPTY STATE ===== */}
        {homeworks.length === 0 && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 60, borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>📝</div>
            <h2 style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 8, fontSize: 24
            }}>
              No Assignments Yet
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 24 }}>
              Create your first homework assignment for your students
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white", border: "none", borderRadius: 12,
                fontWeight: "600", fontSize: 15, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 12px rgba(102,126,234,0.3)", transition: "all 0.3s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <FaPlus /> Create First Assignment
            </button>
          </div>
        )}

        {/* ===== HOMEWORK CARDS ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {homeworks.map((hw, index) => {
            const student = students.find(s => s.id === hw.studentId);
            const studentName = student?.fullname || student?.name || student?.email || hw.studentId;
            const dueStr = hw.dueDate?.toDate
              ? new Date(hw.dueDate.toDate()).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })
              : "No due date";

            return (
              <div key={hw.id}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(20px)",
                    padding: 24, borderRadius: 20,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                    transition: "all 0.3s",
                    animation: `hwSlideIn 0.5s ease-out ${index * 0.08}s both`
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
                  {/* Top Row: Icon + Info + Actions */}
                  <div style={{
                    display: "flex", alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap", gap: 16
                  }}>
                    {/* Left: Icon + Details */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flex: 1, minWidth: 200 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontSize: 22,
                        boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
                      }}>
                        <FaBook />
                      </div>
                      <div>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#1e293b", fontWeight: "700" }}>
                          {hw.title}
                        </h3>

                        {/* Meta Badges */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 5,
                            background: "rgba(102,126,234,0.1)",
                            color: "#667eea", padding: "4px 10px",
                            borderRadius: 20, fontSize: 12, fontWeight: "600"
                          }}>
                            <FaUser style={{ fontSize: 10 }} />
                            {studentName}
                          </div>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 5,
                            background: "rgba(16,185,129,0.1)",
                            color: "#10b981", padding: "4px 10px",
                            borderRadius: 20, fontSize: 12, fontWeight: "600"
                          }}>
                            <FaCalendarAlt style={{ fontSize: 10 }} />
                            Due: {dueStr}
                          </div>
                        </div>

                        {/* Description */}
                        {hw.description && (
                          <p style={{
                            margin: "6px 0 0 0",
                            fontSize: 13,
                            color: "#64748b",
                            lineHeight: "1.5"
                          }}>
                            {hw.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <a
                        href={hw.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: "10px 16px",
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: "white", border: "none", borderRadius: 10,
                          fontWeight: "600", fontSize: 13, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6,
                          textDecoration: "none",
                          boxShadow: "0 4px 12px rgba(16,185,129,0.3)", transition: "all 0.3s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 6px 16px rgba(16,185,129,0.4)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.3)";
                        }}
                      >
                        <FaExternalLinkAlt /> View File
                      </a>

                      <button
                        onClick={() => updateHomeworkLink(hw.id)}
                        style={{
                          padding: "10px 16px",
                          background: "#fff7ed",
                          color: "#f59e0b",
                          border: "1px solid #fed7aa",
                          borderRadius: 10, fontWeight: "600", fontSize: 13,
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                          transition: "all 0.3s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#f59e0b";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.borderColor = "#f59e0b";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "#fff7ed";
                          e.currentTarget.style.color = "#f59e0b";
                          e.currentTarget.style.borderColor = "#fed7aa";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <FaEdit /> Edit Link
                      </button>

                      <button
                        onClick={() => deleteHomework(hw.id)}
                        style={{
                          padding: "10px 14px",
                          background: "#fff5f5", color: "#ef4444",
                          border: "1px solid #fecaca", borderRadius: 10,
                          fontWeight: "600", fontSize: 13, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6,
                          transition: "all 0.3s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#ef4444";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.borderColor = "#ef4444";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "#fff5f5";
                          e.currentTarget.style.color = "#ef4444";
                          e.currentTarget.style.borderColor = "#fecaca";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Submissions Section */}
                  <TeacherHomeworkSubmissions homeworkId={hw.id} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes hwFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes hwSpin { to { transform: rotate(360deg); } }
        @keyframes hwSlideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hwPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}