import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const menuEl = menuRef.current;
    const buttonEl = buttonRef.current;
    if (!menuEl) return;

    const focusableSelectors = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(menuEl.querySelectorAll(focusableSelectors)).filter((el) => !el.hasAttribute('disabled'));
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    // Focus first element
    firstEl?.focus();

    function onKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonEl?.focus();
      }
      if (e.key === "Tab") {
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    }

    function onClickOutside(e) {
      if (!menuEl.contains(e.target) && !buttonEl?.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open]);
  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-semibold text-lg">SurveySite</div>
        <div className="hidden sm:flex space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/survey" className="hover:underline">Survey</Link>
          <Link to="/admin" className="hover:underline">Admin</Link>
        </div>

        <div className="sm:hidden">
          <button ref={buttonRef} onClick={() => setOpen((p) => !p)} className="p-2 rounded bg-blue-500 hover:bg-blue-700" aria-controls="nav-menu" aria-expanded={open} aria-label="Toggle navigation menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div id="nav-menu" ref={menuRef} className="sm:hidden px-4 pb-4" role="menu">
          <Link role="menuitem" to="/" className="block py-2 hover:underline">Home</Link>
          <Link role="menuitem" to="/about" className="block py-2 hover:underline">About</Link>
          <Link role="menuitem" to="/survey" className="block py-2 hover:underline">Survey</Link>
          <Link role="menuitem" to="/admin" className="block py-2 hover:underline">Admin</Link>
        </div>
      )}

      {/* Accessibility handled when menu is open via useEffect */}
    </nav>
  );
}
