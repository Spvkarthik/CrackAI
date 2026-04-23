import axios from "axios";
import { getToken, getUser, setAuth } from "./authStorage.js";
import {
  localGetHistory,
  localGetResult,
  localPrependHistory,
  localUpsertResult,
} from "./localDb.js";

const API_BASE_URL = "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function asErrorMessage(err) {
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Something went wrong";
  return String(message);
}

function normalizeResult(payload, { fallbackId, imageUrl }) {
  const id =
    payload?.id ||
    payload?.resultId ||
    payload?._id ||
    payload?.data?.id ||
    fallbackId;

  const severity = payload?.severity || payload?.data?.severity || "Medium";
  const confidenceRaw =
    payload?.confidence ??
    payload?.data?.confidence ??
    payload?.percentage ??
    payload?.data?.percentage ??
    78;

  const confidence =
    typeof confidenceRaw === "string" ? Number(confidenceRaw) : confidenceRaw;

  const description =
    payload?.description ||
    payload?.data?.description ||
    "Crack-like patterns detected. Review highlighted areas and confirm with visual inspection.";

  const boxes =
    payload?.boxes ||
    payload?.overlayBoxes ||
    payload?.data?.boxes ||
    payload?.data?.overlayBoxes ||
    null;

  const hideImage = Boolean(payload?.hideImage || payload?.data?.hideImage);
  const recommendedActions =
    payload?.recommendedActions ||
    payload?.data?.recommendedActions ||
    payload?.actions ||
    payload?.data?.actions ||
    null;

  return {
    id: String(id),
    imageUrl: hideImage
      ? ""
      : payload?.imageUrl || payload?.data?.imageUrl || imageUrl,
    imageName: payload?.imageName || payload?.data?.imageName || null,
    hideImage,
    severity,
    confidence: Math.max(
      0,
      Math.min(100, Number.isFinite(confidence) ? confidence : 0),
    ),
    description,
    overlayBoxes: Array.isArray(boxes) ? boxes : null,
    recommendedActions: Array.isArray(recommendedActions)
      ? recommendedActions
      : null,
    createdAt:
      payload?.createdAt ||
      payload?.data?.createdAt ||
      new Date().toISOString(),
  };
}

function mockBoxes() {
  // percentages relative to container
  const count = 3 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }).map(() => ({
    x: 10 + Math.random() * 70,
    y: 10 + Math.random() * 70,
    w: 10 + Math.random() * 18,
    h: 6 + Math.random() * 14,
  }));
}

export async function login({ email, password }) {
  try {
    const res = await client.post("/login", { email, password });
    const token =
      res.data?.token || res.data?.access_token || res.data?.data?.token;
    const user = res.data?.user ||
      res.data?.data?.user || { name: res.data?.name, email: res.data?.email };

    if (!token) throw new Error("Login succeeded but no token returned.");
    setAuth({ token, user });
    return { token, user };
  } catch (err) {
    // Surface the error to the caller so the UI shows a clear message and
    // we don't store an invalid/demo token that will cause 401s on protected
    // endpoints (which previously led to silent fallbacks to mocked results).
    // Preserve original error message for UI display.
    const message = asErrorMessage(err);
    const out = new Error(message);
    out.original = err;
    throw out;
  }
}

export async function register({ name, email, password }) {
  try {
    const res = await client.post("/register", { name, email, password });
    return res.data;
  } catch (err) {
    // Surface registration errors so the UI can show the failure instead of
    // pretending the account was created. This avoids confusing states where
    // users think they registered but cannot log in.
    const message = asErrorMessage(err);
    const out = new Error(message);
    out.original = err;
    throw out;
  }
}

export async function uploadImage(file) {
  const form = new FormData();
  form.append("image", file);

  const fallbackId = `${Date.now()}`;
  const imageUrl = URL.createObjectURL(file);

  try {
    const res = await client.post("/analyze", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const result = normalizeResult(res.data, { fallbackId, imageUrl });
    if (!result.overlayBoxes) result.overlayBoxes = mockBoxes();

    localUpsertResult(result);
    localPrependHistory({
      id: result.id,
      createdAt: result.createdAt,
      severity: result.severity,
      confidence: result.confidence,
      thumbnailUrl: result.imageUrl,
    });

    return result;
  } catch {
    const result = normalizeResult(
      {
        id: fallbackId,
        severity: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        confidence: 60 + Math.floor(Math.random() * 35),
        description:
          "Backend unavailable; showing a mocked overlay. Wire your backend response fields to replace this.",
        overlayBoxes: mockBoxes(),
      },
      { fallbackId, imageUrl },
    );

    localUpsertResult(result);
    localPrependHistory({
      id: result.id,
      createdAt: result.createdAt,
      severity: result.severity,
      confidence: result.confidence,
      thumbnailUrl: result.imageUrl,
    });

    return result;
  }
}

export async function getHistory() {
  try {
    const res = await client.get("/history");
    const items =
      res.data?.items || res.data?.history || res.data?.data || res.data;
    if (Array.isArray(items)) return items;
    return localGetHistory();
  } catch {
    return localGetHistory();
  }
}

export async function getResult(id) {
  try {
    const res = await client.get(`/results/${id}`);
    const result = normalizeResult(res.data, {
      fallbackId: String(id),
      imageUrl: localGetResult(String(id))?.imageUrl || "",
    });
    if (!result.overlayBoxes)
      result.overlayBoxes =
        localGetResult(String(id))?.overlayBoxes || mockBoxes();
    localUpsertResult(result);
    return result;
  } catch {
    const cached = localGetResult(String(id));
    if (cached) return cached;
    return normalizeResult(
      {
        id: String(id),
        severity: "Medium",
        confidence: 72,
        description:
          "No backend result found. This is a placeholder result so the page renders.",
        overlayBoxes: mockBoxes(),
      },
      { fallbackId: String(id), imageUrl: "" },
    );
  }
}

export function getMe() {
  return getUser();
}
