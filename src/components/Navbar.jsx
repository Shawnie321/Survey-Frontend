import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* BRAND / LOGO */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          SurveySite
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
          <Link to="/" className="px-3 py-1 rounded-lg hover:bg-indigo-50">Home</Link>
          <Link to="/about" className="px-3 py-1 rounded-lg hover:bg-indigo-50">About</Link>
          <Link to="/surveys" className="px-3 py-1 rounded-lg hover:bg-indigo-50">Surveys</Link>

          {role === "Admin" && (
            <Link to="/admin" className="px-3 py-1 rounded-lg hover:bg-indigo-50">
              Admin Dashboard
            </Link>
          )}

          {!username ? (
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-md transition"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:shadow-md transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-gray-700 text-2xl"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {open && (
        <div className="md:hidden bg-white/90 backdrop-blur-sm border-t shadow-lg text-gray-700">
          <div className="flex flex-col p-4 gap-3 text-lg">

            <Link to="/" className="hover:text-indigo-600" onClick={() => setOpen(false)}>
              Home
            </Link>

            <Link to="/about" className="hover:text-indigo-600" onClick={() => setOpen(false)}>
              About
            </Link>

            <Link to="/surveys" className="hover:text-indigo-600" onClick={() => setOpen(false)}>
              Surveys
            </Link>

            {role === "Admin" && (
              <Link
                to="/admin"
                className="hover:text-indigo-600"
                onClick={() => setOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}

            {!username ? (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded text-center mt-2"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            ) : (
              <button
                onClick={() => { setOpen(false); handleLogout(); }}
                className="bg-red-500 text-white px-4 py-2 rounded mt-2"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
