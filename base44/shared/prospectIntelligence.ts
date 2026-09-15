/**
 * Prospect Intelligence™ — Phase 7 Workforce business-capability service definition.
 * ============================================================
 * The FIRST business-capability tool definition for the future Growth Agent.
 *
 * Registry state (AgentToolRegistry, authoritative):
 *   tool_id            : prospect_intelligence
 *   status             : DRAFT  (MUST remain DRAFT + enabled=false until the
 *                              Growth Agent is formally activated in a later
 *                              phase — DRAFT tools can NEVER execute through
 *                              the orchestration core, which requires
 *                              ACTIVE + enabled at request time)
 *   allowed_agent_ids  : ['growth_agent']  (exact id, no wildcards)
 *   target_type        : INTERNAL_SERVICE
 *   target_name        : prospectIntelligence
 *   operation          : INVOKE
 *   execution_scope    : user_scoped
 *   permission_scope   : self_records
 *   risk_level         : low
 *   human_approval_required : false
 *
 * Security model (Phase 7 — READ-ONLY INTELLIGENCE ONLY):
 * - NO execution path exists in ANY boundary for this tool. This module is a
 *   service DEFINITION plus a deterministic analysis engine. The shared Agent
 *   Orchestration Core™ is unchanged and is the only execution boundary; it
 *   structurally refuses DRAFT tools (TOOL_NOT_EXECUTABLE).
 * - The caller input is INERT descriptive data. Field values are never used as
 *   entity names, function names, operations, URLs, queries, or tool selectors.
 *   A strict field allowlist + format caps prevent Prospect Intelligence from
 *   being used as a generic data-access mechanism.
 * - NO LLM is invoked by this engine (v1 is deterministic — zero AI credits,
 *   no consent, budget, or telemetry surface). If a later phase adds LLM
 *   synthesis, it MUST route through the Phase 6 governed AI adapter
 *   (governedGenerate) — direct LLM calls are prohibited.
 * - NO external network access, scraping, messaging, email, CRM changes,
 *   monetary transactions, scheduling, loops, or background work exist here.
 * - Epistemic truthfulness: every claim is labeled OBSERVED (caller-supplied),
 *   INFERRED (deterministic heuristic, labeled as such), or UNKNOWN. External
 *   verification is NEVER performed and NEVER claimed. Confidence is derived
 *   only from input completeness — never manufactured.
 */

export const PROSPECT_TOOL_ID = 'prospect_intelligence';
export const PROSPECT_SERVICE_NAME = 'prospectIntelligence';
export const PROSPECT_SERVICE_VERSION = '0.1.0';
export const PROSPECT_INTENDED_AGENT = 'growth_agent';

/** The authoritative AgentToolRegistry definition values for this tool. */
export const PROSPECT_TOOL_REGISTRY_DEF = {
  tool_id: PROSPECT_TOOL_ID,
  name: 'Prospect Intelligence',
  description: 'Read-only prospect/company intelligence for executive pursuit decisions. Analyzes caller-supplied prospect information and returns structured, epistemically-labeled intelligence (OBSERVED / INFERRED / UNKNOWN). Performs no outreach, no external verification, no CRM mutation, and no persistence. DRAFT — reserved for the future Growth Agent; not executable until formal activation.',
  target_type: 'INTERNAL_SERVICE',
  target_name: PROSPECT_SERVICE_NAME,
  operation: 'INVOKE',
  execution_scope: 'user_scoped',
  permission_scope: 'self_records',
  risk_level: 'low',
  human_approval_required: false,
  status: 'DRAFT',
  enabled: false,
  allowed_agent_ids: [PROSPECT_INTENDED_AGENT],
  source: 'platform_config',
  version: PROSPECT_SERVICE_VERSION,
};

export const EPISTEMIC_LABELS = ['OBSERVED', 'INFERRED', 'UNKNOWN'];

const VERIFICATION_NOTICE =
  'No external verification was performed. All OBSERVED facts are caller-supplied only; ' +
  'INFERRED items are deterministic heuristic outputs; everything else is UNKNOWN. ' +
  'Do not treat this result as externally verified company intelligence.';

