import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import SurveyList from "./pages/SurveyList";
import TakeSurvey from "./pages/TakeSurvey";
import CreateSurvey from "./pages/CreateSurvey";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/surveys" element={<SurveyList />} />
        <Route path="/survey/:id" element={<TakeSurvey />} />
        <Route path="/create-survey" element={<CreateSurvey />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Redirect any unknown route to home so loading the site lands on Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
