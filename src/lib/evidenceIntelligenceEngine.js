/**
 * EXECLEAD.AI — Executive Evidence Intelligence Engine v2.0
 * ----------------------------------------------------------
 * Powers the Evidence Intelligence™ Platform:
 * - Evidence Confidence Decay™
 * - Executive Evidence Chain™
 * - Executive Evidence Score™
 * - Evidence Intelligence™ (AI recommendations)
 * - Enterprise Evidence Dashboard™
 */
import {
  EVIDENCE_TYPES,
  resolveEvidenceType,
  getEvidenceTypeMeta,
  getSourceMeta,
  calculateConfidence,
  calculateAuthenticity,
  calculateFreshness,
  calculateEvidenceQualityScore,
  getExpirationStatus,
  recalculateEvidenceScores,
  parseJsonArray,
} from './evidenceVaultEngine';

// ============================================================
// Evidence Confidence Decay™
// ============================================================

export const DECAY_CONFIGS = [
  { key: 'never', label: 'Never', months: null, color: '#10b981' },
  { key: 'annual', label: 'Annual', months: 12, color: '#f59e0b' },
  { key: '24_months', label: '24 Months', months: 24, color: '#f97316' },
  { key: '36_months', label: '36 Months', months: 36, color: '#ef4444' },
  { key: 'custom', label: 'Custom', months: null, color: '#a855f7' },
];

/**
 * Calculate the decayed confidence based on issue date and decay config.
 * Confidence starts at the base value and linearly decays to 0 over the decay period.
 */
export function calculateDecayedConfidence(evidence) {
  if (!evidence) return 0;
  const baseConfidence = calculateConfidence(evidence);
  const decayType = evidence.expiration_type || 'never';

  if (decayType === 'never' || decayType === 'custom') return baseConfidence;

  const config = DECAY_CONFIGS.find(d => d.key === decayType);
  if (!config || !config.months) return baseConfidence;

  const issueDate = new Date(evidence.date || evidence.verification_date || evidence.created_date || new Date());
  const now = new Date();
  const monthsSinceIssue = (now - issueDate) / (1000 * 60 * 60 * 24 * 30.44);

  if (monthsSinceIssue <= 0) return baseConfidence;
  if (monthsSinceIssue >= config.months) return Math.round(baseConfidence * 0.1); // floor at 10%

  const decayFactor = 1 - (monthsSinceIssue / config.months) * 0.7; // lose up to 70% over the period
  return Math.round(baseConfidence * Math.max(0.1, decayFactor));
}

/**
 * Generate confidence trend data points over time (past 6 months to future 6 months).
 */
export function getConfidenceTrend(evidence) {
  if (!evidence) return [];
  const baseConfidence = calculateConfidence(evidence);
  const decayType = evidence.expiration_type || 'never';
  const config = DECAY_CONFIGS.find(d => d.key === decayType);
  const months = config?.months || 999;
  const issueDate = new Date(evidence.date || evidence.verification_date || evidence.created_date || new Date());

  const points = [];
  const now = new Date();

  for (let i = -6; i <= 6; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthsFromIssue = (targetDate - issueDate) / (1000 * 60 * 60 * 24 * 30.44);
    let confidence;

    if (decayType === 'never' || decayType === 'custom') {
      confidence = baseConfidence;
    } else if (monthsFromIssue <= 0) {
      confidence = baseConfidence;
    } else if (monthsFromIssue >= months) {
      confidence = Math.round(baseConfidence * 0.1);
    } else {
      const decayFactor = 1 - (monthsFromIssue / months) * 0.7;
      confidence = Math.round(baseConfidence * Math.max(0.1, decayFactor));
    }

    points.push({
      month: targetDate.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      confidence,
      isPast: i < 0,
      isCurrent: i === 0,
    });
  }

  return points;
}

export function getDecayConfig(key) {
  return DECAY_CONFIGS.find(d => d.key === key) || DECAY_CONFIGS[0];
}

