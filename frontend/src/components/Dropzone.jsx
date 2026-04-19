import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button.jsx";

export default function Dropzone({ file, onChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const accept = useMemo(() => ["image/png", "image/jpeg", "image/jpg", "image/webp"], []);

  const setFromFileList = useCallback(
    (files) => {
      const f = files?.[0];
      if (!f) return;
      if (!accept.includes(f.type)) {
        onChange(null, "Please select a PNG/JPG/WEBP image.");
        return;
      }
      onChange(f, "");
    },
    [accept, onChange]
  );

  return (
    <div className="space-y-3">
      <div
        className={`relative rounded-2xl border-2 border-dashed p-6 transition ${
          dragOver ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          setFromFileList(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFromFileList(e.target.files)}
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-sm font-semibold text-slate-900">
            Drag & drop an image here
          </div>
          <div className="text-xs text-slate-500">
            or choose a file (PNG/JPG/WEBP)
          </div>
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            Browse files
          </Button>
        </div>
      </div>

      {previewUrl && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-[420px] w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

