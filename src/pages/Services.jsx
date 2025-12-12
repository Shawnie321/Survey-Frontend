export default function Services() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 flex items-center justify-center">
      <div className="max-w-full sm:max-w-xl w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
        <h2 className="text-4xl font-extrabold mb-6 text-blue-700 text-center tracking-tight">
          Our Services
        </h2>
        <div className="grid gap-6">
          <div className="bg-blue-100 rounded-xl p-6 shadow flex flex-col items-center">
            <span className="text-2xl font-bold mb-2">
              Personal Training
            </span>
            <p className="text-gray-700 text-center">
              One-on-one coaching tailored to your goals and fitness level.
            </p>
          </div>
          <div className="bg-blue-100 rounded-xl p-6 shadow flex flex-col items-center">
            <span className="text-2xl font-bold mb-2">
              Group Classes
            </span>
            <p className="text-gray-700 text-center">
              Fun, motivating group workouts for all skill levels.
            </p>
          </div>
            <div className="bg-blue-100 rounded-xl p-6 shadow flex flex-col items-center">
            <span className="text-2xl font-bold mb-2">
              Nutrition Counseling
            </span>
            <p className="text-gray-700 text-center">
              Personalized nutrition plans and expert advice.
            </p>
          </div>
             <div className="bg-blue-100 rounded-xl p-6 shadow flex flex-col items-center">
            <span className="text-2xl font-bold mb-2">
              Strength & Conditioning
            </span>
            <p className="text-gray-700 text-center">
              Programs to build strength, endurance, and overall fitness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}