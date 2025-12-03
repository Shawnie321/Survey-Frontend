import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TakeSurvey() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});
    const [invalidIds, setInvalidIds] = useState([]);
    const [consent, setConsent] = useState(false);
    const [error, setError] = useState("");
    const username = localStorage.getItem("username") || "Anonymous";

    // Identify and exclude the survey question that duplicates the consent checkbox.
    // Adjust this check if your backend uses a different wording.
    function isConsentQuestion(q) {
        const t = (q?.questionText || "").toLowerCase();
        return (
            t.includes("privacy") ||
            t.includes("consent") ||
            (t.includes("terms") && t.includes("conditions")) ||
            t.includes("terms and conditions")
        );
    }

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

    // Use only visibleQuestions (exclude consent-duplicate question)
    const visibleQuestions = survey.questions.filter((q) => !isConsentQuestion(q));

    if (!visibleQuestions || visibleQuestions.length === 0) {
        return (
            <div className="max-w-3xl mx-auto p-8 text-center">
                <h2 className="text-xl font-semibold">This survey has no questions yet.</h2>
                <p className="mt-2 text-gray-600">If you are the admin, please add questions.</p>
            </div>
        );
    }

    const handleAnswer = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
        // If this question was previously marked invalid and now has a value, clear it
        setInvalidIds((prev) => prev.filter((id) => id !== questionId));
    };

    function validateRequiredQuestions() {
        const invalid = [];
        for (const q of visibleQuestions) {
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

    async function handleSubmit(e) {
        e.preventDefault();

        if (!consent) {
            setError("You must give consent to submit this survey.");
            return;
        }

        const payload = {
            username,
            answers: visibleQuestions.map((q) => {
                const val = answers[q.id];
                return {
                    questionId: q.id,
                    answerText: q.questionType === "Text" ? (val || "") : null,
                    ratingValue: q.questionType === "Rating" ? (val ? Number(val) : null) : null,
                    // For multiple choice treat as answerText
                    ...(q.questionType === "MultipleChoice" ? { answerText: val || "" } : {}),
                };
            }),
            ConsentGiven: consent,
        };

        try {
            const res = await fetch(`https://localhost:7126/api/surveys/${id}/responses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Failed to submit");
            }
            localStorage.setItem(`survey_${id}_${username}`, "completed");
            setConsent(false);
            setError("");
            navigate("/surveys");
        } catch (err) {
            setError(err?.message || "Submission failed");
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-3">{survey.title}</h1>
            <p className="text-gray-600 mb-6">{survey.description}</p>

            <div className="h-3 bg-gray-200 rounded mb-6">
                <div
                    className="bg-blue-600 h-3 rounded"
                    style={{ width: `${(Object.keys(answers).length / visibleQuestions.length) * 100}%` }}
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {visibleQuestions.map((q) => {
                    const isInvalid = invalidIds.includes(q.id);
                    return (
                        <div
                            key={q.id}
                            data-qid={q.id}
                            className={`bg-white p-4 rounded shadow ${isInvalid ? "border-2 border-red-500 bg-red-50" : ""}`}
                        >
                            <p className={`font-semibold mb-3 ${isInvalid ? "text-red-600" : ""}`}>
                                {q.questionText}
                                {q.isRequired ? <span className="ml-2 text-sm text-red-600">*</span> : null}
                            </p>

                            {q.questionType === "Text" && (
                                <textarea
                                    className={`w-full border rounded p-2 ${isInvalid ? "border-red-400" : ""}`}
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
                                            className={`px-3 py-1 rounded border ${answers[q.id] === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100"} ${isInvalid ? "ring-2 ring-red-300" : ""}`}
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
                    );
                })}

                {/* Consent checkbox */}
                <div className="flex items-start gap-3">
                    <input
                        id="consent"
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => { setConsent(e.target.checked); if (error) setError(""); }}
                        className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="consent" className="text-sm text-gray-700">
                        I agree to the privacy terms and conditions. <span className="text-gray-400">(Required)</span>
                    </label>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button type="submit" className="mt-6 bg-green-600 text-white px-6 py-2 rounded">Submit Survey</button>
            </form>
        </div>
    );
}
