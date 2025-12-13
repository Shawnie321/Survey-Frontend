import { useState } from "react";
import { apiFetch } from "../utils/api";

export default function CreateQuestionForm({ surveyId, onCreated }) {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("Text");
  const [options, setOptions] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    const payload = {
      questionText,
      questionType,
      options: options || null,
      isRequired,
    };

    try {
      const res = await apiFetch(`/api/surveys/${surveyId}/questions`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setLoading(false);

      if (res.ok) {
        const data = await res.json();
        onCreated?.(data);
        setQuestionText("");
        setOptions("");
        setIsRequired(false);
      } else {
        const txt = await res.text();
        alert("Failed to create question: " + txt);
      }
    } catch (err) {
      setLoading(false);
      console.error("Error creating question:", err);
      alert("Failed to create question: " + (err.message || err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Question</label>
        <input
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
          maxLength={300}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Type</label>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="Text">Text</option>
          <option value="Rating">Rating</option>
          <option value="MultipleChoice">MultipleChoice</option>
        </select>
      </div>

      {questionType === "MultipleChoice" && (
        <div>
          <label className="block text-sm font-medium">Options (comma-separated)</label>
          <input
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      )}

      <div>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">Required</span>
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