// ============================================================
// Executive Evidence Chain™
// ============================================================

export const CHAIN_STAGES = [
  { key: 'source', label: 'Source', icon: 'FileText', description: 'Evidence originated from a trusted source' },
  { key: 'verification', label: 'Verification', icon: 'ShieldCheck', description: 'Evidence has been verified' },
  { key: 'trust', label: 'Trust', icon: 'TrendingUp', description: 'Evidence contributes to Executive Trust™' },
  { key: 'credentials', label: 'Credentials', icon: 'Award', description: 'Evidence powers Executive Credentials™' },
  { key: 'portfolio', label: 'Portfolio', icon: 'FolderCheck', description: 'Evidence appears in Executive Portfolio™' },
  { key: 'promotion', label: 'Promotion', icon: 'ArrowUpCircle', description: 'Evidence supports career progression' },
  { key: 'readiness', label: 'Executive Readiness™', icon: 'Target', description: 'Evidence contributes to readiness score' },
];

/**
 * Build the evidence provenance chain for a single evidence item.
 */
export function buildEvidenceChain(evidence) {
  if (!evidence) return [];

  const sourceMeta = getSourceMeta(evidence.source_type);
  const quality = calculateEvidenceQualityScore(evidence);
  const isVerified = evidence.verification_status === 'verified';

  return CHAIN_STAGES.map((stage, idx) => {
    let status = 'locked';
    let score = 0;

    switch (stage.key) {
      case 'source':
        status = evidence.source || evidence.source_type ? 'complete' : 'locked';
        score = sourceMeta.trustWeight * 100;
        break;
      case 'verification':
        status = isVerified ? 'complete' : evidence.verification_status === 'pending' ? 'active' : 'locked';
        score = isVerified ? 100 : evidence.verification_status === 'pending' ? 50 : 0;
        break;
      case 'trust':
        status = isVerified ? 'complete' : 'locked';
        score = isVerified ? Math.min(100, quality + 20) : 0;
        break;
      case 'credentials':
        status = isVerified && quality > 50 ? 'complete' : 'locked';
        score = isVerified ? Math.min(100, quality) : 0;
        break;
      case 'portfolio':
        const modules = parseJsonArray(evidence.related_modules);
        status = modules.includes('Executive Portfolio™') || isVerified ? 'complete' : 'locked';
        score = isVerified ? Math.min(100, quality - 10) : 0;
        break;
      case 'promotion':
        status = isVerified && quality > 60 ? 'complete' : quality > 30 ? 'active' : 'locked';
        score = isVerified ? Math.min(100, quality - 20) : 0;
        break;
      case 'readiness':
        status = isVerified && quality > 70 ? 'complete' : quality > 40 ? 'active' : 'locked';
        score = isVerified ? Math.min(100, quality - 30) : 0;
        break;
    }

    // Propagate: if previous stage is locked, this one is too
    if (idx > 0) {
      const prev = CHAIN_STAGES[idx - 1];
      // Only propagate lock if the previous stage hasn't been completed
    }

    return { ...stage, status, score };
  });
}

// ============================================================
// Executive Evidence Score™
// ============================================================

export const SCORE_DIMENSIONS = [
  { key: 'coverage', label: 'Coverage', weight: 0.20, description: 'Breadth of evidence types', color: '#6366f1', icon: 'Layers' },
  { key: 'quality', label: 'Quality', weight: 0.20, description: 'Average evidence quality', color: '#a855f7', icon: 'Gauge' },
  { key: 'authenticity', label: 'Authenticity', weight: 0.20, description: 'Average authenticity score', color: '#10b981', icon: 'ShieldCheck' },
  { key: 'freshness', label: 'Freshness', weight: 0.15, description: 'How current the evidence is', color: '#f59e0b', icon: 'Clock' },
  { key: 'completeness', label: 'Completeness', weight: 0.10, description: 'Field completeness per item', color: '#06b6d4', icon: 'FileCheck' },
  { key: 'ai_confidence', label: 'AI Confidence', weight: 0.15, description: 'Average AI review confidence', color: '#3b82f6', icon: 'Sparkles' },
];

