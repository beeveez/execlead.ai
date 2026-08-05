// Architecture Decision Records™ (ADR) — Architecture Governance v1.0.
// Preserves the *why* behind architectural decisions. Every significant
// decision gets a permanent, searchable, versioned record linked to
// standards, exceptions, services, and releases.
//
// Philosophy:
//   Code explains how.    Standards explain what.
//   Exceptions explain deviations.
//   ADRs explain why.

import { listArchitectureExceptions } from './architectureGovernanceEngine';

// ── Status metadata ──
export const ADR_STATUS_META = {
  proposed: { label: 'Proposed', color: '#94a3b8', bg: 'bg-slate-500/15', text: 'text-slate-400', group: 'pending' },
  accepted: { label: 'Accepted', color: '#10b981', bg: 'bg-emerald-500/15', text: 'text-emerald-400', group: 'accepted' },
  implemented: { label: 'Implemented', color: '#6366f1', bg: 'bg-indigo-500/15', text: 'text-indigo-400', group: 'accepted' },
  deprecated: { label: 'Deprecated', color: '#f97316', bg: 'bg-orange-500/15', text: 'text-orange-400', group: 'deprecated' },
  superseded: { label: 'Superseded', color: '#a78bfa', bg: 'bg-violet-500/15', text: 'text-violet-400', group: 'deprecated' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'bg-rose-500/15', text: 'text-rose-400', group: 'rejected' },
};

export const ADR_CATEGORY_META = {
  platform: { label: 'Platform' },
  architecture: { label: 'Architecture' },
  security: { label: 'Security' },
  ai: { label: 'AI' },
  identity: { label: 'Identity' },
  commercial: { label: 'Commercial' },
  experience: { label: 'Experience' },
  data: { label: 'Data' },
  infrastructure: { label: 'Infrastructure' },
  developer_experience: { label: 'Developer Experience' },
  performance: { label: 'Performance' },
};

export const ADR_WORKSPACES = [
  { key: 'executive', label: 'Executive' },
  { key: 'enterprise', label: 'Enterprise' },
  { key: 'platform', label: 'Platform' },
  { key: 'developer', label: 'Developer' },
];

// Events that should prompt automatic ADR creation, with the draft fields
// to prefill when the trigger fires.
export const ADR_TRIGGERS = [
  { key: 'standard', label: 'New Architecture Standard approved', defaultCategory: 'platform', defaultTrigger: 'standard' },
  { key: 'exception', label: 'Exception approved', defaultCategory: 'architecture', defaultTrigger: 'exception' },
  { key: 'service', label: 'New Platform Service introduced', defaultCategory: 'platform', defaultTrigger: 'service' },
  { key: 'repository', label: 'Repository pattern changed', defaultCategory: 'architecture', defaultTrigger: 'repository' },
  { key: 'policy', label: 'New governance policy adopted', defaultCategory: 'platform', defaultTrigger: 'policy' },
  { key: 'runtime', label: 'Core runtime abstraction modified', defaultCategory: 'architecture', defaultTrigger: 'runtime' },
];

// Generate the next sequential ADR id (ADR-NNNN) from existing records.
export function generateADRId(existing = []) {
  let max = 0;
  for (const a of existing) {
    const m = /ADR-(\d+)/.exec(a.adr_id || '');
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `ADR-${String(max + 1).padStart(4, '0')}`;
}

// Compute dashboard stats from a list of ADRs.
export function computeADRStats(adrs = []) {
  const byStatus = {};
  for (const a of adrs) byStatus[a.status] = (byStatus[a.status] || 0) + 1;

  const recentlyChanged = [...adrs]
    .sort((x, y) => new Date(y.updated_date || y.decision_date || 0) - new Date(x.updated_date || x.decision_date || 0))
    .slice(0, 5);

  return {
    total: adrs.length,
    accepted: (byStatus.accepted || 0) + (byStatus.implemented || 0),
    pending: byStatus.proposed || 0,
    deprecated: (byStatus.deprecated || 0) + (byStatus.superseded || 0),
    rejected: byStatus.rejected || 0,
    recentlyChanged,
  };
}

// Apply search + category + workspace + owner filters.
export function filterADRs(adrs = [], { query = '', category = 'all', workspace = 'all', owner = 'all', status = 'all' } = {}) {
  return adrs.filter((a) => {
    if (status !== 'all' && a.status !== status) return false;
    if (category !== 'all' && a.category !== category) return false;
    if (workspace !== 'all' && !(a.affected_workspaces || []).includes(workspace)) return false;
    if (owner !== 'all' && (a.owner || '') !== owner) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = [a.title, a.adr_id, a.problem_statement, a.decision, a.rationale, a.owner]
        .map((s) => (s || '').toLowerCase()).join(' ');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// Derive ADR draft suggestions from approved, active architecture exceptions.
// Returns one suggestion per exception that has no existing ADR referencing it.
export async function deriveADRSuggestions(existingADRs = []) {
  let exceptions = [];
  try {
    exceptions = await listArchitectureExceptions();
  } catch {
    exceptions = [];
  }
  const approved = exceptions.filter((e) => e.approval_status === 'approved' && e.current_state === 'active');
  const linked = new Set();
  for (const a of existingADRs) {
    for (const id of a.related_exception_ids || []) linked.add(id);
  }
  return approved
    .filter((e) => !linked.has(e.exception_id))
    .map((e) => ({
      suggested_title: `Document decision behind ${e.title}`,
      category: 'architecture',
      trigger_source: 'exception',
      source_ref_id: e.exception_id,
      problem_statement: e.alternative_considered || `Approved exception ${e.exception_id} for ${e.module || e.title}.`,
      rationale: e.risk_assessment || e.description || '',
      related_exception_ids: [e.exception_id],
      affected_services: [],
      affected_workspaces: e.workspace ? [e.workspace] : [],
    }));
}

// Build a blank ADR draft (for the create form).
export function blankADRDraft(adrId, ownerName) {
  return {
    adr_id: adrId,
    title: '',
    category: 'architecture',
    status: 'proposed',
    owner: ownerName || '',
    decision_date: new Date().toISOString(),
    version: '1.0',
    problem_statement: '',
    decision: '',
    alternatives_considered: '',
    rationale: '',
    consequences: '',
    affected_services: [],
    affected_workspaces: [],
    related_standards: [],
    related_exception_ids: [],
    related_releases: [],
    migration_impact: '',
    review_date: '',
    superseded_by: '',
    attachments: [],
    trigger_source: 'manual',
    source_ref_id: '',
  };
}

export default {
  ADR_STATUS_META,
  ADR_CATEGORY_META,
  ADR_WORKSPACES,
  ADR_TRIGGERS,
  generateADRId,
  computeADRStats,
  filterADRs,
  deriveADRSuggestions,
  blankADRDraft,
};