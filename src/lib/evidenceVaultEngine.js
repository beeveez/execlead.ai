/**
 * EXECLEAD.AI — Executive Evidence Vault Engine v1.0
 * ----------------------------------------------------
 * Single source of truth for evidence type definitions, quality scoring,
 * authenticity calculation, freshness tracking, graph construction,
 * and expiration monitoring across the platform.
 *
 * Every verification must reference an Evidence Object — this engine
 * provides the scoring and relationship logic that powers the
 * Evidence Vault™, Evidence Relationship Graph™, AI Evidence Reviewer™,
 * Evidence Quality Score™, Evidence Timeline™, Evidence Explorer™,
 * and Evidence Expiration Dashboard™.
 */

// ============================================================
// Evidence Types — 15 canonical types
// ============================================================

export const EVIDENCE_TYPES = [
  { key: 'identity', label: 'Identity', icon: 'ShieldCheck', color: '#10b981', module: 'Verification Center™', description: 'Government-issued identity documents' },
  { key: 'employment', label: 'Employment', icon: 'Briefcase', color: '#f59e0b', module: 'Executive Trust™', description: 'Employment verification records' },
  { key: 'education', label: 'Education', icon: 'GraduationCap', color: '#8b5cf6', module: 'Verification Center™', description: 'Academic credentials and degrees' },
  { key: 'certifications', label: 'Certifications', icon: 'Award', color: '#06b6d4', module: 'Executive Credentials™', description: 'Professional certifications' },
  { key: 'executive_credentials', label: 'Executive Credentials™', icon: 'BadgeCheck', color: '#f59e0b', module: 'Executive Credentials™', description: 'EXECLEAD.AI executive credential evidence' },
  { key: 'awards', label: 'Awards', icon: 'Trophy', color: '#fbbf24', module: 'Executive Portfolio™', description: 'Industry awards and recognitions' },
  { key: 'memberships', label: 'Memberships', icon: 'Users', color: '#6366f1', module: 'Executive Portfolio™', description: 'Professional body memberships' },
  { key: 'publications', label: 'Publications', icon: 'BookOpen', color: '#3b82f6', module: 'Executive Portfolio™', description: 'Published articles, papers, books' },
  { key: 'projects', label: 'Projects', icon: 'FolderKanban', color: '#14b8a6', module: 'Executive Portfolio™', description: 'Significant project summaries' },
  { key: 'patents', label: 'Patents', icon: 'Lightbulb', color: '#eab308', module: 'Executive Portfolio™', description: 'Granted patents' },
  { key: 'board_memberships', label: 'Board Memberships', icon: 'Building2', color: '#a855f7', module: 'Executive Identity Graph™', description: 'Board or advisory positions' },
  { key: 'licenses', label: 'Licenses', icon: 'FileCheck', color: '#0ea5e9', module: 'Verification Center™', description: 'Professional licenses' },
  { key: 'security_clearances', label: 'Security Clearances', icon: 'Lock', color: '#ef4444', module: 'Enterprise Governance', description: 'Government security clearances' },
  { key: 'organization_verification', label: 'Organization Verification', icon: 'Building', color: '#06b6d4', module: 'Enterprise Governance', description: 'Organization/domain verification evidence' },
  { key: 'executive_portfolio', label: 'Executive Portfolio Evidence™', icon: 'FolderCheck', color: '#a855f7', module: 'Executive Portfolio™', description: 'Portfolio-level verification evidence' },
];

// Legacy category mapping — maps old categories to new evidence types
export const CATEGORY_TO_TYPE = {
  award: 'awards',
  certificate: 'certifications',
  government_id: 'identity',
  employment_verification: 'employment',
  promotion_letter: 'employment',
  kpi: 'projects',
  performance_review: 'employment',
  project_summary: 'projects',
  whitepaper: 'publications',
  publication: 'publications',
  patent: 'patents',
  speaking_engagement: 'awards',
  board_appointment: 'board_memberships',
  recommendation_letter: 'employment',
  client_testimonial: 'awards',
  leadership_photo: 'executive_portfolio',
  video: 'executive_portfolio',
  presentation: 'publications',
};

