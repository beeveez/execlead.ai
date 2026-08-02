/**
 * EXEC™ Reliability Engine
 * ============================================================
 * Stage-by-stage pipeline instrumentation for EXEC™.
 *
 * Every EXEC™ message flows through 10 stages:
 *   1. message_received   6. executive_context
 *   2. auth               7. callAI / ai_call
 *   3. workspace           8. ai_provider_response
 *   4. persona            9. response_parse / quality_gate
 *   5. knowledge_pack     10. render
 *
 * Each stage logs { stage, status, latencyMs, error, correlationId }.
 * Failures are traceable to the exact stage + correlation ID.
 *
 * Health rollup powers the EXEC™ Health panel (Developer Workspace only).
 */

const MAX_EVENTS = 200;
const _events = [];

export function newCorrelationId() {
  return `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function logStage({ correlationId, stage, status, latencyMs, error, extra }) {
  const evt = {
    correlationId: correlationId || "unknown",
    stage,
    status: status || "success",
    latencyMs: typeof latencyMs === "number" ? latencyMs : null,
    error: error || null,
    ts: Date.now(),
    ...(extra || {}),
  };
  _events.push(evt);
  if (_events.length > MAX_EVENTS) _events.shift();

  if (status === "failure") {
    console.error(`[EXEC™ Reliability] ✗ ${stage} FAILED (cid=${evt.correlationId})`, error || "");
  } else {
    const ms = evt.latencyMs != null ? ` ${evt.latencyMs}ms` : "";
    console.debug(`[EXEC™ Reliability] ✓ ${stage}${ms} (cid=${evt.correlationId})`);
  }
  return evt;
}

// AI-call stage events power the provider health metrics.
export function getExecHealth(windowSize = 50) {
  const aiEvents = _events.filter((e) => e.stage === "ai_call").slice(-windowSize);
  const total = aiEvents.length;
  const success = aiEvents.filter((e) => e.status === "success").length;
  const fail = total - success;
  const latencies = aiEvents.filter((e) => typeof e.latencyMs === "number" && e.status === "success").map((e) => e.latencyMs);
  const avgLatency = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  const lastSuccess = [...aiEvents].reverse().find((e) => e.status === "success");
  const lastFailureEvt = [...aiEvents].reverse().find((e) => e.status === "failure");

  let connectivity = "unknown";
  if (total > 0) connectivity = success > 0 ? "operational" : "down";

  return {
    provider: lastSuccess?.provider || lastFailureEvt?.provider || "—",
    model: lastSuccess?.model || lastFailureEvt?.model || "—",
    connectivity,
    avgLatency,
    successRate: total ? Math.round((success / total) * 100) : 0,
    errorRate: total ? Math.round((fail / total) * 100) : 0,
    lastSuccessAt: lastSuccess ? new Date(lastSuccess.ts).toISOString() : null,
    total,
    success,
    fail,
  };
}

export function getExecEvents(limit = 50) {
  return _events.slice(-limit).reverse();
}

export function getLastFailure() {
  for (let i = _events.length - 1; i >= 0; i--) {
    if (_events[i].status === "failure") return _events[i];
  }
  return null;
}

export function clearExecEvents() {
  _events.length = 0;
}