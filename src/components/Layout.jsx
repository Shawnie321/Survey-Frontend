import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Layout() {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setUsername(localStorage.getItem("username"));
  }, []);

  function handleLogout() {
    // Remove only authentication keys so other data (e.g. survey_<id>_<username>) stays
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  }

  // Hide navigation bar for /admin, /edit-survey/:id, /create-survey, and /survey/:id routes ONLY for admin
  // Do NOT hide for /surveys (survey list page)
  const hideNav =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/edit-survey") ||
    location.pathname.startsWith("/create-survey") ||
    (role === "Admin" && location.pathname.startsWith("/survey"));

  const current = location.pathname;
  function navClass(path, exact = false) {
    if (exact) return current === path ? "font-semibold" : "";
    return current.startsWith(path) ? "font-semibold" : "";
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && (
        <nav className="bg-blue-600 text-white">
          {/* full-width bar so items can sit at the viewport edges */}
          <div className="w-full flex items-center px-6 py-4">
            {/* left-aligned nav links (flush left) */}
            <div className="flex items-center gap-6">
              <Link to="/" className={`hover:underline ${navClass("/", true)}`}>

              </Link>
              <Link to="/" className={`hover:underline ${navClass("/", true)}`}>

              </Link>
              <Link to="/" className={`hover:underline ${navClass("/", true)}`}>

              </Link>
              <Link to="/" className={`hover:underline ${navClass("/", true)}`}>
                Home
              </Link>
              <Link to="/About" className={`hover:underline ${navClass("/About", true)}`}>
                About
              </Link>
              <Link to="/services" className={`hover:underline ${navClass("/services", true)}`}>
                Services
              </Link>
              <Link to="/surveys" className={`hover:underline ${navClass("/surveys", true)}`}>
                Surveys
              </Link>
              {role === "Admin" && (
                <Link to="/admin" className={`hover:underline ${navClass("/admin")}`}>
                  Admin
                </Link>
              )}
            </div>

            {/* push login/logout to the far right */}
            <div className="flex items-center gap-3 ml-auto mr-4">
              {username ? (
                <>
                  <span className="text-sm">👋 {username}</span>
                  <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded">Logout</button>
                </>
              ) : (
                <Link to="/login" className={`bg-white text-blue-600 px-3 py-1 rounded ${navClass("/login", true)}`}>
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-gray-300 py-8 mt-10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">© {new Date().getFullYear()} Survey Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}