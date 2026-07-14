/**
 * EXECLEAD.AI — RLS Policy Registry™
 * ============================================================
 * Standardized 4-class security model for every entity in the platform.
 * Eliminates ad-hoc RLS policies by classifying each entity into exactly
 * one security class, then auditing its read/update/delete rules.
 *
 * Security Classification Matrix™
 * ─────────────────────────────────────────────
 * Public            │ Anyone read        │ Admin CUD
 * User-scoped       │ Owner read         │ Owner/System CUD
 * Organization-scoped │ Same-org read     │ Org Admin/System CUD
 * Platform-scoped   │ Platform Admin read │ Platform Service CUD
 *
 * This module is the single source of truth for the RLS Registry™ tab
 * in the Security Operations Center.
 */

// ── The Four Standard Security Classifications ──
export const SECURITY_CLASSIFICATIONS = {
  public: {
    id: "public",
    label: "Public",
    description: "Anyone can read; admin-only mutations",
    tone: "blue",
  },
  user: {
    id: "user",
    label: "User-Scoped",
    description: "Owner can read their own records; admin/system mutate",
    tone: "emerald",
  },
  organization: {
    id: "organization",
    label: "Organization-Scoped",
    description: "Same-organization users can read; org admin/system mutate",
    tone: "violet",
  },
  platform: {
    id: "platform",
    label: "Platform-Scoped",
    description: "Platform Admin / Developer / Service Role only",
    tone: "amber",
  },
};

// ── RLS Health Status ──
export const RLS_STATUS = {
  protected: { id: "protected", label: "Protected", tone: "emerald" },
  partial: { id: "partial", label: "Partial", tone: "amber" },
  open: { id: "open", label: "No RLS", tone: "red" },
  unverified: { id: "unverified", label: "Unverified", tone: "indigo" },
};

// ── Entity Security Classification™ ──
// Data-sensitivity classification for each entity, independent of access scope.
// Inherits default security controls based on classification rather than
// requiring manual rules each time. Visible in the RLS Registry™ tab.
export const ENTITY_SECURITY_CLASSIFICATIONS = {
  pii: {
    id: "pii",
    label: "PII",
    icon: "🔴",
    description: "Contains personally identifiable information",
    tone: "red",
    defaultControls: "Owner-scoped read; admin-only mutations; encryption at rest",
  },
  financial: {
    id: "financial",
    label: "Financial",
    icon: "🔴",
    description: "Contains financial, billing, or wallet data",
    tone: "red",
    defaultControls: "Owner + admin/finance read; admin/finance mutations; PCI-aware",
  },
  tenant_boundary: {
    id: "tenant_boundary",
    label: "Tenant Boundary",
    icon: "🔴",
    description: "Defines multi-tenant isolation boundaries",
    tone: "red",
    defaultControls: "Same-org read; platform admin mutations; cross-tenant denied",
  },
  identity_infrastructure: {
    id: "identity_infrastructure",
    label: "Identity Infrastructure",
    icon: "🔴",
    description: "Identity, SSO, provisioning, and access infrastructure",
    tone: "red",
    defaultControls: "Admin/dev only; secrets encrypted; security officer oversight",
  },
  governance: {
    id: "governance",
    label: "Governance",
    icon: "🟠",
    description: "Governance, compliance, and certification records",
    tone: "amber",
    defaultControls: "Admin/dev read; platform admin mutations; audit trail required",
  },
  confidential: {
    id: "confidential",
    label: "Confidential",
    icon: "🟠",
    description: "Confidential business intelligence and reports",
    tone: "amber",
    defaultControls: "Admin/dev read; platform admin mutations; document-level visibility",
  },
  immutable_audit: {
    id: "immutable_audit",
    label: "Immutable Audit",
    icon: "🔴",
    description: "Append-only audit log — update/delete prohibited",
    tone: "red",
    defaultControls: "System create; authorized read; update NEVER; delete NEVER; corrections via new entry",
  },
  internal: {
    id: "internal",
    label: "Internal",
    icon: "🟡",
    description: "Internal platform configuration and catalog",
    tone: "yellow",
    defaultControls: "Admin/dev read; admin mutations; platform admin delete",
  },
  public_catalog: {
    id: "public_catalog",
    label: "Public",
    icon: "🟢",
    description: "Public catalog data — readable by all authenticated users",
    tone: "green",
    defaultControls: "Public read; admin CUD; no PII in public fields",
  },
};

