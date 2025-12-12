import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://localhost:7126";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const user = username.trim();
    const pass = password;

    if (!user || !pass) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
      });

      // Try to parse any JSON body (success or error) so we can surface server messages
      let payload = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }

      if (!res.ok) {
        const serverMsg =
          payload && (payload.message || payload.error) ? (payload.message || payload.error) : res.statusText;
        throw new Error(serverMsg || "Login failed");
      }

      // Expecting payload to be JSON with token, role, username - adapt field names if backend differs
      const data = payload ?? {};
      if (data.role !== "Admin") {
        setError("You are not authorized as an admin.");
        return;
      }

      if (!data.token) {
        setError("Authentication succeeded but no token was returned by the server.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username ?? user);
      navigate("/admin");
    } catch (err) {
      // Provide the server message when available, otherwise a friendly fallback
      setError(err?.message ?? "Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          {/* Back button positioned at the upper-left corner */}
          <button
              onClick={() => navigate('/')}
              className="absolute top-4 left-4 text-gray-800 px-3 py-2 rounded hover:bg-gray-200 z-50"
          >
              ← Back to Home
          </button>
      <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-xs sm:w-80 space-y-4">
        <h2 className="text-xl font-semibold text-center">Admin Login</h2>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input
          type="text"
          placeholder="Admin Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2"
          disabled={loading}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          disabled={loading}
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="text-sm text-center mt-2">
          <Link to="/login" className="text-gray-500 underline">Back to User Login</Link>
        </div>
      </form>
    </div>
  );
}