/**
 * EXEC™ Telemetry Engine™
 * ------------------------
 * Captures, buffers, and flushes operational telemetry events.
 * Privacy-safe: redacts sensitive fields, consent-aware, opt-out supported.
 */
import { base44 } from "@/api/base44Client";

const BUFFER_FLUSH_INTERVAL = 10000;
const BUFFER_MAX_SIZE = 20;
const SESSION_ID_KEY = "exec_telemetry_session_id";
const CONSENT_KEY = "exec_telemetry_consent";

const SENSITIVE_PATTERNS = [
  /password/i, /token/i, /secret/i, /api.?key/i,
  /authorization/i, /credential/i, /ssn/i, /credit.?card/i,
];

let buffer = [];
let flushTimer = null;
let enabled = false;
let initialized = false;

function generateSessionId() {
  return `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = generateSessionId();
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return "sess-unknown";
  }
}

export function getTelemetryConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY) !== "false";
  } catch {
    return true;
  }
}

export function setTelemetryConsent(granted) {
  try {
    localStorage.setItem(CONSENT_KEY, granted ? "true" : "false");
  } catch {}
}

export function setTelemetryEnabled(val) {
  enabled = val;
  if (val && !initialized) initTelemetry();
}

function sanitizeProperties(props) {
  if (!props || typeof props !== "object") return {};
  const sanitized = {};
  for (const [key, value] of Object.entries(props)) {
    if (SENSITIVE_PATTERNS.some((p) => p.test(key))) continue;
    if (typeof value === "string" && value.length > 500) {
      sanitized[key] = value.substring(0, 500);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

const CATEGORY_MAP = {
  navigation: "navigation",
  search: "search",
  workspace_change: "workspace",
  button_click: "interaction",
  repair: "repair",
  verification: "verification",
  export: "export",
  ai_session: "ai",
  report_generation: "report",
  command_palette: "interaction",
  pdf_export: "export",
  session_duration: "session",
  login: "auth",
  logout: "auth",
  error: "error",
  warning: "warning",
  api_latency: "performance",
};

function deriveCategory(eventType) {
  return CATEGORY_MAP[eventType] || "interaction";
}

export async function flushBuffer() {
  if (buffer.length === 0) return;
  const events = [...buffer];
  buffer = [];
  try {
    await base44.entities.TelemetryEvent.bulkCreate(events);
  } catch {
    buffer = [...events, ...buffer].slice(0, 100);
  }
}

export function initTelemetry() {
  if (initialized) return;
  initialized = true;
  flushTimer = setInterval(() => { flushBuffer().catch(() => {}); }, BUFFER_FLUSH_INTERVAL);
  try {
    window.addEventListener("beforeunload", () => { flushBuffer().catch(() => {}); });
  } catch {}
}

export function track(eventType, properties = {}) {
  if (!enabled || !getTelemetryConsent()) return;

  const event = {
    event_type: eventType,
    event_category: deriveCategory(eventType),
    module: properties.module || "other",
    page_path: properties.page_path || (typeof window !== "undefined" ? window.location.pathname : ""),
    workspace: properties.workspace || null,
    session_id: getSessionId(),
    duration_ms: properties.duration_ms || 0,
    properties_json: JSON.stringify(sanitizeProperties(properties)),
    status: properties.status || "info",
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent.substring(0, 500) : "",
    is_anonymous: false,
  };

  buffer.push(event);
  if (buffer.length >= BUFFER_MAX_SIZE) flushBuffer().catch(() => {});
}

export function getTelemetryStats() {
  return {
    bufferSize: buffer.length,
    sessionId: getSessionId(),
    consent: getTelemetryConsent(),
    enabled,
    initialized,
  };
}