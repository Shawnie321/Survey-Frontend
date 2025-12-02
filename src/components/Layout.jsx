import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Layout() {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setUsername(localStorage.getItem("username"));
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-semibold hover:underline text-lg">
              SurveySite
            </Link>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/" className="px-3 py-1 rounded-lg hover:bg-white/10">Home</Link>
              <Link to="/About" className="px-3 py-1 rounded-lg hover:bg-white/10">About</Link>
              <Link to="/services" className="px-3 py-1 rounded-lg hover:bg-white/10">Services</Link>
              <Link to="/surveys" className="px-3 py-1 rounded-lg hover:bg-white/10">Surveys</Link>
              {role === "Admin" && (
                <>
                  <Link to="/create-survey" className="px-3 py-1 rounded-lg hover:bg-white/10">Create Survey</Link>
                  <Link to="/admin" className="px-3 py-1 rounded-lg hover:bg-white/10">Admin</Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {username ? (
              <>
                <span className="text-sm bg-white/10 px-3 py-1 rounded-full">{username}</span>
                <button onClick={handleLogout} className="bg-white text-indigo-600 px-3 py-1 rounded-lg shadow-sm">Logout</button>
              </>
            ) : (
              <Link to="/login" className="bg-white text-indigo-600 px-3 py-1 rounded-lg shadow-sm">Login</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}