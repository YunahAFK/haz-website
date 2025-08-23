import { Routes, Route } from "react-router-dom";
import { Navigation } from "./components/layout/Navigation";
import Home from "./pages/Home";
import LectureDetail from "./pages/LectureDetail";
import AdminHome from "./pages/AdminHome";
import AdminCreateLecture from "./pages/AdminCreateLecture";
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { AuthProvider } from "./contexts/AuthContext";


function App() {
  return (
    <AuthProvider>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lecture/:lectureId" element={<LectureDetail />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/create-lecture" element={<AdminCreateLecture />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
