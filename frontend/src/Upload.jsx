import React, { useState } from "react";
import "./App.css"
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

    if (preview) {
      URL.revokeObjectURL(preview);
    }

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

      if (!res.ok) {
        throw new Error("Server error");
      }

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold text-center text-gray-500">
          AI Crack Detection System
        </h1>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-4">
          <input
            type="file"
            onChange={handleFile}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4
              file:rounded-xl file:border-0 file:text-sm file:font-semibold
              file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
          />

          <button
            onClick={upload}
            disabled={!file || loading}
            className="w-full py-3 rounded-2xl bg-slate-800 text-white font-semibold
              hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Detecting..." : "Upload & Detect"}
          </button>
        </div>

        {preview && (
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">
              Selected Image
            </h3>
            <img
              src={preview}
              alt="preview"
              className="w-full max-h-[400px] object-contain rounded-2xl"
            />
          </div>
        )}

        {result && (
          <div className="bg-white rounded-3xl shadow-xl p-6 border-l-8 border-slate-800">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Result: {result}
            </h2>
            <h3 className="text-lg text-slate-600 mb-1">
              Severity: <span className="font-semibold">{severity}</span>
            </h3>
            <h4 className="text-lg text-slate-600">
              Crack %: <span className="font-semibold">{percentage}</span>
            </h4>
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;