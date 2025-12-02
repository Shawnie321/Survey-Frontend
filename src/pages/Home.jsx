import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white py-24 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Welcome {username ? `back, ${username}` : "to our Survey Platform"}!
            </h1>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
              Participate in surveys, share your insights, and help us improve our services.
              Easy, fast, and user-friendly.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/surveys"
                className="bg-white/90 text-indigo-600 px-6 py-3 rounded-xl shadow-md font-semibold hover:scale-[1.02] transition"
              >
                Take a Survey
              </Link>

              {role === "Admin" && (
                <Link
                  to="/admin"
                  className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-md font-semibold hover:scale-[1.02] transition"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">Why Use Our Survey System?</h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            We built this platform to make feedback easier, more meaningful, and more enjoyable.
          </p>

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-2">📊 Easy-to-Use Surveys</h3>
              <p className="text-gray-600">
                Simple and clean interface for answering surveys without hassle.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-2">⚡ Fast & Secure</h3>
              <p className="text-gray-600">
                All responses are stored securely and handled with modern encryption.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-2">📈 Admin Analytics</h3>
              <p className="text-gray-600">
                Admins can view survey performance, responses, and insights instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">© {new Date().getFullYear()} Survey Platform. All rights reserved.</p>

          {username && (
            <button
              onClick={handleLogout}
              className="mt-3 text-red-400 hover:text-red-300 underline text-sm"
            >
              Logout
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
