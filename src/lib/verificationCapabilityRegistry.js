/**
 * Verification Capability Dependencies™ & Integration Registry™
 *
 * Registers:
 * 1. Capability Dependencies — what EXEC™ Verified depends on
 * 2. Integration Registry — dormant integration points for future activation
 *
 * Nothing here is activated — these are metadata registries only.
 */

// ============================================================
// Capability Dependencies™
// ============================================================
export const CAPABILITY_DEPENDENCIES = {
  capability_id: "exec_verified",
  name: "EXEC™ Verified Framework™",
  lifecycle: "Hidden — Production Ready",
  maturity: "Production Ready",
  activation: "Feature Flag: exec_verified",
  depends_on: [
    { id: "executive_trust", name: "Executive Trust™", status: "operational", critical: true },
    { id: "identity_verification", name: "Identity Verification™", status: "operational", critical: true },
    { id: "evidence_confidence", name: "Evidence Confidence™", status: "operational", critical: true },
    { id: "verification_intelligence", name: "Verification Intelligence™", status: "operational", critical: true },
    { id: "security_center", name: "Security Center™", status: "operational", critical: true },
    { id: "account_hub", name: "Account Hub™", status: "operational", critical: true },
    { id: "capability_registry", name: "Capability Registry™", status: "operational", critical: true },
    { id: "feature_flags", name: "Feature Flags™", status: "operational", critical: true },
    { id: "audit_center", name: "Audit Center™", status: "operational", critical: true },
    { id: "executive_passport", name: "Executive Passport™", status: "dormant", critical: false },
  ],
};

// ============================================================
// Integration Registry™ — dormant integration points
// ============================================================
export const INTEGRATION_REGISTRY = [
  {
    id: "executive_passport",
    name: "Executive Passport™",
    desc: "Portable executive identity credential — carries verified status across systems",
    status: "dormant",
    activation_trigger: "exec_verified enabled + passport module launched",
    data_contract: "verification_level, evidence_confidence, trust_score",
  },
  {
    id: "recruiter_workspace",
    name: "Recruiter Workspace™",
    desc: "Recruiters search and view verified executive profiles",
    status: "dormant",
    activation_trigger: "exec_verified enabled + recruiter launch phase",
    data_contract: "verification_status, verification_level, user_name, user_email",
  },
  {
    id: "executive_marketplace",
    name: "Executive Marketplace™",
    desc: "Marketplace listings display verified badge and trust signals",
    status: "dormant",
    activation_trigger: "exec_verified enabled + marketplace launched",
    data_contract: "verification_status, verification_level, badge_display",
  },
  {
    id: "leadership_dna",
    name: "Leadership DNA™",
    desc: "Verified status enhances Leadership DNA confidence scoring",
    status: "dormant",
    activation_trigger: "exec_verified enabled",
    data_contract: "verification_level, evidence_confidence",
  },
  {
    id: "promotion_forecast",
    name: "Promotion Forecast™",
    desc: "Verified status contributes to promotion readiness scoring",
    status: "dormant",
    activation_trigger: "exec_verified enabled",
    data_contract: "verification_level, readiness_score",
  },
  {
    id: "executive_readiness",
    name: "Executive Readiness™",
    desc: "Verification status feeds into executive readiness calculations",
    status: "dormant",
    activation_trigger: "exec_verified enabled",
    data_contract: "verification_level, readiness_score, trust_score",
  },
  {
    id: "executive_reputation",
    name: "Executive Reputation™",
    desc: "Verified badge boosts reputation score weight",
    status: "dormant",
    activation_trigger: "exec_verified enabled",
    data_contract: "verification_level, verification_status",
  },
  {
    id: "executive_timeline",
    name: "Executive Timeline™",
    desc: "Verification milestones appear on the executive timeline",
    status: "dormant",
    activation_trigger: "exec_verified enabled",
    data_contract: "verification_date, verification_level, expiration_date",
  },
  {
    id: "enterprise_workspace",
    name: "Enterprise Workspace™",
    desc: "Enterprise dashboards show verified executive counts and trust metrics",
    status: "dormant",
    activation_trigger: "exec_verified enabled + enterprise launch phase",
    data_contract: "organization_id, verified_count, average_confidence",
  },
];

/**
 * Returns all dormant integrations.
 */
export function getDormantIntegrations() {
  return INTEGRATION_REGISTRY.filter((i) => i.status === "dormant");
}

/**
 * Returns critical dependencies.
 */
export function getCriticalDependencies() {
  return CAPABILITY_DEPENDENCIES.depends_on.filter((d) => d.critical);
}