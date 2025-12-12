import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminHeader({ username, isReview, role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const menuEl = menuRef.current;
    const buttonEl = buttonRef.current;
    if (!menuEl) return;

    const focusableSelectors = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(menuEl.querySelectorAll(focusableSelectors)).filter((el) => !el.hasAttribute('disabled'));
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    firstEl?.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        buttonEl?.focus();
      }
      if (e.key === 'Tab') {
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    }

    function onClickOutside(e) {
      if (!menuEl.contains(e.target) && !buttonEl?.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [menuOpen]);

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
      <div className="relative w-full">
        {/* leftmost hamburger - uses absolute so it sits at viewport edge */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50">
          <button
            ref={buttonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            className="relative w-10 h-10 flex items-center justify-center hover:bg-blue-700 rounded transition overflow-visible"
          >
            {/* Absolute spans positioned at the center to create a consistent X animation */}
            <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 transform origin-center transition duration-200 ease-in-out block w-5 h-0.5 bg-white pointer-events-none ${menuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
            <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 transform origin-center transition duration-200 ease-in-out block w-5 h-0.5 bg-white pointer-events-none ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 transform origin-center transition duration-200 ease-in-out block w-5 h-0.5 bg-white pointer-events-none ${menuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center pl-14 sm:pl-16">
          <div className="text-lg sm:text-3xl font-extrabold tracking-wider">Admin Dashboard</div>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div id="admin-menu" ref={menuRef} role="menu" className="sm:absolute sm:top-16 sm:right-6 absolute top-16 right-0 left-0 p-2 sm:w-48 bg-white text-gray-800 rounded-lg shadow-xl z-50">
            {onDashboard && (
              <button
                onClick={() => handleNavigate("/create-survey")}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition font-medium flex items-center gap-2"
                role="menuitem"
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
              role="menuitem"
            >
              📋 Surveys
            </button>
            <hr className="my-1" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition font-medium flex items-center gap-2"
              role="menuitem"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