// ── Input contract ──────────────────────────────────────────────────────
// Strict allowlist. Any other key is rejected — this is what prevents the
// capability from being used as a generic data-access mechanism (no entity
// names, function names, operations, arbitrary URLs, queries, or selectors).
const ALLOWED_FIELDS = ['company_name', 'website', 'industry', 'location', 'context'];

const BARE_DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

function cleanString(value, maxLen) {
  const s = String(value ?? '').trim().replace(/\s+/g, ' ');
  if (s.length === 0) return '';
  return s.length > maxLen ? null : s;
}

/**
 * Validate and normalize a narrowly-defined prospect input.
 * Rejects: missing company_name, non-object bodies, unknown fields, control
 * characters, selector-looking payloads, and anything that is not a bare
 * domain for `website` (no scheme, path, port, query, or fragment).
 */
export function validateProspectInput(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error_code: 'PROSPECT_INPUT_MALFORMED', error: 'Prospect input must be a JSON object.' };
  }
  const keys = Object.keys(body);
  const unknownKeys = keys.filter((k) => !ALLOWED_FIELDS.includes(k));
  if (unknownKeys.length > 0) {
    return {
      ok: false,
      error_code: 'PROSPECT_INPUT_FIELD_REJECTED',
      error: `Unsupported field(s): ${unknownKeys.join(', ')}. Only ${ALLOWED_FIELDS.join(', ')} are accepted.`,
    };
  }

  const companyName = typeof body.company_name === 'string' ? cleanString(body.company_name, 120) : null;
  if (!companyName || companyName.length < 2) {
    return { ok: false, error_code: 'PROSPECT_COMPANY_NAME_REQUIRED', error: 'A company_name of 2–120 characters is required.' };
  }
  if (/[\u0000-\u001f\u007f]/.test(companyName) || /[<>]/.test(companyName) || /:\/\//.test(companyName)) {
    return { ok: false, error_code: 'PROSPECT_COMPANY_NAME_INVALID', error: 'company_name contains invalid characters.' };
  }

  const input = { company_name: companyName };

  if (body.website !== undefined && body.website !== null && body.website !== '') {
    const w = String(body.website).trim().toLowerCase();
    if (!BARE_DOMAIN_RE.test(w)) {
      return {
        ok: false,
        error_code: 'PROSPECT_WEBSITE_INVALID',
        error: 'website must be a bare domain (e.g. acme.com) — schemes, paths, ports, queries, and fragments are not accepted.',
      };
    }
    input.website = w;
  }

  for (const field of ['industry', 'location']) {
    if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
      const v = cleanString(body[field], 100);
      if (v === null || /[\u0000-\u001f\u007f<>]/.test(v) || /:\/\//.test(v)) {
        return { ok: false, error_code: 'PROSPECT_INPUT_MALFORMED', error: `${field} exceeds 100 characters or contains invalid characters.` };
      }
      input[field] = v;
    }
  }

  if (body.context !== undefined && body.context !== null && body.context !== '') {
    const c = cleanString(body.context, 500);
    if (c === null || /[\u0000-\u001f\u007f<>]/.test(c)) {
      return { ok: false, error_code: 'PROSPECT_CONTEXT_INVALID', error: 'context exceeds 500 characters or contains invalid characters.' };
    }
    input.context = c;
  }

  return { ok: true, input };
}

