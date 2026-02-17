import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { FaPaperPlane, FaArrowLeft, FaUser } from "react-icons/fa";

export default function ChatRoom({ role }) {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD CHAT META ---------------- */
  useEffect(() => {
    async function loadChat() {
      const snap = await getDoc(doc(db, "chats", chatId));
      if (snap.exists()) {
        setChatInfo(snap.data());
      }
      setLoading(false);
    }
    loadChat();
  }, [chatId]);

  /* ---------------- REAL-TIME MESSAGES ---------------- */
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    if (role === "teacher") {
      updateDoc(doc(db, "chats", chatId), {
        unreadForTeacher: 0,
      }).catch(err => console.error("Update unread error:", err));
    }
  }, [chatId, role]);

  /* ---------------- SEND MESSAGE ---------------- */
  async function sendMessage() {
    if (!text.trim()) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(
        collection(db, "chats", chatId, "messages"),
        {
          senderId: user.uid,
          text: text.trim(),
          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: text.trim(),
        lastUpdated: serverTimestamp(),
      });

      setText("");
    } catch (err) {
      console.error("Send message error:", err);
     
    }
  }

  function handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 40,
          borderRadius: 20,
          textAlign: "center"
        }}>
          <div style={{
            width: 60,
            height: 60,
            border: "4px solid rgba(102,126,234,0.2)",
            borderTop: "4px solid #667eea",
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
            Loading chat...
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

  const chatName = role === "teacher" 
    ? (chatInfo?.studentName || "Student")
    : (chatInfo?.teacherName || "Teacher");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Background Blobs */}
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

      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        padding: "20px 30px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 16
      }}>
        <button
          onClick={() => navigate(role === "teacher" ? "/teacher/dashboard" : "/student/dashboard")}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#f1f5f9",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onMouseEnter={e => e.target.style.background = "#e2e8f0"}
          onMouseLeave={e => e.target.style.background = "#f1f5f9"}
        >
          <FaArrowLeft style={{ color: "#667eea" }} />
        </button>

        <div style={{
          width: 45,
          height: 45,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 20
        }}>
          <FaUser />
        </div>

        <div>
          <h2 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>
            {chatName}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {role === "teacher" ? "Student" : "Teacher"}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ maxWidth: 900, width: "100%", margin: "0 auto", flex: 1 }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "white",
              opacity: 0.7
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <p style={{ fontSize: 16 }}>No messages yet. Start the conversation!</p>
            </div>
          )}

          {messages.map((m) => {
            const isMe = m.senderId === auth.currentUser?.uid;
            return (
              <div
                key={m.id}
                style={{
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start"
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "12px 18px",
                    borderRadius: 16,
                    background: isMe
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "rgba(255,255,255,0.95)",
                    color: isMe ? "white" : "#1e293b",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    backdropFilter: "blur(20px)",
                    wordBreak: "break-word"
                  }}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        padding: "20px 30px",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
        position: "relative",
        zIndex: 10
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 12 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: "14px 20px",
              borderRadius: 12,
              border: "2px solid #e2e8f0",
              fontSize: 15,
              outline: "none",
              transition: "border-color 0.3s"
            }}
            onFocus={e => e.target.style.borderColor = "#667eea"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            style={{
              padding: "14px 24px",
              background: text.trim()
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#94a3b8",
              color: "white",
              border: "none",
              borderRadius: 12,
              cursor: text.trim() ? "pointer" : "not-allowed",
              fontWeight: "600",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: text.trim() ? "0 4px 12px rgba(102,126,234,0.3)" : "none",
              transition: "all 0.3s"
            }}
            onMouseEnter={e => {
              if (text.trim()) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(102,126,234,0.4)";
              }
            }}
            onMouseLeave={e => {
              if (text.trim()) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(102,126,234,0.3)";
              }
            }}
          >
            <FaPaperPlane />
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}