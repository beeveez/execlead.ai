/**
 * EXECLEAD.AI — Entity Governance Policy™
 * ============================================================
 * Permissions are automatically enforced by entity classification
 * instead of being configured individually.
 *
 * Three Governance Tiers:
 *
 * 1. Business Records
 *    ✓ Create  ✓ Read  ✓ Update  ✓ Archive
 *    (Delete only if explicitly approved by business rules)
 *
 * 2. Configuration Records
 *    ✓ Create  ✓ Read  ✓ Update
 *    Every update automatically creates:
 *      • Platform History event
 *      • Audit Ledger event
 *      • Recovery Point
 *
 * 3. Immutable Records (Audit / Security / Compliance / Identity / Financial)
 *    ✓ Create  ✓ Read  ✓ Export  ✓ Archive (subject to retention)
 *    ✗ Update  ✗ Delete
 *
 * Violations:
 *   Any immutable entity that grants Delete or unrestricted Update
 *   permissions is reported to the Architecture Governance Board™.
 */
import { RLS_REGISTRY, getEntitySecurityClass } from "./rlsRegistry";
import { discoverAllEntities } from "./entityDiscovery";

// ── Governance Tiers ──

export const GOVERNANCE_TIERS = {
  business: {
    id: "business",
    label: "Business Record",
    description: "Full CRUD with archive support. Delete only if explicitly approved by business rules.",
    permissions: { create: true, read: true, update: true, archive: true, delete: "conditional" },
    color: "#3b82f6",
    icon: "Database",
  },
  configuration: {
    id: "configuration",
    label: "Configuration Record",
    description: "Create, Read, Update. Every update creates a Platform History event, Audit Ledger event, and Recovery Point.",
    permissions: { create: true, read: true, update: true, archive: false, delete: false },
    color: "#a855f7",
    icon: "Settings",
  },
  immutable: {
    id: "immutable",
    label: "Immutable Record",
    description: "Create, Read, Export, Archive (subject to retention). Update and Delete are PROHIBITED.",
    permissions: { create: true, read: true, update: false, archive: true, delete: false, export: true },
    color: "#ef4444",
    icon: "Lock",
  },
};

// ── Explicit Immutable Entity Set ──
// Audit, Security, Compliance, Identity, and Financial records
// that must NEVER be updated or deleted.
const EXPLICIT_IMMUTABLE = new Set([
  // Audit Logs
  "LegacyAuditLog",
  "ReputationAuditLog",
  "FoundingMemberAuditLog",
  "CompanyAuditLog",
  "SubscriptionAuditLog",
  "FeatureFlagAudit",
  // Platform History & Security Events
  "PlatformStateEvent",
  "SelfHealingEvent",
  "TelemetryEvent",
  "SecurityEvent",
  "SecurityIncident",
  "GuardianActivity",
  // Compliance
  "ConsentRecord",
  "DataSubjectRequest",
  "GovernanceCertificate",
  "CodeOfConductAcceptance",
  // Identity
  "IdentitySyncEvent",
  "IdentityVersion",
  "VerificationLog",
  // Financial Transaction Records
  "WalletTransaction",
  "BillingEvent",
  "Invoice",
  "ReferralTransaction",
  "EmailEvent",
  "ProfileView",
  "ShareEvent",
  // V2 Immutable
  "PortfolioVersion",
  "ExecutiveCredential",
]);

// ── Name-pattern heuristics for immutable classification ──
const IMMUTABLE_PATTERNS = [
  /audit/i,
  /auditlog$/i,
  /event$/i,
  /log$/i,
  /telemetry/i,
  /consent/i,
  /governancecertificate/i,
  /guardianactivity/i,
  /datasubject/i,
  /codeofconduct/i,
  /identityversion/i,
  /identitysync/i,
  /verificationlog/i,
];

// ── Configuration entity patterns ──
const CONFIGURATION_PATTERNS = [
  /config$/i,
  /settings$/i,
  /pricingplan/i,
  /membershipprogram/i,
  /cpq/i,
  /coupon/i,
  /referralsettings/i,
  /referralreward/i,
  /featureflag$/i,
  /feature$/i,
  /ssoconfig/i,
  /paymentsettings/i,
  /emailsettings/i,
  /pricing/i,
];

/**
 * Classify an entity into a governance tier.
 * @param {string} entityName
 * @returns {"business" | "configuration" | "immutable"}
 */
export function classifyEntity(entityName) {
  if (EXPLICIT_IMMUTABLE.has(entityName)) return "immutable";

  // Check security class from RLS registry — immutable_audit = immutable
  const secClass = getEntitySecurityClass(entityName);
  if (secClass === "immutable_audit") return "immutable";

  // Pattern-based detection
  if (IMMUTABLE_PATTERNS.some((p) => p.test(entityName))) return "immutable";
  if (CONFIGURATION_PATTERNS.some((p) => p.test(entityName))) return "configuration";

  return "business";
}

