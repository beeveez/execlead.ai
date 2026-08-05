// Service Observability™ — in-memory operational counters for Platform Services.
// Counters increment as migrated consumers run, powering the live dashboard panel.

const state = {
  repositoryCalls: 0,
  aiCalls: 0,
  errors: 0,
  warnings: 0,
  byService: {},
  latencies: [],
};

function bump(service) { state.byService[service] = (state.byService[service] || 0) + 1; }

export function recordRepositoryCall(service = 'repository') { state.repositoryCalls++; bump(service); }
export function recordAICall(service = 'AIService') { state.aiCalls++; bump(service); }
export function recordError(service = 'system') { state.errors++; bump(`${service}:errors`); }
export function recordWarning() { state.warnings++; }
export function recordLatency(ms) {
  state.latencies.push(ms);
  if (state.latencies.length > 50) state.latencies.shift();
}

export function getObservability() {
  const avg = state.latencies.length
    ? Math.round(state.latencies.reduce((a, b) => a + b, 0) / state.latencies.length)
    : 0;
  return {
    repositoryCalls: state.repositoryCalls,
    aiCalls: state.aiCalls,
    errors: state.errors,
    warnings: state.warnings,
    avgResponseTimeMs: avg,
    byService: { ...state.byService },
  };
}

export function resetObservability() {
  state.repositoryCalls = 0; state.aiCalls = 0; state.errors = 0; state.warnings = 0;
  state.byService = {}; state.latencies = [];
}

export default { recordRepositoryCall, recordAICall, recordError, recordWarning, recordLatency, getObservability, resetObservability };