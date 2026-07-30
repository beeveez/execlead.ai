/**
 * EXECLEAD.AI — RLS Validation Engine™
 * ============================================================
 * Enterprise Row-Level Security Standard · Version 1.0 · P0
 *
 * Validates that every registered entity enforces the platform
 * RLS standard based on the 4-class model:
 *   • Public            — Anyone read; Admin CUD
 *   • User-Scoped       — Owner read; Owner/System CUD
 *   • Organization-Scoped — Same-org read; Org Admin/System CUD
 *   • Platform-Scoped   — Platform Admin/Developer/Service CUD
 *
 * Entity Classification (Enterprise RLS Standard):
 *   Type A — User-Owned         (profile, resume, notes)
 *   Type B — Organization-Owned (knowledge packs, reports, CRM)
 *   Type C — System-Owned       (manifest, registry, findings, Guardian™)
 *
 * Guardian™ validates per entity:
 *   1. Missing CRUD rules
 *   2. Open Read permissions
 *   3. Overly permissive Update rules
 *   4. Unrestricted Delete access
 *   5. Missing ownership validation
 *   6. Missing administrator policy
 *
 * Security Principles enforced:
 *   Least Privilege · Zero Trust · Default Deny ·
 *   Explicit Authorization · User Ownership ·
 *   Organization Isolation · Auditability
 */
import { RLS_REGISTRY, SECURITY_CLASSIFICATIONS, ENTITY_SECURITY_CLASSIFICATIONS, getEntitySecurityClass } from "./rlsRegistry";

const PLATFORM_ADMIN_ROLES = ["super_admin", "platform_admin"];
const IMMUTABLE = "__immutable__";
const CRUD_OPS = ["create", "read", "update", "delete"];

// ── Entity Type Classification (Enterprise RLS Standard) ──
const ENTITY_TYPE_MAP = {
  user: { type: "A", label: "User-Owned", description: "Owner only" },
  organization: { type: "B", label: "Organization-Owned", description: "Visible only within the organization" },
  platform: { type: "C", label: "System-Owned", description: "Only platform services or administrators may modify" },
  public: { type: "A", label: "User-Owned", description: "Owner only (public read)" },
};

/**
 * Generate the recommended RLS policy for an entity based on its classification.
 */
export function generateRecommendedPolicy(entityName, classification, scopeField) {
  const adminOr = [
    { "user_condition": { "role": "super_admin" } },
    { "user_condition": { "role": "platform_admin" } },
    { "user_condition": { "role": "admin" } },
  ];
  switch (classification) {
    case "public":
      return {
        create: { "$or": adminOr },
        read: true,
        update: { "$or": adminOr },
        delete: { "$or": [{ "user_condition": { "role": "super_admin" } }, { "user_condition": { "role": "platform_admin" } }] },
      };
    case "user":
      return {
        create: { "$or": [{ [`data.${scopeField || "user_id"}`]: "{{user.id}}" }, ...adminOr] },
        read: { "$or": [{ [`data.${scopeField || "user_id"}`]: "{{user.id}}" }, ...adminOr] },
        update: { "$or": [{ [`data.${scopeField || "user_id"}`]: "{{user.id}}" }, ...adminOr] },
        delete: { "$or": [{ "user_condition": { "role": "super_admin" } }, { "user_condition": { "role": "platform_admin" } }] },
      };
    case "organization":
      return {
        create: { "$or": [{ [`data.${scopeField || "organization_id"}`]: "{{user.data.organization_id}}" }, ...adminOr] },
        read: { "$or": [{ [`data.${scopeField || "organization_id"}`]: "{{user.data.organization_id}}" }, ...adminOr] },
        update: { "$or": [{ [`data.${scopeField || "organization_id"}`]: "{{user.data.organization_id}}" }, ...adminOr] },
        delete: { "$or": [{ "user_condition": { "role": "super_admin" } }, { "user_condition": { "role": "platform_admin" } }] },
      };
    case "platform":
      return {
        create: { "$or": adminOr },
        read: { "$or": adminOr },
        update: { "$or": [{ "user_condition": { "role": "super_admin" } }, { "user_condition": { "role": "platform_admin" } }] },
        delete: { "$or": [{ "user_condition": { "role": "super_admin" } }, { "user_condition": { "role": "platform_admin" } }] },
      };
    default:
      return { create: {}, read: {}, update: {}, delete: {} };
  }
}

/**
 * Derive per-operation CRUD policy status for an entity from its registry entry.
 * Status values: 'explicit' (rule present & restricted), 'restricted' (partial),
 *               'open' (no restriction), 'missing' (no rule at all).
 *
 * Registry status maps:
 *   protected → all 4 ops explicit
 *   partial   → read explicit, create/update/delete open
 *   open      → all 4 ops open
 */
