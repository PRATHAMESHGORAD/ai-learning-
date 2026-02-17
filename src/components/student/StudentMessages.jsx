import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";
import { FaComments, FaTrash, FaChalkboardTeacher } from "react-icons/fa";

import { auth, db } from "../../firebase";

export default function StudentMessages() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) return;

      const q = query(
        collection(db, "chats"),
        where("studentId", "==", user.uid)
      );

      const unsubChats = onSnapshot(q, (snap) => {
        setChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      return () => unsubChats();
    });

    return () => unsub();
  }, []);

  async function deleteChat(chatId) {
    const ok = window.confirm("Delete this chat?");
    if (!ok) return;

    try {
      const msgsRef = collection(db, "chats", chatId, "messages");
      const msgsSnap = await getDocs(msgsRef);

      for (const m of msgsSnap.docs) {
        await deleteDoc(m.ref);
      }

      await deleteDoc(doc(db, "chats", chatId));
    } catch (err) {
      console.error(err);
      alert("Delete blocked by rules or ownership");
    }
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
            Loading Messages...
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
        maxWidth: 900, 
        margin: "0 auto", 
        position: "relative", 
        zIndex: 10,
        paddingBottom: "120px"
      }}>
        {/* Header */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: 30,
          borderRadius: 20,
          marginBottom: 30,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
              <FaComments />
            </div>
            
            <h1 style={{
              margin: 0,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: 32,
              fontWeight: "700"
            }}>
              Messages
            </h1>
          </div>
        </div>

        {/* Empty State */}
        {chats.length === 0 && (
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: 60,
            borderRadius: 20,
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>💬</div>
            <h2 style={{
              fontSize: 28,
              marginBottom: 16,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              No Messages Yet
            </h2>
            <p style={{ fontSize: 16, color: "#64748b" }}>
              Your teacher conversations will appear here
            </p>
          </div>
        )}

        {/* Chat List */}
        {chats.map((chat, index) => (
          <div
            key={chat.id}
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              padding: 24,
              borderRadius: 20,
              marginBottom: 20,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              cursor: "pointer",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16
            }}
            onClick={() => navigate(`/student/chat/${chat.id}`)}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 48px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.15)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 22,
                flexShrink: 0
              }}>
                <FaChalkboardTeacher />
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: 18,
                  color: "#1e293b",
                  fontWeight: "600"
                }}>
                  {chat.teacherName || "Teacher"}
                </h3>
                <p style={{
                  margin: "4px 0 0 0",
                  fontSize: 14,
                  color: "#64748b"
                }}>
                  Click to view conversation
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat.id);
              }}
              style={{
                padding: "10px 16px",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontWeight: "600",
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.3s",
                flexShrink: 0
              }}
              onMouseEnter={e => {
                e.target.style.transform = "scale(1.05)";
                e.target.style.boxShadow = "0 6px 16px rgba(239,68,68,0.4)";
              }}
              onMouseLeave={e => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)";
              }}
            >
              <FaTrash />
              Delete
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}