function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function mockBoxes() {
  const count = 3 + Math.floor(Math.random() * 4);
  return Array.from({ length: count }).map(() => ({
    x: rand(8, 78),
    y: rand(8, 78),
    w: rand(10, 18),
    h: rand(6, 14),
  }));
}

function analyzeMock() {
  // metrics designed for trend tracking
  const crackAreaPct = clamp(rand(0.5, 18), 0, 100);
  const maxWidthMm = clamp(rand(0.1, 3.5), 0, 10);
  const lengthCm = clamp(rand(2, 120), 0, 300);

  // weighted score 0..100
  const damageScore = clamp(crackAreaPct * 3 + maxWidthMm * 8 + lengthCm * 0.15, 0, 100);

  const severity =
    damageScore >= 70 ? "High" : damageScore >= 35 ? "Medium" : "Low";

  const confidence = clamp(Math.round(rand(62, 96)), 0, 100);

  const description =
    severity === "High"
      ? "Significant crack-like patterns detected. Consider immediate inspection and mitigation."
      : severity === "Medium"
        ? "Moderate crack-like patterns detected. Monitor closely and compare with past uploads."
        : "Minor crack-like patterns detected. Continue periodic monitoring.";

  return {
    severity,
    confidence,
    description,
    overlayBoxes: mockBoxes(),
    metrics: {
      crackAreaPct: Number(crackAreaPct.toFixed(2)),
      maxWidthMm: Number(maxWidthMm.toFixed(2)),
      lengthCm: Number(lengthCm.toFixed(1)),
      damageScore: Number(damageScore.toFixed(1)),
    },
  };
}

module.exports = { analyzeMock };

