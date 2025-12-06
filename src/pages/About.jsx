export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-2 text-blue-700 text-center tracking-tight">
          About the System
        </h2>
        <hr className="my-2 border-blue-100" />
        <p className="text-base text-gray-700 mb-2 text-center">
          This system allows collecting and analyzing customer satisfaction data in a secure and user-friendly way.
        </p>
        <div className="bg-blue-50 rounded-xl p-3 shadow text-center flex flex-col items-center gap-2">
          <span className="text-lg font-bold text-blue-600 mb-1 block">
            Technology Stack
          </span>
          <div className="flex items-center justify-center gap-2 mb-1">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
              alt="React"
              className="w-6 h-6"
            />
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg"
              alt=".NET"
              className="w-6 h-6"
            />
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"
              alt="SQL"
              className="w-6 h-6"
            />
          </div>
          <p className="text-gray-700 text-sm">
            Survey frontend built with React and Tailwind CSS, connected to an ASP.NET
            Core API and SQL database for robust data management.
          </p>
        </div>
      </div>
    </div>
  );
}
