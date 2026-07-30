/**
 * AI Governance Center™ — Responsible Executive AI Framework
 *
 * Enterprise control plane for AI policy, safety, compliance, monitoring,
 * oversight, and continuous governance. Answers:
 *   • Was this recommendation compliant?
 *   • Did AI follow policy?
 *   • Was enough evidence available?
 *   • Should human review have been required?
 *   • Which AI models are deployed? Which prompts changed? Which policies applied?
 *
 * Subsystems: AI Policy Engine™, Decision Policy Check™, Human Review™,
 * Model Registry™, Prompt Governance™, AI Audit Log™, AI Risk Score™.
 */

const LS = {
  policies: "execlead.ai.policies.v1",
  audit: "execlead.ai.audit_log.v1",
  models: "execlead.ai.model_registry.v1",
  prompts: "execlead.ai.prompt_registry.v1",
};
const AUDIT_MAX = 200;

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}
function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/* ============================================================
   AI Policy Engine™
   ============================================================ */

export const DEFAULT_POLICIES = [
  { id: "min_evidence", name: "Minimum Evidence Threshold", description: "Recommendations require at least N evidence items.", threshold: 3, severity: "high", enabled: true, category: "evidence" },
  { id: "min_confidence", name: "Minimum Confidence", description: "Recommendation confidence must meet threshold.", threshold: 40, severity: "high", enabled: true, category: "confidence" },
  { id: "min_reliability", name: "Minimum Reliability", description: "Evidence reliability must meet threshold.", threshold: 50, severity: "medium", enabled: true, category: "evidence" },
  { id: "max_prediction_risk", name: "Maximum Prediction Risk", description: "Predictions above this risk require human review.", threshold: 70, severity: "critical", enabled: true, category: "risk" },
  { id: "allowed_rec_types", name: "Allowed Recommendation Types", description: "Only these activity types may be recommended.", value: ["simulation", "challenge", "coaching", "journal", "lesson", "interview"], severity: "medium", enabled: true, category: "scope" },
  { id: "restricted_categories", name: "Restricted Advice Categories", description: "Advice in these categories is blocked.", value: ["medical", "legal", "financial_advice"], severity: "critical", enabled: true, category: "scope" },
  { id: "human_review", name: "Required Human Review", description: "Auto-require review for low confidence, low evidence, or high-impact recommendations.", threshold: 1, severity: "critical", enabled: true, category: "review" },
  { id: "enterprise_overrides", name: "Enterprise Overrides", description: "Enterprise policies override user-level thresholds.", threshold: 1, severity: "medium", enabled: true, category: "enterprise" },
  { id: "regional_policies", name: "Regional Policies", description: "Apply regional compliance variations.", threshold: 1, severity: "medium", enabled: false, category: "regional" },
];

export function getPolicies() {
  const p = read(LS.policies, null);
  if (p && Array.isArray(p)) return p;
  write(LS.policies, DEFAULT_POLICIES);
  return DEFAULT_POLICIES;
}
export function savePolicies(policies) {
  write(LS.policies, policies);
  return policies;
}
export function updatePolicy(id, patch) {
  const policies = getPolicies().map((p) => (p.id === id ? { ...p, ...patch } : p));
  return savePolicies(policies);
}

const HIGH_IMPACT_KEYWORDS = ["promotion", "succession", "talent", "enterprise", "executive"];

function isHighImpact(competency) {
  const c = (competency || "").toLowerCase();
  return HIGH_IMPACT_KEYWORDS.some((k) => c.includes(k));
}

/* ============================================================
   Decision Policy Check™
   ============================================================ */

