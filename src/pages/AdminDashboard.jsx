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
    const [qrOpen, setQrOpen] = useState(false);
    const [qrSrc, setQrSrc] = useState("");
    const [qrLoading, setQrLoading] = useState(false);

    function generateShareKeyForSurveyId(surveyId) {
        const uuid = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now().toString(36));
        return btoa(JSON.stringify({ id: surveyId, uuid }));
    }

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
            const res = await fetch(
                `https://localhost:7126/api/surveys/${survey.id}/responses`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

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
            const ares = await fetch(
                `https://localhost:7126/api/analytics/${survey.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
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
                (r.username || "Anonymous")
                    .toLowerCase()
                    .includes(value.toLowerCase())
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

    // Generate QR for a survey
    async function generateQRCodeForSurvey(survey) {
        setQrLoading(true);
        // ensure we have a persistent share key in localStorage for the survey
        const stored = JSON.parse(localStorage.getItem("surveyShares" ) || "{}");
        function generateShareKeyForSurvey(surveyId) {
            const uuid = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now().toString(36));
            return btoa(JSON.stringify({ id: surveyId, uuid }));
        }
        const key = stored[survey.id] || generateShareKeyForSurvey(survey.id);
        if (!stored[survey.id]) stored[survey.id] = key;
        localStorage.setItem("surveyShares", JSON.stringify(stored));

        const url = `${window.location.origin}/survey/${survey.id}?share=${encodeURIComponent(key)}`;
        try {
            // Create a QR using an external API as a fallback and to avoid adding a new dependency
            const dataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
            setQrSrc(dataUrl);
            setQrOpen(true);
        } catch (e) {
            console.error('Failed to generate QR:', e);
            alert('Failed to generate QR code');
        } finally {
            setQrLoading(false);
        }
    }

    function printQr() {
        if (!qrSrc) return;
        const w = window.open('', '_blank');
        if (!w) return alert('Unable to open print window');
        w.document.write(`<!doctype html><html><head><title>Print QR</title><style>body{display:flex;align-items:center;justify-content:center;height:100vh;margin:0;} img{max-width:90%;}</style></head><body><img src="${qrSrc}" alt="Survey QR"/></body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); w.close(); }, 250);
    }

    async function exportToPDF() {
        const table = document.getElementById("responsesTable");
        if (!table) return alert("Table not found!");

        // Clone table and remove Actions column from the clone
        const clone = table.cloneNode(true);
        // --- FIXED HEADER HEIGHT ---
        // Force stable header height so it is never cut in half
        const fixedHeaderHeight = 50; // adjust (px) depending on your styling
        clone.querySelectorAll("thead th").forEach((th) => {
            th.style.height = fixedHeaderHeight + "px";
            th.style.minHeight = fixedHeaderHeight + "px";
            th.style.maxHeight = fixedHeaderHeight + "px";
            th.style.lineHeight = fixedHeaderHeight + "px";
        });
        clone.querySelector("thead").style.display = "table-header-group";
        clone.querySelector("thead").style.background = "#2563eb"; // match your blue header
        clone.querySelector("thead").style.color = "white";

        // Find actions column index
        const headerCells = clone.querySelectorAll("thead th");
        let actionsIndex = -1;
        headerCells.forEach((th, i) => {
            const txt = (th.textContent || "").trim().toLowerCase();
            if (txt.includes("action")) actionsIndex = i;
        });
        if (actionsIndex === -1 && headerCells.length > 0) actionsIndex = headerCells.length - 1;

        // Compute original column widths from on-screen table (so clone uses same widths)
        const originalHeaderCells = table.querySelectorAll("thead th");
        const colWidths = Array.from(originalHeaderCells).map((th) => {
            const w = th.getBoundingClientRect().width;
            return Math.round(w);
        });

        // Apply fixed table layout + explicit widths to clone so header aligns with body
        clone.style.tableLayout = "fixed";
        clone.style.width = `${table.getBoundingClientRect().width}px`;
        clone.style.borderCollapse = "collapse";

        // Insert colgroup with widths to force stable column sizing
        const colgroup = document.createElement("colgroup");
        colWidths.forEach((w, i) => {
            if (i === actionsIndex) return; // skip actions column
            const col = document.createElement("col");
            col.style.width = `${w}px`;
            colgroup.appendChild(col);
        });
        // Remove existing colgroup if any then add ours at the top
        const existingColgroup = clone.querySelector("colgroup");
        if (existingColgroup) existingColgroup.remove();
        clone.insertBefore(colgroup, clone.firstChild);

        // Remove Actions column header and body cells, also apply widths to th/td
        const clonedHeaderCells = clone.querySelectorAll("thead th");
        let colPos = 0;
        clonedHeaderCells.forEach((th, i) => {
            if (i === actionsIndex) {
                th.remove();
                return;
            }
            // apply width from colWidths array (skip removed index)
            const w = colWidths[i];
            if (w) th.style.width = `${w}px`;
            th.style.boxSizing = "border-box";
            colPos++;
        });

        clone.querySelectorAll("tbody tr").forEach((tr) => {
            const tds = Array.from(tr.querySelectorAll("td"));
            let tdPos = 0;
            tds.forEach((td, i) => {
                if (i === actionsIndex) {
                    td.remove();
                    return;
                }
                const w = colWidths[i];
                if (w) td.style.width = `${w}px`;
                td.style.boxSizing = "border-box";
                tdPos++;
            });
        });

        // Wrap clone so styles render correctly and append off-screen
        const wrapper = document.createElement("div");
        wrapper.style.background = "#ffffff";
        wrapper.style.padding = "16px";
        const container = table.parentElement;
        const containerWidth = container ? container.clientWidth : table.clientWidth;
        wrapper.style.width = `${containerWidth}px`;
        clone.style.width = "100%";
        wrapper.appendChild(clone);
        wrapper.style.position = "fixed";
        wrapper.style.left = "-10000px";
        wrapper.style.top = "0";
        document.body.appendChild(wrapper);

        // measure header and row positions AFTER clone is in DOM
        const headerEl = wrapper.querySelector("thead");
        const headerRect = headerEl ? headerEl.getBoundingClientRect() : { height: 0, top: wrapper.getBoundingClientRect().top };
        const wrapperRect = wrapper.getBoundingClientRect();
        const rowEls = Array.from(wrapper.querySelectorAll("tbody tr"));
        const rowRects = rowEls.map((tr) => {
            const r = tr.getBoundingClientRect();
            return {
                top: r.top - wrapperRect.top,
                height: r.height,
            };
        });

        // Render the wrapper to a canvas at high resolution
        const scale = 2;
        const canvas = await html2canvas(wrapper, { scale, useCORS: true, backgroundColor: "#ffffff" });

        // remove temporary wrapper
        document.body.removeChild(wrapper);

        const pdf = new jsPDF("p", "mm", "letter");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate pixels per mm for slicing (canvas px = DOM px * scale)
        const imgWidthPx = canvas.width;
        const imgHeightPx = canvas.height;
        const pxPerMm = imgWidthPx / pdfWidth;
        const sliceHeightPx = Math.floor(pdfHeight * pxPerMm);

        // header in canvas px
        const headerHeightPx = Math.round((headerRect.height || 0) * scale);

        // Build pages by grouping whole rows so no row is split across pages
        const pages = [];
        let startIdx = 0;
        while (startIdx < rowRects.length) {
            let available = sliceHeightPx - headerHeightPx;
            if (available < 0) available = 0;

            let endIdx = startIdx;
            while (endIdx < rowRects.length) {
                const rowTopPx = Math.round(rowRects[endIdx].top * scale);
                const rowHeightPx = Math.round(rowRects[endIdx].height * scale);

                const firstRowTopPx = Math.round(rowRects[startIdx].top * scale);
                const relTop = rowTopPx - firstRowTopPx;
                const wouldBeHeight = relTop + rowHeightPx;

                if (wouldBeHeight > available && endIdx > startIdx) break;

                endIdx++;
            }

            // if no row fits (single row too tall), force at least one row per page
            if (endIdx === startIdx) endIdx = startIdx + 1;

            pages.push({ startIdx, endIdx }); // endIdx is exclusive
            startIdx = endIdx;
        }

        // Now render each page: header + rows block
        for (let p = 0; p < pages.length; p++) {
            const { startIdx: s, endIdx: e } = pages[p];
            const firstRowTopPx = Math.round(rowRects[s].top * scale);
            const lastRow = rowRects[e - 1];
            const lastRowBottomPx = Math.round((lastRow.top + lastRow.height) * scale);
            const rowsBlockHeightPx = lastRowBottomPx - firstRowTopPx;

            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = imgWidthPx;
            pageCanvas.height = headerHeightPx + rowsBlockHeightPx;
            const ctx = pageCanvas.getContext("2d");

            // white bg
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

            // draw header from top of original canvas
            if (headerHeightPx > 0) {
                ctx.drawImage(canvas, 0, 0, imgWidthPx, headerHeightPx, 0, 0, pageCanvas.width, headerHeightPx);
            }

            // draw rows block
            ctx.drawImage(
                canvas,
                0,
                firstRowTopPx,
                imgWidthPx,
                rowsBlockHeightPx,
                0,
                headerHeightPx,
                pageCanvas.width,
                rowsBlockHeightPx
            );

            const pageData = pageCanvas.toDataURL("image/png");
            const pageImgHeightMm = (pageCanvas.height * pdfWidth) / pageCanvas.width;

            pdf.addImage(pageData, "PNG", 0, 0, pdfWidth, pageImgHeightMm);
            if (p < pages.length - 1) pdf.addPage();
        }

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
            <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 p-6 space-y-6 overflow-x-hidden">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* --- Survey List --- */}
                    <div className="bg-white rounded shadow p-4 min-w-0">
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
                    <div className="md:col-span-2 bg-white rounded shadow p-4 min-w-0">
                        {!selected ? (
                            <p className="text-gray-500">Select a survey to view responses.</p>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold mb-2">{selected.title}</h2>
                                <p className="text-gray-600 mb-4">{selected.description}</p>

                                {analytics && (
                                    <>
                                        {/* Stats */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                            <div className="bg-blue-100 p-3 rounded text-center min-w-0 w-full">
                                                <h4>Total</h4>
                                                <p className="text-xl font-bold">
                                                    {analytics.totalResponses}
                                                </p>
                                            </div>
                                            <div className="bg-green-100 p-3 rounded text-center">
                                                <h4>Average</h4>
                                                <p className="text-xl font-bold">
                                                    {analytics.averageRating}
                                                </p>
                                            </div>
                                            <div className="bg-yellow-100 p-3 rounded text-center">
                                                <h4>Highest</h4>
                                                <p className="text-xl font-bold">
                                                    {analytics.highestRating}
                                                </p>
                                            </div>
                                            <div className="bg-red-100 p-3 rounded text-center">
                                                <h4>Lowest</h4>
                                                <p className="text-xl font-bold">
                                                    {analytics.lowestRating}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Chart */}
                                        {chartData && (
                                            <div className="bg-gray-50 p-4 rounded shadow mb-6 min-w-0 w-full overflow-hidden">
                                                <div className="w-full max-w-full h-48 sm:h-64 md:h-96 min-w-0">
                                                    <Bar
                                                        data={chartData}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: { legend: { display: false } },
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Filter + Export + Search */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 w-full">
                                    <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={filterResponses}
                                            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                                        >
                                            Filter
                                        </button>
                                        <button
                                            onClick={resetFilter}
                                            className="bg-gray-300 px-4 py-2 rounded shadow hover:bg-gray-400"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    <div className="flex gap-2 items-center w-full sm:w-auto justify-start sm:justify-end">
                                        <input
                                            type="text"
                                            placeholder="Search username..."
                                            value={searchUsername}
                                            onChange={(e) => searchByUsername(e.target.value)}
                                                                className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                                        />
                                        <button
                                            onClick={exportToExcel}
                                                                className="bg-green-600 text-white px-3 py-2 rounded shadow hover:bg-green-700 w-full sm:w-auto"
                                        >
                                            Excel
                                        </button>
                                        <button
                                            onClick={exportToPDF}
                                                                className="bg-red-600 text-white px-3 py-2 rounded shadow hover:bg-red-700 w-full sm:w-auto"
                                        >
                                            PDF
                                        </button>
                                        {/* QR Code Generator */}
                                        <button
                                            onClick={() => generateQRCodeForSurvey(selected)}
                                            className="bg-indigo-600 text-white px-3 py-2 rounded shadow hover:bg-indigo-700 w-full sm:w-auto"
                                            disabled={qrLoading}
                                            title="Generate QR code for the selected survey"
                                        >
                                            {qrLoading ? 'Generating...' : 'Generate QR'}
                                        </button>
                                    </div>
                                </div>

                                {/* --- Responses Table --- */}
                                <div className="rounded-xl shadow border border-gray-200 max-h-[500px] overflow-auto min-w-0">
                                    <table id="responsesTable" className="min-w-full border-collapse text-sm">
                                        <thead className="bg-blue-600 text-white top-0">
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
                            <h3 className="text-lg font-semibold mb-4">Delete this response?</h3>
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
                {/* --- QR Modal --- */}
                {qrOpen && (
                    <div onClick={() => setQrOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                            <h3 className="mb-4 text-lg font-semibold">QR Code for "{selected?.title}"</h3>
                            <div className="flex flex-col items-center gap-4">
                                <img src={qrSrc} alt="Survey QR code" className="w-64 h-64 object-contain" />
                                <div className="flex gap-2 w-full">
                                    <button
                                        className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700"
                                        onClick={printQr}
                                    >
                                        Print
                                    </button>
                                    <button
                                        className="flex-1 bg-gray-300 px-3 py-2 rounded hover:bg-gray-400"
                                        onClick={() => {
                                            const stored = JSON.parse(localStorage.getItem("surveyShares") || "{}");
                                            const shareKey = stored[selected?.id] || (() => {
                                                const k = generateShareKeyForSurveyId(selected?.id);
                                                stored[selected?.id] = k;
                                                localStorage.setItem("surveyShares", JSON.stringify(stored));
                                                return k;
                                            })();
                                            navigator.clipboard?.writeText(`${window.location.origin}/survey/${selected?.id}?share=${encodeURIComponent(shareKey)}`);
                                            alert('Survey link copied to clipboard');
                                        }}
                                    >
                                        Copy Link
                                    </button>
                                </div>
                                <div className="w-full text-right mt-2">
                                    <button className="text-sm text-gray-600 hover:underline" onClick={() => setQrOpen(false)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}