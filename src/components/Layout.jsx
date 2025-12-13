import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setUsername(localStorage.getItem("username"));
  }, []);

  useEffect(() => {
    const active = sessionStorage.getItem('active_share');
    if (active) {
      try {
        const parsed = JSON.parse(active);
        if (parsed && parsed.id) {
          // if we're not on the active survey, redirect and hide nav
          const expectedPath = `/survey/${parsed.id}`;
          if (!location.pathname.startsWith(expectedPath)) {
            // replace history entry to avoid back loop
            navigate(`${expectedPath}?share=${encodeURIComponent(parsed.share)}`, { replace: true });
          }
        }
      } catch (e) {
        // ignore malformed
      }
    }
  }, [location.pathname, navigate]);

  function handleLogout() {
    // Remove only authentication keys so other data (e.g. survey_<id>_<username>) stays
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  }

  // Hide navigation bar for /admin, /edit-survey/:id, /create-survey, and /survey/:id routes ONLY for admin
  // Do NOT hide for /surveys (survey list page)
  const activeShare = sessionStorage.getItem('active_share');

  const hideNav =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/edit-survey") ||
    location.pathname.startsWith("/create-survey") ||
    (role === "Admin" && location.pathname.startsWith("/survey")) ||
    !!activeShare;

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
          <div className="relative w-full flex items-center px-4 sm:px-6 py-4 pl-14 sm:pl-6">
            {/* left-aligned nav links (flush left) */}
            <div className="hidden sm:flex items-center gap-6">
              <Link to="/" className={`text-lg font-bold mr-4 ${navClass("/", true)}`}>GYMMY</Link>
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

            {/* mobile menu button - positioned at the left edge */}
            <div className="sm:hidden absolute left-4 top-1/2 transform -translate-y-1/2 z-40">
              <button
                onClick={() => setMobileOpen((p) => !p)}
                aria-label="Toggle Menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                className="w-10 h-10 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-700 shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* push login/logout to the far right */}
            <div className="flex items-center gap-3 ml-auto mr-4">
              {username ? (
                <>
                  <span className="text-sm">👋 {username}</span>
                  <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-gray-100">Logout</button>
                </>
              ) : (
                <Link to="/login" className={`bg-white text-blue-600 px-3 py-1 rounded ${navClass("/login", true)}`}>
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile nav items (shown when open) */}
          {mobileOpen && (
            <div id="mobile-nav" className="sm:hidden bg-blue-600 px-4 py-3 flex flex-col gap-3">
              <Link to="/" className={`hover:underline ${navClass("/", true)}`}>Home</Link>
              <Link to="/about" className={`hover:underline ${navClass("/about", true)}`}>About</Link>
              <Link to="/services" className={`hover:underline ${navClass("/services", true)}`}>Services</Link>
              <Link to="/surveys" className={`hover:underline ${navClass("/surveys", true)}`}>Surveys</Link>
              {role === "Admin" && (
                <Link to="/admin" className={`hover:underline ${navClass("/admin")}`}>Admin</Link>
              )}
              {!username ? (
                <Link to="/login" className={`bg-white text-blue-600 px-3 py-1 rounded ${navClass("/login", true)}`}>Login</Link>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded">Logout</button>
                </div>
              )}
            </div>
          )}
        </nav>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-gray-300 py-8 mt-10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">© {new Date().getFullYear()} GYMMY. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}