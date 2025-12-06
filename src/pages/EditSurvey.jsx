import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
 setQuestions(data.questions || []);
 } catch (err) {
 setError("Error loading survey.");
 } finally {
 setLoading(false);
 }
 }
 loadSurvey();
 }, [id]);
 async function handleSave(e) {
 e.preventDefault();
 setMessage("");
 if (!title.trim()) {
 setMessage("Please add a title.");
 return;
 }
 const payload = {
 title,
 description,
 questions, // unchanged
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
 if (!res.ok) throw new Error("Failed to save survey");
 setMessage("Survey Updated Successfully!");
 setTimeout(() => navigate("/admin"),1200);
 } catch (err) {
 setMessage("? Error saving survey.");
 } finally {
 setLoading(false);
 }
 }

 if (loading) return <div className="p-8 text-center">Loading...</div>;
 if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

 return (
 <div className="max-w-4xl mx-auto p-8">
 <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Edit Survey</h2>
 {message && (
 <div className={`mb-6 p-3 rounded text-center ${message.includes("") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{message}</div>
 )}
 <form onSubmit={handleSave} className="bg-white shadow-md rounded-lg p-6 space-y-6">
 <div>
 <label className="block text-gray-700 font-semibold mb-2">Survey Title</label>
 <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded mb-4 focus:ring-2 focus:ring-blue-500" />
 <label className="block text-gray-700 font-semibold mb-2">Description</label>
 <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500" />
 </div>
 <div className="border-t pt-6">
 <h3 className="text-lg font-semibold text-gray-800 mb-4">Questions (read-only)</h3>
 {questions.length ===0 ? (
 <p className="text-gray-500">No questions in this survey.</p>
 ) : (
 <ul className="space-y-4">
 {questions.map((q, idx) => (
 <li key={idx} className="bg-gray-50 rounded p-4 shadow">
 <div className="font-semibold">{q.questionText}</div>
 <div className="text-sm text-gray-600">Type: {q.questionType}{q.options && ` — Options: ${q.options}`}{q.isRequired && " — Required"}</div>
 </li>
 ))}
 </ul>
 )}
 </div>
 <div className="flex justify-end mt-6">
 <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
 </div>
 </form>
 </div>
 );
}
