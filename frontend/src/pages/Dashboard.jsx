import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import Spinner from "../components/Spinner.jsx";
import SeverityChart from "../components/SeverityChart.jsx";
import { getHistory, getMe } from "../services/api.js";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function Dashboard() {
  const user = useMemo(() => getMe(), []);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const items = await getHistory();
        if (!alive) return;
        setHistory(Array.isArray(items) ? items : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const uploads = history.length;
    const cracksDetected = history.filter((h) => String(h?.severity || "").toLowerCase() !== "none")
      .length;
    const lastUpload = history[0]?.createdAt || history[0]?.date || history[0]?.uploadedAt || "";
    return { uploads, cracksDetected, lastUpload };
  }, [history]);

  const recent = useMemo(() => history.slice(0, 6), [history]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome, {user?.name || "User"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Here’s a quick overview of your crack detection activity.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <Spinner label="Loading dashboard..." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card title="Total uploads" subtitle="Images analyzed to date">
              <div className="text-3xl font-semibold text-slate-900">{stats.uploads}</div>
            </Card>
            <Card title="Cracks detected" subtitle="Based on severity metadata">
              <div className="text-3xl font-semibold text-slate-900">
                {stats.cracksDetected}
              </div>
            </Card>
            <Card title="Last upload" subtitle="Most recent analysis timestamp">
              <div className="text-sm font-semibold text-slate-900">
                {formatDate(stats.lastUpload)}
              </div>
            </Card>
          </div>

          <Card
            title="Severity progress"
            subtitle="Trend of Low / Medium / High across your uploads"
          >
            <SeverityChart items={history} />
          </Card>

          <Card title="Recent activity" subtitle="Your latest uploads and outcomes">
            {recent.length === 0 ? (
              <p className="text-sm text-slate-600">
                No uploads yet. Head to Upload to analyze your first image.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recent.map((item) => {
                  const id = item?.id || item?._id || item?.resultId;
                  const createdAt = item?.createdAt || item?.date || item?.uploadedAt;
                  const severity = item?.severity || "—";
                  const confidence = item?.confidence ?? item?.percentage;
                  return (
                    <div key={String(id)} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          Result #{String(id)}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {formatDate(createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">{severity}</div>
                        <div className="text-xs text-slate-500">
                          {confidence != null ? `${Math.round(Number(confidence))}%` : "—"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

