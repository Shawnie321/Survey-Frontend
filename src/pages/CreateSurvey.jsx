import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";

export default function CreateSurvey() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // keep current UI default question but support full question shape
  const [questions, setQuestions] = useState([{ text: "", type: "rating", options: "", isRequired: false }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (role !== "Admin") navigate("/login");
  }, [navigate, role]);

  function addQuestion() {
    setQuestions([...questions, { text: "", type: "rating", options: "", isRequired: false }]);
  }

  function removeQuestion(index) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(index, field, value) {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  }

  // New: allow toggling required for a question
  function toggleRequired(index) {
    const updated = [...questions];
    updated[index].isRequired = !updated[index].isRequired;
    setQuestions(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a survey title.");
      return;
    }
    if (questions.some((q) => !q.text.trim())) {
      setMessage("All questions must have text");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      // Prepare questions in the shape expected by older backend: questionText, questionType, options, isRequired
      const payloadQuestions = questions.map((q) => {
        return {
          questionText: q.text,
          questionType: q.type === "rating" ? "Rating" : q.type === "text" ? "Text" : "MultipleChoice",
          options: q.type === "multiple" || q.type === "MultipleChoice" ? (q.options || "") : "",
          isRequired: !!q.isRequired,
        };
      });

      const res = await fetch("https://localhost:7126/api/surveys", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          createdBy: username,
          questions: payloadQuestions,
        }),
      });

      if (!res.ok) {
        console.error("Error creating survey:", res.status);
        const text = await res.text().catch(() => null);
        alert(`Error creating survey: ${res.status} ${text ? '- ' + text : ''}`);
        return;
      }

      alert("Survey created successfully!");
      navigate("/admin");
    } catch (e) {
      console.error("Error:", e);
      alert("Failed to create survey");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminHeader username={username} currentPage="create" />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Create New Survey</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Survey Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter survey title"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter survey description"
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Questions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Questions</h2>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-medium text-gray-700">Question {idx + 1}</label>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                    placeholder="Enter question text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(idx, "type", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="rating">Rating (1-5)</option>
                    <option value="text">Text</option>
                    <option value="multiple">Multiple Choice</option>
                  </select>

                  {/* If multiple choice, show options input and required toggle */}
                  {q.type === "multiple" && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Options (comma separated)</label>
                      <input
                        type="text"
                        value={q.options}
                        onChange={(e) => updateQuestion(idx, "options", e.target.value)}
                        placeholder="e.g. Yes,No,Maybe"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={!!q.isRequired}
                        onChange={() => toggleRequired(idx)}
                        className="mr-2"
                      />
                      Required
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Add Question
            </button>
          </div>

          {/* Message area from older UI */}
          {message && (
            <div className={`p-3 rounded ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Survey"}
          </button>
        </form>
      </div>
    </>
  );
}