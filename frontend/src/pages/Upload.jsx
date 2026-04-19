import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card.jsx";
import Dropzone from "../components/Dropzone.jsx";
import Button from "../components/Button.jsx";
import Spinner from "../components/Spinner.jsx";
import { uploadImage } from "../services/api.js";

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onFileChange = (nextFile, errMsg) => {
    setFile(nextFile);
    setError(errMsg || "");
  };

  const onUpload = async () => {
    if (!file) {
      setError("Please choose an image to upload.");
      return;
    }
    setError("");
    try {
      setLoading(true);
      const result = await uploadImage(file);
      navigate(`/app/results/${result.id}`, { state: { result }, replace: true });
    } catch (err) {
      setError(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Upload an image"
        subtitle="Drag & drop a structural image to detect and analyze cracks."
      >
        <Dropzone file={file} onChange={onFileChange} />

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            API: <span className="font-mono">POST http://localhost:5000/api/analyze</span>
          </div>
          <Button onClick={onUpload} disabled={!file || loading}>
            {loading ? <Spinner label="Processing..." /> : "Upload & Detect"}
          </Button>
        </div>
      </Card>

      <Card title="What happens next?" subtitle="How results are generated">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">1) Upload</div>
            <div className="mt-1 text-xs text-slate-600">
              Your image is sent to the analysis endpoint.
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">2) Detect</div>
            <div className="mt-1 text-xs text-slate-600">
              The model predicts crack locations and severity.
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">3) Review</div>
            <div className="mt-1 text-xs text-slate-600">
              View overlays, confidence, and save to history.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

