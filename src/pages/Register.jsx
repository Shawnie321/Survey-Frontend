import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(""); // YYYY-MM-DD
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function validate() {
    if (!firstName.trim() || firstName.trim().length < 3) return "First Name must be at least 3 characters.";
    if (!lastName.trim() || lastName.trim().length < 3) return "Last Name must be at least 3 characters.";
    if (!dateOfBirth) return "Date of Birth is required.";
    // ensure at least 16 years old
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear() - (today < new Date(dob.getFullYear() + (today.getMonth() - dob.getMonth() < 0 ? 1 : 0), dob.getMonth(), dob.getDate()) ? 1 : 0);
    // simpler accurate age calc:
    const ageCalc = new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970;
    if (ageCalc < 16) return "You must be at least 16 years old to register.";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return "A valid email is required.";
    if (!username.trim() || username.trim().length < 6) return "Username must be at least 6 characters.";
    if (!password || password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  }

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("");
    const validationError = validate();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        // Aligns with UserCreateDto property names and casing
        FirstName: firstName.trim(),
        MiddleName: middleName.trim() || null,
        LastName: lastName.trim(),
        DateOfBirth: dateOfBirth, // send YYYY-MM-DD (backend DateOnly)
        Email: email.trim(),
        PhoneNumber: phoneNumber.trim() || null,
        Username: username.trim(),
        Password: password,
        ConfirmPassword: confirmPassword,
        Role: "User"
        // CreatedAt omitted so server can set it
      };

      const res = await fetch("https://localhost:7126/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errText = "Registration failed. Try again.";
        try {
          const data = await res.json();
          if (data?.message) errText = data.message;
          else if (data?.errors) errText = Object.values(data.errors).flat().join(" ");
        } catch {}
        throw new Error(errText);
      }

      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      setMessage(err?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-full max-w-lg space-y-3">
        <h2 className="text-xl font-semibold text-center">User Registration</h2>

        {message && <div className="text-sm text-center text-blue-600">{message}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Middle Name (optional)"
            value={middleName}
            onChange={e => setMiddleName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={dateOfBirth}
            onChange={e => setDateOfBirth(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          type="tel"
          placeholder="Phone Number (optional)"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="text"
          placeholder="Username (min 6 chars)"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <div className="text-sm text-center mt-2">
          <Link to="/login" className="text-blue-600">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}