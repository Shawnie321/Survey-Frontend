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
 <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
 <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
 <h1 className="text-4xl font-extrabold text-blue-700 mb-4 tracking-tight">Welcome, {username || "Guest"}!</h1>
 <p className="mb-8 text-gray-700 text-lg">
 This is your user homepage. You can participate in surveys and view your results.
 </p>

 <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
 <Link to="/surveys" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-blue-700 transition">Take Survey</Link>
 {role === "Admin" && (
 <Link to="/admin" className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-green-700 transition">
 Go to Admin Dashboard
 </Link>
 )}
 </div>
 {username && (
 <button onClick={handleLogout} className="mt-2 text-sm text-gray-500 underline hover:text-blue-600">Logout</button>
 )}
 </div>
 </div>
 );
}