export function getEvidenceTypeMeta(typeKey) {
  return EVIDENCE_TYPES.find(t => t.key === typeKey) || EVIDENCE_TYPES.find(t => t.key === 'certificate');
}

export function resolveEvidenceType(evidence) {
  if (evidence.evidence_type) return evidence.evidence_type;
  if (evidence.category && CATEGORY_TO_TYPE[evidence.category]) return CATEGORY_TO_TYPE[evidence.category];
  return 'certificate';
}

// ============================================================
// Source Types
// ============================================================

export const SOURCE_TYPES = [
  { key: 'official_document', label: 'Official Document', trustWeight: 0.95, color: '#10b981' },
  { key: 'third_party_verification', label: 'Third-Party Verification', trustWeight: 0.85, color: '#06b6d4' },
  { key: 'enterprise_admin', label: 'Enterprise Admin', trustWeight: 0.90, color: '#6366f1' },
  { key: 'manual_review', label: 'Manual Review', trustWeight: 0.75, color: '#f59e0b' },
  { key: 'ai_extracted', label: 'AI-Extracted', trustWeight: 0.60, color: '#a855f7' },
  { key: 'automated_check', label: 'Automated Check', trustWeight: 0.70, color: '#3b82f6' },
  { key: 'self_reported', label: 'Self-Reported', trustWeight: 0.35, color: '#64748b' },
];

export function getSourceMeta(sourceType) {
  return SOURCE_TYPES.find(s => s.key === sourceType) || SOURCE_TYPES.find(s => s.key === 'self_reported');
}

// ============================================================
// Verification Statuses
// ============================================================

export const VERIFICATION_STATUSES = {
  unverified: { label: 'Unverified', color: '#64748b', icon: 'Circle' },
  pending: { label: 'Pending Review', color: '#f59e0b', icon: 'Clock' },
  verified: { label: 'Verified', color: '#10b981', icon: 'CheckCircle2' },
  rejected: { label: 'Rejected', color: '#ef4444', icon: 'XCircle' },
  expired: { label: 'Expired', color: '#f97316', icon: 'AlertCircle' },
  revoked: { label: 'Revoked', color: '#ef4444', icon: 'Ban' },
};

// ============================================================
// Quality Score Dimensions
// ============================================================

export const QUALITY_DIMENSIONS = [
  { key: 'confidence', label: 'Confidence', weight: 0.30, description: 'Source reliability and verification method', color: '#3b82f6', icon: 'Gauge' },
  { key: 'authenticity', label: 'Authenticity', weight: 0.35, description: 'Likelihood the evidence is genuine', color: '#10b981', icon: 'ShieldCheck' },
  { key: 'freshness', label: 'Freshness', weight: 0.20, description: 'How current the evidence is', color: '#f59e0b', icon: 'Clock' },
  { key: 'evidence_quality', label: 'Document Quality', weight: 0.15, description: 'Document clarity and completeness', color: '#a855f7', icon: 'FileCheck' },
];

// ============================================================
// Scoring Functions
// ============================================================

/**
 * Calculate confidence score (0-100) based on source type,
 * verification status, and AI review.
 */