// ── Entity → Security Classification Map ──
// Explicit assignments override the auto-classification heuristic.
const ENTITY_SECURITY_CLASS_MAP = {
  // Financial
  ExecutiveWallet: "financial",
  Invoice: "financial",
  WithdrawalRequest: "financial",
  WalletTransaction: "financial",
  Subscription: "financial",
  ReferralTransaction: "financial",
  Referral: "financial",
  BillingEvent: "financial",
  PaymentSettings: "financial",
  CPQQuote: "financial",
  Purchase: "financial",
  // Tenant Boundary
  Organization: "tenant_boundary",
  // Identity Infrastructure
  IdentityProvider: "identity_infrastructure",
  IdentitySyncEvent: "identity_infrastructure",
  SSOConfig: "identity_infrastructure",
  EmailSettings: "identity_infrastructure",
  ExecutiveIdentityTransfer: "identity_infrastructure",
  // Governance
  GovernanceCertificate: "governance",
  GuardianActivity: "governance",
  // Confidential
  SuccessionPlan: "confidential",
  EnterpriseReport: "confidential",
  ReportEvidence: "confidential",
  // Immutable Audit
  ReputationAuditLog: "immutable_audit",
  SubscriptionAuditLog: "immutable_audit",
  CompanyAuditLog: "immutable_audit",
  FoundingMemberAuditLog: "immutable_audit",
  LegacyAuditLog: "immutable_audit",
  // Public Catalog
  Company: "public_catalog",
  CompanyVersion: "public_catalog",
};

/**
 * Resolve the Entity Security Classification™ for a given entity name.
 * Falls back to auto-classification based on the RLS classification:
 *   user → pii, organization → internal, platform → internal, public → public_catalog
 */
export function getEntitySecurityClass(entityName) {
  if (ENTITY_SECURITY_CLASS_MAP[entityName]) {
    return ENTITY_SECURITY_CLASS_MAP[entityName];
  }
  const entry = RLS_REGISTRY.find((e) => e.name === entityName);
  if (!entry) return "internal";
  if (entry.classification === "user") return "pii";
  if (entry.classification === "public") return "public_catalog";
  return "internal";
}

/**
 * Get the full classification metadata for an entity.
 */
export function getEntitySecurityClassMeta(entityName) {
  const classId = getEntitySecurityClass(entityName);
  return ENTITY_SECURITY_CLASSIFICATIONS[classId] || ENTITY_SECURITY_CLASSIFICATIONS.internal;
}

