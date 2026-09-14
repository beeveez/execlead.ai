/**
 * Consent Service™ — Privacy Consent Lifecycle
 * ============================================================
 * Authoritative consent state management for RA 10173 compliance.
 *
 * Responsibilities:
 *   • Load and cache user consent records (sync access for AI boundary)
 *   • Grant / withdraw consent via ConsentRecord entity
 *   • Record required registration consent (terms + privacy_policy)
 *   • Expose sync consent checks for the AI personalization boundary
 *   • Synchronize analytics consent with the telemetry engine
 *
 * Design:
 *   • One ConsentRecord per consent_type per user (update-in-place)
 *   • Audit fields preserved (date_granted, date_withdrawn)
 *   • In-memory cache seeded by SubscriptionContext after auth
 *   • Fail-closed: if consent state is unknown (null), personalization is blocked
 *   • Analytics consent sync preserves existing local opt-out when authoritative
 *     state is unknown (null = no record)
 */
import { base44 } from "@/api/base44Client";
import { setTelemetryConsent } from "@/lib/telemetryEngine";

// ── In-memory consent cache ──
// null = unknown / not loaded; true = granted; false = withdrawn
let _cache = {
  marketing: null,
  ai_personalization: null,
  analytics: null,
  cookies: null,
  terms: null,
  privacy_policy: null,
};
let _userEmail = null;

// ============================================================
// LOAD — called by SubscriptionContext after auth
// ============================================================

export async function loadConsentState(email) {
  _userEmail = email;
  if (!email) return;
  try {
    const records = await base44.entities.ConsentRecord.filter({ user_email: email });
    _reduceConsents(records || []);
    _syncAnalyticsToTelemetry();
  } catch (e) {
    // Fail gracefully — cache stays null (unknown).
    // AI boundary will block personalization (fail-closed).
  }
}

function _reduceConsents(records) {
  // Latest record per consent_type is the current state
  const byType = {};
  for (const r of records) {
    const existing = byType[r.consent_type];
    if (!existing || new Date(r.created_date || r.updated_date || 0) >= new Date(existing.created_date || 0)) {
      byType[r.consent_type] = r;
    }
  }
  _cache = {
    marketing: byType.marketing?.granted ?? null,
    ai_personalization: byType.ai_personalization?.granted ?? null,
    analytics: byType.analytics?.granted ?? null,
    cookies: byType.cookies?.granted ?? null,
    terms: byType.terms?.granted ?? null,
    privacy_policy: byType.privacy_policy?.granted ?? null,
  };
}

// ============================================================
// SYNC ACCESS — for AI personalization boundary
// ============================================================

export function hasConsent(type) {
  return _cache[type] === true;
}

export function hasPersonalizationConsent() {
  return _cache.ai_personalization === true;
}

export function getConsentState(type) {
  return _cache[type];
}

// ============================================================
// GRANT / WITHDRAW — called by MyPrivacy ConsentTab
// ============================================================

export async function grantConsent(type, purpose) {
  const now = new Date().toISOString();
  try {
    const existing = await base44.entities.ConsentRecord.filter({ user_email: _userEmail, consent_type: type });
    const record = existing?.[0];
    if (record) {
      await base44.entities.ConsentRecord.update(record.id, {
        granted: true,
        date_granted: now,
        date_withdrawn: null,
        purpose: purpose || record.purpose,
      });
    } else {
      await base44.entities.ConsentRecord.create({
        consent_type: type,
        granted: true,
        date_granted: now,
        user_email: _userEmail,
        purpose: purpose || `${type} consent granted`,
        consent_version: "1.0",
      });
    }
    _cache[type] = true;
    if (type === "analytics") _syncAnalyticsToTelemetry();
    return true;
  } catch (e) {
    return false;
  }
}

export async function withdrawConsent(type) {
  const now = new Date().toISOString();
  try {
    const existing = await base44.entities.ConsentRecord.filter({ user_email: _userEmail, consent_type: type });
    const record = existing?.[0];
    if (record) {
      await base44.entities.ConsentRecord.update(record.id, {
        granted: false,
        date_withdrawn: now,
      });
    } else {
      await base44.entities.ConsentRecord.create({
        consent_type: type,
        granted: false,
        date_withdrawn: now,
        user_email: _userEmail,
        purpose: `${type} consent withdrawn`,
        consent_version: "1.0",
      });
    }
    _cache[type] = false;
    if (type === "analytics") _syncAnalyticsToTelemetry();
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================================
// REGISTRATION CONSENT — called after verifyOtp / OAuth login
// ============================================================

export async function recordRegistrationConsent(email) {
  _userEmail = email;
  const now = new Date().toISOString();
  const required = [
    { type: "terms", purpose: "Terms of Service accepted at registration" },
    { type: "privacy_policy", purpose: "Privacy Policy accepted at registration" },
  ];
  for (const { type, purpose } of required) {
    try {
      const existing = await base44.entities.ConsentRecord.filter({ user_email: email, consent_type: type });
      if (!existing?.length) {
        await base44.entities.ConsentRecord.create({
          consent_type: type,
          granted: true,
          date_granted: now,
          user_email: email,
          purpose,
          consent_version: "1.0",
        });
      }
      _cache[type] = true;
    } catch (e) {
      // Non-blocking — consent recording is best-effort at registration
    }
  }
}

// ============================================================
// ANALYTICS → TELEMETRY SYNC
// ============================================================

function _syncAnalyticsToTelemetry() {
  // null = unknown — preserve existing local opt-out mechanism
  // true/false = authoritative — override local state
  if (_cache.analytics === null) return;
  setTelemetryConsent(_cache.analytics === true);
}