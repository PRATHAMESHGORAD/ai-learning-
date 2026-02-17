import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaPaperPlane, FaRobot, FaTrash, FaPlus, FaSearch, FaBrain } from "react-icons/fa";

function generateChatTitle(text) {
  if (!text) return "New Chat";
  return text.replace(/\s+/g, " ").trim().slice(0, 35);
}

function createNewChat() {
  return {
    id: Date.now().toString(),
    title: "New Chat",
    messages: [
      {
        role: "assistant",
        content: "👋 Hi! I'm your AI tutor. Ask me anything about your studies!",
      },
    ],
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };
}

export default function AiTutor() {
  const navigate = useNavigate();
  const endRef = useRef(null);
  const sessionStartRef = useRef(Date.now());

  const [storageKey, setStorageKey] = useState(null);
  const [chats, setChats] = useState([createNewChat()]);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        setChats([createNewChat()]);
        setStorageKey(null);
        return;
      }

      const key = `ai_chats_${user.uid}`;
      setStorageKey(key);

      const saved = localStorage.getItem(key);
      if (saved) {
        const loadedChats = JSON.parse(saved);
        setChats(loadedChats);

        const lastActiveId = localStorage.getItem(`last_active_chat_${user.uid}`);
        if (lastActiveId && loadedChats.some(c => c.id === lastActiveId)) {
          setActiveChatId(lastActiveId);
        } else {
          const sorted = loadedChats.sort((a, b) => b.lastUpdated - a.lastUpdated);
          setActiveChatId(sorted[0].id);
        }
      } else {
        setChats([createNewChat()]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!chats.length) return;
    const exists = chats.some(c => c.id === activeChatId);
    if (!exists) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(chats));
  }, [chats, storageKey]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && activeChatId) {
      localStorage.setItem(`last_active_chat_${user.uid}`, activeChatId);
    }
  }, [activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat.messages, loading]);

  useEffect(() => {
    function handleUnload() {
      const secondsSpent = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const user = auth.currentUser;
      if (!user || secondsSpent < 5) return;

      fetch("http://localhost:5000/api/progress/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          practiceSeconds: secondsSpent,
        }),
      });
    }

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    setLoading(true);

    const userMessage = { role: "user", content: input };

    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              lastUpdated: Date.now(),
            }
          : chat
      )
    );

    setInput("");

    try {
      const currentChat = chats.find(c => c.id === activeChatId);
      const fullHistory = [...currentChat.messages, userMessage];

      const res = await fetch("http://localhost:5000/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: fullHistory,
          mode: "teach",
          userId: auth.currentUser.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.reply) {
        throw new Error(data.error || "Backend error");
      }

      const aiMessage = { role: "assistant", content: data.reply };

      setChats(prev =>
        prev.map(chat => {
          if (chat.id !== activeChatId) return chat;

          const isFirstUserMessage =
            chat.messages.filter(m => m.role === "user").length === 1;

          return {
            ...chat,
            title: isFirstUserMessage ? generateChatTitle(input) : chat.title,
            messages: [...chat.messages, aiMessage],
            lastUpdated: Date.now(),
          };
        })
      );
    } catch (err) {
      console.error("AI ERROR:", err);
      alert("AI tutor failed. Please try again.");
      
      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: chat.messages.slice(0, -1) }
            : chat
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function goToQuiz() {
    if (!activeChat || activeChat.messages.length < 2) {
      alert("Ask something first before taking quiz");
      return;
    }

    const userMessages = activeChat.messages.filter(m => m.role === "user");

    navigate("/student/quiz", {
      state: { 
        messages: userMessages,
        chatId: activeChatId,
      },
    });
  }

  function newChat() {
    const chat = createNewChat();
    setChats([chat, ...chats]);
    setActiveChatId(chat.id);
  }

  function deleteChat(id) {
    if (!confirm("Delete this chat?")) return;
    const remaining = chats.filter(c => c.id !== id);
    const safeChats = remaining.length ? remaining : [createNewChat()];
    setChats(safeChats);
    setActiveChatId(safeChats[0].id);
  }

  const filteredChats = chats
    .filter(chat => chat.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.lastUpdated - a.lastUpdated);

  return (
    <div style={{
      display: "flex",
      height: "100%",
      background: "#f0f2f5",
      overflow: "hidden"
    }}>
      {/* ===== SIDEBAR ===== */}
      {sidebarOpen && (
        <div style={{
          width: 280,
          background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
          flexShrink: 0
        }}>
          {/* New Chat Button */}
          <div style={{ padding: "20px 20px 12px 20px" }}>
            <button
              onClick={newChat}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.95)",
                color: "#667eea",
                border: "none",
                borderRadius: 10,
                fontWeight: "700",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "all 0.3s"
              }}
              onMouseEnter={e => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={e => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
            >
              <FaPlus />
              New Chat
            </button>
          </div>

          {/* Search Bar - SAME WIDTH AS BUTTON */}
          <div style={{
                    padding: "0 50px 16px 20px",
                   display: "flex",
                   justifyContent: "center"
            }}>

            <div style={{ position: "relative" }}>
              <FaSearch style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 12
              }} />
              <input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "92%",
                  padding: "10px 10px 10px 36px",
                  borderRadius: 8,
                  border: "none",
                  fontSize: 13,
                  outline: "none",
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  backdropFilter: "blur(10px)"
                }}
              />
            </div>
          </div>

          {/* Chat List - SCROLLABLE */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "0 12px 12px 12px"
          }}>
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  cursor: "pointer",
                  background: chat.id === activeChatId 
                    ? "rgba(255,255,255,0.25)" 
                    : "transparent",
                  borderRadius: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.3s",
                  border: chat.id === activeChatId ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent"
                }}
                onMouseEnter={e => {
                  if (chat.id !== activeChatId) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  }
                }}
                onMouseLeave={e => {
                  if (chat.id !== activeChatId) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                  <div style={{
                    fontWeight: "600",
                    color: "white",
                    marginBottom: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: 14
                  }}>
                    {chat.title}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "500" }}>
                    {new Date(chat.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    padding: 8,
                    borderRadius: 6,
                    fontSize: 13,
                    transition: "all 0.3s",
                    flexShrink: 0,
                    marginLeft: 8
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(255,0,0,0.3)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== MAIN CHAT AREA ===== */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 30px",
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              border: "2px solid rgba(255,255,255,0.3)"
            }}>
              <FaRobot style={{ color: "white" }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, color: "white", fontWeight: "600" }}>
                AI Tutor
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.9)" }}>
                Always here to help you learn
              </p>
            </div>
          </div>
          
          <button
            onClick={goToQuiz}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: loading 
                ? "rgba(255,255,255,0.3)" 
                : "rgba(255,255,255,0.95)",
              color: loading ? "rgba(255,255,255,0.6)" : "#28a745",
              border: "none",
              borderRadius: 10,
              fontWeight: "700",
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: loading ? "none" : "0 4px 12px rgba(0,0,0,0.15)",
              transition: "all 0.3s"
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
              }
            }}
            onMouseLeave={e => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
          >
            <FaBrain />
            Quiz Me
          </button>
        </div>

        {/* Messages - SCROLLABLE */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: 24,
          background: "#e8eaf6"
        }}>
          {activeChat.messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 16
              }}
            >
              <div style={{
                maxWidth: "70%",
                padding: "12px 16px",
                borderRadius: 14,
                background: m.role === "user" 
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                  : "#ffffff",
                color: m.role === "user" ? "white" : "#333",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                borderBottomRightRadius: m.role === "user" ? 4 : 14,
                borderBottomLeftRadius: m.role === "user" ? 14 : 4,
                fontSize: 15,
                lineHeight: 1.5
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: 16
            }}>
              <div style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                gap: 6
              }}>
                <div className="typing-dot" />
                <div className="typing-dot" style={{ animationDelay: "0.2s" }} />
                <div className="typing-dot" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input - FIXED */}
        <div style={{
          padding: 20,
          background: "white",
          borderTop: "1px solid #e0e0e0",
          flexShrink: 0
        }}>
          <div style={{
            display: "flex",
            gap: 12,
            maxWidth: 1200,
            margin: "0 auto"
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your studies..."
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 10,
                border: "2px solid #e0e0e0",
                fontSize: 14,
                outline: "none",
                transition: "all 0.3s",
                background: "white"
              }}
              onFocus={e => {
                e.target.style.border = "2px solid #667eea";
                e.target.style.boxShadow = "0 0 0 3px rgba(102,126,234,0.1)";
              }}
              onBlur={e => {
                e.target.style.border = "2px solid #e0e0e0";
                e.target.style.boxShadow = "none";
              }}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: "12px 24px",
                background: loading || !input.trim() 
                  ? "#ccc" 
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: 10,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: loading || !input.trim() 
                  ? "none" 
                  : "0 4px 12px rgba(102,126,234,0.3)",
                transition: "all 0.3s"
              }}
              onMouseEnter={e => {
                if (!loading && input.trim()) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(102,126,234,0.4)";
                }
              }}
              onMouseLeave={e => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(102,126,234,0.3)";
              }}
            >
              <FaPaperPlane />
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #667eea;
          animation: typing 1.4s infinite;
        }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}