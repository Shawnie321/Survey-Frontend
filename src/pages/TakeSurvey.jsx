import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import Markdown from "react-markdown";

const TERMS_AND_CONDITIONS = `
# **Terms and Conditions**
**Please read these terms and conditions carefully before using our survey application.**

**1. Introduction**
By accessing or using the survey application, you agree to be bound by these terms and conditions. If you do not agree with any part of these terms, you must not use the application.

**2. User Accounts**
To access certain features of the application, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information, including your password. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.

**3. Survey Participation**
Your participation in surveys is voluntary. You have the right to refuse to participate or to withdraw from a survey at any time without penalty.

**4. Privacy**
We are committed to protecting your privacy. Your responses to surveys are anonymous, and we do not collect personally identifiable information unless you provide it voluntarily.

**5. Intellectual Property**
All content and materials available on the application, including but not limited to text, graphics, logos, and software, are the property of the application or its content suppliers and are protected by intellectual property laws.

**6. Disclaimers**
The application is provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, regarding the operation of the application or the information, content, materials, or products included in the application.

**7. Limitation of Liability**
To the fullest extent permitted by law, we shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with the use of the application or the participation in surveys.

**8. Changes to Terms**
We reserve the right to modify these terms and conditions at any time. Your continued use of the application after any changes constitutes your acceptance of the new terms.

**9. Governing Law**
These terms and conditions shall be governed by and construed in accordance with the laws of the jurisdiction in which the application operates.

**10. Contact Us**

If you have any questions or concerns about these terms and conditions, please contact us at **gymsurvey@app.com**.

--

*Last updated: December 07,2025*`;

