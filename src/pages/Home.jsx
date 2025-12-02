import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-blue-600">Welcome, {username || "Guest"}!</h1>
      <p className="mt-4 text-gray-700">
        This is your user homepage. You can participate in surveys and view your results.
      </p>

      <div className="mt-6 flex justify-center gap-4">
        <Link to="/surveys" className="bg-blue-600 text-white px-4 py-2 rounded">Take Survey</Link>
        {role === "Admin" && (
          <Link to="/admin" className="bg-green-600 text-white px-4 py-2 rounded">
            Go to Admin Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}