function deriveCrudStatus(entry) {
  const { status, classification, sensitive } = entry;
  if (status === "protected") {
    return {
      create: "explicit",
      read: classification === "public" ? "public" : "explicit",
      update: "explicit",
      delete: "explicit",
    };
  }
  if (status === "partial") {
    return { create: "open", read: "explicit", update: "open", delete: "open" };
  }
  // open
  return { create: "open", read: "open", update: "open", delete: "open" };
}

/**
 * Run the 6 Guardian™ validation checks on a single entity.
 */
function runGuardianChecks(entry, crudStatus) {
  const checks = [];
  const { classification, scope, sensitive, status } = entry;
  const isPublic = classification === "public";

  // 1. Missing CRUD rules
  const missingOps = CRUD_OPS.filter((op) => crudStatus[op] === "missing");
  if (missingOps.length > 0) {
    checks.push({
      id: "missing_crud",
      severity: "critical",
      message: `Missing CRUD rules for: ${missingOps.join(", ")}.`,
      remediation: "Define explicit Create, Read, Update, Delete permissions.",
    });
  }

  // 2. Open Read permissions (non-public entities with open read)
  if (crudStatus.read === "open" && !isPublic) {
    checks.push({
      id: "open_read",
      severity: sensitive ? "critical" : "high",
      message: `Read permission is open — any authenticated user can read this ${classification} entity.`,
      remediation: `Scope read by ${classification === "user" ? "owner (user_id/created_by_id)" : classification === "organization" ? "organization_id" : "admin role"}.`,
    });
  }

  // 3. Overly permissive Update rules
  if (crudStatus.update === "open") {
    checks.push({
      id: "permissive_update",
      severity: sensitive ? "critical" : "high",
      message: `Update permission is open — any authenticated user can modify records.`,
      remediation: "Restrict update to owner or administrator role only.",
    });
  }

  // 4. Unrestricted Delete access
  if (crudStatus.delete === "open") {
    checks.push({
      id: "unrestricted_delete",
      severity: "critical",
      message: `Delete permission is unrestricted — any authenticated user can delete records.`,
      remediation: "Restrict delete to Platform Administrators or Entity Administrators only.",
    });
  }

  // 5. Missing ownership validation (user/org entity without owner/org scope)
  if (classification === "user" && (!scope || scope === "—")) {
    checks.push({
      id: "missing_ownership",
      severity: "high",
      message: `User-owned entity has no owner scope field (user_id / created_by_id).`,
      remediation: "Add user_id or rely on created_by_id and scope read/update by owner.",
    });
  }
  if (classification === "organization" && (!scope || scope === "—")) {
    checks.push({
      id: "missing_org_scope",
      severity: "high",
      message: `Organization-owned entity has no organization_id scope field.`,
      remediation: "Add organization_id and scope read/update by same-org membership.",
    });
  }

  // 6. Missing administrator policy (no admin role condition for system-owned entities)
  if (classification === "platform" && status === "open") {
    checks.push({
      id: "missing_admin_policy",
      severity: "critical",
      message: `System-owned entity has no administrator policy — unrestricted access.`,
      remediation: "Restrict all CRUD to platform admin / developer roles.",
    });
  }

  return checks;
}

/**
 * Compute audit-protection advisory for an entity.
 * Audit fields (created_by_id, created_date, audit logs) must remain immutable.
 */
function computeAuditProtection(entry) {
  // Immutable audit entities enforce this via __immutable__ update/delete rules.
  if (entry.rule && entry.rule.toLowerCase().includes("immutable")) {
    return { protected: true, note: "Audit fields protected via immutable append-only RLS." };
  }
  if (entry.status === "protected") {
    return { protected: true, note: "Update rule restricts mutations to owner/admin — audit fields preserved." };
  }
  return { protected: false, note: "Open update permission risks audit field tampering (created_by_id, created_date)." };
}

/**
 * Validate a single entity and return its full RLS validation record.
 */