export default function TakeSurvey() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});
    const [invalidIds, setInvalidIds] = useState([]);
    const [consent, setConsent] = useState(false);
    const [error, setError] = useState("");
    const [isReview, setIsReview] = useState(false);
    const [isSharedView, setIsSharedView] = useState(false);
    const [reviewResponse, setReviewResponse] = useState(null);
    const [reviewAnswers, setReviewAnswers] = useState(null); // map questionId -> string
    const [showTerms, setShowTerms] = useState(false);
    const username = localStorage.getItem("username") || "Anonymous";
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("review") === "true") setIsReview(true);
        const share = params.get("share");
        if (share) {
            // set active share session so navigation is restricted
            sessionStorage.setItem("active_share", JSON.stringify({ id, share }));
            setIsSharedView(true);
        } else {
            setIsSharedView(false);
        }
    }, [location.search, id]);

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
                const p = new URLSearchParams(location.search);
                const share = p.get("share");
                const url = `https://localhost:7126/api/surveys/${id}${share ? "?share=" + encodeURIComponent(share) : ""}`;
                const res = await fetch(url, { headers: share ? { 'X-Share-Key': share } : {} });
                if (!res.ok) {
                    if (res.status === 403) {
                        setError("Access denied. This survey is only accessible via a private link.");
                        return;
                    }
                    throw new Error("Failed to load survey");
                }
                const data = await res.json();

                // If a share param exists, validate that it corresponds to this survey id at least client-side.
                if (share) {
                    try {
                        const decoded = JSON.parse(atob(share));
                        if (String(decoded.id) !== String(id)) {
                            setError("Invalid share link for this survey.");
                            return;
                        }
                    } catch (e) {
                        // if it fails to decode, treat as invalid
                        console.warn('Invalid share token format', e);
                        setError("Invalid share link.");
                        return;
                    }
                }

                setSurvey(data);

                // Check skip flag (set when user requests a retake) � prevents auto review detection
                const skipKey = `skip_review_${id}`;
                const skip = sessionStorage.getItem(skipKey) === "1";
                if (skip) {
                    sessionStorage.removeItem(skipKey);
                    // intentionally do not auto-enter review mode
                    return;
                }

                // If review already forced, still try to fetch answers for display
                if (isReview) {
                    // Try answers endpoint first
                    if (token) {
                        try {
                            const ansRes = await fetch(`https://localhost:7126/api/surveys/${id}/responses/user/me/answers`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            if (ansRes.ok) {
                                const ansData = await ansRes.json();
                                const map = {};
                                (ansData || []).forEach(a => {
                                    if (!a) return;
                                    const qid = String(a.questionId ?? a.questionId);
                                    const val = a.answerText ?? (a.ratingValue != null ? String(a.ratingValue) : "");
                                    map[qid] = val;
                                });
                                setReviewAnswers(map);
                                return;
                            }
                        } catch (e) {
                            console.error("Error fetching answers endpoint:", e);
                        }
                    }

                    // fallback: fetch all responses
                    try {
                        const rres = await fetch(`https://localhost:7126/api/surveys/${id}/responses`);
                        if (rres.ok) {
                            const rdata = await rres.json();
                            const match = (rdata || []).reverse().find(r => (r.username || "Anonymous") === username);
                            setReviewResponse(match || null);
                            if (match && match.answers) {
                                const map = {};
                                (match.answers || []).forEach(a => {
                                    const qid = String(a.questionId ?? a.questionId);
                                    const val = a.answerText ?? (a.ratingValue != null ? String(a.ratingValue) : "");
                                    map[qid] = val;
                                });
                                setReviewAnswers(map);
                            }
                        }
                    } catch (e) {
                        console.error("Error fetching responses:", e);
                    }
                } else {
                    // If not already in review and token present, optionally check server for existing answers to auto-set review
                    if (token) {
                        try {
                            const checkRes = await fetch(`https://localhost:7126/api/surveys/${id}/responses/user/me/answers`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            if (checkRes.ok) {
                                const checkData = await checkRes.json();
                                if (Array.isArray(checkData) && checkData.length > 0) {
                                    const map = {};
                                    checkData.forEach((a) => {
                                        const qid = String(a.questionId ?? a.questionId);
                                        const val = a.answerText ?? (a.ratingValue != null ? String(a.ratingValue) : "");
                                        map[qid] = val;
                                    });
                                    setReviewAnswers(map);
                                    setIsReview(true);
                                }
                            }
                        } catch (e) {
                            console.error("Error checking existing answers:", e);
                        }
                    } else {
                        // Fallback to localStorage flag
                        const completedKey = `survey_${id}_${localStorage.getItem("username") || "Anonymous"}`;
                        const completed = localStorage.getItem(completedKey);
                        if (completed) {
                            setIsReview(true);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching survey:", err);
            }
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, token, username, isReview]);

    if (!survey) {
        if (error) {
            return (
                <div className="p-6 sm:p-8 text-center">
                    <h2 className="text-xl font-semibold mb-4 text-red-600">{error}</h2>
                    <div className="mt-4">
                        <button onClick={() => { sessionStorage.removeItem('active_share'); navigate('/surveys'); }} className="bg-gray-200 px-3 py-1 rounded">Back to Surveys</button>
                    </div>
                </div>
            );
        }
        return <div className="p-6 sm:p-8 text-center">Loading survey...</div>;
    }

    // Use only visibleQuestions (exclude consent-duplicate question)
    const visibleQuestions = survey.questions.filter((q) => !isConsentQuestion(q));

    // Helper: Render AdminHeader only for admin
    const AdminHeaderIfAdmin = role === "Admin" ? <AdminHeader username={username} /> : null;

    if (!visibleQuestions || visibleQuestions.length === 0) {
        return (
            <>
            {AdminHeaderIfAdmin}
            <div className="max-w-full sm:max-w-3xl mx-auto p-6 sm:p-8 text-center">
                <h2 className="text-xl font-semibold">This survey has no questions yet.</h2>
                <p className="mt-2 text-gray-600">If you are the admin, please add questions.</p>
            </div>
            </>
        );
    }

    const handleAnswer = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
        // If this question was previously marked invalid and now has a value, clear it
        setInvalidIds((prev) => prev.filter((id) => id !== questionId));
    };

    function _validateRequiredQuestions() {
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

        // Validate required questions first
        const invalid = _validateRequiredQuestions();
        if (invalid.length > 0) {
            setInvalidIds(invalid);
            setError("You must answer all required question/s");
            return;
        }

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
            const params = new URLSearchParams(location.search);
            const shareParam = params.get("share");
            const postUrl = `https://localhost:7126/api/surveys/${id}/responses${shareParam ? `?share=${encodeURIComponent(shareParam)}` : ""}`;
            const res = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(shareParam ? { 'X-Share-Key': shareParam } : {}) },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Failed to submit");
            }
            localStorage.setItem(`survey_${id}_${username}`, "completed");
            setConsent(false);
            setError("");
            const paramsAfter = new URLSearchParams(location.search);
            const shareAfter = paramsAfter.get("share");
            if (shareAfter) {
                sessionStorage.removeItem('active_share');
            }
            navigate("/surveys");
        } catch (err) {
            setError(err?.message || "Submission failed");
        }
    }

    function getReviewValue(q) {
        // prefer answers-only map if available (keys normalized to strings)
        const qKey = String(q.id ?? q.questionId ?? "");
        if (reviewAnswers && qKey in reviewAnswers) return reviewAnswers[qKey];

        // fallback to reviewResponse.answers (normalize ids to strings)
        if (reviewResponse?.answers?.length) {
            // try match by questionId
            const byId = reviewResponse.answers.find(a => String(a.questionId) === qKey);
            if (byId) return byId.answerText ?? (byId.ratingValue != null ? String(byId.ratingValue) : "");

            // fallback: try match by questionText (less ideal but helps if ids differ)
            const byText = reviewResponse.answers.find(a => {
              // some backends include questionText in the answer DTO; try that first
              if (a.questionText && typeof a.questionText === 'string') {
                return a.questionText.trim() === (q.questionText || "").trim();
              }
              return false;
            });
            if (byText) return byText.answerText ?? (byText.ratingValue != null ? String(byText.ratingValue) : "");
        }

        // nothing found
        console.debug("No review answer found for question", { q, reviewAnswers, reviewResponse });
        return "(no answer found)";
    }

    // Retake handler: clear local and in-memory state and prevent immediate re-entering review by server check
    function handleRetake() {
        const completedKey = `survey_${id}_${username}`;
        localStorage.removeItem(completedKey);

        // set skip flag so the load effect won't auto-detect a stored server response for this view
        sessionStorage.setItem(`skip_review_${id}`, "1");

        // clear local UI state
        setIsReview(false);
        setReviewAnswers(null);
        setReviewResponse(null);
        setAnswers({});
        setInvalidIds([]);
        setConsent(false);
        setError("");

        // navigate to the survey page without review query
        navigate(`/survey/${id}`);
    }

    // If review mode, render a read-only view of the user's answers
    if (isReview) {
        return (
            <>
            {AdminHeaderIfAdmin}
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-3"> Your Answers in '{survey.title}' Survey</h1>
                <p className="text-gray-600 mb-6">You have already completed this survey. Below are your answers.</p>

                <div className="space-y-4">
                    {visibleQuestions.map((q) => {
                        const value = getReviewValue(q);

                        return (
                            <div key={q.id} className="bg-white p-4 rounded shadow">
                                <p className="font-semibold mb-2">{q.questionText}</p>
                                <p className="text-gray-700">{value}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex gap-3">
                    <button onClick={() => navigate('/surveys')} className="bg-gray-200 px-4 py-2 rounded">Back to Surveys</button>
                    <button onClick={handleRetake} className="bg-blue-600 text-white px-4 py-2 rounded">Retake Survey</button>
                </div>
            </div>
            </>
        );
    }

    return (
        <>
        {AdminHeaderIfAdmin}
        <div className="max-w-4xl mx-auto p-6">
            {isSharedView && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm rounded">
                    Viewing via private link — this session allows access to this survey only.
                    <div className="mt-2 flex gap-2">
                        <button onClick={() => { sessionStorage.removeItem('active_share'); setIsSharedView(false); navigate('/surveys'); }}
                            className="bg-gray-200 px-3 py-1 rounded">Exit Shared View</button>
                    </div>
                </div>
            )}
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
                                            type="button"
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

                {/* Consent checkbox with clickable terms */}
                <div className="flex items-start gap-3">
                    <input
                        id="consent"
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => { setConsent(e.target.checked); if (error) setError(""); }}
                        className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="consent" className="text-sm text-gray-700">
                        I agree to the privacy{' '}
                        <button
                            type="button"
                            className="underline text-blue-600 hover:text-blue-800"
                            style={{ background: 'none', border: 'none', padding:0, margin:0, cursor: 'pointer' }}
                            onClick={() => setShowTerms(true)}
                        >
                            terms and conditions
                        </button>
                        . <span className="text-gray-400">(Required)</span>
                    </label>
                </div>

                {showTerms && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative">
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                        onClick={() => setShowTerms(false)}
                        aria-label="Close terms and conditions"
                    >
                        &times;
                    </button>
                    <div className="prose max-w-none" style={{ maxHeight:400, overflowY: 'auto' }}>
                        <Markdown>{TERMS_AND_CONDITIONS}</Markdown>
                    </div>
                    </div>
                </div>
                )}

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button type="submit" className="mt-6 bg-green-600 text-white px-6 py-2 rounded">Submit Survey</button>
            </form>
        </div>
        </>
    );
}
