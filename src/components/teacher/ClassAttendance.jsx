import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function ClassAttendance({ classId }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "liveClasses", classId, "attendance"),
      (snap) => {
        setStudents(
          snap.docs.map(d => ({ id: d.id, ...d.data() }))
        );
      }
    );

    return () => unsub();
  }, [classId]);

  return (
    <div style={{ marginTop: 10 }}>
      <h4>Attendance</h4>

      {students.length === 0 && <p>No students joined yet</p>}

      {students.map(s => (
        <div key={s.id} style={{ fontSize: 14 }}>
          • {s.studentName}
        </div>
      ))}
    </div>
  );
}
