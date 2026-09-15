/**
 * Phase 8.3 — qualify_own_prospect (Growth Agent, READ-ONLY analysis).
 * ============================================================
 * Strict input contract and deterministic qualification engine answering
 * "Is this prospect worth pursuing?" from information ALREADY present in the
 * authenticated user's own Prospect record.
 *
 * Pure and deterministic: no LLM, no InvokeLLM, no network, no external
 * verification or research, no writes of ANY Prospect field (status,
 * qualification_score, notes, intelligence_summary — all untouched), no
 * record creation, no leads, no opportunities, no email, no messaging, no
 * CRM, no payments, no scheduling, no background work, no autonomous
 * pursuit. The output is RETURN-ONLY; recommended_status is advisory and
 * never mutates the actual Prospect.status.
 *
 * Ownership: the caller is resolved SERVER-side by the orchestration chain.
 * Client-supplied identity keys (user_id, owner_user_id, organization_id)
 * are never read — they are rejected by the input contract as unknown keys.
 * The record lookup is always anchored to the server-resolved authenticated
 * user, so cross-user, cross-organization, and platform-wide access are
 * structurally impossible through this tool.
 *
 * Evidence integrity: evidence may only reference information present in the
 * Prospect record or in a VERIFIED server-issued prospect_intelligence
 * execution owned by the same user. An intelligence_reference that does not
 * resolve to a real SUCCEEDED server-issued execution owned by the caller is
 * treated as unavailable and labeled UNKNOWN — never fabricated.
 *
 * This module is written in plain JS syntax so the exact shipped file can be
 * executed by the deterministic test suite without a Deno runtime.
 */

export const PROSPECT_QUALIFY_TOOL_ID = 'qualify_own_prospect';
export const PROSPECT_QUALIFY_TOOL_VERSION = '1.0.0';
export const PROSPECT_QUALIFY_ANALYSIS_MODE = 'deterministic_v1';
export const PROSPECT_QUALIFY_SCORE_CAP = 90;
export const PROSPECT_QUALIFY_STATUSES = ['NEW', 'QUALIFIED', 'DISQUALIFIED', 'PURSUING', 'CONVERTED'];
export const PROSPECT_QUALIFY_EPISTEMIC_LABELS = ['OBSERVED', 'INFERRED', 'UNKNOWN'];

export const PROSPECT_QUALIFY_VERIFICATION_NOTICE =
  'Deterministic v1 qualification analysis. Based ONLY on the Prospect record owned by the authenticated caller. '
  + 'No LLM was invoked, no external verification or research was performed, and no Prospect field was modified. '
  + 'recommended_status is advisory only — the actual Prospect.status is unchanged.';

// Registry definition mirrored for deterministic tests. The LIVE
// AgentToolRegistry record is the authority; this constant documents the
// Phase 8.3 definition and stays DRAFT + disabled in code until activation.
export const PROSPECT_QUALIFY_TOOL_REGISTRY_DEF = {
  tool_id: PROSPECT_QUALIFY_TOOL_ID,
  name: 'Qualify Own Prospect',
  target_type: 'INTERNAL_SERVICE',
  target_name: 'prospectQualification',
  operation: 'INVOKE',
  execution_scope: 'user_scoped',
  permission_scope: 'self_records',
  risk_level: 'low',
  human_approval_required: false,
  allowed_agent_ids: ['growth_agent'],
  status: 'DRAFT',
  enabled: false,
};

