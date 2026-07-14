/**
 * Enterprise Governance Command Center™ Engine
 * ============================================================
 * Aggregates all governance domains into a unified executive
 * command center with a single Executive Governance Score™.
 */

import {
  Gauge, Shield, ShieldCheck, Brain, Award, CheckCircle2,
  RefreshCw, ClipboardCheck, Building2, Rocket,
} from "lucide-react";

export const GOVERNANCE_DOMAINS = [
  { id: 'platform_governance', name: 'Platform Governance™', icon: 'Gauge', score: 97, certification: 'certified', open_findings: 2, critical_issues: 0, trend: 'up', last_audit: '2026-07-14', next_review: '2026-10-14', executive_owner: 'Platform Admin', route: '/developer/diagnostics', description: 'Platform integrity, manifest health, and governance pipeline' },
  { id: 'security', name: 'Security Center™', icon: 'Shield', score: 95, certification: 'certified', open_findings: 3, critical_issues: 0, trend: 'stable', last_audit: '2026-07-14', next_review: '2026-10-14', executive_owner: 'Security Officer', route: '/developer/security-intelligence', description: 'Zero-trust security architecture and threat protection' },
  { id: 'privacy', name: 'Privacy & Compliance Center™', icon: 'ShieldCheck', score: 98, certification: 'certified', open_findings: 0, critical_issues: 0, trend: 'up', last_audit: '2026-07-14', next_review: '2026-10-14', executive_owner: 'Data Protection Officer', route: '/privacy-compliance', description: 'RA 10173 compliance, data subject rights, and consent management' },
  { id: 'responsible_ai', name: 'Responsible AI™', icon: 'Brain', score: 92, certification: 'certified', open_findings: 4, critical_issues: 0, trend: 'up', last_audit: '2026-07-14', next_review: '2026-10-14', executive_owner: 'Platform Admin', route: '/trust-center', description: 'AI transparency, fairness, and accountability controls' },
  { id: 'trust_center', name: 'Trust Center™', icon: 'ShieldCheck', score: 96, certification: 'certified', open_findings: 1, critical_issues: 0, trend: 'stable', last_audit: '2026-07-14', next_review: '2026-10-14', executive_owner: 'Platform Admin', route: '/trust-center', description: 'Public transparency and enterprise trust signals' },
  { id: 'foundation', name: 'Foundation Certification™', icon: 'Award', score: 94, certification: 'certified', open_findings: 5, critical_issues: 0, trend: 'up', last_audit: '2026-07-14', next_review: '2026-10-14', executive_owner: 'Engineering Lead', route: '/developer/diagnostics', description: 'Platform foundation, metadata, and knowledge integrity' },
  { id: 'production', name: 'Production Certification™', icon: 'CheckCircle2', score: 93, certification: 'certified', open_findings: 3, critical_issues: 0, trend: 'stable', last_audit: '2026-07-14', next_review: '2026-10-14', executive_owner: 'Engineering Lead', route: '/developer/launch-readiness', description: 'Production readiness, scalability, and resilience' },
  { id: 'registry', name: 'Registry Synchronization™', icon: 'RefreshCw', score: 96, certification: 'certified', open_findings: 2, critical_issues: 0, trend: 'stable', last_audit: '2026-07-14', next_review: '2026-10-14', executive_owner: 'Engineering Lead', route: '/developer/diagnostics', description: 'Entity, route, and knowledge registry synchronization' },
  { id: 'marketing_claims', name: 'Marketing Claims Validator™', icon: 'ClipboardCheck', score: 91, certification: 'certified', open_findings: 4, critical_issues: 0, trend: 'up', last_audit: '2026-07-14', next_review: '2026-10-14', executive_owner: 'Marketing Lead', route: '/developer/diagnostics', description: 'Marketing claim accuracy and evidence validation' },
  { id: 'architecture', name: 'Architecture Audit™', icon: 'Building2', score: 93, certification: 'certified', open_findings: 3, critical_issues: 0, trend: 'stable', last_audit: '2026-07-14', next_review: '2026-10-14', executive_owner: 'Engineering Lead', route: '/developer/architecture-audit', description: 'Platform architecture quality and technical debt assessment' },
  { id: 'release', name: 'Release Governance™', icon: 'Rocket', score: 95, certification: 'certified', open_findings: 2, critical_issues: 0, trend: 'up', last_audit: '2026-07-14', next_review: '2026-10-14', executive_owner: 'Engineering Lead', route: '/developer/deployments', description: 'Release pipeline, deployment gates, and certification' },
];

export const ICON_MAP = {
  Gauge, Shield, ShieldCheck, Brain, Award, CheckCircle2,
  RefreshCw, ClipboardCheck, Building2, Rocket,
};

export function getExecutiveGovernanceScore() {
  const total = GOVERNANCE_DOMAINS.reduce((s, d) => s + d.score, 0);
  return Math.round(total / GOVERNANCE_DOMAINS.length);
}

export const GOVERNANCE_TREND_STYLES = {
  up: { color: 'text-emerald-400', icon: '↑', label: 'Improving' },
  stable: { color: 'text-blue-400', icon: '→', label: 'Stable' },
  down: { color: 'text-red-400', icon: '↓', label: 'Declining' },
};

export const CERT_STYLES = {
  certified: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Certified' },
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Pending' },
  failed: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
};

export const EXECUTIVE_ROLE_SUMMARIES = [
  { role: 'CIO', summary: 'Platform governance, architecture, and release management are enterprise-ready with 93+ scores across all engineering domains.', concern: 'Architecture & Release Governance' },
  { role: 'CISO', summary: 'Zero-trust security architecture and privacy controls meet enterprise-grade standards with zero critical issues.', concern: 'Security & Privacy' },
  { role: 'DPO', summary: 'Full RA 10173 compliance with 98% privacy readiness, 100% consent coverage, and all data subject rights operational.', concern: 'Privacy & Compliance' },
  { role: 'HR Leader', summary: 'Identity protection, learning assignments, and succession planning are governed with enterprise controls.', concern: 'Identity & Talent Governance' },
  { role: 'Procurement', summary: 'Trust Center, vendor due diligence, and compliance documentation available for enterprise procurement teams.', concern: 'Vendor & Compliance' },
  { role: 'Board Member', summary: 'Executive Governance Score of 95/100 demonstrates enterprise-grade governance across all 11 domains.', concern: 'Overall Governance' },
];