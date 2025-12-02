import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
    fetch("https://localhost:7126/api/surveys")
      .then((res) => res.json())
      .then((data) => setSurveys(data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-10 text-blue-700 text-center tracking-tight">
          Available Surveys
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {surveys.map((survey) => {
            const completed = localStorage.getItem(
              `survey_${survey.id}_${username}`
            );

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
                    to={`/survey/${survey.id}`}
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
  );
}
