import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
  e.preventDefault();

  try {
    const res = await fetch("https://localhost:7126/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        passwordHash: password, // ✅ changed key name
      }),
    });

    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("username", data.username);

    if (data.role === "Admin") navigate("/admin");
    else navigate("/");
  } catch (err) {
    setError("Invalid username or password");
  }
}

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80 space-y-4">
        <h2 className="text-xl font-semibold text-center">User Login</h2>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>
        <div className="text-sm text-center mt-2">
          Don’t have an account? <Link to="/register" className="text-blue-600">Register</Link>
        </div>
        <div className="text-sm text-center mt-2">
          <Link to="/admin-login" className="text-gray-500 underline">Admin Login</Link>
        </div>
      </form>
    </div>
  );
}