import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://localhost:7126";

export default function EditSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadSurvey() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/surveys/${id}`);
        if (!res.ok) throw new Error("Failed to load survey");
        const data = await res.json();
        setTitle(data.title);
        setDescription(data.description);
        // Normalize questions to editable shape
        const normalized = (data.questions || []).map((q) => ({
          id: q.id ?? q.questionId ?? null,
          questionText: q.questionText ?? q.text ?? "",
          questionType:
            q.questionType ?? (q.type === "rating" ? "Rating" : q.type === "text" ? "Text" : q.type === "multiple" ? "MultipleChoice" : "Text"),
          options: q.options ?? q.choices ?? "",
          isRequired: !!(q.isRequired ?? q.required ?? false),
        }));
        setQuestions(normalized);
      } catch {
        setError("Error loading survey.");
      } finally {
        setLoading(false);
      }
    }
    loadSurvey();
  }, [id]);

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { id: null, questionText: "", questionType: "Text", options: "", isRequired: false },
    ]);
  }

  function removeQuestion(index) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index, field, value) {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function toggleRequired(index) {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isRequired: !updated[index].isRequired };
      return updated;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    if (!title.trim()) {
      setMessage("Please add a title.");
      return;
    }
    if (questions.some((q) => !q.questionText.trim())) {
      setMessage("All questions must have text.");
      return;
    }

    const payload = {
      title,
      description,
      questions: questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.questionType === "MultipleChoice" ? (q.options || "") : "",
        isRequired: !!q.isRequired,
      })),
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/surveys/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || "Failed to save survey");
      }
      setMessage("Survey Updated Successfully!");
      setTimeout(() => navigate("/admin"), 1200);
    } catch (err) {
      console.error("Save error:", err);
      setMessage("Error saving survey. See console for details.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <>
      <AdminHeader username={localStorage.getItem("username")}/>
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Edit Survey</h2>

        {message && (
          <div
            className={`mb-6 p-3 rounded text-center ${message.includes("Successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Survey Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4 focus:ring-2 focus:ring-blue-500"
            />

            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Questions</h3>
            {questions.length === 0 ? (
              <p className="text-gray-500">No questions in this survey.</p>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id ?? idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <label className="font-medium text-gray-700">Question {idx + 1}</label>
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => updateQuestion(idx, "questionText", e.target.value)}
                      placeholder="Enter question text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={q.questionType}
                      onChange={(e) => updateQuestion(idx, "questionType", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Rating">Rating (1-10)</option>
                      <option value="Text">Text</option>
                      <option value="MultipleChoice">Multiple Choice</option>
                    </select>

                    {q.questionType === "MultipleChoice" && (
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

                <div>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    + Add Question
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
