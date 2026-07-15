/**
 * EXECLEAD.AI — Enterprise Verification Workflow™ Engine v1.0
 * ----------------------------------------------------------
 * Single source of truth for:
 *  - Verification Workflow™ stages (9-step lifecycle)
 *  - Verification Matrix™ category definitions
 *  - Verification Expiration™ configuration
 *  - Identity Confidence™ scoring (6 dimensions)
 *  - Verification Analytics™ computation
 *  - Governance helpers (immutable log writing)
 */

// =================================================================
// WORKFLOW STAGES — 9-step Enterprise Verification Workflow™
// =================================================================

export const WORKFLOW_STAGES = [
  { id: 'requested', label: 'Requested', icon: 'Clock', color: '#3b82f6', order: 1 },
  { id: 'submitted', label: 'Submitted', icon: 'Upload', color: '#3b82f6', order: 2 },
  { id: 'pending_review', label: 'Pending Review', icon: 'Eye', color: '#f59e0b', order: 3 },
  { id: 'evidence_review', label: 'Evidence Review', icon: 'FileSearch', color: '#f59e0b', order: 4 },
  { id: 'approved', label: 'Approved', icon: 'CheckCircle2', color: '#10b981', order: 5 },
  { id: 'trust_updated', label: 'Executive Trust Updated', icon: 'TrendingUp', color: '#a855f7', order: 6 },
  { id: 'portfolio_updated', label: 'Portfolio Updated', icon: 'FolderCheck', color: '#a855f7', order: 7 },
  { id: 'credential_updated', label: 'Credential Eligibility Updated', icon: 'Award', color: '#a855f7', order: 8 },
  { id: 'audit_written', label: 'Audit Ledger Written', icon: 'Lock', color: '#64748b', order: 9 },
];

export const STAGE_MAP = WORKFLOW_STAGES.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});

export function getStage(stageId) {
  return STAGE_MAP[stageId] || WORKFLOW_STAGES[0];
}

export function getStageOrder(stageId) {
  const stage = STAGE_MAP[stageId];
  return stage ? stage.order : 0;
}

export function isStageComplete(verification, category, stageId) {
  const stages = parseWorkflowStages(verification);
  const catStage = stages[category];
  if (!catStage) return false;
  return getStageOrder(catStage.stage) >= getStageOrder(stageId);
}

export function getCurrentStage(verification, category) {
  const stages = parseWorkflowStages(verification);
  const catStage = stages[category];
  if (!catStage) return WORKFLOW_STAGES[0];
  return STAGE_MAP[catStage.stage] || WORKFLOW_STAGES[0];
}

export function getWorkflowProgress(verification, category) {
  const current = getCurrentStage(verification, category);
  return Math.round((current.order / WORKFLOW_STAGES.length) * 100);
}

// =================================================================
// VERIFICATION CATEGORIES — for the Verification Matrix™
// =================================================================

export const VERIFICATION_CATEGORIES = [
  { key: 'email', label: 'Email', verifiedField: 'email_verified', dateField: 'email_verified_date', methodField: null, verifiedByField: null, icon: 'Mail', color: '#6366f1', expirationDefault: 'never', enterpriseVerifiable: false, trustWeight: 8 },
  { key: 'phone', label: 'Phone', verifiedField: 'phone_verified', dateField: 'phone_verified_date', methodField: null, verifiedByField: null, icon: 'Phone', color: '#06b6d4', expirationDefault: 'never', enterpriseVerifiable: false, trustWeight: 8 },
  { key: 'identity', label: 'Identity', verifiedField: 'identity_verified', dateField: 'identity_verified_date', methodField: 'identity_verified_method', verifiedByField: 'identity_verified_by', icon: 'ShieldCheck', color: '#10b981', expirationDefault: '24_months', enterpriseVerifiable: false, trustWeight: 20 },
  { key: 'employment', label: 'Employment', verifiedField: 'professional_verified', dateField: 'professional_verified_date', methodField: 'professional_verified_method', verifiedByField: 'professional_verified_by', icon: 'Briefcase', color: '#f59e0b', expirationDefault: 'annual', enterpriseVerifiable: true, trustWeight: 15 },
  { key: 'organization', label: 'Organization', verifiedField: 'organization_verified', dateField: 'organization_verified_date', methodField: 'organization_verified_method', verifiedByField: 'organization_verified_by', icon: 'Building2', color: '#06b6d4', expirationDefault: 'annual', enterpriseVerifiable: true, trustWeight: 10 },
  { key: 'education', label: 'Education', verifiedField: 'education_verified', dateField: 'education_verified_date', methodField: 'education_verified_method', verifiedByField: 'education_verified_by', icon: 'GraduationCap', color: '#8b5cf6', expirationDefault: 'never', enterpriseVerifiable: false, trustWeight: 10 },
  { key: 'executive_credentials', label: 'Executive Credentials', verifiedField: 'executive_credentials_verified', dateField: 'executive_credentials_verified_date', methodField: null, verifiedByField: null, icon: 'Award', color: '#f59e0b', expirationDefault: 'annual', enterpriseVerifiable: false, trustWeight: 7 },
  { key: 'executive_portfolio', label: 'Executive Portfolio', verifiedField: 'executive_portfolio_verified', dateField: 'executive_portfolio_verified_date', methodField: null, verifiedByField: null, icon: 'FolderCheck', color: '#a855f7', expirationDefault: 'annual', enterpriseVerifiable: false, trustWeight: 7 },
  { key: 'executive_role', label: 'Executive Role', verifiedField: 'executive_role_verified', dateField: 'executive_role_verified_date', methodField: 'executive_role_verified_method', verifiedByField: 'executive_role_verified_by', icon: 'Crown', color: '#a855f7', expirationDefault: 'annual', enterpriseVerifiable: true, trustWeight: 5 },
  { key: 'internal_credentials', label: 'Internal Credentials', verifiedField: 'internal_credentials_verified', dateField: 'internal_credentials_verified_date', methodField: null, verifiedByField: 'internal_credentials_verified_by', icon: 'BadgeCheck', color: '#10b981', expirationDefault: 'annual', enterpriseVerifiable: true, trustWeight: 5 },
];

