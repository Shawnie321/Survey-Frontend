import { useState } from "react";

export default function CreateSurvey() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: "Text",
    options: "",
    isRequired: false,
  });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // ✅ Add a new question to the list
  const addQuestion = () => {
    if (!newQuestion.questionText.trim()) {
      setMessage("Please enter a question text.");
      return;
    }
    setQuestions([...questions, newQuestion]);
    setNewQuestion({ questionText: "", questionType: "Text", options: "", isRequired: false });
    setMessage("");
  };

  // ✅ Remove question
  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // ✅ Submit survey + questions in one API call
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || questions.length === 0) {
      setMessage("Please add a title and at least one question.");
      return;
    }

    const payload = {
      title,
      description,
      createdBy: username,
      questions, // array of question objects (includes isRequired)
    };

    try {
      const res = await fetch("https://localhost:7126/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create survey");
      }

      const data = await res.json();
      console.log("Survey created:", data);

      setMessage("✅ Survey created successfully!");
      setTitle("");
      setDescription("");
      setQuestions([]);
    } catch (err) {
      console.error("Error creating survey:", err);
      setMessage("❌ Error creating survey. Check console for details.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">
        Create a New Survey
      </h2>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-3 rounded text-center ${
            message.includes("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 space-y-6"
      >
        {/* Survey Title and Description */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Survey Title
          </label>
          <input
            type="text"
            placeholder="Enter survey title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-4 focus:ring-2 focus:ring-blue-500"
          />

          <label className="block text-gray-700 font-semibold mb-2">
            Description
          </label>
          <textarea
            placeholder="Describe your survey (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Add Question Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Add Questions
          </h3>

          {/* Question Input */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Enter question text"
              value={newQuestion.questionText}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  questionText: e.target.value,
                })
              }
              className="flex-1 border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={newQuestion.questionType}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  questionType: e.target.value,
                })
              }
              className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Text">Text</option>
              <option value="Rating">Rating (1–10)</option>
              <option value="MultipleChoice">Multiple Choice</option>
            </select>
          </div>

          {/* Multiple choice options input */}
          {newQuestion.questionType === "MultipleChoice" && (
            <input
              type="text"
              placeholder="Enter choices separated by commas (e.g. Yes,No,Maybe)"
              value={newQuestion.options}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, options: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* Required checkbox */}
          <div className="flex items-center gap-2 mt-2 mb-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={newQuestion.isRequired}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, isRequired: e.target.checked })
                }
                className="mr-2"
              />
              Required
            </label>
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Question
          </button>
        </div>

        {/* Preview of Added Questions */}
        {questions.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3 text-gray-800">
              Preview ({questions.length})
            </h4>
            <ul className="divide-y">
              {questions.map((q, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-3"
                >
                  <div>
                    <p className="font-medium">{q.questionText}</p>
                    <p className="text-sm text-gray-500">
                      Type: {q.questionType}
                      {q.options && <span> — Options: {q.options}</span>}
                      {q.isRequired && <span> — Required</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Survey Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Save Survey
          </button>
        </div>
      </form>
    </div>
  );
}