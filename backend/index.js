const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");

const { db, initDb } = require("./lib/db");
const { authMiddleware } = require("./lib/auth");
const { analyzeWithLocalMlService } = require("./lib/mlService");

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
let demoImageSeq = 0;

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").slice(0, 12) || ".jpg";
    demoImageSeq += 1;
    cb(null, `image${demoImageSeq}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
});

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/register", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!name) return res.status(400).json({ message: "Name is required" });
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ message: "Valid email is required" });
  if (!password || password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  const existing = db.data.users.find((u) => u.email === email);
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: nanoid(), name, email, passwordHash, createdAt: new Date().toISOString() };
  db.data.users.push(user);
  await db.write();

  return res.json({ ok: true });
});

app.post("/api/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const user = db.data.users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = issueToken(user);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get("/api/me", authMiddleware(JWT_SECRET), (req, res) => {
  return res.json({ user: req.user });
});

// Upload + analyze
app.post("/api/analyze", authMiddleware(JWT_SECRET), upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image file is required (field name: image)" });

  const structureName = String(req.body?.structureName || "Default Structure").trim();
  const locationTag = String(req.body?.locationTag || "General").trim();

  const imageName = req.file.filename || `image${Date.now()}`;
  const createdAt = new Date().toISOString();

  const analysis = await analyzeWithLocalMlService(req.file.path);
  const resultId = nanoid();

  const result = {
    id: resultId,
    userId: req.user.id,
    structureName,
    locationTag,
    imageUrl: "",
    imageName,
    hideImage: true,
    createdAt,
    severity: analysis.severity,
    confidence: analysis.confidence,
    description: analysis.description,
    overlayBoxes: analysis.overlayBoxes,
    metrics: analysis.metrics, // crackAreaPct, damageScore, etc.
    recommendedActions: analysis.recommendedActions,
  };

  db.data.results.push(result);

  db.data.history.unshift({
    id: resultId,
    userId: req.user.id,
    structureName,
    locationTag,
    createdAt,
    severity: result.severity,
    confidence: result.confidence,
    thumbnailUrl: "",
    imageName,
    damageScore: result.metrics.damageScore,
    crackAreaPct: result.metrics.crackAreaPct,
  });

  db.data.history = db.data.history.slice(0, 500);
  await db.write();

  return res.json(result);
});

app.get("/api/history", authMiddleware(JWT_SECRET), (req, res) => {
  const structureName = req.query?.structureName ? String(req.query.structureName) : "";
  const locationTag = req.query?.locationTag ? String(req.query.locationTag) : "";

  let items = db.data.history.filter((h) => h.userId === req.user.id);
  if (structureName) items = items.filter((h) => h.structureName === structureName);
  if (locationTag) items = items.filter((h) => h.locationTag === locationTag);

  return res.json({ items });
});

app.get("/api/results/:id", authMiddleware(JWT_SECRET), (req, res) => {
  const id = String(req.params.id);
  const result = db.data.results.find((r) => r.id === id && r.userId === req.user.id);
  if (!result) return res.status(404).json({ message: "Result not found" });
  return res.json(result);
});

// Trend for a structure/location (damageScore over time)
app.get("/api/trend", authMiddleware(JWT_SECRET), (req, res) => {
  const structureName = req.query?.structureName ? String(req.query.structureName) : "";
  const locationTag = req.query?.locationTag ? String(req.query.locationTag) : "";
  const metric = req.query?.metric ? String(req.query.metric) : "damageScore";

  let rows = db.data.history.filter((h) => h.userId === req.user.id);
  if (structureName) rows = rows.filter((h) => h.structureName === structureName);
  if (locationTag) rows = rows.filter((h) => h.locationTag === locationTag);

  const points = rows
    .slice()
    .reverse()
    .map((h) => ({
      id: h.id,
      createdAt: h.createdAt,
      value: Number(h[metric] ?? 0),
    }));

  return res.json({ metric, points });
});

// Alerts based on recent slope/spikes
app.get("/api/alerts", authMiddleware(JWT_SECRET), (req, res) => {
  const structureName = req.query?.structureName ? String(req.query.structureName) : "";
  const locationTag = req.query?.locationTag ? String(req.query.locationTag) : "";

  let rows = db.data.history.filter((h) => h.userId === req.user.id);
  if (structureName) rows = rows.filter((h) => h.structureName === structureName);
  if (locationTag) rows = rows.filter((h) => h.locationTag === locationTag);

  const last = rows.slice(0, 14).slice().reverse(); // oldest -> newest
  const alerts = [];

  if (last.length >= 2) {
    const prev = last[last.length - 2];
    const curr = last[last.length - 1];
    const delta = (curr.damageScore ?? 0) - (prev.damageScore ?? 0);
    if (delta > 10) {
      alerts.push({
        type: "SPIKE",
        level: "high",
        message: `Damage score spiked by +${delta.toFixed(1)} since last upload.`,
        at: curr.createdAt,
      });
    } else if (delta > 4) {
      alerts.push({
        type: "INCREASE",
        level: "medium",
        message: `Damage score increased by +${delta.toFixed(1)} since last upload.`,
        at: curr.createdAt,
      });
    }
  }

  const highs = last.filter((x) => String(x.severity).toLowerCase() === "high");
  if (highs.length >= 3) {
    alerts.push({
      type: "PERSISTENT_HIGH",
      level: "high",
      message: "High severity detected repeatedly in recent uploads.",
      at: highs[highs.length - 1].createdAt,
    });
  }

  return res.json({ alerts });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend:", err);
    process.exit(1);
  });