export function checkDecisionPolicy(explanation, trustScore, policies) {
  const pols = policies || getPolicies();
  const get = (id) => pols.find((p) => p.id === id) || {};
  const enabled = (id) => get(id).enabled !== false;

  const evidenceCount = (explanation.evidenceUsed || []).reduce((a, e) => a + (e.count || 0), 0);
  const conf = explanation.confidence?.value || 0;
  const reliability = explanation.reliability || 0;
  const outcomeValidation = trustScore?.outcomeValidation || 0;
  const activityType = explanation.recommendation?.activityType || "";
  const competency = explanation.recommendation?.competency || "";
  const predictionRisk = 100 - (trustScore?.predictionAccuracy || 0);

  const allowedTypes = get("allowed_rec_types").value || [];
  const restricted = get("restricted_categories").value || [];

  const minEvidence = enabled("min_evidence") ? get("min_evidence").threshold : 0;
  const minConfidence = enabled("min_confidence") ? get("min_confidence").threshold : 0;
  const minReliability = enabled("min_reliability") ? get("min_reliability").threshold : 0;
  const maxPredictionRisk = enabled("max_prediction_risk") ? get("max_prediction_risk").threshold : 100;

  const checks = [
    { name: "Evidence Coverage", value: evidenceCount, threshold: minEvidence, passed: evidenceCount >= minEvidence, detail: `${evidenceCount} evidence item(s)` },
    { name: "Confidence", value: conf, threshold: minConfidence, passed: conf >= minConfidence, detail: `${conf}%` },
    { name: "Reliability", value: reliability, threshold: minReliability, passed: reliability >= minReliability, detail: `${reliability}%` },
    { name: "Outcome Validation", value: outcomeValidation, threshold: 20, passed: outcomeValidation >= 20, detail: `${outcomeValidation}%` },
    { name: "Policy Compliance", value: activityType, threshold: "allowed list", passed: !enabled("allowed_rec_types") || allowedTypes.includes(activityType), detail: `type "${activityType}"` },
    { name: "Restricted Categories", value: competency, threshold: "not restricted", passed: !enabled("restricted_categories") || !restricted.includes(competency.toLowerCase()), detail: `competency "${competency}"` },
    { name: "Bias Checks", value: (explanation.evidenceUsed || []).length, threshold: 2, passed: (explanation.evidenceUsed || []).length >= 2, detail: `${(explanation.evidenceUsed || []).length} distinct source(s)` },
    { name: "Hallucination Risk", value: 100 - reliability, threshold: 70, passed: reliability >= 30, detail: `risk ${100 - reliability}%` },
  ];

  const highImpact = isHighImpact(competency);
  const failedCritical = checks.some((c) => !c.passed && ["Evidence Coverage", "Confidence", "Policy Compliance", "Restricted Categories"].includes(c.name));
  const humanReviewRequired =
    enabled("human_review") && (failedCritical || highImpact || predictionRisk > maxPredictionRisk);

  const passed = checks.every((c) => c.passed);

  return { checks, passed, humanReviewRequired, highImpact, predictionRisk };
}

/* ============================================================
   AI Risk Score™
   ============================================================ */

export function computeAIRiskScore(explanation, trustScore, decisionCheck) {
  const evidenceCount = (explanation.evidenceUsed || []).reduce((a, e) => a + (e.count || 0), 0);
  const evidenceRisk = clamp(100 - evidenceCount * 15, 0, 100);
  const modelRisk = clamp(100 - (trustScore?.calibration || 0), 0, 100);
  const predictionRisk = clamp(100 - (trustScore?.predictionAccuracy || 0), 0, 100);
  const failedCount = (decisionCheck?.checks || []).filter((c) => !c.passed).length;
  const policyRisk = clamp(failedCount * 25, 0, 100);
  const sourceCount = (explanation.evidenceUsed || []).length;
  const biasRisk = sourceCount < 2 ? 70 : sourceCount < 3 ? 30 : 10;

  const overall = Math.round(
    evidenceRisk * 0.25 + modelRisk * 0.2 + predictionRisk * 0.2 + policyRisk * 0.2 + biasRisk * 0.15
  );
  const governanceScore = 100 - overall;

  return { evidenceRisk, modelRisk, predictionRisk, policyRisk, biasRisk, overall, governanceScore };
}

/* ============================================================
   AI Audit Log™ (append-only)
   ============================================================ */

