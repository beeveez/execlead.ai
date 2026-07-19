/**
 * Metric Intelligence™ — Global Drawer Store
 *
 * Module-level state so any MetricCard anywhere in the app
 * can open the drill-down drawer without page-level wiring.
 */

const listeners = new Set();
let state = { open: false, metricId: null, score: 0, previous: null, label: null };

export function getMetricDrawerState() {
  return state;
}

export function openMetricDrawer(metricId, score, previous, label) {
  state = { open: true, metricId, score, previous, label };
  notify();
}

export function closeMetricDrawer() {
  state = { open: false, metricId: null, score: 0, previous: null, label: null };
  notify();
}

export function subscribeToMetricDrawer(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l(state));
}