// ── Deterministic industry heuristic model ───────────────────────────────
// INFERRED outputs come exclusively from this model. It makes NO claims about
// the specific prospect — only pattern-level statements labeled as heuristics.
const INDUSTRY_MODELS = [
  {
    match: ['technology', 'software', 'saas', 'it', 'cloud', 'ai', 'platform'],
    category: 'Technology / Software',
    business_model_indicators: ['Recurring subscription or usage-based revenue is common in this category', 'Product-led growth motions are common in this category'],
    strategic_priorities: ['Scaling efficiently while preserving margin', 'Talent retention in competitive markets', 'Moving upmarket or expanding product scope'],
    pain_points: ['Leadership bandwidth strained by rapid growth', 'Transitioning founder-led execution to a structured executive operating rhythm', 'Board and investor communication demands increasing'],
  },
  {
    match: ['financial', 'banking', 'fintech', 'insurance', 'capital', 'investment'],
    category: 'Financial Services',
    business_model_indicators: ['Regulated revenue models with long sales cycles are common in this category'],
    strategic_priorities: ['Regulatory compliance and risk governance', 'Cost discipline under margin pressure', 'Digital transformation of legacy operations'],
    pain_points: ['Executive succession and bench depth under scrutiny', 'Stakeholder trust and transparency demands', 'Balancing innovation with compliance constraints'],
  },
  {
    match: ['healthcare', 'health', 'pharma', 'medical', 'biotech'],
    category: 'Healthcare / Life Sciences',
    business_model_indicators: ['Reimbursement- and outcome-driven revenue models are common in this category'],
    strategic_priorities: ['Clinical or product safety and quality', 'Operational cost containment', 'Regulatory navigation across markets'],
    pain_points: ['Complex cross-functional leadership coordination', 'Retention of specialized executive talent', 'Evidence-based decision-making requirements'],
  },
  {
    match: ['retail', 'consumer', 'ecommerce', 'e-commerce', 'commerce'],
    category: 'Retail / Consumer',
    business_model_indicators: ['Volume-driven, margin-sensitive revenue models are common in this category'],
    strategic_priorities: ['Omnichannel customer experience', 'Supply chain resilience', 'Margin protection amid cost inflation'],
    pain_points: ['Leadership alignment across distributed operations', 'Speed of decision-making in volatile demand cycles', 'Digital capability gaps at the executive level'],
  },
  {
    match: ['manufacturing', 'industrial', 'logistics', 'supply'],
    category: 'Manufacturing / Industrial',
    business_model_indicators: ['Asset- and throughput-driven revenue models are common in this category'],
    strategic_priorities: ['Operational excellence and Lean Six Sigma maturity', 'Automation and workforce transition', 'Supplier and geopolitical risk diversification'],
    pain_points: ['Aging leadership pipelines and succession gaps', 'Bridging operational and commercial leadership mindsets', 'Continuous improvement program fatigue'],
  },
  {
    match: ['consulting', 'professional', 'services', 'agency', 'legal'],
    category: 'Professional Services',
    business_model_indicators: ['Billable-utilization revenue models are common in this category'],
    strategic_priorities: ['Partner or principal pipeline development', 'Practice-area diversification', 'Pricing power amid commoditization'],
    pain_points: ['Rainmaker concentration risk', 'Transitioning senior practitioners into enterprise leadership roles', 'Knowledge transfer and institutional memory'],
  },
  {
    match: ['education', 'edtech', 'learning', 'university'],
    category: 'Education',
    business_model_indicators: ['Enrollment- and funding-driven revenue models are common in this category'],
    strategic_priorities: ['Digital learning transformation', 'Enrollment and retention economics', 'Stakeholder and community trust'],
    pain_points: ['Governance complexity across committees and boards', 'Budget constraint leadership', 'Change management at institutional scale'],
  },
  {
    match: ['energy', 'utilities', 'mining', 'oil', 'gas'],
    category: 'Energy / Utilities',
    business_model_indicators: ['Capital-intensive, regulated revenue models are common in this category'],
    strategic_priorities: ['Energy transition strategy', 'Asset reliability and safety culture', 'Regulatory and community relations'],
    pain_points: ['Long-horizon capital decision governance', 'Technical-to-executive leadership transitions', 'Talent gaps in transformation roles'],
  },
];

function matchIndustry(industry) {
  if (!industry) return null;
  const i = industry.toLowerCase();
  return INDUSTRY_MODELS.find((m) => m.match.some((k) => i.includes(k))) || null;
}

// ── Confidence model ─────────────────────────────────────────────────────
// Confidence is derived ONLY from input completeness. It can never reach the
// maximum because no external verification is performed (hard cap 60).
const MAX_CONFIDENCE = 60;
const INSUFFICIENT_EVIDENCE_THRESHOLD = 35;

function computeConfidence(input, industryMatched) {
  const supplied = ['company_name', 'website', 'industry', 'location', 'context']
    .filter((f) => Boolean(input[f])).length;
  let score = 10 + supplied * 8 + (industryMatched ? 10 : 0);
  score = Math.min(score, MAX_CONFIDENCE);
  const basis = [
    `${supplied} of 5 input fields supplied by the caller`,
    industryMatched ? 'industry matched a heuristic category model' : 'industry not matched to any heuristic category model',
    'no external verification performed',
  ];
  return { score, basis };
}

