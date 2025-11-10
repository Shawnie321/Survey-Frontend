import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
        const res = await fetch("https://localhost:7126/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            passwordHash: password, // ✅ changed key name
        }),
        });

        if (!res.ok) throw new Error("Registration failed");
        setMessage("Registration successful! You can now log in.");
        setTimeout(() => navigate("/login"), 1500);
    } catch {
        setMessage("Registration failed. Try again.");
    }
}

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-80 space-y-4">
        <h2 className="text-xl font-semibold text-center">User Registration</h2>
        {message && <div className="text-blue-600 text-sm text-center">{message}</div>}
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
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
          Register
        </button>
        <div className="text-sm text-center mt-2">
          <Link to="/login" className="text-blue-600">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}