/**
 * Get the full governance policy for an entity.
 */
export function getGovernancePolicy(entityName) {
  const tierId = classifyEntity(entityName);
  const tier = GOVERNANCE_TIERS[tierId];
  return {
    entityName,
    tier: tierId,
    tierLabel: tier.label,
    tierDescription: tier.description,
    permissions: tier.permissions,
    color: tier.color,
    immutable: tierId === "immutable",
  };
}

/**
 * Check if an entity is classified as immutable.
 */
export function isImmutableEntity(entityName) {
  return classifyEntity(entityName) === "immutable";
}

/**
 * Detect governance violations across all known entities.
 *
 * A violation occurs when:
 *   1. An immutable entity is NOT in the RLS_REGISTRY (unregistered)
 *   2. An immutable entity's RLS rule mentions "delete" being allowed
 *   3. An immutable entity's RLS rule does NOT contain "immutable"
 *
 * @returns {Array} List of violation objects
 */
export function detectGovernanceViolations() {
  const violations = [];
  const allEntities = discoverAllEntities();
  const rlsMap = new Map(RLS_REGISTRY.map((e) => [e.name, e]));

  for (const entity of allEntities) {
    const tier = classifyEntity(entity.name);
    if (tier !== "immutable") continue;

    const rls = rlsMap.get(entity.name);
    const rule = (rls?.rule || "").toLowerCase();

    // Violation: immutable entity not in RLS registry
    if (!rls) {
      violations.push({
        entityName: entity.name,
        tier: "immutable",
        severity: "critical",
        type: "unregistered_immutable",
        title: `${entity.name} is classified as Immutable but has no RLS policy`,
        description: `This entity matches the immutable classification pattern but is not registered in the RLS Registry™. Its update/delete permissions are unverified and may allow mutation.`,
        remediation: "Register the entity in the RLS Registry™ with update/delete set to __immutable__.",
      });
      continue;
    }

    // Violation: rule mentions delete being allowed
    if (rule.includes("delete") && !rule.includes("no update/delete") && !rule.includes("delete never") && !rule.includes("delete: __immutable__")) {
      violations.push({
        entityName: entity.name,
        tier: "immutable",
        severity: "critical",
        type: "delete_allowed",
        title: `${entity.name} allows Delete but is classified as Immutable`,
        description: `RLS rule: "${rls.rule}". Immutable records must never allow deletion.`,
        remediation: "Set the delete RLS policy to __immutable__ for this entity.",
      });
    }

    // Violation: rule does not contain "immutable"
    if (!rule.includes("immutable") && !rule.includes("append-only") && !rule.includes("no update/delete")) {
      violations.push({
        entityName: entity.name,
        tier: "immutable",
        severity: "high",
        type: "update_not_restricted",
        title: `${entity.name} is Immutable but RLS does not enforce immutability`,
        description: `RLS rule: "${rls.rule}". The rule does not mention immutability or append-only enforcement.`,
        remediation: "Update the RLS policy to set update and delete to __immutable__.",
      });
    }
  }

  return violations;
}

/**
 * Compute governance policy metrics for dashboards.
 */
export function computeGovernanceMetrics() {
  const allEntities = discoverAllEntities();
  const violations = detectGovernanceViolations();

  const byTier = {
    business: allEntities.filter((e) => classifyEntity(e.name) === "business").length,
    configuration: allEntities.filter((e) => classifyEntity(e.name) === "configuration").length,
    immutable: allEntities.filter((e) => classifyEntity(e.name) === "immutable").length,
  };

  const immutableEntities = allEntities.filter((e) => isImmutableEntity(e.name));
  const immutableEnforced = immutableEntities.filter((e) => {
    const rls = RLS_REGISTRY.find((r) => r.name === e.name);
    const rule = (rls?.rule || "").toLowerCase();
    return rule.includes("immutable") || rule.includes("append-only") || rule.includes("no update/delete");
  }).length;

  const enforcementRate = immutableEntities.length > 0
    ? Math.round((immutableEnforced / immutableEntities.length) * 100)
    : 100;

  return {
    totalEntities: allEntities.length,
    byTier,
    immutableTotal: immutableEntities.length,
    immutableEnforced,
    immutableUnenforced: immutableEntities.length - immutableEnforced,
    enforcementRate,
    violations,
    violationCount: violations.length,
    criticalViolations: violations.filter((v) => v.severity === "critical").length,
    highViolations: violations.filter((v) => v.severity === "high").length,
    passed: violations.length === 0,
  };
}