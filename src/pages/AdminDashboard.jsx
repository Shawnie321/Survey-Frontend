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
  const [searchUsername, setSearchUsername] = useState("");

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
    
    // Debug: check if token exists
    if (!token) {
      console.error("No token found in localStorage");
      alert("Authentication token missing. Please log in again.");
      navigate("/login");
      return;
    }
    
    console.log("Token:", token.substring(0, 20) + "..."); // Log first 20 chars only
    
    try {
      const res = await fetch(`https://localhost:7126/api/surveys/${survey.id}/responses`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      if (!res.ok) {
        console.error("Responses API error:", res.status, res.statusText);
        if (res.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        alert(`Error loading responses: ${res.status}`);
        return;
      }
      const data = await res.json();
      console.log("Responses data:", data);
      setResponses(data || []);
      setFilteredResponses(data || []);
    } catch (e) {
      console.error("Error fetching responses:", e);
      alert("Failed to load responses");
    }

    try {
      const ares = await fetch(`https://localhost:7126/api/analytics/${survey.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!ares.ok) {
        console.error("Analytics API error:", ares.status, ares.statusText);
        return;
      }
      const aData = await ares.json();
      console.log("Analytics data:", aData);
      setAnalytics(aData);
    } catch (e) {
      console.error("Error fetching analytics:", e);
    }
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

  function searchByUsername(value) {
    setSearchUsername(value);
    if (!value.trim()) {
      setFilteredResponses(responses);
    } else {
      const searched = responses.filter((r) =>
        (r.username || "Anonymous").toLowerCase().includes(value.toLowerCase())
      );
      setFilteredResponses(searched);
    }
  }

  function exportToExcel() {
    if (!filteredResponses.length) return alert("No data to export.");
    const sheet = XLSX.utils.json_to_sheet(filteredResponses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Responses");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `${selected?.title || "Survey"}_Responses.xlsx`);
  }

  // Export to PDF but exclude the "Actions" column
  async function exportToPDF() {
    const table = document.getElementById("responsesTable");
    if (!table) return alert("Table not found!");

    // Clone the table so we can modify it without affecting the page
    const clone = table.cloneNode(true);

    // Remove the last header cell (Actions) if present
    const headerRow = clone.querySelector("thead tr");
    if (headerRow) {
      const ths = headerRow.querySelectorAll("th");
      if (ths.length > 0) ths[ths.length - 1].remove();
    }

    // Remove the last column cell from each body row, adjust colspan when needed
    const bodyRows = clone.querySelectorAll("tbody tr");
    bodyRows.forEach((row) => {
      const tds = row.querySelectorAll("td");
      if (tds.length === 1 && tds[0].hasAttribute("colspan")) {
        // This is the "No responses found" row — reduce colspan by 1
        const colspan = Number(tds[0].getAttribute("colspan")) || 1;
        tds[0].setAttribute("colspan", Math.max(1, colspan - 1));
      } else if (tds.length > 0) {
        // Remove last cell (Actions)
        tds[tds.length - 1].remove();
      }
    });

    // Wrap clone in a container positioned off-screen so it can be rendered
    const container = document.createElement("div");
    container.style.position = "static";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.background = "white";
    container.style.padding = "8px";

    // Increase font size for export (adjust px to taste)
    const desiredFontSize = "30px";
    container.style.fontSize = desiredFontSize;
    // ensure table elements use this font size (override Tailwind classes)
    clone.querySelectorAll("th, td").forEach((el) => {
      el.style.fontSize = desiredFontSize;
      // optional: increase padding so larger text doesn't look cramped
      el.style.padding = "26px";
    });

    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      // Use a higher scale so text remains sharp when rasterized
      const canvas = await html2canvas(clone, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "letter");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`${selected?.title || "Survey"}_Responses.pdf`);
    } catch (e) {
      console.error("Error exporting PDF:", e);
      alert("Failed to export PDF.");
    } finally {
      // Clean up the temporary element
      document.body.removeChild(container);
    }
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
            data: [analytics.averageRating, analytics.highestRating, analytics.lowestRating],
            backgroundColor: ["#3b82f6", "#22c55e", "#ef4444"],
          },
        ],
      }
    : null;

  return (
    <>
      <AdminHeader username={username} currentPage="dashboard" />
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* --- Survey List --- */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">All Surveys</h2>
            <ul className="divide-y">
              {surveys.map((s) => (
                <li key={s.id} className="py-3 flex justify-between items-center">
                  <button className="text-blue-600 hover:underline font-medium text-lg" onClick={() => viewSurvey(s)}>
                    {s.title}
                  </button>
                  <button onClick={() => deleteSurvey(s.id)} className="text-red-600 text-sm hover:underline px-2 py-1 rounded hover:bg-red-50">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Survey Details + Analytics --- */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg width="48" height="48" fill="none" viewBox="002424" stroke="currentColor" className="mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M917v-2a44000-4-4H5a44000-44v2m16-2a44000-4-4h-1a44000-44v2m6-2a44000-4-4h-1a44000-44v2" />
                </svg>
                <p>Select a survey to view responses.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2 text-blue-700">{selected.title}</h2>
                <p className="text-gray-600 mb-4">{selected.description}</p>

                {analytics && (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-100 p-4 rounded-xl text-center shadow">
                        <h4 className="font-semibold text-blue-700">Total</h4>
                        <p className="text-2xl font-bold">{analytics.totalResponses}</p>
                      </div>
                      <div className="bg-green-100 p-4 rounded-xl text-center shadow">
                        <h4 className="font-semibold text-green-700">Average</h4>
                        <p className="text-2xl font-bold">{analytics.averageRating}</p>
                      </div>
                      <div className="bg-yellow-100 p-4 rounded-xl text-center shadow">
                        <h4 className="font-semibold text-yellow-700">Highest</h4>
                        <p className="text-2xl font-bold">{analytics.highestRating}</p>
                      </div>
                      <div className="bg-red-100 p-4 rounded-xl text-center shadow">
                        <h4 className="font-semibold text-red-700">Lowest</h4>
                        <p className="text-2xl font-bold">{analytics.lowestRating}</p>
                      </div>
                    </div>

                    {/* Chart */}
                    {chartData && (
                      <div className="bg-gray-50 p-6 rounded-xl shadow mb-8">
                        <Bar data={chartData} />
                      </div>
                    )}
                  </>
                )}

                {/* Filter + Export + Search */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div className="flex gap-2 items-center">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                    <button onClick={filterResponses} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
                      Filter
                    </button>
                    <button onClick={resetFilter} className="bg-gray-300 px-4 py-2 rounded shadow hover:bg-gray-400">
                      Reset
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Search username..." 
                      value={searchUsername}
                      onChange={(e) => searchByUsername(e.target.value)}
                      className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
                      Excel
                    </button>
                    <button onClick={exportToPDF} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">
                      PDF
                    </button>
                  </div>
                </div>

                {/* --- Responses Table --- */}
                <div className="rounded-xl shadow border border-gray-200" style={{ maxHeight: "500px", overflowY: "auto" }}>
                  <table id="responsesTable" className="min-w-full border-collapse text-sm">
                    <thead className="bg-blue-600 text-white sticky top-0">
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
                              <button onClick={() => setShowConfirm(r.id)} className="text-red-600 mx-1 px-2 py-1 rounded hover:bg-red-50">
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
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold mb-6 text-red-600">Delete this response?</h3>
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowConfirm(null)} className="px-4 py-2 bg-gray-300 rounded shadow hover:bg-gray-400">
                  Cancel
                </button>
                <button onClick={() => deleteResponse(showConfirm)} className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700">
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