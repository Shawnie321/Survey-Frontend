import { useState } from "react";

export default function Survey() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submitForm(e) {
    e.preventDefault();

    const payload = {
      name,
      rating: Number(rating),
      comment
    };

    try {
      const response = await fetch("https://localhost:7126/api/surveyresponses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSent(true);
      setName("");
      setRating(5);
      setComment("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to send response. Check if the API is running.");
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Customer Survey</h2>

      {!sent ? (
        <form onSubmit={submitForm} className="space-y-4 bg-white p-6 rounded shadow">
          {error && <div className="bg-red-100 text-red-600 p-3 rounded">{error}</div>}

          <label className="block">
            <span className="text-sm font-medium">Your name (optional)</span>
            <input value={name} onChange={e => setName(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2" placeholder="John Doe" />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Overall satisfaction (1–10)</span>
            <input type="range" min="1" max="10" value={rating}
              onChange={e => setRating(e.target.value)} className="w-full mt-2" />
            <div className="text-sm text-gray-600 mt-1">Selected: {rating}</div>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Comments</span>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2" rows="4" />
          </label>

          <div className="text-right">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
          </div>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 p-6 rounded text-center">
          <h3 className="text-lg font-medium text-green-700">Thank you!</h3>
          <p className="mt-2 text-gray-700">Your feedback has been submitted.</p>
          <button onClick={() => setSent(false)} className="mt-4 bg-blue-600 text-white px-3 py-1 rounded">Submit another</button>
        </div>
      )}
    </div>
  );
}
