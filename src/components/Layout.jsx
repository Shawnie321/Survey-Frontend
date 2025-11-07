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
    <div className="min-h-screen flex flex-col">
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-semibold hover:underline">Home</Link>
            <Link to="/About" className="hover:underline">About</Link>
            <Link to="/services" className="hover:underline">Services</Link>
            <Link to="/surveys" className="hover:underline">Surveys</Link>
            {role === "Admin" && (
              <>
                <Link to="/create-survey" className="hover:underline">Create Survey</Link>
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

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} — Your App
      </footer>
    </div>
  );
}