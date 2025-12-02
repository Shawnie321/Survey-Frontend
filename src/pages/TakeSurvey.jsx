import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TakeSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const username = localStorage.getItem("username") || "Anonymous";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`https://localhost:7126/api/surveys/${id}`);
        if (!res.ok) throw new Error("Failed to load survey");
        const data = await res.json();
        setSurvey(data);
      } catch (err) {
        console.error("Error fetching survey:", err);
      }
    }
    load();
  }, [id]);

  if (!survey) return <div className="p-8 text-center">Loading survey...</div>;

  if (!survey.questions || survey.questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h2 className="text-xl font-semibold">This survey has no questions yet.</h2>
        <p className="mt-2 text-gray-600">If you are the admin, please add questions.</p>
      </div>
    );
  }

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  async function handleSubmit() {
    // Build answers array in server format
    const answerList = survey.questions.map((q) => {
      const val = answers[q.id];
      return {
        questionId: q.id,
        answerText: q.questionType === "Text" ? (val || "") : null,
        ratingValue: q.questionType === "Rating" ? (val ? Number(val) : (null)) : null,
        // For multiple choice treat as answerText
        ...(q.questionType === "MultipleChoice" ? { answerText: val || "" } : {})
      };
    });

    const payload = {
      username,
      answers: answerList
    };

    try {
      const res = await fetch(`https://localhost:7126/api/surveys/${id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to submit");
      }
      localStorage.setItem(`survey_${id}_${username}`, "completed");
      navigate("/surveys");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit survey.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-3">{survey.title}</h1>
      <p className="text-gray-600 mb-6">{survey.description}</p>

      <div className="h-3 bg-gray-200 rounded mb-6">
        <div
          className="bg-blue-600 h-3 rounded"
          style={{ width: `${(Object.keys(answers).length / survey.questions.length) * 100}%` }}
        />
      </div>

      <div className="space-y-6">
        {survey.questions.map((q) => (
          <div key={q.id} className="bg-white p-4 rounded shadow">
            <p className="font-semibold mb-3">{q.questionText}</p>

            {q.questionType === "Text" && (
              <textarea
                className="w-full border rounded p-2"
                rows="3"
                value={answers[q.id] || ""}
                onChange={(e) => handleAnswer(q.id, e.target.value)}
              />
            )}

            {q.questionType === "Rating" && (
              <div className="flex gap-2 flex-wrap">
                {[...Array(10)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(q.id, i + 1)}
                    className={`px-3 py-1 rounded border ${answers[q.id] === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

            {q.questionType === "MultipleChoice" && (
              <div className="space-y-2">
                {q.options?.split(",").map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={opt.trim()}
                      checked={answers[q.id] === opt.trim()}
                      onChange={() => handleAnswer(q.id, opt.trim())}
                    />
                    <span>{opt.trim()}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className="mt-6 bg-green-600 text-white px-6 py-2 rounded">Submit Survey</button>
    </div>
  );
}
