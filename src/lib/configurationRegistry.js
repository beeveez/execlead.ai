// Configuration Registry™ — Phase 7.
// Centralized configurable values: AI provider, model, rate limits, feature
// flags, billing plans, prompt versions, external APIs. Avoid hard-coded
// provider details scattered across the codebase.

const DEFAULTS = {
  'ai.default_model': 'automatic',
  'ai.coach_model': 'automatic',
  'ai.simulate_model': 'automatic',
  'ai.rate_limit_per_min': 60,
  'feature_flags.refresh_interval_ms': 30000,
  'billing.currency': 'USD',
  'external.airtable_enabled': true,
  'external.gmail_enabled': true,
  'prompt.default_version': '1.0',
  'repository.active_backend': 'base44',
  'partners.ecosystem_target': 14,
  'partners.currency': 'USD',
  'partners.allowed_attribution_models': ['Partner-Sourced', 'Partner-Assisted', 'Partner-Integrated'],
};

const OVERRIDES = {};

export function setConfig(key, value) { OVERRIDES[key] = value; }

export function getConfig(key, fallback = null) {
  if (key in OVERRIDES) return OVERRIDES[key];
  if (key in DEFAULTS) return DEFAULTS[key];
  return fallback;
}

export function listConfig() {
  return Object.keys(DEFAULTS).map((k) => ({
    key: k,
    value: getConfig(k),
    overridden: k in OVERRIDES,
  }));
}

export function resetConfig(key) { delete OVERRIDES[key]; }

export default { setConfig, getConfig, listConfig, resetConfig };