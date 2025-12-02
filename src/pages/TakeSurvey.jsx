import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://localhost:7126";

function SurveyQuestion({ q, value, onAnswer, isInvalid }) {
  return (
    <div
      data-qid={q.id}
      className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition ${isInvalid ? "border-2 border-red-500 bg-red-50" : "hover:shadow-2xl"}`}
      aria-invalid={isInvalid}
      aria-required={q.isRequired}
    >
      <label className={`font-semibold mb-3 block text-lg ${isInvalid ? "text-red-600" : "text-gray-800"}`} htmlFor={`q_${q.id}`}>
        {q.questionText}
        {q.isRequired ? <span className="ml-2 text-sm text-red-600">*</span> : null}
      </label>

      {q.questionType === "Text" && (
        <textarea
          id={`q_${q.id}`}
          className={`w-full border rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-500 ${isInvalid ? "border-red-400" : "border-gray-300"}`}
          rows="3"
          value={value || ""}
          onChange={(e) => onAnswer(q.id, e.target.value)}
          aria-label={q.questionText}
        />
      )}

      {q.questionType === "Rating" && (
        <div className="flex gap-2 flex-wrap mt-2" role="radiogroup" aria-label={q.questionText}>
          {[...Array(10)].map((_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={0}
              aria-checked={value === i +1}
              aria-label={`Rate ${i +1}`}
              onClick={() => onAnswer(q.id, i +1)}
              className={`px-4 py-2 rounded-full border font-semibold text-base transition ${value === i +1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"} ${isInvalid ? "ring-2 ring-red-300" : "hover:bg-blue-100"}`}
            >
              {i +1}
            </button>
          ))}
        </div>
      )}

      {q.questionType === "MultipleChoice" && (
        <div className="space-y-2 mt-2" role="radiogroup" aria-label={q.questionText}>
          {q.options?.split(",").map((opt, idx) => (
            <label key={idx} className="flex items-center gap-2 text-base">
              <input
                type="radio"
                id={`q_${q.id}_opt_${idx}`}
                name={`q_${q.id}`}
                value={opt.trim()}
                checked={value === opt.trim()}
                onChange={() => onAnswer(q.id, opt.trim())}
                aria-checked={value === opt.trim()}
                aria-label={opt.trim()}
                className="accent-blue-600"
              />
              <span>{opt.trim()}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TakeSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [invalidIds, setInvalidIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const username = localStorage.getItem("username") || "Anonymous";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/surveys/${id}`);
        if (!res.ok) throw new Error("Failed to load survey");
        const data = await res.json();
        setSurvey(data);
      } catch (err) {
        setError("Error fetching survey. Please try again later.");
        console.error("Error fetching survey:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-8 text-center" role="status" aria-live="polite">Loading survey...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  if (!survey?.questions?.length) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h2 className="text-xl font-semibold">This survey has no questions yet.</h2>
        <p className="mt-2 text-gray-600">If you are the admin, please add questions.</p>
      </div>
    );
  }

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setInvalidIds((prev) => prev.filter((id) => id !== questionId));
  };

  function validateRequiredQuestions() {
    const invalid = [];
    for (const q of survey.questions) {
      if (q.isRequired) {
        const val = answers[q.id];
        const answered = (() => {
          if (q.questionType === "Text") return typeof val === "string" && val.trim() !== "";
          if (q.questionType === "Rating") return val != null;
          if (q.questionType === "MultipleChoice") return typeof val === "string" && val.trim() !== "";
          return true;
        })();
        if (!answered) invalid.push(q.id);
      }
    }
    return invalid;
  }

  async function handleSubmit() {
    const invalid = validateRequiredQuestions();
    if (invalid.length >0) {
      setInvalidIds(invalid);
      const el = document.querySelector(`[data-qid="${invalid[0]}"]`);
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
      alert("Please answer all required questions (highlighted in red).");
      return;
    }

    const answerList = survey.questions.map((q) => {
      const val = answers[q.id];
      return {
        questionId: q.id,
        answerText: q.questionType === "Text" ? (val || "") : null,
        ratingValue: q.questionType === "Rating" ? (val ? Number(val) : null) : null,
        ...(q.questionType === "MultipleChoice" ? { answerText: val || "" } : {}),
      };
    });

    const payload = {
      username,
      answers: answerList,
    };

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/surveys/${id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to submit");
      }
      localStorage.setItem(`survey_${id}_${username}`, "completed");
      navigate("/surveys");
    } catch (err) {
      setError("Failed to submit survey. Please try again later.");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-4xl font-extrabold mb-3 text-blue-700 tracking-tight">{survey.title}</h1>
        <p className="text-gray-600 mb-8 text-lg">{survey.description}</p>

        <div className="h-3 bg-gray-200 rounded mb-8" aria-label="Progress">
          <div
            className="bg-blue-600 h-3 rounded"
            style={{ width: `${(Object.keys(answers).length / survey.questions.length) *100}%` }}
          />
        </div>

        <div className="space-y-8">
          {survey.questions.map((q) => (
            <SurveyQuestion
              key={q.id}
              q={q}
              value={answers[q.id]}
              onAnswer={handleAnswer}
              isInvalid={invalidIds.includes(q.id)}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="mt-10 bg-green-600 text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-green-700 transition text-lg"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Submitting..." : "Submit Survey"}
        </button>
      </div>
    </div>
  );
}
