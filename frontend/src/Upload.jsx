import React, { useState } from "react";
import "./App.css";

function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [severity, setSeverity] = useState("");
  const [percentage, setPercentage] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);

    if (preview) URL.revokeObjectURL(preview);

    setPreview(URL.createObjectURL(selected));
    setResult("");
    setSeverity("");
    setPercentage("");
  };

  const upload = async () => {
    if (!file) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data.result);
      setSeverity(data.severity);
      setPercentage(data.percentage);
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    setResult("");
    setSeverity("");
    setPercentage("");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-6">

        <h1 className="text-4xl font-bold text-center text-slate-800">
          AI Crack Detection System
        </h1>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-5">

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-8 cursor-pointer hover:bg-slate-50 transition">
            <span className="text-slate-600 font-medium">
              Click to upload or drag image
            </span>
            <input
              type="file"
              onChange={handleFile}
              className="hidden"
            />
          </label>

          <button
            onClick={upload}
            disabled={!file || loading}
            className="w-full py-3 rounded-2xl bg-slate-800 text-white font-semibold
              hover:bg-slate-700 transition disabled:opacity-50"
          >
            {loading ? "Detecting..." : "Upload & Detect"}
          </button>
        </div>

        {preview && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-slate-700">
                Selected Image
              </h3>

              <button
                onClick={removeImage}
                className="text-red-500 font-medium hover:underline"
              >
                Remove
              </button>
            </div>

            <img
              src={preview}
              alt="preview"
              className="w-full max-h-[400px] object-contain rounded-2xl"
            />
          </div>
        )}

        {result && (
          <div className="bg-white rounded-3xl shadow-xl p-6 border-l-8 border-slate-800 space-y-3">

            <h2 className="text-2xl font-bold text-slate-800">
              Result: {result}
            </h2>

            <h3 className="text-lg text-slate-600">
              Severity: <span className="font-semibold">{severity}</span>
            </h3>

            <h4 className="text-lg text-slate-600">
              Crack %: <span className="font-semibold">{percentage}</span>
            </h4>

            {percentage && (
              <div className="w-full bg-slate-200 rounded-full h-3 mt-2">
                <div
                  className="bg-slate-800 h-3 rounded-full transition-all"
                  style={{ width: `${percentage}` }}
                />
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default Upload;