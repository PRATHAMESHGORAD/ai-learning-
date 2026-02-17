import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function StudentChat() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [chatId]);

  async function sendMessage() {
    if (!text.trim()) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: auth.currentUser.uid,
      text,
      createdAt: serverTimestamp(),
    });

    setText("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat</h2>

      <div style={{ minHeight: 300, marginBottom: 10 }}>
        {messages.map((m) => (
          <p key={m.id}>
            <b>{m.senderId === auth.currentUser.uid ? "You" : "Teacher"}:</b>{" "}
            {m.text}
          </p>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
