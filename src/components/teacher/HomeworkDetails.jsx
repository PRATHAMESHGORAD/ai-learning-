import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function HomeworkDetails({ homework }) {
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);

  // 🔹 Load all students
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "students"), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 🔹 Load submissions
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "homeworks", homework.id, "submissions"),
      (snap) => {
        setSubmissions(
          snap.docs.map(d => ({ id: d.id, ...d.data() }))
        );
      }
    );
    return () => unsub();
  }, [homework.id]);

  function isSolved(studentId) {
    return submissions.some(s => s.studentId === studentId);
  }

  function getSubmission(studentId) {
    return submissions.find(s => s.studentId === studentId);
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>{homework.title}</h3>

      {students.map(stu => {
        const solved = isSolved(stu.id);
        const submission = getSubmission(stu.id);

        return (
          <div
            key={stu.id}
            style={{
              border: "1px solid #ddd",
              padding: 10,
              marginBottom: 8,
              background: solved ? "#e6fffa" : "#ffecec"
            }}
          >
            <b>{stu.fullname}</b>

            <span style={{ marginLeft: 10 }}>
              {solved ? "✅ Solved" : "❌ Unsolved"}
            </span>

            {solved && (
              <div>
                <a href={submission.fileUrl} target="_blank">
                  View Submission
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
