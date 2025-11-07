import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-semibold text-lg">SurveySite</div>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/survey" className="hover:underline">Survey</Link>
          <Link to="/admin" className="hover:underline">Admin</Link>
        </div>
      </div>
    </nav>
  );
}