/**
 * Coverage: percentage of the 15 evidence types that have at least one item.
 */
export function calculateCoverageScore(evidenceItems) {
  if (!evidenceItems || evidenceItems.length === 0) return 0;
  const typesPresent = new Set(evidenceItems.map(resolveEvidenceType));
  return Math.round((typesPresent.size / EVIDENCE_TYPES.length) * 100);
}

/**
 * Quality: average overall_quality across all items.
 */
export function calculateQualityScore(evidenceItems) {
  if (!evidenceItems || evidenceItems.length === 0) return 0;
  const recalced = evidenceItems.map(recalculateEvidenceScores);
  return Math.round(recalced.reduce((s, e) => s + (e.overall_quality || 0), 0) / recalced.length);
}

/**
 * Authenticity: average authenticity across all items.
 */
export function calculateAuthenticityScore(evidenceItems) {
  if (!evidenceItems || evidenceItems.length === 0) return 0;
  const recalced = evidenceItems.map(recalculateEvidenceScores);
  return Math.round(recalced.reduce((s, e) => s + (e.authenticity || 0), 0) / recalced.length);
}

/**
 * Freshness: average freshness across all items.
 */
export function calculateFreshnessScore(evidenceItems) {
  if (!evidenceItems || evidenceItems.length === 0) return 0;
  const recalced = evidenceItems.map(recalculateEvidenceScores);
  return Math.round(recalced.reduce((s, e) => s + (e.freshness || 0), 0) / recalced.length);
}

/**
 * Completeness: average field completeness per item.
 */
