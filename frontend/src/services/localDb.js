const HISTORY_KEY = "crackai_history_v1";
const RESULTS_KEY = "crackai_results_v1";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function localGetHistory() {
  return readJson(HISTORY_KEY, []);
}

export function localGetResult(id) {
  const all = readJson(RESULTS_KEY, {});
  return all?.[id] || null;
}

export function localUpsertResult(result) {
  const all = readJson(RESULTS_KEY, {});
  all[result.id] = result;
  writeJson(RESULTS_KEY, all);
}

export function localPrependHistory(item) {
  const history = readJson(HISTORY_KEY, []);
  const next = [item, ...history].slice(0, 100);
  writeJson(HISTORY_KEY, next);
}

