import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
    fetch("https://localhost:7126/api/surveys")
      .then(res => res.json())
      .then(data => setSurveys(data));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Available Surveys</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {surveys.map((survey) => {
          const completed = localStorage.getItem(`survey_${survey.id}_${username}`);

          return (
            <div
              key={survey.id}
              className="bg-white shadow-md rounded-lg p-5 border hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold">{survey.title}</h2>
              <p className="text-gray-600 mt-1">{survey.description}</p>

              <div className="flex justify-between items-center mt-4">
                {completed ? (
                  <span className="text-green-600 font-semibold">✅ Completed</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">⏳ Not Completed</span>
                )}

                <Link
                  to={`/survey/${survey.id}`}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  {completed ? "View" : "Answer"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {surveys.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No surveys available.</p>
      )}
    </div>
  );
}
