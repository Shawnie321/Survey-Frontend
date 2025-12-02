export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-4xl font-extrabold mb-6 text-blue-700 text-center tracking-tight">
          About the System
        </h2>
        <p className="text-lg text-gray-700 mb-4 text-center">
          This system allows collecting and analyzing customer satisfaction data in a secure and user-friendly way.
        </p>
        <div className="bg-blue-50 rounded-xl p-6 shadow text-center">
          <span className="text-xl font-bold text-blue-600 mb-2 block">
            Technology Stack
          </span>
          <p className="text-gray-700">
            Survey frontend built with React and Tailwind CSS, connected to an ASP.NET Core API and SQL database for robust data management.
          </p>
        </div>
      </div>
    </div>
  );
}