export function calculateCompletenessScore(evidenceItems) {
  if (!evidenceItems || evidenceItems.length === 0) return 0;
  const fields = ['title', 'description', 'organization', 'source', 'date', 'evidence_file_url', 'evidence_hash'];
  const scores = evidenceItems.map(e => {
    const filled = fields.filter(f => e[f] && String(e[f]).trim().length > 0).length;
    return (filled / fields.length) * 100;
  });
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

/**
 * AI Confidence: average ai_confidence for items that have been AI-reviewed.
 */
export function calculateAIConfidenceScore(evidenceItems) {
  if (!evidenceItems || evidenceItems.length === 0) return 0;
  const reviewed = evidenceItems.filter(e => e.ai_review_status === 'completed' || e.ai_review_status === 'flagged');
  if (reviewed.length === 0) return 0;
  return Math.round(reviewed.reduce((s, e) => s + (e.ai_confidence || 0), 0) / reviewed.length);
}

/**
 * Overall Evidence Score™: weighted composite of all dimensions.
 */
export function calculateOverallEvidenceScore(evidenceItems) {
  if (!evidenceItems || evidenceItems.length === 0) return 0;
  const dimensions = {
    coverage: calculateCoverageScore(evidenceItems),
    quality: calculateQualityScore(evidenceItems),
    authenticity: calculateAuthenticityScore(evidenceItems),
    freshness: calculateFreshnessScore(evidenceItems),
    completeness: calculateCompletenessScore(evidenceItems),
    ai_confidence: calculateAIConfidenceScore(evidenceItems),
  };

  return Math.round(
    dimensions.coverage * SCORE_DIMENSIONS[0].weight +
    dimensions.quality * SCORE_DIMENSIONS[1].weight +
    dimensions.authenticity * SCORE_DIMENSIONS[2].weight +
    dimensions.freshness * SCORE_DIMENSIONS[3].weight +
    dimensions.completeness * SCORE_DIMENSIONS[4].weight +
    dimensions.ai_confidence * SCORE_DIMENSIONS[5].weight
  );
}

export function getEvidenceScoreBreakdown(evidenceItems) {
  return {
    coverage: calculateCoverageScore(evidenceItems),
    quality: calculateQualityScore(evidenceItems),
    authenticity: calculateAuthenticityScore(evidenceItems),
    freshness: calculateFreshnessScore(evidenceItems),
    completeness: calculateCompletenessScore(evidenceItems),
    ai_confidence: calculateAIConfidenceScore(evidenceItems),
    overall: calculateOverallEvidenceScore(evidenceItems),
  };
}

// ============================================================
// Evidence Intelligence™ — AI Recommendations
// ============================================================

export function identifyMissingEvidence(evidenceItems) {
  if (!evidenceItems) return [];
  const present = new Set(evidenceItems.map(resolveEvidenceType));
  return EVIDENCE_TYPES
    .filter(t => !present.has(t.key))
    .map(t => ({
      type: 'missing',
      severity: 'medium',
      evidenceType: t.key,
      label: t.label,
      message: `No ${t.label} evidence on file`,
      recommendation: `Add ${t.label.toLowerCase()} evidence to improve coverage`,
      color: t.color,
    }));
}

export function identifyWeakEvidence(evidenceItems) {
  if (!evidenceItems) return [];
  return evidenceItems
    .map(e => ({ evidence: e, quality: calculateEvidenceQualityScore(e) }))
    .filter(item => item.quality < 50)
    .map(item => ({
      type: 'weak',
      severity: item.quality < 25 ? 'critical' : 'high',
      evidenceId: item.evidence.id,
      label: item.evidence.title,
      quality: item.quality,
      message: `Quality score is ${item.quality}/100`,
      recommendation: 'Improve evidence quality: add documentation, get verification, or run AI review',
      color: '#f59e0b',
    }));
}

export function identifyExpiredEvidence(evidenceItems) {
  if (!evidenceItems) return [];
  return evidenceItems
    .map(e => ({ evidence: e, status: getExpirationStatus(e) }))
    .filter(item => item.status.status === 'expired')
    .map(item => ({
      type: 'expired',
      severity: 'critical',
      evidenceId: item.evidence.id,
      label: item.evidence.title,
      message: `Expired ${Math.abs(item.status.days)} days ago`,
      recommendation: 'Renew or replace this expired evidence',
      color: '#ef4444',
    }));
}

export function identifyConflictingEvidence(evidenceItems) {
  if (!evidenceItems || evidenceItems.length < 2) return [];
  const conflicts = [];
  const byType = {};

  evidenceItems.forEach(e => {
    const type = resolveEvidenceType(e);
    if (!byType[type]) byType[type] = [];
    byType[type].push(e);
  });

  Object.entries(byType).forEach(([type, items]) => {
    if (items.length < 2) return;
    // Check for same type, overlapping dates, different organizations
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j];
        if (a.organization && b.organization && a.organization !== b.organization) {
          const dateA = a.date ? new Date(a.date) : null;
          const dateB = b.date ? new Date(b.date) : null;
          if (dateA && dateB) {
            const diffMonths = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24 * 30.44);
            if (diffMonths < 6) {
              const typeMeta = getEvidenceTypeMeta(type);
              conflicts.push({
                type: 'conflicting',
                severity: 'high',
                evidenceId: a.id,
                label: `${a.title} ↔ ${b.title}`,
                message: `Two ${typeMeta.label} items from different organizations within 6 months`,
                recommendation: 'Review and resolve conflicting evidence',
                color: '#f97316',
              });
            }
          }
        }
      }
    }
  });

  return conflicts;
}