// The ONLY input key a qualification request may carry. Everything else —
// identity, ownership, tenant, selector, query, database, filter, projection,
// and mode keys — is rejected.
const ALLOWED_INPUT_KEYS = ['prospect_id'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function reject(error_code, error) {
  return { ok: false, error_code, error };
}

/** Safe preview of a rejected field name — never echoes raw client input. */
function fieldPreview(name) {
  return String(name).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown';
}

function hasValue(v) {
  return v !== undefined && v !== null && typeof v === 'string' && v.trim() !== '';
}

/**
 * Validate a qualification request input. The ONLY accepted shape is an
 * object with exactly one required key: `prospect_id` (a bounded UUID
 * issued server-side at Prospect creation). Unknown keys — including
 * client-supplied identity, ownership, tenant, selector, query, database,
 * filter, field, and mode keys — are rejected before anything runs.
 */
export function validateQualifyInput(rawInput) {
  if (rawInput === null || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return reject('QUALIFY_INPUT_INVALID', 'Qualification input must be a plain object with a prospect_id.');
  }
  for (const key of Object.keys(rawInput)) {
    if (!ALLOWED_INPUT_KEYS.includes(key)) {
      return reject('QUALIFY_INPUT_FIELD_REJECTED',
        `Unsupported qualification input field "${fieldPreview(key)}" — only prospect_id is accepted.`);
    }
  }
  const raw = rawInput.prospect_id;
  if (raw === undefined || raw === null || raw === '') {
    return reject('QUALIFY_PROSPECT_ID_REQUIRED', 'prospect_id is required.');
  }
  if (typeof raw !== 'string' || raw.length > 100 || !UUID_RE.test(raw.trim())) {
    return reject('QUALIFY_PROSPECT_ID_INVALID',
      'prospect_id must be the bounded prospect identifier issued at record creation.');
  }
  return { ok: true, input: { prospect_id: raw.trim().toLowerCase() } };
}

/**
 * Deterministic hash of a qualification request's allowed input. Used ONLY
 * to key idempotency per logical request (per prospect) — never for
 * authorization. Total over any input value.
 */
export function qualifyInputHash(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return '';
  const s = typeof input.prospect_id === 'string' ? input.prospect_id : '';
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

// Deterministic lifecycle-status scoring (points, from the record itself).
const STATUS_POINTS = { NEW: 0, QUALIFIED: 10, PURSUING: 10, CONVERTED: 15, DISQUALIFIED: -30 };

/**
 * Safe not-found result. Returns no prospect data and leaks no information
 * about whether the prospect_id exists for any other user or organization —
 * a Prospect owned by someone else resolves to this same result.
 */
export function buildQualificationNotFound(prospectId) {
  return {
    found: false,
    prospect_id: prospectId,
    qualification: null,
    notice: 'No Prospect record matching this prospect_id is owned by the authenticated caller. '
      + 'No cross-user, cross-organization, or platform-wide lookup is performed; no prospect data is returned.',
    verification_notice: PROSPECT_QUALIFY_VERIFICATION_NOTICE,
  };
}

/**
 * Deterministic v1 qualification analysis. Reads ONLY the supplied
 * Prospect record (already fetched by the orchestration core under the
 * server-resolved owner) plus a flag stating whether the record's
 * intelligence_reference was VERIFIED server-side against a real SUCCEEDED
 * server-issued prospect_intelligence execution owned by the same user.
 * Never mutates the record; never fabricates evidence; no LLM.
 *
 * Scoring model (explainable, deterministic, capped at 90 — never 100,
 * because no external verification is performed):
 *   company_name +10 | website +10 | industry +10 | location +5 | notes +5
 *   intelligence_summary +10 | qualification_score up to +20 (proportional)
 *   verified server-issued prospect intelligence +15
 *   lifecycle status: QUALIFIED +10, PURSUING +10, CONVERTED +15, DISQUALIFIED -30
 * Missing information earns no points and lowers confidence — never inflates.
 */
export function buildQualification(record, opts) {
  const options = opts || {};
  const intelligenceVerified = options.intelligence_verified === true;
  const status = PROSPECT_QUALIFY_STATUSES.includes(record.status) ? record.status : 'NEW';
  const hasQs = typeof record.qualification_score === 'number' && Number.isInteger(record.qualification_score);
  const hasRef = hasValue(record.intelligence_reference);

  const scoreFactors = [];
  const addFactor = (factor, points, label, source) => {
    scoreFactors.push({ factor, points, label, source });
  };

  addFactor('company_name on record', 10, 'OBSERVED', 'prospect_record');
  if (hasValue(record.website)) addFactor('website on record', 10, 'OBSERVED', 'prospect_record');
  if (hasValue(record.industry)) addFactor('industry on record', 10, 'OBSERVED', 'prospect_record');
  if (hasValue(record.location)) addFactor('location on record', 5, 'OBSERVED', 'prospect_record');
  if (hasValue(record.notes)) addFactor('notes on record', 5, 'OBSERVED', 'prospect_record');
  if (hasValue(record.intelligence_summary)) addFactor('intelligence_summary on record', 10, 'OBSERVED', 'prospect_record');
  if (hasQs) {
    addFactor('qualification_score on record', Math.min(20, Math.round(record.qualification_score * 0.2)), 'OBSERVED', 'prospect_record');
  }
  if (hasRef && intelligenceVerified) {
    addFactor('verified server-issued prospect intelligence', 15, 'OBSERVED', 'verified_prospect_intelligence');
  }
  const statusPoints = STATUS_POINTS[status] || 0;
  if (statusPoints !== 0) {
    addFactor(`lifecycle status ${status} on record`, statusPoints, 'OBSERVED', 'prospect_record');
  }

  const rawScore = scoreFactors.reduce((sum, f) => sum + f.points, 0);
  const score = Math.max(0, Math.min(PROSPECT_QUALIFY_SCORE_CAP, rawScore));
  const dimensions = scoreFactors.filter((f) => f.points > 0).length;

  // Missing information — explicit, deterministic, never fabricated.
  const missingInformation = [];
  if (!hasValue(record.website)) missingInformation.push({ field: 'website', why: 'No website on record — direct channel reachability is unknown.' });
  if (!hasValue(record.industry)) missingInformation.push({ field: 'industry', why: 'No industry on record — targeted positioning cannot be assessed.' });
  if (!hasValue(record.location)) missingInformation.push({ field: 'location', why: 'No location on record — geographic fit cannot be assessed.' });
  if (!hasQs) missingInformation.push({ field: 'qualification_score', why: 'No qualification_score on record — no recorded interest-fit signal.' });
  if (!hasValue(record.intelligence_summary)) missingInformation.push({ field: 'intelligence_summary', why: 'No intelligence_summary on record — no prior intelligence context.' });
  if (!hasValue(record.notes)) missingInformation.push({ field: 'notes', why: 'No notes on record — no operator context.' });

  // Confidence — categorical with explicit basis; missing information reduces it.
  const coreEvidence = [
    hasValue(record.website), hasValue(record.industry), hasValue(record.location),
    hasQs, hasValue(record.intelligence_summary),
  ].filter(Boolean).length;
  let confidenceLevel = 'LOW';
  let confidenceBasis;
  if (intelligenceVerified && hasQs && hasValue(record.website) && hasValue(record.industry)) {
    confidenceLevel = 'HIGH';
    confidenceBasis = 'Verified server-issued prospect intelligence, a recorded qualification_score, and both website and industry are present on the record.';
  } else if (coreEvidence >= 3) {
    confidenceLevel = 'MEDIUM';
    confidenceBasis = `${coreEvidence} of 5 core evidence fields are present on the record; missing information reduces confidence.`;
  } else {
    confidenceBasis = `Only ${coreEvidence} of 5 core evidence fields are present on the record; missing information reduces confidence to LOW.`;
  }

  // Fit assessment — deterministic bands, always labeled INFERRED.
  let fitAssessment;
  if (score >= 70) fitAssessment = 'Strong fit based on available record evidence.';
  else if (score >= 50) fitAssessment = 'Promising fit — moderate evidence on record.';
  else if (score >= 30) fitAssessment = 'Limited-evidence fit — qualification not yet supported by the record.';
  else fitAssessment = 'Insufficient evidence to assess fit.';

  // Opportunity signals — only from facts actually on the record.
  const opportunitySignals = [];
  if (hasQs && record.qualification_score >= 60) {
    opportunitySignals.push({ signal: 'Recorded qualification_score is at or above 60.', basis: 'qualification_score on record', label: 'OBSERVED' });
  }
  if (status === 'PURSUING' || status === 'CONVERTED') {
    opportunitySignals.push({ signal: 'Record lifecycle is already beyond NEW.', basis: `status ${status} on record`, label: 'OBSERVED' });
  }
  if (hasRef && intelligenceVerified) {
    opportunitySignals.push({ signal: 'Verified server-issued prospect intelligence is available.', basis: 'intelligence_reference resolves to a SUCCEEDED server-issued prospect_intelligence execution owned by the same user', label: 'OBSERVED', source: 'verified_prospect_intelligence' });
  }
  if (hasValue(record.industry)) {
    opportunitySignals.push({ signal: 'Industry category is recorded, supporting targeted positioning.', basis: 'industry on record', label: 'INFERRED' });
  }
  if (hasValue(record.website)) {
    opportunitySignals.push({ signal: 'Website is on record, enabling human-led channel research.', basis: 'website on record', label: 'INFERRED' });
  }

  // Risk signals — observed, inferred, or unknown; never fabricated.
  const riskSignals = [];
  if (status === 'DISQUALIFIED') {
    riskSignals.push({ signal: 'Record is marked DISQUALIFIED.', basis: 'status on record', label: 'OBSERVED' });
  }
  if (hasRef && !intelligenceVerified) {
    riskSignals.push({ signal: 'intelligence_reference does not resolve to a verified server-issued prospect intelligence execution — treated as unavailable.', basis: 'server-side reference verification', label: 'UNKNOWN' });
  }
  if (!hasValue(record.website)) riskSignals.push({ signal: 'No website on record — reachability is unknown.', basis: 'website absent from record', label: 'UNKNOWN' });
  if (!hasValue(record.industry)) riskSignals.push({ signal: 'No industry on record — positioning cannot be assessed.', basis: 'industry absent from record', label: 'UNKNOWN' });
  if (score < 30) {
    riskSignals.push({ signal: 'Sparse record — assessment carries LOW confidence.', basis: 'deterministic score below 30', label: 'INFERRED' });
  }

  // Evidence — only record facts and verified intelligence. No fabrication.
  const evidence = scoreFactors
    .filter((f) => f.points > 0)
    .map((f) => ({ finding: f.factor, label: f.label, source: f.source }));
  if (hasRef && intelligenceVerified) {
    evidence.push({ finding: 'intelligence_reference verified against a real SUCCEEDED server-issued prospect_intelligence execution owned by the same user.', label: 'OBSERVED', source: 'verified_prospect_intelligence' });
  }
  if (hasRef && !intelligenceVerified) {
    evidence.push({ finding: 'intelligence_reference present but NOT verified against a server-issued prospect_intelligence execution owned by this user — not relied upon.', label: 'UNKNOWN', source: 'prospect_record' });
  }

  // Recommended status — ADVISORY ONLY, never applied to the record.
  let recommendedStatus;
  if (status === 'DISQUALIFIED') recommendedStatus = 'DISQUALIFIED';
  else if (status === 'QUALIFIED' || status === 'PURSUING' || status === 'CONVERTED') recommendedStatus = status;
  else if (score >= 70) recommendedStatus = 'QUALIFIED';
  else recommendedStatus = 'NEW';

  // Recommended next step — deterministic, human-in-the-loop, never autonomous.
  let recommendedNextStep;
  if (status === 'DISQUALIFIED') {
    recommendedNextStep = 'Human owner should confirm or overturn the recorded disqualification before any pursuit.';
  } else if (score >= 70 && intelligenceVerified) {
    recommendedNextStep = 'Human review for a pursuit decision — this analysis recommends but never pursues.';
  } else if (score >= 70) {
    recommendedNextStep = 'Human review for a pursuit decision — enrich the record with verified prospect intelligence to raise confidence.';
  } else if (score >= 45) {
    recommendedNextStep = 'Gather additional evidence (website, industry, qualification inputs, verified prospect intelligence) before qualifying.';
  } else {
    recommendedNextStep = 'Enrich the prospect record before qualification assessment.';
  }

  const qualificationSummary = `Deterministic qualification analysis for "${record.company_name}" produced a bounded score of `
    + `${score}/${PROSPECT_QUALIFY_SCORE_CAP} — evidence is drawn only from the caller-owned Prospect record with no external verification. `
    + `Confidence is ${confidenceLevel} based on ${dimensions} contributing evidence dimension(s)`
    + (missingInformation.length > 0 ? `; ${missingInformation.length} information field(s) missing.` : '.');

  return {
    found: true,
    prospect_id: record.prospect_id,
    company_name: record.company_name,
    observed_status: status,
    analysis_mode: PROSPECT_QUALIFY_ANALYSIS_MODE,
    qualification_summary: qualificationSummary,
    fit_assessment: { assessment: fitAssessment, basis: `deterministic score ${score}/${PROSPECT_QUALIFY_SCORE_CAP}`, label: 'INFERRED' },
    qualification_score: score,
    score_cap: PROSPECT_QUALIFY_SCORE_CAP,
    score_cap_basis: 'No external verification is performed, so the score is capped below 100.',
    score_factors: scoreFactors,
    opportunity_signals: opportunitySignals,
    risk_signals: riskSignals,
    missing_information: missingInformation,
    recommended_next_step: recommendedNextStep,
    recommended_status: recommendedStatus,
    recommendation_only: true,
    status_note: 'Advisory only — the actual Prospect.status is unchanged by this analysis.',
    confidence: { level: confidenceLevel, basis: confidenceBasis },
    intelligence_reference_verified: intelligenceVerified,
    evidence,
    epistemic_labels: PROSPECT_QUALIFY_EPISTEMIC_LABELS,
    verification_notice: PROSPECT_QUALIFY_VERIFICATION_NOTICE,
  };
}