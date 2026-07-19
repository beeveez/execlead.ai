/**
 * Executive Intelligence Transparency Standard™ v1.0
 * --------------------------------------------------
 * Global store that allows any metric card across the platform
 * to open the Intelligence Analysis Panel™ without prop drilling.
 */

let _listeners = [];
let _state = { open: false, payload: null };

export function openIntelligenceAnalysis(payload) {
  _state = { open: true, payload };
  _listeners.forEach((fn) => fn(_state));
}

export function closeIntelligenceAnalysis() {
  _state = { open: false, payload: null };
  _listeners.forEach((fn) => fn(_state));
}

export function subscribeIntelligenceAnalysis(listener) {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((fn) => fn !== listener);
  };
}

export function getIntelligenceAnalysisState() {
  return _state;
}