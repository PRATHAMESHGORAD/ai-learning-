import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { FaPaperPlane, FaTimes } from "react-icons/fa";

export default function HomeworkSubmit({
  homeworkId,
  existingSubmission,
  onClose,
  onSubmitted
}) {
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🔹 preload link if editing
  useEffect(() => {
    if (existingSubmission?.submissionUrl) {
      setLink(existingSubmission.submissionUrl);
    }
  }, [existingSubmission]);

  async function submitHomework() {
    const user = auth.currentUser;
    if (!user) return;

    if (!link.trim()) {
      alert("Please paste a submission link");
      return;
    }

    setSubmitting(true);

    try {
      const ref = doc(db, "homeworks", homeworkId, "submissions", user.uid);

      if (existingSubmission) {
        // 🔁 EDIT MODE
        await updateDoc(ref, {
          submissionUrl: link,
          updatedAt: serverTimestamp()
        });
      } else {
        // 🆕 FIRST SUBMIT
        await setDoc(ref, {
          studentId: user.uid,
          studentName: user.email,
          submissionUrl: link,
          submittedAt: serverTimestamp(),
          checked: false
        });
      }

      onSubmitted();
      onClose();
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      background: "#f8f9ff",
      padding: 20,
      borderRadius: 12,
      border: "2px solid #e2e8f0"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16
      }}>
        <h4 style={{
          margin: 0,
          fontSize: 16,
          color: "#1e293b",
          fontWeight: "700"
        }}>
          {existingSubmission ? "Edit Your Submission" : "Submit Your Work"}
        </h4>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            fontSize: 18,
            padding: 4,
            display: "flex",
            alignItems: "center",
            transition: "color 0.3s"
          }}
          onMouseEnter={e => e.target.style.color = "#1e293b"}
          onMouseLeave={e => e.target.style.color = "#64748b"}
        >
          <FaTimes />
        </button>
      </div>

      <input
        placeholder="Paste your submission link (Google Drive, Dropbox, etc.)"
        value={link}
        onChange={e => setLink(e.target.value)}
        disabled={submitting}
        style={{
          width: "100%",
          padding: "12px 16px",
          border: "2px solid #e2e8f0",
          borderRadius: 10,
          fontSize: 14,
          marginBottom: 12,
          outline: "none",
          transition: "border-color 0.3s",
          boxSizing: "border-box"
        }}
        onFocus={e => e.target.style.borderColor = "#667eea"}
        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
      />

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={submitHomework}
          disabled={submitting}
          style={{
            flex: 1,
            padding: "12px 24px",
            background: submitting
              ? "#94a3b8"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontWeight: "700",
            fontSize: 14,
            cursor: submitting ? "not-allowed" : "pointer",
            boxShadow: submitting ? "none" : "0 4px 12px rgba(102,126,234,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.3s"
          }}
          onMouseEnter={e => {
            if (!submitting) {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 6px 16px rgba(102,126,234,0.4)";
            }
          }}
          onMouseLeave={e => {
            if (!submitting) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(102,126,234,0.3)";
            }
          }}
        >
          <FaPaperPlane />
          {submitting
            ? "Submitting..."
            : existingSubmission
            ? "Update Submission"
            : "Submit Homework"}
        </button>

        <button
          onClick={onClose}
          disabled={submitting}
          style={{
            padding: "12px 24px",
            background: "#f1f5f9",
            color: "#64748b",
            border: "none",
            borderRadius: 10,
            fontWeight: "600",
            fontSize: 14,
            cursor: submitting ? "not-allowed" : "pointer",
            transition: "all 0.3s"
          }}
          onMouseEnter={e => {
            if (!submitting) e.target.style.background = "#e2e8f0";
          }}
          onMouseLeave={e => {
            if (!submitting) e.target.style.background = "#f1f5f9";
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}