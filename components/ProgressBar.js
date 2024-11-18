export default function ProgressBar({ completion }) {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-green-500 h-4 transition-all duration-500"
            style={{ width: `${completion}%` }}
          ></div>
        </div>
        <p className="text-right text-gray-600 mt-2">{completion}% Complete</p>
      </div>
    </div>
  );
}
