import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";

export default function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) return; // don't fetch when not logged in

    fetch("https://localhost:7126/api/surveys", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setSurveys(data))
      .catch(console.error);
  }, [username, token]);

  // Server-backed completed-check: try a dedicated endpoint, fall back gracefully.
  useEffect(() => {
    if (!token) return; // only query server when authenticated

    async function loadCompleted() {
      try {
        // Preferred endpoint - adjust if your backend exposes a different path
        const primary = await fetch("https://localhost:7126/api/users/me/completed-surveys", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (primary.ok) {
          const ids = await primary.json();
          setCompletedIds(new Set((ids || []).map((id) => String(id))));
          return;
        }

        // Fallback endpoint (alternative backend naming)
        const alt = await fetch("https://localhost:7126/api/surveys/completed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (alt.ok) {
          const ids = await alt.json();
          setCompletedIds(new Set((ids || []).map((id) => String(id))));
          return;
        }

        // If neither endpoint exists, just warn and keep client-side markers
        console.warn("Completed surveys endpoint not found (checked /users/me/completed-surveys and /surveys/completed).");
      } catch (e) {
        console.error("Error loading completed surveys:", e);
      }
    }

    loadCompleted();
  }, [token]);

  if (!username) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex items-center">
        <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-2xl shadow">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Please log in to view surveys
          </h1>
          <p className="text-gray-600 mb-6">
            You must be signed in to access available surveys. Create an account or
            log in to continue.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Login
            </button>
            <Link
              to="/register"
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {role === "Admin" && <AdminHeader username={username} />}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-10 text-blue-700 text-center tracking-tight">
            Available Surveys
          </h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {surveys.map((survey) => {
              const idKey = String(survey.id);
              // server-backed completed takes precedence; fallback to client marker
              const completedServer = completedIds.has(idKey);
              const completedClient = localStorage.getItem(`survey_${survey.id}_${username}`);
              const completed = completedServer || !!completedClient;

              return (
                <div
                  key={survey.id}
                  className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {survey.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{survey.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    {completed ? (
                      <span className="text-green-600 font-semibold">
                        ✅ Completed
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">
                        ⏳ Not Completed
                      </span>
                    )}

                    <Link
                      to={completed ? `/survey/${survey.id}?review=true` : `/survey/${survey.id}`}
                      className={`px-5 py-2 rounded-full font-semibold shadow transition ${
                        completed
                          ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {completed ? "View" : "Answer"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {surveys.length === 0 && (
            <p className="text-gray-500 text-center mt-10">
              No surveys available.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
