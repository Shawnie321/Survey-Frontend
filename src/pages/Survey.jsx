import { useState } from "react";

export default function Survey() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  async function submitForm(e) {
    e.preventDefault();

    if (!consent) {
      setError("You must give consent to submit this survey.");
      return;
    }

    const payload = {
      name,
      email,
      rating: Number(rating),
      comment,
      ConsentGiven: consent,
    };

    try {
      const response = await fetch("https://localhost:7126/api/surveyresponses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Submission failed");

      setSent(true);
      setName("");
      setEmail("");
      setRating(5);
      setComment("");
      setError("");
    } catch (err) {
      setError("Failed to send response. Check if the API is running.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
          Customer Feedback
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Your feedback helps us improve our services.
        </p>
      </div>

      {!sent ? (
        <form
          onSubmit={submitForm}
          className="p-8 rounded-2xl shadow-2xl bg-white/60 backdrop-blur-sm border border-white/20 space-y-6 transition-transform hover:scale-[1.01]"
        >
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-100">
              {error}
            </div>
          )}

          {/* NAME FIELD */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-gray-600 mb-1">
              Name (optional)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-white/80 border border-transparent rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 transition placeholder-gray-400"
              placeholder="John Doe"
            />
          </div>

          {/* EMAIL FIELD */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-gray-600 mb-1">
              Email (optional)
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full bg-white/80 border border-transparent rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 transition placeholder-gray-400"
              placeholder="john@example.com"
              type="email"
            />
          </div>

          {/* RATING FIELD */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-gray-600 mb-2">
              How satisfied are you? (1–10)
            </label>

            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full mt-1 accent-indigo-500"
            />

            <div className="mt-3 flex items-center justify-between">
              <span className="text-gray-500 text-sm">Not satisfied</span>
              <span className="text-xl font-semibold text-indigo-600">
                {rating} ⭐
              </span>
              <span className="text-gray-500 text-sm">Very satisfied</span>
            </div>
          </div>

          {/* COMMENTS FIELD */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-gray-600 mb-1">
              Additional comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 block w-full bg-white/80 border border-transparent rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition resize-none placeholder-gray-400"
              rows="4"
              placeholder="Tell us about your experience..."
            />
          </div>

          {/* CONSENT FIELD */}
          <div className="flex items-start gap-3">
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => { setConsent(e.target.checked); if (error) setError(""); }}
              className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I consent to the processing and storage of my response for analysis.{" "}
              <span className="text-gray-400">(Required)</span>
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="text-right">
            <button
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl shadow-md transform transition hover:-translate-y-0.5"
              type="submit"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gradient-to-br from-white/70 to-green-50 border border-green-200 p-8 rounded-xl text-center shadow-lg">
          <h3 className="text-xl font-semibold text-green-700">
            🎉 Thank you for your feedback!
          </h3>
          <p className="mt-2 text-gray-700">
            Your response has been submitted successfully.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Submit Another Response
          </button>
        </div>
      )}
    </div>
  );
}