/**
 * Build a structured, epistemically-truthful Prospect Intelligence result from
 * validated caller-supplied input. Deterministic: no LLM, no network, no DB.
 */
export function buildProspectIntelligence(input, now = new Date()) {
  const model = matchIndustry(input.industry);
  const confidence = computeConfidence(input, Boolean(model));
  const insufficient = confidence.score < INSUFFICIENT_EVIDENCE_THRESHOLD;
  const evidence = [];

  // ── OBSERVED (caller-supplied only) ──
  const observed = [`Company name: ${input.company_name} (supplied by caller, not verified)`];
  evidence.push({ claim: `Prospect company name is "${input.company_name}"`, epistemic_label: 'OBSERVED', basis: 'caller-supplied input field', source: 'caller_supplied' });
  if (input.website) {
    observed.push(`Website/domain: ${input.website} (supplied by caller, not visited or verified)`);
    evidence.push({ claim: `Caller supplied the domain ${input.website}`, epistemic_label: 'OBSERVED', basis: 'caller-supplied input field', source: 'caller_supplied' });
  } else {
    evidence.push({ claim: 'No public web presence data was supplied', epistemic_label: 'UNKNOWN', basis: 'website field absent from input', source: 'input_completeness' });
  }
  if (input.industry) {
    observed.push(`Stated industry: ${input.industry} (supplied by caller, not verified)`);
    evidence.push({ claim: `Caller stated the industry as "${input.industry}"`, epistemic_label: 'OBSERVED', basis: 'caller-supplied input field', source: 'caller_supplied' });
  }
  if (input.location) {
    observed.push(`Stated location: ${input.location} (supplied by caller, not verified)`);
    evidence.push({ claim: `Caller stated the location as "${input.location}"`, epistemic_label: 'OBSERVED', basis: 'caller-supplied input field', source: 'caller_supplied' });
  }
  if (input.context) {
    observed.push(`Engagement context: ${input.context} (supplied by caller)`);
    evidence.push({ claim: 'Caller supplied an engagement context note', epistemic_label: 'OBSERVED', basis: 'caller-supplied input field', source: 'caller_supplied' });
  }

  const company_overview = {
    epistemic_label: 'OBSERVED',
    status: 'AVAILABLE',
    content: ['Caller-supplied facts only:', ...observed.map((o) => `- ${o}`), 'No additional company facts are known. This system did not verify any claim about this company.'],
  };

  // ── Industry / category ──
  const industry_category = model
    ? {
        epistemic_label: 'INFERRED',
        status: 'AVAILABLE',
        content: [`Heuristic category match: ${model.category} (inferred from the caller-stated industry "${input.industry}")`],
      }
    : {
        epistemic_label: 'UNKNOWN',
        status: input.industry ? 'INSUFFICIENT_EVIDENCE' : 'UNKNOWN',
        content: input.industry
          ? [`The stated industry "${input.industry}" did not match any heuristic category model — INSUFFICIENT EVIDENCE for categorization.`]
          : ['No industry was supplied — UNKNOWN.'],
      };
  if (model) {
    evidence.push({ claim: `Category ${model.category} is a heuristic match`, epistemic_label: 'INFERRED', basis: 'deterministic industry keyword model', source: 'heuristic_industry_model' });
  }

  const inferSection = (items, subject) =>
    items
      ? { epistemic_label: 'INFERRED', status: 'AVAILABLE', content: items.map((i) => `${i} (INFERRED — category-level heuristic, not a claim about this specific company)`) }
      : { epistemic_label: 'UNKNOWN', status: 'INSUFFICIENT_EVIDENCE', content: [`No category model matched — INSUFFICIENT EVIDENCE to infer ${subject}.`] };

  const business_model_indicators = inferSection(model ? model.business_model_indicators : null, 'business model indicators');
  const strategic_priorities = inferSection(model ? model.strategic_priorities : null, 'strategic priorities');
  const executive_pain_points = inferSection(model ? model.pain_points : null, 'executive-level pain points');

  // ── EXECLEAD.AI fit (INFERRED, completeness-driven) ──
  const fitSignals = [];
  if (model) fitSignals.push('Industry category suggests executive development and leadership-capability needs are plausible (INFERRED)');
  if (input.context) fitSignals.push(`Engagement context supplied by the caller suggests a relevant use case: "${input.context}" (OBSERVED input, INFERRED relevance)`);
  if (!input.website) fitSignals.push('No public footprint data supplied — fit cannot be corroborated (UNKNOWN)');
  const execlead_fit = fitSignals.length > 0
    ? { epistemic_label: 'INFERRED', status: insufficient ? 'INSUFFICIENT_EVIDENCE' : 'AVAILABLE', content: fitSignals }
    : { epistemic_label: 'UNKNOWN', status: 'INSUFFICIENT_EVIDENCE', content: ['INSUFFICIENT EVIDENCE — no industry match and no engagement context supplied.'] };

  // ── Opportunity signals ──
  const oppSignals = [];
  if (input.website) oppSignals.push('A public web presence was supplied by the caller — public-source research by a human is possible (no scraping was performed)');
  if (model) oppSignals.push('Category-level executive needs (per the heuristic model) may create a plausible conversation opening — INFERRED, not verified');
  const opportunity_signals = oppSignals.length > 0
    ? { epistemic_label: 'INFERRED', status: insufficient ? 'INSUFFICIENT_EVIDENCE' : 'AVAILABLE', content: oppSignals }
    : { epistemic_label: 'UNKNOWN', status: 'INSUFFICIENT_EVIDENCE', content: ['INSUFFICIENT EVIDENCE — no opportunity signals could be derived from the supplied input.'] };

  // ── Risks / disqualifiers ──
  const risks = ['All facts are caller-supplied and unverified — the company may not exist as described'];
  if (!input.website) risks.push('No public web presence supplied — identity and legitimacy UNKNOWN');
  if (!input.industry) risks.push('No industry supplied — fit assessment impossible (UNKNOWN)');
  if (!model && input.industry) risks.push(`Stated industry "${input.industry}" is outside the current heuristic model — analysis quality is reduced`);
  if (insufficient) risks.push('Overall evidence is INSUFFICIENT — do not make pursuit decisions from this result alone');
  const risks_disqualifiers = { epistemic_label: 'INFERRED', status: 'AVAILABLE', content: risks };

  // ── Recommended next step (human decision, never outreach) ──
  const recommended_next_step = {
    epistemic_label: 'INFERRED',
    status: 'AVAILABLE',
    content: [insufficient
      ? 'INSUFFICIENT EVIDENCE — a human should confirm the prospect exists via approved public sources and re-run with a more complete input. This system will not contact anyone.'
      : 'A human executive should review this result, verify the caller-supplied facts via approved public sources, and decide whether to pursue. This system performs no outreach of any kind.'],
  };

  return {
    capability: PROSPECT_TOOL_ID,
    service_version: PROSPECT_SERVICE_VERSION,
    generated_at: now.toISOString(),
    prospect: input,
    result: {
      company_overview,
      industry_category,
      business_model_indicators,
      strategic_priorities,
      executive_pain_points,
      execlead_fit,
      opportunity_signals,
      risks_disqualifiers,
      recommended_next_step,
    },
    confidence: {
      overall: confidence.score,
      basis: confidence.basis,
      epistemic_label: 'INFERRED',
    },
    evidence,
    verification_notice: VERIFICATION_NOTICE,
  };
}

/**
 * Convenience gate used by future orchestration integration (and by tests):
 * asserts the tool, per its authoritative registry definition, MUST NOT be
 * executable while DRAFT/disabled — the only correct state until the Growth
 * Agent is formally activated.
 */
export function assertToolNotExecutable(def) {
  if (def.status === 'DRAFT' || def.enabled === false) {
    return { executable: false, reason: 'Tool is DRAFT and/or disabled — it cannot execute through the orchestration core (ACTIVE + enabled required at request time).' };
  }
  return { executable: true, reason: 'Tool definition is ACTIVE + enabled — orchestration core would evaluate it at request time.' };
}