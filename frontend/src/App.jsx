import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";             
import "aos/dist/aos.css";        

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Crud from "./components/crud/Crud";
import Create from "./components/crud/Create";
import Read from "./components/crud/Read";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000, 
      once: false,    
      mirror: true, 
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="confirm" element={<ConfirmEmail />} />
        <Route path="confirm/:token" element={<ConfirmEmail />} />
        <Route path="forgot" element={<ForgotPassword />} />
        <Route path="reset/:pin?" element={<ResetPassword />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="crud" element={<ProtectedRoute><Crud /></ProtectedRoute>} />
        <Route path="create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
        <Route path="read" element={<ProtectedRoute><Read /></ProtectedRoute>} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
