import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminHeader({ username, currentPage = "dashboard" }) {
  const navigate = useNavigate();
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

  return (
    <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left: Logo/Company Name */}
        <div className="text-2xl font-extrabold tracking-wider">Sirbey</div>

        {/* Middle: Spacer */}
        <div className="flex-1"></div>

        {/* Right: User + Hamburger Menu */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">👋 {username}</span>

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
            {currentPage === "dashboard" ? (
              <button
                onClick={() => handleNavigate("/create-survey")}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition font-medium flex items-center gap-2"
              >
                ➕ Create Survey
              </button>
            ) : (
              <button
                onClick={() => handleNavigate("/admin")}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition font-medium flex items-center gap-2"
              >
                📊 Back to Dashboard
              </button>
            )}
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
