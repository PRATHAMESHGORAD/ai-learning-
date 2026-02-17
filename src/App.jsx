import { Routes, Route  } from "react-router-dom";
import Landing from "./pages/Landing";
import TeacherAuth from "./pages/TeacherAuth";
import StudentAuth from "./pages/StudentAuth";
import TeacherQualification from "./pages/TeacherQualification";
import StudentEducation from "./pages/StudentEducation";
import StudentExam from "./pages/StudentExam";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Quiz from "./components/student/Quiz";
import Teachers from "./components/student/Teachers";
import StudentChat from "./components/student/StudentChat";
import ChatRoom from "./components/chat/ChatRoom";
import TeacherMessages from "./components/teacher/TeacherMessages";
import StudentSettings from './components/student/StudentSettings';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Teacher Auth */}
      <Route path="/teacher/login" element={<TeacherAuth />} />
      <Route path="/teacher/auth" element={<TeacherAuth />} />

      {/* Student Auth */}
      <Route path="/student/login" element={<StudentAuth />} />

      {/* Teacher */}
      <Route path="/teacher/qualification" element={<TeacherQualification />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

      {/* Student */}
      <Route path="/student/education" element={<StudentEducation />} />
      <Route path="/student/exam" element={<StudentExam />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />

      <Route path="/student/quiz" element={<Quiz />} />
      <Route path="/student/teachers" element={<Teachers />} />
      <Route path="/student/chat/:chatId" element={<ChatRoom role="student" />} />
      <Route path="/teacher/chat/:chatId" element={<ChatRoom role="teacher" />} />
      <Route path="/teacher/messages" element={<TeacherMessages />} />   
      
      <Route path="/student/settings" element={<StudentSettings />} />
 



    </Routes>
  );
}
