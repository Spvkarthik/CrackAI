const fs = require("fs");

function recommendedActionsFor(severity) {
  const s = String(severity || "").toLowerCase();
  if (s === "high") {
    return [
      "Stop work in the immediate area if safety is uncertain.",
      "Schedule an urgent on-site inspection and measure crack width/length.",
      "Document with close-ups + wider context photos for comparison.",
      "Consider temporary supports / load reduction until evaluated.",
    ];
  }
  if (s === "medium") {
    return [
      "Mark crack endpoints and re-check in 24–72 hours.",
      "Capture images from consistent angle/distance for trend tracking.",
      "Inspect nearby joints/edges for secondary cracking.",
      "Escalate if growth is observed across uploads.",
    ];
  }
  return [
    "Continue periodic monitoring; re-upload at regular intervals.",
    "Capture another image from a closer distance for clarity.",
    "Log location and environmental conditions (moisture, temperature).",
  ];
}

async function analyzeWithLocalMlService(imagePath, opts) {
  const baseUrl = (opts?.baseUrl || process.env.ML_SERVICE_URL || "http://localhost:5050").replace(
    /\/$/,
    ""
  );

  // Node 18+ has fetch/FormData/Blob globally (via undici).
  const fd = new FormData();
  const buf = fs.readFileSync(imagePath);
  fd.append("image", new Blob([buf]), "image.jpg");

  const res = await fetch(`${baseUrl}/detect`, { method: "POST", body: fd });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`ML service failed (${res.status})`);
    err.statusCode = res.status;
    err.body = text;
    throw err;
  }

  const data = JSON.parse(text);
  const severity = String(data?.severity || "Medium");
  const ratio = Number(data?.crack_ratio ?? 0);
  const count = Number(data?.crack_count ?? 0);

  const confidence = Math.max(0, Math.min(100, Math.round(40 + ratio * 1000)));
  const description =
    severity === "High"
      ? "Severe cracking detected. Immediate inspection and mitigation is recommended."
      : severity === "Medium"
        ? "Moderate cracking detected. Monitor closely and compare with previous uploads."
        : "Minor cracking detected. Continue periodic monitoring.";

  return {
    severity,
    confidence,
    description,
    overlayBoxes: [],
    recommendedActions: recommendedActionsFor(severity),
    metrics: {
      crackAreaPct: Number((ratio * 100).toFixed(2)),
      maxWidthMm: 0,
      lengthCm: 0,
      damageScore: severity === "High" ? 85 : severity === "Medium" ? 55 : 25,
      crackCount: Number.isFinite(count) ? count : 0,
    },
    provider: { name: "local_ml_service", url: baseUrl },
  };
}

module.exports = { analyzeWithLocalMlService };

