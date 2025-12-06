import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
 Chart as ChartJS,
 CategoryScale,
 LinearScale,
 BarElement,
 Title,
 Tooltip,
 Legend,
} from "chart.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AdminHeader from "../components/AdminHeader";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
 const navigate = useNavigate();
 const token = localStorage.getItem("token");
 const username = localStorage.getItem("username");
 const role = localStorage.getItem("role");

 const [surveys, setSurveys] = useState([]);
 const [selected, setSelected] = useState(null);
 const [responses, setResponses] = useState([]);
 const [analytics, setAnalytics] = useState(null);

 const [startDate, setStartDate] = useState("");
 const [endDate, setEndDate] = useState("");
 const [filteredResponses, setFilteredResponses] = useState([]);
 const [showConfirm, setShowConfirm] = useState(null);

 useEffect(() => {
 if (role !== "Admin") navigate("/login");
 }, [navigate, role]);

 useEffect(() => {
 fetch("https://localhost:7126/api/surveys", {
 headers: { Authorization: `Bearer ${token}` },
 })
 .then((r) => r.json())
 .then(setSurveys)
 .catch(console.error);
 }, [token]);

 async function viewSurvey(survey) {
 setSelected(survey);
 const res = await fetch(`https://localhost:7126/api/surveys/${survey.id}/responses`, {
 headers: { Authorization: `Bearer ${token}` },
 });
 const data = await res.json();
 setResponses(data || []);
 setFilteredResponses(data || []);

 const ares = await fetch(`https://localhost:7126/api/analytics/${survey.id}`, {
 headers: { Authorization: `Bearer ${token}` },
 });
 const aData = await ares.json();
 setAnalytics(aData);
 }

 async function deleteSurvey(id) {
 if (!window.confirm("Delete this survey?")) return;
 await fetch(`https://localhost:7126/api/surveys/${id}`, {
 method: "DELETE",
 headers: { Authorization: `Bearer ${token}` },
 });
 setSurveys(surveys.filter((s) => s.id !== id));
 setSelected(null);
 }

 function filterResponses() {
 if (!startDate || !endDate) return alert("Select start and end dates");
 const start = new Date(startDate);
 const end = new Date(endDate);
 const filtered = responses.filter((r) => {
 const date = new Date(r.submittedAt);
 return date >= start && date <= end;
 });
 setFilteredResponses(filtered);
 }

 function resetFilter() {
 setFilteredResponses(responses);
 setStartDate("");
 setEndDate("");
 }

 function exportToExcel() {
 if (!filteredResponses.length) return alert("No data to export.");
 const sheet = XLSX.utils.json_to_sheet(filteredResponses);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, sheet, "Responses");
 const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
 saveAs(new Blob([buffer]), `${selected?.title || "Survey"}_Responses.xlsx`);
 }

 async function exportToPDF() {
 const table = document.getElementById("responsesTable");
 if (!table) return alert("Table not found!");
 const canvas = await html2canvas(table, { scale:2 });
 const imgData = canvas.toDataURL("image/png");
 const pdf = new jsPDF("p", "mm", "a4");
 const width = pdf.internal.pageSize.getWidth();
 const height = (canvas.height * width) / canvas.width;
 pdf.addImage(imgData, "PNG",0,0, width, height);
 pdf.save(`${selected?.title || "Survey"}_Responses.pdf`);
 }

 async function deleteResponse(id) {
 try {
 await fetch(`https://localhost:7126/api/surveyresponses/${id}`, {
 method: "DELETE",
 headers: { Authorization: `Bearer ${token}` },
 });
 alert("Deleted successfully!");
 setShowConfirm(null);
 setResponses(responses.filter((r) => r.id !== id));
 setFilteredResponses(filteredResponses.filter((r) => r.id !== id));
 } catch {
 alert("Error deleting response.");
 }
 }

 const chartData = analytics
 ? {
 labels: ["Average", "Highest", "Lowest"],
 datasets: [
 {
 label: "Ratings",
 data: [
 analytics.averageRating,
 analytics.highestRating,
 analytics.lowestRating,
 ],
 backgroundColor: ["#3b82f6", "#22c55e", "#ef4444"],
 },
 ],
 }
 : null;

 return (
 <>
 <AdminHeader username={username} currentPage="dashboard" />
 <div className="max-w-7xl mx-auto p-6 space-y-6">
 <div className="grid md:grid-cols-3 gap-6">
 {/* --- Survey List --- */}
 <div className="bg-white rounded shadow p-4">
 <h2 className="text-lg font-semibold mb-3">All Surveys</h2>
 <ul className="divide-y">
 {surveys.map((s) => (
 <li key={s.id} className="py-2 flex justify-between items-center">
 <div className="flex gap-2 items-center">
 <button
 className="text-blue-600 hover:underline"
 onClick={() => viewSurvey(s)}
 >
 {s.title}
 </button>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => navigate(`/edit-survey/${s.id}`)}
 className="text-yellow-600 text-sm hover:underline"
 >
 Edit
 </button>
 <button
 onClick={() => deleteSurvey(s.id)}
 className="text-red-600 text-sm hover:underline"
 >
 Delete
 </button>
 </div>
 </li>
 ))}
 </ul>
 </div>

 {/* --- Survey Details + Analytics --- */}
 <div className="md:col-span-2 bg-white rounded shadow p-4">
 {!selected ? (
 <p className="text-gray-500">Select a survey to view responses.</p>
 ) : (
 <>
 <h2 className="text-xl font-bold mb-2">{selected.title}</h2>
 <p className="text-gray-600 mb-4">{selected.description}</p>

 {analytics && (
 <>
 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
 <div className="bg-blue-100 p-3 rounded text-center">
 <h4>Total</h4>
 <p className="text-xl font-bold">{analytics.totalResponses}</p>
 </div>
 <div className="bg-green-100 p-3 rounded text-center">
 <h4>Average</h4>
 <p className="text-xl font-bold">{analytics.averageRating}</p>
 </div>
 <div className="bg-yellow-100 p-3 rounded text-center">
 <h4>Highest</h4>
 <p className="text-xl font-bold">{analytics.highestRating}</p>
 </div>
 <div className="bg-red-100 p-3 rounded text-center">
 <h4>Lowest</h4>
 <p className="text-xl font-bold">{analytics.lowestRating}</p>
 </div>
 </div>

 {/* Chart */}
 {chartData && (
 <div className="bg-gray-50 p-4 rounded shadow mb-6">
 <Bar data={chartData} />
 </div>
 )}
 </>
 )}

 {/* Filter + Export */}
 <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
 <div className="flex gap-2 items-center">
 <input
 type="date"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 className="border rounded px-2 py-1"
 />
 <input
 type="date"
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 className="border rounded px-2 py-1"
 />
 <button
 onClick={filterResponses}
 className="bg-blue-600 text-white px-3 py-1 rounded"
 >
 Filter
 </button>
 <button
 onClick={resetFilter}
 className="bg-gray-300 px-3 py-1 rounded"
 >
 Reset
 </button>
 </div>
 <div className="flex gap-2">
 <button
 onClick={exportToExcel}
 className="bg-green-600 text-white px-3 py-1 rounded"
 >
 Excel
 </button>
 <button
 onClick={exportToPDF}
 className="bg-red-600 text-white px-3 py-1 rounded"
 >
 PDF
 </button>
 </div>
 </div>

 {/* --- Responses Table --- */}
 <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
 <table
 id="responsesTable"
 className="min-w-full border-collapse text-sm"
 >
 <thead className="bg-blue-600 text-white">
 <tr>
 <th className="p-3 border">ID</th>
 <th className="p-3 border">User</th>
 <th className="p-3 border">Submitted</th>
 <th className="p-3 border">Actions</th>
 </tr>
 </thead>
 <tbody>
 {filteredResponses.length ? (
 filteredResponses.map((r) => (
 <tr key={r.id} className="hover:bg-gray-50 text-center">
 <td className="border p-3">{r.id}</td>
 <td className="border p-3">{r.username || "Anonymous"}</td>
 <td className="border p-3">{new Date(r.submittedAt).toLocaleString()}</td>
 <td className="border p-3">
 <button
 onClick={() => setShowConfirm(r.id)}
 className="text-red-600 mx-1 px-2 py-1 rounded hover:bg-red-50"
 >
 🗑️ Delete
 </button>
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan="4" className="text-center p-4 text-gray-500">
 No responses found.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </>
 )}
 </div>
 </div>

 {/* --- Delete Confirmation --- */}
 {showConfirm && (
 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
 <div className="bg-white p-6 rounded shadow-lg">
 <h3 className="text-lg font-semibold mb-4">
 Delete this response?
 </h3>
 <div className="flex justify-end gap-2">
 <button
 onClick={() => setShowConfirm(null)}
 className="px-3 py-1 bg-gray-300 rounded"
 >
 Cancel
 </button>
 <button
 onClick={() => deleteResponse(showConfirm)}
 className="px-3 py-1 bg-red-600 text-white rounded"
 >
 Delete
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 </>
 );
}