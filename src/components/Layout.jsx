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
    localStorage.clear();
    navigate("/login");
  }

  // Hide navigation bar for /admin and /edit-survey/:id routes
  const hideNav = location.pathname === "/admin" || location.pathname.startsWith("/edit-survey");

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && (
        <nav className="bg-blue-600 text-white p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to="/" className="font-semibold hover:underline">Home</Link>
              <Link to="/About" className="hover:underline">About</Link>
              <Link to="/services" className="hover:underline">Services</Link>
              <Link to="/surveys" className="hover:underline">Surveys</Link>
              {role === "Admin" && (
                <>
                  {/* <Link to="/create-survey" className="hover:underline">Create Survey</Link> */}
                  <Link to="/admin" className="hover:underline">Admin</Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {username ? (
                <>
                  <span className="text-sm">👋 {username}</span>
                  <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded">Logout</button>
                </>
              ) : (
                <Link to="/login" className="bg-white text-blue-600 px-3 py-1 rounded">Login</Link>
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