export function getAuditLog() {
  return read(LS.audit, []);
}
export function appendAuditLog(entry) {
  const log = getAuditLog();
  const record = {
    id: uid("audit"),
    timestamp: new Date().toISOString(),
    user: entry.user || "system",
    workspace: entry.workspace || "executive",
    prompt: entry.prompt || "",
    model: entry.model || "",
    evidenceUsed: entry.evidenceUsed || [],
    policyApplied: entry.policyApplied || [],
    recommendation: entry.recommendation || {},
    confidence: entry.confidence || 0,
    decisionTrace: entry.decisionTrace || null,
    reviewer: entry.reviewer || "",
    passed: entry.passed,
    humanReviewRequired: entry.humanReviewRequired,
    highImpact: entry.highImpact || false,
    riskScore: entry.riskScore || null,
    governanceScore: entry.governanceScore || 0,
  };
  const next = [record, ...log].slice(0, AUDIT_MAX);
  write(LS.audit, next);
  return record;
}
export function reviewAuditEntry(id, reviewer) {
  const log = getAuditLog().map((e) => (e.id === id ? { ...e, reviewer } : e));
  write(LS.audit, log);
  return log;
}
export function exportAuditLog() {
  const log = getAuditLog();
  const headers = ["timestamp", "user", "workspace", "model", "recommendation", "confidence", "passed", "humanReviewRequired", "reviewer", "governanceScore"];
  const rows = log.map((e) =>
    headers.map((h) => {
      const v = e[h];
      if (h === "recommendation") return `${e.recommendation?.label || ""} (${e.recommendation?.competency || ""})`;
      return typeof v === "object" ? JSON.stringify(v) : v;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

/* ============================================================
   Model Registry™
   ============================================================ */

export function getModelRegistry() {
  const models = read(LS.models, null);
  if (models && Array.isArray(models)) return models;
  const seeded = [
    { id: uid("model"), version: "v1", type: "recommendation", knowledgePackVersion: "kpv1", calibrationVersion: "cal1", recommendationVersion: "rv1", deployedAt: new Date().toISOString(), active: true, performance: 0, rollbackHistory: [] },
  ];
  write(LS.models, seeded);
  return seeded;
}
export function registerModelVersion({ version, type, performance }) {
  const models = getModelRegistry().map((m) => ({ ...m, active: false }));
  const entry = { id: uid("model"), version, type: type || "recommendation", knowledgePackVersion: "kpv1", calibrationVersion: "cal1", recommendationVersion: "rv1", deployedAt: new Date().toISOString(), active: true, performance: performance || 0, rollbackHistory: [] };
  const next = [entry, ...models];
  write(LS.models, next);
  return next;
}
export function rollbackModel(id) {
  const models = getModelRegistry();
  const target = models.find((m) => m.id === id);
  if (!target) return models;
  const next = models.map((m) => {
    if (m.id === id) return { ...m, active: true, rollbackHistory: [...(m.rollbackHistory || []), { from: new Date().toISOString(), reason: "manual rollback" }] };
    return { ...m, active: false };
  });
  write(LS.models, next);
  return next;
}

/* ============================================================
   Prompt Governance™
   ============================================================ */

export function getPromptRegistry() {
  const prompts = read(LS.prompts, null);
  if (prompts && Array.isArray(prompts)) return prompts;
  const seeded = [
    { id: uid("prompt"), version: "prompt-v1", key: "executive_coach", author: "platform", approved: true, deployedAt: new Date().toISOString(), performance: 0, abTests: [] },
  ];
  write(LS.prompts, seeded);
  return seeded;
}
export function registerPromptVersion({ key, author, performance }) {
  const prompts = getPromptRegistry();
  const entry = { id: uid("prompt"), version: `prompt-v${prompts.length + 1}`, key: key || "executive_coach", author: author || "platform", approved: false, deployedAt: new Date().toISOString(), performance: performance || 0, abTests: [] };
  const next = [entry, ...prompts];
  write(LS.prompts, next);
  return next;
}
export function approvePrompt(id) {
  const next = getPromptRegistry().map((p) => (p.id === id ? { ...p, approved: true } : p));
  write(LS.prompts, next);
  return next;
}
export function rollbackPrompt(id) {
  const next = getPromptRegistry().map((p) => (p.id === id ? { ...p, approved: true } : { ...p, approved: false }));
  write(LS.prompts, next);
  return next;
}

/* ============================================================
   Enterprise Dashboard™
   ============================================================ */

export function getGovernanceDashboard() {
  const log = getAuditLog();
  const models = getModelRegistry();
  const prompts = getPromptRegistry();
  const total = log.length;
  const passed = log.filter((e) => e.passed).length;
  const policyCompliance = total ? Math.round((passed / total) * 100) : 100;
  const governanceScore = total ? Math.round(log.reduce((a, e) => a + (e.governanceScore || 0), 0) / total) : 0;
  const humanReviews = log.filter((e) => e.humanReviewRequired && !e.reviewer).length;
  const policyViolations = total - passed;
  const activeModel = models.find((m) => m.active);
  const modelPerformance = activeModel?.performance || 0;
  const promptDrift = prompts.length;
  const decisionTrends = log.slice(0, 7).map((e) => ({ passed: e.passed, timestamp: e.timestamp }));

  return {
    policyCompliance,
    governanceScore,
    humanReviews,
    modelPerformance,
    promptDrift,
    policyViolations,
    decisionTrends,
    totalDecisions: total,
    activeModelVersion: activeModel?.version || "—",
  };
}