export function calculateConfidence(evidence) {
  if (!evidence) return 0;
  const sourceMeta = getSourceMeta(evidence.source_type);
  let score = sourceMeta.trustWeight * 50;

  if (evidence.verification_status === 'verified') score += 30;
  else if (evidence.verification_status === 'pending') score += 15;
  else if (evidence.verification_status === 'rejected' || evidence.verification_status === 'revoked') score = Math.min(score, 10);

  if (evidence.verifier || evidence.reviewer_name) score += 10;
  if (evidence.evidence_hash) score += 5;
  if (evidence.ai_review_status === 'completed' && evidence.ai_confidence > 0) {
    score = Math.round((score + evidence.ai_confidence) / 2);
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate authenticity score (0-100) based on source type,
 * verification status, file presence, hash, and AI review.
 */
export function calculateAuthenticity(evidence) {
  if (!evidence) return 0;
  const sourceMeta = getSourceMeta(evidence.source_type);
  let score = sourceMeta.trustWeight * 40;

  if (evidence.verification_status === 'verified') score += 35;
  else if (evidence.verification_status === 'pending') score += 10;
  else if (evidence.verification_status === 'rejected') score = Math.min(score, 5);

  if (evidence.evidence_file_url) score += 10;
  if (evidence.evidence_hash) score += 10;
  if (evidence.ai_review_status === 'completed') {
    const aiFlags = parseJsonArray(evidence.ai_flags);
    if (aiFlags.length === 0) score += 5;
    else score = Math.max(0, score - aiFlags.length * 10);
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate freshness score (0-100) based on issue date
 * and expiration. Newer evidence scores higher.
 */
export function calculateFreshness(evidence) {
  if (!evidence) return 0;
  if (!evidence.date && !evidence.verification_date) return 20;

  const issueDate = new Date(evidence.date || evidence.verification_date);
  const now = new Date();
  const daysSinceIssue = Math.floor((now - issueDate) / (1000 * 60 * 60 * 24));

  let score;
  if (daysSinceIssue <= 30) score = 100;
  else if (daysSinceIssue <= 90) score = 90;
  else if (daysSinceIssue <= 180) score = 75;
  else if (daysSinceIssue <= 365) score = 60;
  else if (daysSinceIssue <= 730) score = 40;
  else if (daysSinceIssue <= 1095) score = 20;
  else score = 10;

  // Check expiration
  if (evidence.expiration_date) {
    const expStatus = getExpirationStatus(evidence);
    if (expStatus.status === 'expired') score = Math.min(score, 5);
    else if (expStatus.status === 'expiring_soon') score = Math.min(score, 50);
  }

  return score;
}

/**
 * Calculate document quality score (0-100) based on file presence,
 * description completeness, and AI quality assessment.
 */
export function calculateDocumentQuality(evidence) {
  if (!evidence) return 0;
  let score = 20;
  if (evidence.evidence_file_url) score += 25;
  if (evidence.description && evidence.description.length > 20) score += 15;
  if (evidence.organization) score += 10;
  if (evidence.source) score += 10;
  if (evidence.tags) score += 5;
  if (evidence.evidence_hash) score += 10;
  if (evidence.ai_review_status === 'completed' && evidence.ai_confidence > 70) score += 5;
  return Math.min(100, score);
}

/**
 * Calculate the overall Evidence Quality Score™ (0-100).
 * Weighted composite of confidence, authenticity, freshness, and document quality.
 */
export function calculateEvidenceQualityScore(evidence) {
  if (!evidence) return 0;
  const confidence = calculateConfidence(evidence);
  const authenticity = calculateAuthenticity(evidence);
  const freshness = calculateFreshness(evidence);
  const docQuality = calculateDocumentQuality(evidence);

  const overall = Math.round(
    confidence * QUALITY_DIMENSIONS[0].weight +
    authenticity * QUALITY_DIMENSIONS[1].weight +
    freshness * QUALITY_DIMENSIONS[2].weight +
    docQuality * QUALITY_DIMENSIONS[3].weight
  );

  return Math.min(100, Math.max(0, overall));
}

/**
 * Recalculate all quality dimensions and return updated evidence object.
 */
export function recalculateEvidenceScores(evidence) {
  if (!evidence) return evidence;
  return {
    ...evidence,
    confidence: calculateConfidence(evidence),
    authenticity: calculateAuthenticity(evidence),
    freshness: calculateFreshness(evidence),
    evidence_quality: calculateDocumentQuality(evidence),
    overall_quality: calculateEvidenceQualityScore(evidence),
  };
}

// ============================================================
// Quality Labels
// ============================================================

export function getQualityLabel(score) {
  if (score >= 85) return { label: 'Excellent', color: '#10b981' };
  if (score >= 70) return { label: 'Good', color: '#3b82f6' };
  if (score >= 50) return { label: 'Fair', color: '#f59e0b' };
  if (score >= 25) return { label: 'Poor', color: '#f97316' };
  return { label: 'Critical', color: '#ef4444' };
}

// ============================================================
// Expiration Functions
// ============================================================

export function getExpirationStatus(evidence) {
  if (!evidence) return { status: 'unknown', label: 'Unknown', color: '#64748b', days: null };
  if (!evidence.expiration_date && evidence.expiration_type === 'never') {
    return { status: 'permanent', label: 'No Expiration', color: '#10b981', days: null };
  }
  if (!evidence.expiration_date) {
    return { status: 'permanent', label: 'No Expiration', color: '#10b981', days: null };
  }
  const expDate = new Date(evidence.expiration_date);
  const now = new Date();
  const daysUntil = Math.floor((expDate - now) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return { status: 'expired', label: 'Expired', color: '#ef4444', days: daysUntil };
  if (daysUntil <= 30) return { status: 'expiring_soon', label: 'Expiring Soon', color: '#f59e0b', days: daysUntil };
  if (daysUntil <= 90) return { status: 'expiring', label: 'Expiring', color: '#f97316', days: daysUntil };
  return { status: 'active', label: 'Active', color: '#10b981', days: daysUntil };
}

export function getUpcomingExpirations(evidenceItems) {
  if (!evidenceItems) return [];
  return evidenceItems
    .map(e => ({ evidence: e, status: getExpirationStatus(e) }))
    .filter(item => item.status.status === 'expired' || item.status.status === 'expiring_soon' || item.status.status === 'expiring')
    .sort((a, b) => (a.status.days || 0) - (b.status.days || 0));
}

// ============================================================
// Evidence Graph
// ============================================================

export function buildEvidenceGraph(evidenceItems) {
  if (!evidenceItems || evidenceItems.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];

  // Evidence nodes
  evidenceItems.forEach((evidence, idx) => {
    const typeMeta = getEvidenceTypeMeta(resolveEvidenceType(evidence));
    nodes.push({
      id: evidence.id || `ev-${idx}`,
      label: evidence.title || 'Untitled',
      type: 'evidence',
      evidenceType: resolveEvidenceType(evidence),
      color: typeMeta.color,
      icon: typeMeta.icon,
      quality: evidence.overall_quality || calculateEvidenceQualityScore(evidence),
      status: evidence.verification_status || 'unverified',
      x: 0, y: 0,
    });
  });

  // Module nodes (unique modules from evidence types)
  const moduleSet = new Map();
  evidenceItems.forEach((evidence, idx) => {
    const typeMeta = getEvidenceTypeMeta(resolveEvidenceType(evidence));
    if (!moduleSet.has(typeMeta.module)) {
      moduleSet.set(typeMeta.module, {
        id: `module-${typeMeta.module}`,
        label: typeMeta.module,
        type: 'module',
        color: '#6366f1',
        icon: 'Layers',
        x: 0, y: 0,
      });
    }
    // Edge: evidence -> module
    edges.push({
      source: evidence.id || `ev-${idx}`,
      target: `module-${typeMeta.module}`,
      type: 'belongs_to',
    });
  });

  // Related evidence edges
  evidenceItems.forEach((evidence, idx) => {
    const related = parseJsonArray(evidence.related_evidence_ids);
    related.forEach(relId => {
      if (typeof relId === 'string') {
        edges.push({
          source: evidence.id || `ev-${idx}`,
          target: relId,
          type: 'related_to',
        });
      } else if (relId && relId.id) {
        edges.push({
          source: evidence.id || `ev-${idx}`,
          target: relId.id,
          type: relId.type || 'related_to',
        });
      }
    });
  });

  // Verification node if related_verification_id exists
  const verSet = new Set();
  evidenceItems.forEach(e => {
    if (e.related_verification_id && !verSet.has(e.related_verification_id)) {
      verSet.add(e.related_verification_id);
      nodes.push({
        id: `verification-${e.related_verification_id}`,
        label: 'Identity Verification',
        type: 'verification',
        color: '#10b981',
        icon: 'ShieldCheck',
        x: 0, y: 0,
      });
      edges.push({
        source: e.id,
        target: `verification-${e.related_verification_id}`,
        type: 'supports',
      });
    }
  });

  // Add module nodes
  moduleSet.forEach(m => nodes.push(m));

  // Compute positions — circular layout for evidence, outer ring for modules
  const evidenceNodes = nodes.filter(n => n.type === 'evidence');
  const moduleNodes = nodes.filter(n => n.type === 'module');
  const verificationNodes = nodes.filter(n => n.type === 'verification');

  const centerX = 250, centerY = 200;
  const evidenceRadius = Math.max(80, evidenceNodes.length * 15);
  const moduleRadius = evidenceRadius + 100;

  evidenceNodes.forEach((node, i) => {
    const angle = (i / Math.max(evidenceNodes.length, 1)) * Math.PI * 2;
    node.x = centerX + Math.cos(angle) * evidenceRadius;
    node.y = centerY + Math.sin(angle) * evidenceRadius;
  });

  moduleNodes.forEach((node, i) => {
    const angle = (i / Math.max(moduleNodes.length, 1)) * Math.PI * 2 + Math.PI / 4;
    node.x = centerX + Math.cos(angle) * moduleRadius;
    node.y = centerY + Math.sin(angle) * moduleRadius;
  });

  verificationNodes.forEach((node, i) => {
    node.x = centerX;
    node.y = centerY - moduleRadius - 30 + i * 40;
  });

  return { nodes, edges };
}

// ============================================================
// Timeline
// ============================================================

export function getEvidenceTimeline(evidenceItems) {
  if (!evidenceItems) return [];
  const events = [];

  evidenceItems.forEach(evidence => {
    if (evidence.created_date) {
      events.push({
        evidence,
        type: 'created',
        label: 'Evidence Added',
        date: evidence.created_date,
        color: '#6366f1',
        icon: 'Plus',
      });
    }
    if (evidence.verification_date) {
      events.push({
        evidence,
        type: 'verified',
        label: 'Evidence Verified',
        date: evidence.verification_date,
        color: '#10b981',
        icon: 'CheckCircle2',
        reviewer: evidence.reviewer_name || evidence.verifier,
      });
    }
    if (evidence.ai_review_date) {
      events.push({
        evidence,
        type: 'ai_reviewed',
        label: 'AI Review Completed',
        date: evidence.ai_review_date,
        color: '#a855f7',
        icon: 'Sparkles',
      });
    }
    if (evidence.expiration_date) {
      const expStatus = getExpirationStatus(evidence);
      if (expStatus.status === 'expired') {
        events.push({
          evidence,
          type: 'expired',
          label: 'Evidence Expired',
          date: evidence.expiration_date,
          color: '#ef4444',
          icon: 'AlertCircle',
        });
      }
    }
  });

  return events.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ============================================================
// Stats
// ============================================================

export function getEvidenceStats(evidenceItems) {
  if (!evidenceItems || evidenceItems.length === 0) {
    return {
      total: 0,
      verified: 0,
      pending: 0,
      unverified: 0,
      expired: 0,
      avgQuality: 0,
      avgConfidence: 0,
      avgAuthenticity: 0,
      avgFreshness: 0,
      upcomingExpirations: 0,
      byType: {},
      bySource: {},
    };
  }

  const recalced = evidenceItems.map(recalculateEvidenceScores);
  const stats = {
    total: recalced.length,
    verified: recalced.filter(e => e.verification_status === 'verified').length,
    pending: recalced.filter(e => e.verification_status === 'pending').length,
    unverified: recalced.filter(e => e.verification_status === 'unverified').length,
    expired: recalced.filter(e => getExpirationStatus(e).status === 'expired').length,
    avgQuality: Math.round(recalced.reduce((s, e) => s + (e.overall_quality || 0), 0) / recalced.length),
    avgConfidence: Math.round(recalced.reduce((s, e) => s + (e.confidence || 0), 0) / recalced.length),
    avgAuthenticity: Math.round(recalced.reduce((s, e) => s + (e.authenticity || 0), 0) / recalced.length),
    avgFreshness: Math.round(recalced.reduce((s, e) => s + (e.freshness || 0), 0) / recalced.length),
    upcomingExpirations: getUpcomingExpirations(recalced).length,
    byType: {},
    bySource: {},
  };

  recalced.forEach(e => {
    const type = resolveEvidenceType(e);
    stats.byType[type] = (stats.byType[type] || 0) + 1;
    const source = e.source_type || 'self_reported';
    stats.bySource[source] = (stats.bySource[source] || 0) + 1;
  });

  return stats;
}

// ============================================================
// Filtering & Sorting
// ============================================================

export function filterAndSortEvidence(evidenceItems, filters = {}) {
  if (!evidenceItems) return [];
  let result = [...evidenceItems];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(e =>
      (e.title || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q) ||
      (e.organization || '').toLowerCase().includes(q) ||
      (e.source || '').toLowerCase().includes(q)
    );
  }

  if (filters.type && filters.type !== 'all') {
    result = result.filter(e => resolveEvidenceType(e) === filters.type);
  }

  if (filters.status && filters.status !== 'all') {
    result = result.filter(e => e.verification_status === filters.status);
  }

  if (filters.sourceType && filters.sourceType !== 'all') {
    result = result.filter(e => e.source_type === filters.sourceType);
  }

  const sortBy = filters.sortBy || 'date';
  const sortDir = filters.sortDir || 'desc';
  result.sort((a, b) => {
    let valA, valB;
    switch (sortBy) {
      case 'quality':
        valA = calculateEvidenceQualityScore(a);
        valB = calculateEvidenceQualityScore(b);
        break;
      case 'confidence':
        valA = calculateConfidence(a);
        valB = calculateConfidence(b);
        break;
      case 'title':
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
        break;
      case 'date':
      default:
        valA = new Date(a.date || a.created_date || 0).getTime();
        valB = new Date(b.date || b.created_date || 0).getTime();
    }
    if (typeof valA === 'string') return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  return result;
}

// ============================================================
// AI Review Prompt Builder
// ============================================================

export function buildAIReviewPrompt(evidence) {
  const typeMeta = getEvidenceTypeMeta(resolveEvidenceType(evidence));
  const sourceMeta = getSourceMeta(evidence.source_type);
  return `You are an expert AI Evidence Reviewer for EXECLEAD.AI's Executive Evidence Vault.

Review the following evidence item and provide a quality assessment.

Evidence Title: ${evidence.title || 'N/A'}
Evidence Type: ${typeMeta.label}
Organization: ${evidence.organization || 'N/A'}
Source: ${evidence.source || 'N/A'}
Source Type: ${sourceMeta.label} (trust weight: ${sourceMeta.trustWeight})
Description: ${evidence.description || 'N/A'}
Issue Date: ${evidence.date || 'N/A'}
Verification Status: ${evidence.verification_status || 'unverified'}
Has File: ${evidence.evidence_file_url ? 'Yes' : 'No'}
Has Hash: ${evidence.evidence_hash ? 'Yes' : 'No'}

Provide your assessment as JSON with these fields:
- ai_confidence (0-100): Your confidence in the evidence's validity
- ai_review_summary (string, 2-3 sentences): Your assessment
- ai_flags (array of strings): Any concerns (e.g. "missing_documentation", "outdated", "unverified_source", "low_authenticity", "needs_manual_review")

Be rigorous. Flag anything that seems suspicious or incomplete.`;
}

export const AI_REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    ai_confidence: { type: 'number' },
    ai_review_summary: { type: 'string' },
    ai_flags: { type: 'array', items: { type: 'string' } },
  },
};

// ============================================================
// Utilities
// ============================================================

export function parseJsonArray(str) {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  try { return JSON.parse(str); } catch { return []; }
}

export function parseModules(evidence) {
  return parseJsonArray(evidence?.related_modules);
}

export function parseAuditRefs(evidence) {
  return parseJsonArray(evidence?.audit_references);
}

export function parseRelatedEvidence(evidence) {
  return parseJsonArray(evidence?.related_evidence_ids);
}

export function parseAIFlags(evidence) {
  return parseJsonArray(evidence?.ai_flags);
}

export function parseTags(evidence) {
  return parseJsonArray(evidence?.tags);
}