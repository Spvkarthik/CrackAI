import { useMemo } from "react";

function toSeverityScore(sev) {
  const s = String(sev || "").toLowerCase();
  if (s === "high") return 3;
  if (s === "medium") return 2;
  if (s === "low") return 1;
  return null;
}

function formatTick(score) {
  if (score === 3) return "High";
  if (score === 2) return "Medium";
  if (score === 1) return "Low";
  return "";
}

export default function SeverityChart({ items }) {
  const points = useMemo(() => {
    const rows = Array.isArray(items) ? items : [];
    // show oldest -> newest, keep it readable
    const ordered = rows.slice().reverse().slice(-30);
    return ordered
      .map((h) => {
        const createdAt = h?.createdAt || h?.date || h?.uploadedAt || "";
        const t = new Date(createdAt).getTime();
        const y = toSeverityScore(h?.severity);
        if (!Number.isFinite(t) || y == null) return null;
        return { t, y };
      })
      .filter(Boolean);
  }, [items]);

  if (points.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
        Upload a few images to see severity progress.
      </div>
    );
  }

  const W = 720;
  const H = 220;
  const padL = 52;
  const padR = 16;
  const padT = 14;
  const padB = 26;

  const tMin = Math.min(...points.map((p) => p.t));
  const tMax = Math.max(...points.map((p) => p.t));
  const xSpan = Math.max(1, tMax - tMin);

  const xFor = (t) => padL + ((t - tMin) / xSpan) * (W - padL - padR);
  const yFor = (y) => {
    // map 1..3 to chart space (3 at top)
    const pct = (3 - y) / 2; // 0..1
    return padT + pct * (H - padT - padB);
  };

  const d = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${xFor(p.t).toFixed(2)} ${yFor(p.y).toFixed(2)}`)
    .join(" ");

  const yTicks = [3, 2, 1].map((score) => ({
    score,
    y: yFor(score),
    label: formatTick(score),
  }));

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-56 w-full overflow-visible rounded-xl border border-slate-200 bg-white"
        role="img"
        aria-label="Severity progress over time"
        preserveAspectRatio="none"
      >
        {/* grid + labels */}
        {yTicks.map((t) => (
          <g key={t.score}>
            <line x1={padL} x2={W - padR} y1={t.y} y2={t.y} stroke="#e2e8f0" strokeWidth="1" />
            <text
              x={padL - 10}
              y={t.y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#64748b"
            >
              {t.label}
            </text>
          </g>
        ))}

        {/* line */}
        <path d={d} fill="none" stroke="#0f172a" strokeWidth="2.5" />

        {/* dots */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={xFor(p.t)}
            cy={yFor(p.y)}
            r="4"
            fill="#0f172a"
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}

        {/* x axis */}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="#e2e8f0" />
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Older</span>
        <span>Newer</span>
      </div>
    </div>
  );
}