// =================================================================
// EXPIRATION TYPES
// =================================================================

export const EXPIRATION_TYPES = [
  { id: 'never', label: 'Never', months: null, color: '#10b981', description: 'Does not expire' },
  { id: 'annual', label: 'Annual', months: 12, color: '#f59e0b', description: 'Renew every 12 months' },
  { id: '24_months', label: '24 Months', months: 24, color: '#3b82f6', description: 'Renew every 24 months' },
  { id: 'custom', label: 'Custom', months: null, color: '#a855f7', description: 'Custom renewal period' },
];

export const EXPIRATION_MAP = EXPIRATION_TYPES.reduce((acc, t) => { acc[t.id] = t; return acc; }, {});

export function getExpirationType(typeId) {
  return EXPIRATION_MAP[typeId] || EXPIRATION_TYPES[0];
}

export function calculateExpirationDate(verifiedDate, expirationType, customMonths) {
  if (expirationType === 'never') return null;
  const months = expirationType === 'custom' ? (customMonths || 12) : (EXPIRATION_MAP[expirationType]?.months || 12);
  if (!verifiedDate) return null;
  const date = new Date(verifiedDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

export function getDaysUntilExpiration(expirationDate) {
  if (!expirationDate) return null;
  const now = new Date();
  const exp = new Date(expirationDate);
  const diff = exp - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getExpirationStatus(expirationDate) {
  if (!expirationDate) return { status: 'never', label: 'No Expiration', color: '#10b981', days: null };
  const days = getDaysUntilExpiration(expirationDate);
  if (days < 0) return { status: 'expired', label: 'Expired', color: '#ef4444', days };
  if (days <= 30) return { status: 'expiring', label: 'Expiring Soon', color: '#f59e0b', days };
  if (days <= 90) return { status: 'upcoming', label: 'Upcoming Renewal', color: '#3b82f6', days };
  return { status: 'active', label: 'Active', color: '#10b981', days };
}

export function getUpcomingRenewals(verification) {
  const config = parseExpirationConfig(verification);
  const renewals = [];
  for (const cat of VERIFICATION_CATEGORIES) {
    const cfg = config[cat.key];
    if (!cfg || cfg.type === 'never') continue;
    const verified = verification?.[cat.verifiedField];
    if (!verified) continue;
    const expDate = cfg.expiration_date || calculateExpirationDate(verification?.[cat.dateField], cfg.type, cfg.custom_months);
    if (!expDate) continue;
    const status = getExpirationStatus(expDate);
    if (status.status !== 'expired' && status.days <= 90) {
      renewals.push({ category: cat, expirationDate: expDate, ...status });
    }
  }
  return renewals.sort((a, b) => a.days - b.days);
}

// =================================================================
// IDENTITY CONFIDENCE™ — 6 quality dimensions
// =================================================================

export const CONFIDENCE_DIMENSIONS = [
  { key: 'confidence_verification_quality', label: 'Verification Quality', icon: 'ShieldCheck', color: '#10b981', weight: 0.25, description: 'Based on verification methods used' },
  { key: 'confidence_evidence_quality', label: 'Evidence Quality', icon: 'FileSearch', color: '#3b82f6', weight: 0.20, description: 'Based on evidence items uploaded' },
  { key: 'confidence_coverage', label: 'Coverage', icon: 'CheckCircle2', color: '#8b5cf6', weight: 0.20, description: 'Based on verification categories complete' },
  { key: 'confidence_document_quality', label: 'Document Quality', icon: 'FileText', color: '#f59e0b', weight: 0.15, description: 'Based on document types and quality' },
  { key: 'confidence_review_quality', label: 'Review Quality', icon: 'Eye', color: '#06b6d4', weight: 0.20, description: 'Based on reviewer credentials' },
];

const METHOD_QUALITY_SCORES = {
  third_party: 100, ai_assisted: 85, manual_review: 70,
  corporate_email: 75, company_invitation: 80, enterprise_admin: 95, linkedin: 65,
  domain_verification: 80, duns_lookup: 85, credential_check: 80, institution_verification: 85,
  hr_confirmation: 90, board_resolution: 95, org_chart: 75,
};

export function calculateIdentityConfidence(verification, evidenceItems = [], logs = []) {
  // 1. Verification Quality — based on methods used
  const methods = [
    verification?.identity_verified_method,
    verification?.professional_verified_method,
    verification?.organization_verified_method,
    verification?.education_verified_method,
    verification?.executive_role_verified_method,
  ].filter(Boolean);
  const vq = methods.length > 0
    ? Math.round(methods.reduce((sum, m) => sum + (METHOD_QUALITY_SCORES[m] || 70), 0) / methods.length)
    : 0;

  // 2. Evidence Quality — based on evidence items and their verification status
  let eq = 0;
  if (evidenceItems.length > 0) {
    const verified = evidenceItems.filter(e => e.verification_status === 'verified').length;
    const total = evidenceItems.length;
    eq = Math.round((verified / total) * 100);
  }

  // 3. Coverage — based on verification categories complete
  const completed = VERIFICATION_CATEGORIES.filter(c => verification?.[c.verifiedField]).length;
  const cov = Math.round((completed / VERIFICATION_CATEGORIES.length) * 100);

  // 4. Document Quality — based on document type (government IDs score higher)
  let dq = 0;
  if (verification?.identity_document_type) {
    const highQualityDocs = ['passport', 'national_id', 'government_id'];
    const mediumQualityDocs = ['drivers_license'];
    if (highQualityDocs.includes(verification.identity_document_type)) dq = 95;
    else if (mediumQualityDocs.includes(verification.identity_document_type)) dq = 80;
    else dq = 60;
  }

  // 5. Review Quality — based on reviewer credentials and review thoroughness
  const reviewActions = (logs || []).filter(l =>
    ['identity_approved', 'employment_approved', 'organization_approved', 'education_verified',
     'executive_role_verified', 'internal_credentials_verified', 'verification_evidence_reviewed'].includes(l.action)
  );
  let rq = 0;
  if (reviewActions.length > 0) {
    const adminReviews = reviewActions.filter(l => l.reviewer_name).length;
    rq = Math.min(100, Math.round((adminReviews / reviewActions.length) * 100));
    // Bonus for multiple reviewers
    const uniqueReviewers = new Set(reviewActions.map(l => l.reviewer_id).filter(Boolean)).size;
    rq = Math.min(100, rq + (uniqueReviewers > 1 ? 10 : 0));
  }

  // Overall — weighted average
  const overall = Math.round(
    vq * CONFIDENCE_DIMENSIONS[0].weight +
    eq * CONFIDENCE_DIMENSIONS[1].weight +
    cov * CONFIDENCE_DIMENSIONS[2].weight +
    dq * CONFIDENCE_DIMENSIONS[3].weight +
    rq * CONFIDENCE_DIMENSIONS[4].weight
  );

  return {
    confidence_verification_quality: vq,
    confidence_evidence_quality: eq,
    confidence_coverage: cov,
    confidence_document_quality: dq,
    confidence_review_quality: rq,
    confidence_overall: overall,
  };
}

export function getConfidenceLabel(score) {
  if (score >= 90) return { label: 'Excellent', color: '#10b981' };
  if (score >= 75) return { label: 'Good', color: '#3b82f6' };
  if (score >= 50) return { label: 'Fair', color: '#f59e0b' };
  if (score > 0) return { label: 'Low', color: '#ef4444' };
  return { label: 'None', color: '#64748b' };
}

// =================================================================
// VERIFICATION ANALYTICS™
// =================================================================

export function calculateVerificationAnalytics(logs = [], verification = null) {
  const safeLogs = logs || [];

  // Average verification time: from requested to approved
  const requestedLogs = safeLogs.filter(l => l.action === 'verification_requested');
  const approvedLogs = safeLogs.filter(l => l.decision === 'approved' || ['identity_approved', 'employment_approved', 'organization_approved', 'education_verified', 'executive_role_verified', 'internal_credentials_verified'].includes(l.action));
  let avgTimeHours = 0;
  let timeSamples = 0;
  for (const approved of approvedLogs) {
    const requested = requestedLogs.find(r =>
      r.category === approved.category &&
      new Date(r.created_date) < new Date(approved.created_date)
    );
    if (requested) {
      const diff = new Date(approved.created_date) - new Date(requested.created_date);
      avgTimeHours += diff / (1000 * 60 * 60);
      timeSamples++;
    }
  }
  avgTimeHours = timeSamples > 0 ? Math.round(avgTimeHours / timeSamples) : 0;

  // Pending reviews
  const pendingReviews = safeLogs.filter(l => l.decision === 'pending').length;

  // Approval / rejection rates
  const decisions = safeLogs.filter(l => l.decision && l.decision !== 'pending');
  const approved = decisions.filter(l => l.decision === 'approved').length;
  const rejected = decisions.filter(l => l.decision === 'rejected').length;
  const totalDecisions = decisions.length;
  const approvalRate = totalDecisions > 0 ? Math.round((approved / totalDecisions) * 100) : 0;
  const rejectionRate = totalDecisions > 0 ? Math.round((rejected / totalDecisions) * 100) : 0;

  // Verification quality (from confidence)
  const verificationQuality = verification?.confidence_overall || 0;

  // Risk events
  const riskEvents = safeLogs.filter(l => l.risk_level && l.risk_level !== 'low').length;

  // Trust distribution (based on this user's logs with trust changes)
  const trustChanges = safeLogs.filter(l => l.action === 'trust_score_updated' || l.trust_score_after != null);
  const trustDistribution = trustChanges.length > 0
    ? { current: trustChanges[trustChanges.length - 1].trust_score_after || verification?.trust_score || 0, trend: trustChanges }
    : { current: verification?.trust_score || 0, trend: [] };

  return {
    avgTimeHours,
    avgTimeLabel: avgTimeHours === 0 ? '—' : avgTimeHours < 24 ? `${avgTimeHours}h` : `${Math.round(avgTimeHours / 24)}d`,
    pendingReviews,
    approvalRate,
    rejectionRate,
    verificationQuality,
    riskEvents,
    trustDistribution,
    totalEvents: safeLogs.length,
  };
}

// =================================================================
// TRUST TIMELINE™ — derive trust history from logs
// =================================================================

export function buildTrustTimeline(logs = [], verification = null) {
  const safeLogs = logs || [];
  const trustEvents = safeLogs
    .filter(l =>
      l.trust_score_after != null ||
      l.action === 'trust_score_updated' ||
      l.action === 'verified_executive_granted' ||
      ['email_verified', 'phone_verified', 'identity_approved', 'professional_verified', 'organization_approved',
       'education_verified', 'executive_credentials_verified', 'executive_portfolio_verified',
       'executive_role_verified', 'internal_credentials_verified', 'verification_revoked'].includes(l.action)
    )
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return trustEvents.map((log, idx) => {
    const scoreBefore = log.trust_score_before ?? (idx < trustEvents.length - 1 ? trustEvents[idx + 1].trust_score_after : 0);
    const scoreAfter = log.trust_score_after ?? scoreBefore;
    const delta = scoreAfter - scoreBefore;
    return {
      id: log.id,
      date: log.created_date,
      action: log.action,
      category: log.category,
      scoreBefore,
      scoreAfter,
      delta,
      reviewer: log.reviewer_name,
      reason: log.reason,
      notes: log.notes,
      decision: log.decision,
    };
  });
}

// =================================================================
// JSON PARSERS — safe parse with fallback
// =================================================================

export function parseWorkflowStages(verification) {
  if (!verification?.workflow_stages_json) return {};
  try { return JSON.parse(verification.workflow_stages_json); } catch { return {}; }
}

export function parseExpirationConfig(verification) {
  if (!verification?.expiration_config_json) return {};
  try { return JSON.parse(verification.expiration_config_json); } catch { return {}; }
}

// =================================================================
// GOVERNANCE — write to immutable ledgers
// =================================================================

export function buildLogEntry({ verification, user, action, category, stage, decision, reason, notes, reviewerName, reviewerId, trustBefore, trustAfter }) {
  return {
    verification_id: verification?.id,
    user_id: user?.id,
    user_name: user?.full_name || user?.email,
    action,
    category,
    workflow_stage: stage,
    decision: decision || 'pending',
    reason,
    notes,
    reviewer_id: reviewerId,
    reviewer_name: reviewerName,
    submitted_date: new Date().toISOString(),
    reviewed_date: decision && decision !== 'pending' ? new Date().toISOString() : null,
    trust_score_before: trustBefore,
    trust_score_after: trustAfter,
    risk_level: verification?.risk_level || 'low',
  };
}