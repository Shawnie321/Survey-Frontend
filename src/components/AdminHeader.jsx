import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminHeader({ username }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  }

  function handleNavigate(path) {
    setMenuOpen(false);
    navigate(path);
  }

  // Determine if on survey list, create survey, or edit survey page
  const onSurveyList = location.pathname === "/surveys";
  const onDashboard = location.pathname === "/admin";
  const onCreateSurvey = location.pathname === "/create-survey";
  const onEditSurvey = location.pathname.startsWith("/edit-survey");

  return (
    <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-40">
      {/* make a relative container so we can place left and right items at viewport edges */}
      <div className="relative w-full">
        {/* centered spacer to maintain vertical height */}
        <div className="max-w-7xl mx-auto px-6 py-8" />

        {/* Left: Logo placed at far left of viewport */}
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-3xl font-extrabold tracking-wider">
          Admin Dashboard
        </div>

        {/* Right: User + Hamburger Menu placed at far right */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
          <span className="text-l font-semibold">👋 {username}</span>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative w-10 h-10 flex flex-col justify-center items-center gap-1.5 hover:bg-blue-700 rounded transition"
          >
            <span className={`block w-6 h-0.5 bg-white transition ${menuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition ${menuOpen ? "opacity-0" : ""}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
          </button>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-16 right-6 bg-white text-gray-800 rounded-lg shadow-xl w-48 py-2 z-50">
            {onDashboard && (
              <button
                onClick={() => handleNavigate("/create-survey")}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition font-medium flex items-center gap-2"
              >
                ➕ Create Survey
              </button>
            )}
            {(onSurveyList || onCreateSurvey || onEditSurvey) && (
              <button
                onClick={() => handleNavigate("/admin")}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition font-medium flex items-center gap-2"
              >
                📊 Back to Dashboard
              </button>
            )}
            <button
              onClick={() => handleNavigate("/surveys")}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 transition font-medium flex items-center gap-2"
            >
              📋 Surveys
            </button>
            <hr className="my-1" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition font-medium flex items-center gap-2"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
