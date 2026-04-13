
function Landingpage({ setPage }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 p-6">
      <h1 className="text-5xl font-bold text-slate-800 mb-4">
        AI Crack Detection
      </h1>

      <p className="text-lg text-slate-600 mb-8 text-center max-w-xl">
        Upload surface images and detect cracks instantly using AI powered analysis.
      </p>

      <button
        onClick={() => setPage("upload")}
        className="px-8 py-3 bg-slate-800 text-white rounded-2xl font-semibold hover:bg-slate-700 transition"
      >
        Get Started
      </button>
    </div>
  );
}

export default Landingpage;