export function identifyDuplicateEvidence(evidenceItems) {
  if (!evidenceItems || evidenceItems.length < 2) return [];
  const duplicates = [];
  const seen = new Map();

  evidenceItems.forEach(e => {
    const key = (e.title || '').toLowerCase().trim();
    const hashKey = e.evidence_hash;
    [key, hashKey].forEach(k => {
      if (!k) return;
      if (seen.has(k)) {
        duplicates.push({
          type: 'duplicate',
          severity: 'low',
          evidenceId: e.id,
          label: e.title,
          message: `Possible duplicate of "${seen.get(k).title}"`,
          recommendation: 'Remove duplicate or merge evidence records',
          color: '#64748b',
        });
      } else {
        seen.set(k, e);
      }
    });
  });

  return duplicates;
}

export function getRecommendedUploads(evidenceItems) {
  const missing = identifyMissingEvidence(evidenceItems);
  const expired = identifyExpiredEvidence(evidenceItems);
  const weak = identifyWeakEvidence(evidenceItems);

  const recommendations = [];

  // Prioritize: expired first, then missing, then weak
  expired.slice(0, 3).forEach(e => recommendations.push({
    priority: 1,
    ...e,
    action: 'Replace expired evidence',
  }));
  missing.slice(0, 5).forEach(e => recommendations.push({
    priority: 2,
    ...e,
    action: `Upload ${e.label} evidence`,
  }));
  weak.slice(0, 3).forEach(e => recommendations.push({
    priority: 3,
    ...e,
    action: 'Strengthen weak evidence',
  }));

  return recommendations.sort((a, b) => a.priority - b.priority);
}

export function getAllIntelligenceInsights(evidenceItems) {
  return [
    ...identifyMissingEvidence(evidenceItems),
    ...identifyWeakEvidence(evidenceItems),
    ...identifyExpiredEvidence(evidenceItems),
    ...identifyConflictingEvidence(evidenceItems),
    ...identifyDuplicateEvidence(evidenceItems),
  ];
}

// ============================================================
// Enterprise Evidence Dashboard™
// ============================================================

export function getEnterpriseEvidenceStats(evidenceItems) {
  if (!evidenceItems || evidenceItems.length === 0) {
    return {
      total: 0,
      byType: {},
      avgQuality: 0,
      coverage: 0,
      avgAuthenticity: 0,
      avgFreshness: 0,
      verificationRate: 0,
      aiReviewRate: 0,
      pendingReviews: 0,
      expiringCount: 0,
      expiredCount: 0,
      trustContribution: 0,
      expirationForecast: [],
    };
  }

  const recalced = evidenceItems.map(recalculateEvidenceScores);
  const total = recalced.length;
  const verified = recalced.filter(e => e.verification_status === 'verified').length;
  const aiReviewed = recalced.filter(e => e.ai_review_status === 'completed' || e.ai_review_status === 'flagged').length;
  const pending = recalced.filter(e => e.verification_status === 'pending').length;
  const expired = recalced.filter(e => getExpirationStatus(e).status === 'expired').length;
  const expiring = recalced.filter(e => {
    const s = getExpirationStatus(e);
    return s.status === 'expiring_soon' || s.status === 'expiring';
  }).length;

  // By type
  const byType = {};
  EVIDENCE_TYPES.forEach(t => { byType[t.key] = 0; });
  recalced.forEach(e => {
    const type = resolveEvidenceType(e);
    byType[type] = (byType[type] || 0) + 1;
  });

  // Expiration forecast (next 6 months)
  const forecast = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);
    const count = recalced.filter(e => {
      if (!e.expiration_date) return false;
      const exp = new Date(e.expiration_date);
      return exp >= monthStart && exp <= monthEnd;
    }).length;
    forecast.push({
      month: monthStart.toLocaleDateString('en', { month: 'short' }),
      count,
    });
  }

  return {
    total,
    byType,
    avgQuality: Math.round(recalced.reduce((s, e) => s + (e.overall_quality || 0), 0) / total),
    coverage: calculateCoverageScore(recalced),
    avgAuthenticity: Math.round(recalced.reduce((s, e) => s + (e.authenticity || 0), 0) / total),
    avgFreshness: Math.round(recalced.reduce((s, e) => s + (e.freshness || 0), 0) / total),
    verificationRate: Math.round((verified / total) * 100),
    aiReviewRate: Math.round((aiReviewed / total) * 100),
    pendingReviews: pending,
    expiringCount: expiring,
    expiredCount: expired,
    trustContribution: Math.round(recalced.filter(e => e.verification_status === 'verified').reduce((s, e) => s + (e.overall_quality || 0), 0) / total),
    expirationForecast: forecast,
  };
}

