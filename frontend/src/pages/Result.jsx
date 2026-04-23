import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Card from "../components/Card.jsx";
import Spinner from "../components/Spinner.jsx";
import { getResult } from "../services/api.js";

function severityColor(sev) {
  const s = String(sev || "").toLowerCase();
  if (s === "high") return "bg-red-600";
  if (s === "medium") return "bg-amber-500";
  if (s === "low") return "bg-emerald-600";
  return "bg-slate-500";
}

export default function Result() {
  const { id } = useParams();
  const location = useLocation();
  const stateResult = location.state?.result || null;

  const [loading, setLoading] = useState(!stateResult);
  const [result, setResult] = useState(stateResult);

  useEffect(() => {
    let alive = true;
    if (stateResult) return;
    (async () => {
      try {
        const res = await getResult(id);
        if (!alive) return;
        setResult(res);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, stateResult]);

  const actions = useMemo(() => result?.recommendedActions || null, [result]);

  return (
    <div className="space-y-6">
      <Card
        title={`Result #${id}`}
        subtitle={result?.imageName ? `Source: ${result.imageName}` : "Detection result"}
      >
        {loading ? (
          <Spinner label="Loading result..." />
        ) : !result ? (
          <p className="text-sm text-slate-600">Result not found.</p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Severity</div>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${severityColor(result.severity)}`} />
                  <span className="text-sm font-semibold text-slate-900">{result.severity}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm font-semibold text-slate-900">Confidence</div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: `${Math.round(result.confidence)}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-slate-600">{Math.round(result.confidence)}%</div>
              </div>
            </div>

            <Card title="Description">
              <p className="text-sm text-slate-700">{result.description}</p>
            </Card>

            <Card title="Suggested actions" subtitle="Recommended follow-up behaviour">
              <ul className="space-y-2 text-sm text-slate-700">
                {(actions || [
                  "Verify regions visually and confirm crack continuity.",
                  "Capture multiple angles/distances for better comparison.",
                  "Escalate if severity increases across uploads.",
                ]).map((a, idx) => (
                  <li key={idx}>• {a}</li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}

