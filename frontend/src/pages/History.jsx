import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import Spinner from "../components/Spinner.jsx";
import { getHistory } from "../services/api.js";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function History() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getHistory();
        if (!alive) return;
        setItems(Array.isArray(res) ? res : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const normalized = useMemo(() => {
    return items.map((it) => {
      const id = String(it?.id || it?._id || it?.resultId || "");
      const createdAt = it?.createdAt || it?.date || it?.uploadedAt || "";
      const thumbnailUrl = it?.thumbnailUrl || it?.thumbnail || it?.imageUrl || "";
      const severity = it?.severity || "—";
      const confidence = it?.confidence ?? it?.percentage ?? null;
      return { id, createdAt, thumbnailUrl, severity, confidence };
    });
  }, [items]);

  return (
    <Card title="Upload history" subtitle="Browse and open previous detection results">
      {loading ? (
        <Spinner label="Loading history..." />
      ) : normalized.length === 0 ? (
        <p className="text-sm text-slate-600">
          No history yet. Go to Upload to analyze your first image.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {normalized.map((it) => (
            <Link
              key={it.id}
              to={`/app/results/${it.id}`}
              className="flex items-center gap-4 py-4 transition hover:bg-slate-50"
            >
              <div className="h-16 w-16 flex-none overflow-hidden rounded-xl border border-slate-200 bg-white">
                {it.thumbnailUrl ? (
                  <img
                    src={it.thumbnailUrl}
                    alt="thumbnail"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">
                  Result #{it.id}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">{formatDate(it.createdAt)}</div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">{it.severity}</div>
                <div className="text-xs text-slate-500">
                  {it.confidence != null ? `${Math.round(Number(it.confidence))}%` : "—"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

