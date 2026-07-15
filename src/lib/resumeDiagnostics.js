/**
 * Resume Upload Diagnostics
 * -------------------------
 * Lightweight in-memory + localStorage store that records
 * upload and parser events for developer observability.
 * Exposes a subscribe mechanism for the UI panel.
 */

const STORAGE_KEY = "resume_diagnostics";
const MAX_EVENTS = 100;

let events = [];
let listeners = new Set();
let lastUpload = null;
let health = {
  upload_component: "unknown",
  parser_engine: "unknown",
  extraction_engine: "unknown",
  resume_intelligence: "unknown",
};

// Load persisted state
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    events = parsed.events || [];
    lastUpload = parsed.lastUpload || null;
    health = { ...health, ...(parsed.health || {}) };
  }
} catch {}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ events, lastUpload, health }));
  } catch {}
}

function notify() {
  const snapshot = getSnapshot();
  listeners.forEach(fn => { try { fn(snapshot); } catch {} });
}

function getSnapshot() {
  return {
    events: [...events],
    lastUpload: lastUpload ? { ...lastUpload } : null,
    health: { ...health },
  };
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(getSnapshot());
  return () => listeners.delete(fn);
}

export function getDiagnostics() {
  return getSnapshot();
}

export function recordEvent(type, data = {}) {
  const event = {
    type,
    timestamp: Date.now(),
    ...data,
  };
  events.push(event);
  if (events.length > MAX_EVENTS) events = events.slice(-MAX_EVENTS);
  persist();
  notify();
}

export function setHealth(component, status) {
  health[component] = status;
  persist();
  notify();
}

export function recordUploadStart(fileInfo) {
  lastUpload = {
    filename: fileInfo.filename,
    fileSize: fileInfo.fileSize,
    fileType: fileInfo.fileType,
    startedAt: Date.now(),
    completedAt: null,
    parserStartedAt: null,
    parserFinishedAt: null,
    entitiesExtracted: 0,
    skillsExtracted: 0,
    experienceParsed: 0,
    errors: [],
    executionTimeMs: 0,
    status: "uploading",
  };
  recordEvent("upload_started", fileInfo);
  setHealth("upload_component", "healthy");
}

export function recordUploadCompleted(fileUrl) {
  if (!lastUpload) return;
  lastUpload.fileUrl = fileUrl;
  lastUpload.status = "uploaded";
  recordEvent("upload_completed", { fileUrl });
}

export function recordParserStart() {
  if (!lastUpload) return;
  lastUpload.parserStartedAt = Date.now();
  lastUpload.status = "parsing";
  setHealth("parser_engine", "running");
  recordEvent("parser_started");
}

export function recordParserFinished(extractedData) {
  if (!lastUpload) return;
  lastUpload.parserFinishedAt = Date.now();
  lastUpload.completedAt = Date.now();
  lastUpload.status = "completed";
  lastUpload.executionTimeMs = lastUpload.startedAt ? lastUpload.completedAt - lastUpload.startedAt : 0;

  if (extractedData) {
    lastUpload.entitiesExtracted =
      (extractedData.experience?.length || 0) +
      (extractedData.education?.length || 0) +
      (extractedData.certifications?.length || 0);
    lastUpload.skillsExtracted = extractedData.skills?.length || 0;
    lastUpload.experienceParsed = extractedData.experience?.length || 0;
  }

  setHealth("parser_engine", "healthy");
  setHealth("extraction_engine", "healthy");
  setHealth("resume_intelligence", "healthy");
  recordEvent("parser_finished", {
    entitiesExtracted: lastUpload.entitiesExtracted,
    skillsExtracted: lastUpload.skillsExtracted,
    experienceParsed: lastUpload.experienceParsed,
    executionTimeMs: lastUpload.executionTimeMs,
  });
}

export function recordError(message) {
  if (lastUpload) {
    lastUpload.errors.push({ message, timestamp: Date.now() });
    lastUpload.status = "error";
  }
  recordEvent("error", { message });
}

export function clearDiagnostics() {
  events = [];
  lastUpload = null;
  health = {
    upload_component: "unknown",
    parser_engine: "unknown",
    extraction_engine: "unknown",
    resume_intelligence: "unknown",
  };
  persist();
  notify();
}

export function clearParserCache() {
  try {
    const keys = Object.keys(localStorage).filter(k =>
      k.includes("resume_cache") || k.includes("parser_cache") || k.includes("resume_extract")
    );
    keys.forEach(k => localStorage.removeItem(k));
  } catch {}
  recordEvent("parser_cache_cleared");
}