function validateEntity(entry) {
  const crudStatus = deriveCrudStatus(entry);
  const guardianChecks = runGuardianChecks(entry, crudStatus);
  const auditProtection = computeAuditProtection(entry);
  const securityClass = getEntitySecurityClass(entry.name);
  const typeInfo = ENTITY_TYPE_MAP[entry.classification] || ENTITY_TYPE_MAP.platform;

  // Aggregate findings from Guardian checks + audit
  const findings = [...guardianChecks];
  if (!auditProtection.protected) {
    findings.push({
      id: "audit_protection",
      severity: "medium",
      message: auditProtection.note,
      remediation: "Enforce immutable update rules for audit fields (created_by_id, created_date).",
    });
  }

  // Per-operation warnings
  const warnings = [];
  if (entry.sensitive && entry.status !== "protected") warnings.push("Sensitive entity without full protection");
  if (crudStatus.read === "open" && entry.classification !== "public") warnings.push("Open read");
  if (crudStatus.update === "open") warnings.push("Open update");
  if (crudStatus.delete === "open") warnings.push("Open delete");

  const missingRules = CRUD_OPS.filter((op) => crudStatus[op] === "missing" || crudStatus[op] === "open");

  // Risk level
  const hasCritical = findings.some((f) => f.severity === "critical");
  const hasHigh = findings.some((f) => f.severity === "high");
  const hasMedium = findings.some((f) => f.severity === "medium");
  const riskLevel = hasCritical ? "critical" : hasHigh ? "high" : hasMedium ? "medium" : "low";

  // Policy status
  const policyStatus = findings.length === 0 ? "compliant" : hasCritical ? "non_compliant" : "warning";

  return {
    name: entry.name,
    entityType: typeInfo.type,
    entityTypeLabel: typeInfo.label,
    entityTypeDescription: typeInfo.description,
    classification: entry.classification,
    classificationLabel: SECURITY_CLASSIFICATIONS[entry.classification]?.label || "Unknown",
    securityClass,
    securityClassLabel: ENTITY_SECURITY_CLASSIFICATIONS[securityClass]?.label || "Internal",
    scope: entry.scope,
    status: entry.status,
    sensitive: entry.sensitive,
    rule: entry.rule,
    crud: crudStatus,
    crudSummary: {
      create: crudStatus.create,
      read: crudStatus.read,
      update: crudStatus.update,
      delete: crudStatus.delete,
    },
    auditProtection,
    guardianChecks,
    findings,
    warnings,
    missingRules,
    riskLevel,
    policyStatus,
    recommendedPolicy: generateRecommendedPolicy(entry.name, entry.classification, entry.scope),
    lastValidated: new Date().toISOString(),
  };
}

/**
 * Run the full RLS Validation Engine™ across every registered entity.
 */
export function runRLSValidation() {
  const entityResults = RLS_REGISTRY.map((entry) => validateEntity(entry));

  const allFindings = entityResults.flatMap((e) => e.findings.map((f) => ({ ...f, entity: e.name })));

  const bySeverity = {
    critical: allFindings.filter((f) => f.severity === "critical").length,
    high: allFindings.filter((f) => f.severity === "high").length,
    medium: allFindings.filter((f) => f.severity === "medium").length,
    low: allFindings.filter((f) => f.severity === "low").length,
  };

  const total = RLS_REGISTRY.length;
  const compliant = entityResults.filter((e) => e.policyStatus === "compliant").length;
  const protectedCount = RLS_REGISTRY.filter((e) => e.status === "protected").length;
  const coverage = total > 0 ? Math.round((protectedCount / total) * 100) : 0;
  const passRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

  const certified = bySeverity.critical === 0 && bySeverity.high === 0 && coverage === 100;
  const riskLevel = bySeverity.critical > 0 ? "critical"
    : bySeverity.high > 0 ? "high"
    : bySeverity.medium > 0 ? "medium"
    : "low";

  // Entity type distribution
  const typeDistribution = {
    A: entityResults.filter((e) => e.entityType === "A").length,
    B: entityResults.filter((e) => e.entityType === "B").length,
    C: entityResults.filter((e) => e.entityType === "C").length,
  };

  return {
    computedAt: new Date().toISOString(),
    standardVersion: "1.0",
    totalEntities: total,
    protectedEntities: protectedCount,
    compliantEntities: compliant,
    coverage,
    passRate,
    certified,
    riskLevel,
    findingsBySeverity: bySeverity,
    totalFindings: allFindings.length,
    typeDistribution,
    entities: entityResults,
    findings: allFindings,
    principles: ["Least Privilege", "Zero Trust", "Default Deny", "Explicit Authorization", "User Ownership", "Organization Isolation", "Auditability"],
  };
}

/**
 * Get the RLS validation summary for the Guardian™ engine + Security Health Score™ integration.
 * Any entity with incomplete CRUD protection reduces the Security Health Score™.
 */
export function getRLSValidationSummary() {
  const result = runRLSValidation();
  return {
    coverage: result.coverage,
    certified: result.certified,
    riskLevel: result.riskLevel,
    criticalFindings: result.findingsBySeverity.critical,
    highFindings: result.findingsBySeverity.high,
    mediumFindings: result.findingsBySeverity.medium,
    totalFindings: result.totalFindings,
    passRate: result.passRate,
    // Security Health Score™ impact: each incomplete entity reduces the score.
    // Score penalty = (non-compliant entities / total) * 100, capped at 100.
    healthScorePenalty: result.totalEntities > 0
      ? Math.min(100, Math.round(((result.totalEntities - result.compliantEntities) / result.totalEntities) * 100))
      : 0,
    healthScore: result.passRate,
  };
}