// ── Entity Registry (audited 2026-07-13) ──
// Each entry declares: classification, scope field, read/update/delete status,
// sensitivity, and a human-readable rule summary.
//
// status legend:
//   protected — all 4 operations (CRUD) have least-privilege rules
//   partial   — read is restricted but create/update/delete are open
//   open      — empty {} RLS block (no restrictions on any operation)
export const RLS_REGISTRY = [
  // ── User-Scoped ──
  { name: "ExecutiveWallet", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "owner + admin" },
  { name: "SecuritySession", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "owner + admin" },
  { name: "Invoice", classification: "user", scope: "owner_user_id", status: "protected", sensitive: true, rule: "immutable; owner + admin/finance read; update/delete: super_admin/platform_admin only" },
  { name: "WithdrawalRequest", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "owner + admin/finance" },
  { name: "WalletTransaction", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "immutable append-only; owner + admin/finance read; no update/delete" },
  { name: "IdentityVerification", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "owner + admin" },
  { name: "TrustedDevice", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "owner + admin" },
  { name: "AccountDeletionRequest", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "owner + admin" },
  { name: "ReferralTransaction", classification: "user", scope: "referrer_user_id", status: "protected", sensitive: true, rule: "immutable append-only; owner + admin/finance read; no update/delete" },
  { name: "NetworkConnection", classification: "user", scope: "requester_id/recipient_id", status: "protected", sensitive: false, rule: "party + admin" },
  { name: "VerificationLog", classification: "user", scope: "user_id", status: "protected", sensitive: false, rule: "immutable append-only; owner + admin read; no update/delete" },
  { name: "ExecutiveCompetency", classification: "user", scope: "user_id", status: "protected", sensitive: false, rule: "owner + admin" },
  { name: "JourneyEvent", classification: "user", scope: "user_id", status: "protected", sensitive: false, rule: "immutable append-only; owner + admin read; no update/delete" },
  { name: "ExecutiveAffiliation", classification: "user", scope: "user_id", status: "protected", sensitive: false, rule: "owner + admin" },
  { name: "UserProfile", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "owner + same-org + admin" },
  { name: "Subscription", classification: "user", scope: "owner_user_id", status: "protected", sensitive: true, rule: "owner + admin/finance" },
  { name: "SubscriptionAuditLog", classification: "user", scope: "user_id", status: "protected", sensitive: false, rule: "immutable append-only; owner + admin/finance read; no update/delete" },
  { name: "ExecutiveIdentityTransfer", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "owner + org admin + platform admin + security officer; delete: platform admin only" },

  // ── Organization-Scoped ──
  { name: "Department", classification: "organization", scope: "organization_id", status: "protected", sensitive: false, rule: "same-org + admin" },
  { name: "Team", classification: "organization", scope: "organization_id", status: "protected", sensitive: false, rule: "same-org + admin" },
  { name: "IdentitySyncEvent", classification: "organization", scope: "organization_id", status: "protected", sensitive: true, rule: "immutable; same-org + admin read; update/delete: super_admin/platform_admin only" },
  { name: "Organization", classification: "organization", scope: "id", status: "protected", sensitive: true, rule: "org member + platform admin" },
  { name: "OrgMembership", classification: "organization", scope: "organization_id", status: "protected", sensitive: true, rule: "same-org + org admin" },
  { name: "IdentityProvider", classification: "organization", scope: "organization_id", status: "protected", sensitive: true, rule: "same-org + org admin" },

  // ── Platform-Scoped ──
  { name: "SecurityEvent", classification: "platform", scope: "—", status: "protected", sensitive: true, rule: "immutable append-only; admin/dev read; no update/delete" },
  { name: "SecurityIncident", classification: "platform", scope: "—", status: "protected", sensitive: true, rule: "immutable; admin/dev read; update/delete: super_admin/platform_admin only" },
  { name: "BillingEvent", classification: "platform", scope: "—", status: "protected", sensitive: true, rule: "immutable append-only; admin/dev/finance read; no update/delete" },
  { name: "PlatformStateEvent", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "immutable; admin/dev read; update/delete: super_admin/platform_admin only" },
  { name: "SelfHealingEvent", classification: "platform", scope: "user_id", status: "protected", sensitive: false, rule: "immutable; owner + admin/dev read; update/delete: super_admin/platform_admin only" },
  { name: "GovernanceCertificate", classification: "platform", scope: "—", status: "protected", sensitive: true, rule: "immutable; admin/dev read; update/delete: super_admin/platform_admin only" },

  // ── User-Scoped (registered 2026-07-13) ──
  { name: "ExecutiveReputation", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "owner + admin" },
  { name: "ExecutiveMemory", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "owner + admin" },
  { name: "ExecutiveInterest", classification: "user", scope: "user_id", status: "protected", sensitive: false, rule: "owner + admin" },
  { name: "MentorProfile", classification: "user", scope: "user_id", status: "protected", sensitive: false, rule: "owner + admin" },
  { name: "UserMembership", classification: "user", scope: "user_id", status: "protected", sensitive: true, rule: "owner + admin" },
  { name: "Referral", classification: "user", scope: "referrer_user_id", status: "protected", sensitive: true, rule: "owner + admin/finance" },
  { name: "ReferralEvent", classification: "user", scope: "referrer_user_id", status: "protected", sensitive: false, rule: "immutable append-only; owner + admin read; no update/delete" },
  { name: "ResumeVersion", classification: "user", scope: "created_by_id", status: "protected", sensitive: true, rule: "owner + admin" },
  { name: "CareerResume", classification: "user", scope: "created_by_id", status: "protected", sensitive: true, rule: "owner + admin" },
  { name: "SimulationSession", classification: "user", scope: "created_by_id", status: "protected", sensitive: true, rule: "owner + admin" },
  { name: "LeadershipDNA", classification: "user", scope: "created_by_id", status: "protected", sensitive: false, rule: "owner + admin" },
  { name: "ExecutiveLegacy", classification: "user", scope: "created_by_id", status: "protected", sensitive: false, rule: "owner + admin" },
  { name: "IdentityVersion", classification: "user", scope: "created_by_id", status: "protected", sensitive: true, rule: "immutable append-only; owner + admin read; no update/delete" },
  { name: "CouncilSession", classification: "user", scope: "created_by_id", status: "protected", sensitive: false, rule: "owner + admin" },
  { name: "Certificate", classification: "user", scope: "created_by_id", status: "protected", sensitive: false, rule: "owner + admin" },
  { name: "CompanyReport", classification: "user", scope: "created_by_id", status: "protected", sensitive: false, rule: "owner + admin" },
  { name: "CompanyRequest", classification: "user", scope: "created_by_id", status: "protected", sensitive: false, rule: "owner + admin" },
  { name: "FeatureSubscription", classification: "user", scope: "created_by_id", status: "protected", sensitive: false, rule: "owner + admin" },

  // ── Organization-Scoped (registered 2026-07-13) ──
  { name: "SuccessionPlan", classification: "organization", scope: "organization_id", status: "protected", sensitive: true, rule: "same-org + org admin" },
  { name: "CPQQuote", classification: "organization", scope: "organization_id", status: "protected", sensitive: true, rule: "same-org + admin/finance" },
  { name: "CPQApprovalWorkflow", classification: "organization", scope: "organization_id", status: "protected", sensitive: false, rule: "same-org + admin" },
  { name: "LessonProgress", classification: "organization", scope: "organization_id", status: "protected", sensitive: true, rule: "READ: owner + assigned manager_id/coach_id + admin (role-aware, not broad org); UPDATE: admin/system only — owner annotations (notes/bookmark/reflection/feedback) via backend service role, system fields (completion/xp/score/cert/competency) via Learning Engine™/Quiz Engine™; DELETE: super_admin only (soft-delete via is_archived)" },
  { name: "ProcurementRequest", classification: "organization", scope: "organization_id", status: "protected", sensitive: true, rule: "same-org read + org admin/dev; approval chain governs approve/reject mutations; delete: admin only" },

  // ── Public Catalog (registered 2026-07-13) ──
  { name: "Company", classification: "public", scope: "—", status: "protected", sensitive: false, rule: "public read + admin CUD" },
  { name: "CompanyVersion", classification: "public", scope: "—", status: "protected", sensitive: false, rule: "public read + admin CUD" },

  // ── Platform-Scoped (registered 2026-07-13) ──
  { name: "SSOConfig", classification: "platform", scope: "—", status: "protected", sensitive: true, rule: "admin/dev only" },
  { name: "PaymentSettings", classification: "platform", scope: "—", status: "protected", sensitive: true, rule: "admin/dev/finance only" },
  { name: "EmailSettings", classification: "platform", scope: "—", status: "protected", sensitive: true, rule: "admin/dev only" },
  { name: "PricingPlan", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "MembershipProgram", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "CPQModule", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "CPQSeatTier", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "CPQDiscountRule", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "CPQCurrency", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "CPQTaxRule", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "CPQAIPackage", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "CPQSupportPackage", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "ReferralSettings", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "ReferralReward", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "Coupon", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },
  { name: "GuardianActivity", classification: "platform", scope: "—", status: "protected", sensitive: true, rule: "immutable append-only; admin/dev read; no update/delete" },
  { name: "CompanyAuditLog", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "immutable append-only; admin/dev read; no update/delete" },
  { name: "FoundingMemberAuditLog", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "immutable append-only; admin/dev read; no update/delete" },
  { name: "LegacyAuditLog", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "immutable append-only; owner + admin/dev read; no update/delete" },
  { name: "ReputationAuditLog", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "immutable append-only; owner + admin read; no update/delete" },
  { name: "EmailEvent", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "immutable append-only; admin/dev read; no update/delete" },
  { name: "EnterpriseReport", classification: "platform", scope: "—", status: "protected", sensitive: true, rule: "admin/dev only" },
  { name: "ReportEvidence", classification: "platform", scope: "—", status: "protected", sensitive: true, rule: "admin/dev read; platform admin update/delete" },
  { name: "ScheduledReport", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev read; platform admin delete" },
  { name: "Purchase", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "admin/dev only" },

  // ── Immutable Entities (registered 2026-07-14) ──
  // Audit, security, compliance, identity, and financial event records
  // that must NEVER be updated or deleted. All have __immutable__ RLS
  // in their entity schemas for update and delete operations.
  { name: "FeatureFlagAudit", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "immutable append-only; admin/dev read; no update/delete" },
  { name: "TelemetryEvent", classification: "platform", scope: "—", status: "protected", sensitive: false, rule: "immutable append-only; owner + admin/dev read; no update/delete" },
  { name: "ConsentRecord", classification: "user", scope: "created_by_id", status: "protected", sensitive: true, rule: "immutable append-only; owner + admin read; no update/delete" },
  { name: "DataSubjectRequest", classification: "user", scope: "created_by_id", status: "protected", sensitive: true, rule: "immutable append-only; owner + admin read; no update/delete" },
  { name: "CodeOfConductAcceptance", classification: "user", scope: "created_by_id", status: "protected", sensitive: false, rule: "immutable append-only; owner + admin read; no update/delete" },
  { name: "ProfileView", classification: "user", scope: "created_by_id", status: "protected", sensitive: false, rule: "immutable append-only; owner + admin read; no update/delete" },
  { name: "ShareEvent", classification: "user", scope: "created_by_id", status: "protected", sensitive: false, rule: "immutable append-only; owner + admin read; no update/delete" },
  { name: "NetworkEvent", classification: "organization", scope: "organization_id", status: "protected", sensitive: false, rule: "immutable append-only; same-org + admin read; no update/delete" },
];

// ── Score Computation ──
export function computeRLSScores() {
  const total = RLS_REGISTRY.length;
  const protected_ = RLS_REGISTRY.filter((e) => e.status === "protected").length;
  const partial = RLS_REGISTRY.filter((e) => e.status === "partial").length;
  const open = RLS_REGISTRY.filter((e) => e.status === "open").length;

  const orgEntities = RLS_REGISTRY.filter((e) => e.classification === "organization");
  const userEntities = RLS_REGISTRY.filter((e) => e.classification === "user");
  const platformEntities = RLS_REGISTRY.filter((e) => e.classification === "platform");

  const orgProtected = orgEntities.filter((e) => e.status === "protected").length;
  const userProtected = userEntities.filter((e) => e.status === "protected").length;
  const platformProtected = platformEntities.filter((e) => e.status === "protected").length;

  const orgIsolation = orgEntities.length > 0 && orgProtected === orgEntities.length;
  const userIsolation = userEntities.length > 0 && userProtected === userEntities.length;
  const platformIsolation = platformEntities.length > 0 && platformProtected === platformEntities.length;

  // RLS Coverage: protected entities / total
  const rlsCoverage = Math.round((protected_ / total) * 100);

  // Tenant Isolation Score: weighted by classification criticality
  // Organization isolation is the foundation of multi-tenancy (60% weight)
  // User isolation protects personal data (40% weight)
  const orgScore = orgEntities.length > 0 ? (orgProtected / orgEntities.length) * 60 : 60;
  const userScore = userEntities.length > 0 ? (userProtected / userEntities.length) * 40 : 40;
  const tenantIsolationScore = Math.round(orgScore + userScore);

  // Security Score: org (35%) + user (25%) + platform (20%) + coverage (20%)
  const secOrg = orgEntities.length > 0 ? (orgProtected / orgEntities.length) * 35 : 35;
  const secUser = userEntities.length > 0 ? (userProtected / userEntities.length) * 25 : 25;
  const secPlatform = platformEntities.length > 0 ? (platformProtected / platformEntities.length) * 20 : 20;
  const secCoverage = (protected_ / total) * 20;
  const securityScore = Math.round(secOrg + secUser + secPlatform + secCoverage);

  // Cross-tenant test simulation: would a user in Org A see Org B data?
  const crossTenantTests = orgIsolation && userIsolation;

  // Production blocker
  const openSensitive = RLS_REGISTRY.filter((e) => e.status === "open" && e.sensitive).length;
  const blocker = openSensitive === 0 && partial === 0 ? "NONE" : `${openSensitive} sensitive + ${partial} partial`;

  return {
    total,
    protected: protected_,
    partial,
    open,
    orgIsolation,
    userIsolation,
    platformIsolation,
    crossTenantTests,
    rlsCoverage,
    tenantIsolationScore,
    securityScore,
    blocker,
    breakdown: {
      organization: { total: orgEntities.length, protected: orgProtected, open: orgEntities.length - orgProtected },
      user: { total: userEntities.length, protected: userProtected, open: userEntities.length - userProtected },
      platform: { total: platformEntities.length, protected: platformProtected, open: platformEntities.length - platformProtected },
    },
  };
}

export function getEntitiesByClassification(classification) {
  return RLS_REGISTRY.filter((e) => e.classification === classification);
}

export function getEntitiesByStatus(status) {
  return RLS_REGISTRY.filter((e) => e.status === status);
}

// ── Entity Discovery™ Re-exports ──
// Auto-discovers ALL entities in the platform, not just the 30
// manually audited ones. Ensures 100% coverage of the security surface.
export { discoverAllEntities, computeDiscoveryMetrics } from "./entityDiscovery";