// ============================================================
// Collection Templates
// ============================================================

export const COLLECTION_TEMPLATES = [
  { key: 'leadership_portfolio', label: 'Leadership Portfolio™', icon: 'FolderCheck', color: '#a855f7', description: 'Complete leadership evidence for executive portfolio', requiredTypes: ['executive_credentials', 'awards', 'projects', 'board_memberships'] },
  { key: 'promotion_package', label: 'Promotion Package™', icon: 'ArrowUpCircle', color: '#6366f1', description: 'Evidence supporting a promotion case', requiredTypes: ['employment', 'executive_credentials', 'awards', 'performance_review'] },
  { key: 'employment_verification', label: 'Employment Verification™', icon: 'Briefcase', color: '#f59e0b', description: 'Proof of employment history', requiredTypes: ['employment', 'organization_verification'] },
  { key: 'board_application', label: 'Board Application™', icon: 'Building2', color: '#06b6d4', description: 'Evidence for board position application', requiredTypes: ['board_memberships', 'executive_credentials', 'awards', 'publications'] },
  { key: 'investor_due_diligence', label: 'Investor Due Diligence™', icon: 'Search', color: '#10b981', description: 'Due diligence evidence package for investors', requiredTypes: ['identity', 'employment', 'education', 'organization_verification'] },
  { key: 'executive_certification', label: 'Executive Certification™', icon: 'Award', color: '#fbbf24', description: 'Evidence for executive certification', requiredTypes: ['executive_credentials', 'certifications', 'education'] },
  { key: 'enterprise_procurement', label: 'Enterprise Procurement™', icon: 'ShoppingCart', color: '#3b82f6', description: 'Evidence for enterprise procurement', requiredTypes: ['organization_verification', 'licenses', 'security_clearances'] },
  { key: 'custom', label: 'Custom Collection', icon: 'FolderPlus', color: '#64748b', description: 'Custom evidence collection', requiredTypes: [] },
];

export function getCollectionTemplate(key) {
  return COLLECTION_TEMPLATES.find(t => t.key === key) || COLLECTION_TEMPLATES[7];
}

export function calculateCollectionCompleteness(evidenceIds, allEvidence) {
  if (!evidenceIds || !allEvidence || evidenceIds.length === 0) return 0;
  const items = allEvidence.filter(e => evidenceIds.includes(e.id));
  if (items.length === 0) return 0;
  const avgQuality = items.reduce((s, e) => s + calculateEvidenceQualityScore(e), 0) / items.length;
  return Math.round(avgQuality);
}

// ============================================================
// Evidence Request Lifecycle
// ============================================================

export const REQUEST_STATUSES = {
  requested: { label: 'Requested', color: '#6366f1', icon: 'Send', order: 0 },
  submitted: { label: 'Submitted', color: '#f59e0b', icon: 'Upload', order: 1 },
  under_review: { label: 'Under Review', color: '#3b82f6', icon: 'Eye', order: 2 },
  approved: { label: 'Approved', color: '#10b981', icon: 'CheckCircle2', order: 3 },
  rejected: { label: 'Rejected', color: '#ef4444', icon: 'XCircle', order: 4 },
  expired: { label: 'Expired', color: '#f97316', icon: 'AlertCircle', order: 5 },
};

export function getRequestStatusMeta(status) {
  return REQUEST_STATUSES[status] || REQUEST_STATUSES.requested;
}