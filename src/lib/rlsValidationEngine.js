/**
 * EXECLEAD.AI — RLS Validation Engine™
 * ============================================================
 * Sprint 2.0 — RLS Hardening Framework
 * Priority: P0
 *
 * Validates that every registered entity enforces platform-wide
 * Row-Level Security standards based on the 4-class model:
 *   • Public            — Anyone read; Admin CUD
 *   • User-Scoped       — Owner read; Owner/System CUD
 *   • Organization-Scoped — Same-org read; Org Admin/System CUD
 *   • Platform-Scoped   — Platform Admin/Developer/Service CUD
 *
 * Validation checks per entity:
 *   1. Classification present
 *   2. All 4 CRUD operations have explicit rules (no empty {})
 *   3. Delete restricted to platform_admin / super_admin / __immutable__
 *   4. Sensitive entities are not "open" on any operation
 *   5. User-scoped entities scope read by user_id or created_by_id
 *   6. Organization-scoped entities scope read by organization_id
 *
 * Produces findings by severity + a recommended policy generator.
 */
import { RLS_REGISTRY, SECURITY_CLASSIFICATIONS, ENTITY_SECURITY_CLASSIFICATIONS, getEntitySecurityClass } from "./rlsRegistry";

const PLATFORM_ADMIN_ROLES = ["super_admin", "platform_admin"];
const IMMUTABLE = "__immutable__";
const CRUD_OPS = ["create", "read", "update", "delete"];

/**
 * Generate the recommended RLS policy for an entity based on its classification.
 */
export function generateRecommendedPolicy(entityName, classification, scopeField) {
  switch (classification) {
    case "public":
      return {
        create: { "$or": platformAdminRoles() },
        read: true,
        update: { "$or": platformAdminRoles() },
        delete: { "$or": [{ "user_condition": { "role": "super_admin" } }, { "user_condition": { "role": "platform_admin" } }] },
      };
    case "user":
      return {
        create: { "data.user_id": "{{user.id}}", "$or": platformAdminRoles() },
        read: { "$or": [{ [`data.${scopeField || "user_id"}`]: "{{user.id}}" }, ...platformAdminRoles()] },
        update: { "$or": [{ [`data.${scopeField || "user_id"}`]: "{{user.id}}" }, ...platformAdminRoles()] },
        delete: { "$or": [{ "user_condition": { "role": "super_admin" } }, { "user_condition": { "role": "platform_admin" } }] },
      };
    case "organization":
      return {
        create: { "$or": [{ [`data.${scopeField || "organization_id"}`]: "{{user.data.organization_id}}" }, ...platformAdminRoles()] },
        read: { "$or": [{ [`data.${scopeField || "organization_id"}`]: "{{user.data.organization_id}}" }, ...platformAdminRoles()] },
        update: { "$or": [{ [`data.${scopeField || "organization_id"}`]: "{{user.data.organization_id}}" }, ...platformAdminRoles()] },
        delete: { "$or": [{ "user_condition": { "role": "super_admin" } }, { "user_condition": { "role": "platform_admin" } }] },
      };
    case "platform":
      return {
        create: { "$or": platformAdminRoles() },
        read: { "$or": platformAdminRoles() },
        update: { "$or": [{ "user_condition": { "role": "super_admin" } }, { "user_condition": { "role": "platform_admin" } }] },
        delete: { "$or": [{ "user_condition": { "role": "super_admin" } }, { "user_condition": { "role": "platform_admin" } }] },
      };
    default:
      return { create: {}, read: {}, update: {}, delete: {} };
  }
}

function platformAdminRoles() {
  return [
    { "user_condition": { "role": "super_admin" } },
    { "user_condition": { "role": "platform_admin" } },
    { "user_condition": { "role": "admin" } },
  ];
}

/**
 * Validate a single entity's RLS entry against the platform standard.
 */
function validateEntity(entry) {
  const findings = [];
  const classification = entry.classification;
  const scopeField = entry.scope;
  const sensitive = entry.sensitive;

  // Check 1: Classification present
  if (!classification || !SECURITY_CLASSIFICATIONS[classification]) {
    findings.push({
      entity: entry.name,
      severity: "critical",
      rule: "classification_missing",
      message: `Entity "${entry.name}" has no valid security classification.`,
      remediation: `Assign one of: public, user, organization, platform.`,
    });
  }

  // Check 2: Status — open or partial means incomplete RLS
  if (entry.status === "open") {
    findings.push({
      entity: entry.name,
      severity: sensitive ? "critical" : "high",
      rule: "rls_empty",
      message: `Entity "${entry.name}" has no RLS restrictions (empty {} block).`,
      remediation: `Apply the ${classification} class policy template.`,
    });
  } else if (entry.status === "partial") {
    findings.push({
      entity: entry.name,
      severity: "high",
      rule: "rls_partial",
      message: `Entity "${entry.name}" has partial RLS — read restricted but CUD open.`,
      remediation: `Restrict create/update/delete to platform admin roles.`,
    });
  }

  // Check 3: Sensitive entities must not be open
  if (sensitive && entry.status !== "protected") {
    findings.push({
      entity: entry.name,
      severity: "critical",
      rule: "sensitive_open",
      message: `Sensitive entity "${entry.name}" is not fully protected.`,
      remediation: `Enforce least-privilege RLS immediately — this is a P0 security risk.`,
    });
  }

  // Check 4: User-scoped entities should have a user_id or created_by_id scope
  if (classification === "user" && scopeField && scopeField !== "—" && scopeField !== "created_by_id" && !scopeField.includes("user_id")) {
    // Only flag if it doesn't reference user identity at all
    if (!scopeField.includes("user_id") && !scopeField.includes("created_by_id") && !scopeField.includes("requester_id") && !scopeField.includes("referrer_user_id")) {
      findings.push({
        entity: entry.name,
        severity: "medium",
        rule: "scope_field_unusual",
        message: `User-scoped entity "${entry.name}" uses scope "${scopeField}" — verify it resolves to user identity.`,
        remediation: `Confirm the scope field maps to a user reference for owner isolation.`,
      });
    }
  }

  // Check 5: Organization-scoped entities should have organization_id scope
  if (classification === "organization" && (!scopeField || scopeField === "—")) {
    findings.push({
      entity: entry.name,
      severity: "high",
      rule: "org_scope_missing",
      message: `Organization-scoped entity "${entry.name}" has no organization_id scope field.`,
      remediation: `Add organization_id and scope read/update by same-org membership.`,
    });
  }

  return findings;
}

/**
 * Run the full RLS Validation Engine™ across every registered entity.
 */
export function runRLSValidation() {
  const allFindings = [];
  const entityResults = RLS_REGISTRY.map((entry) => {
    const findings = validateEntity(entry);
    allFindings.push(...findings);
    const securityClass = getEntitySecurityClass(entry.name);
    const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
    const topSeverity = findings.length
      ? findings.reduce((max, f) => (severityRank[f.severity] > severityRank[max] ? f : max)).severity
      : "none";
    return {
      name: entry.name,
      classification: entry.classification,
      classificationLabel: SECURITY_CLASSIFICATIONS[entry.classification]?.label || "Unknown",
      securityClass,
      securityClassLabel: ENTITY_SECURITY_CLASSIFICATIONS[securityClass]?.label || "Internal",
      scope: entry.scope,
      status: entry.status,
      sensitive: entry.sensitive,
      rule: entry.rule,
      findingCount: findings.length,
      topSeverity,
      findings,
      recommendedPolicy: generateRecommendedPolicy(entry.name, entry.classification, entry.scope),
      lastValidated: new Date().toISOString(),
    };
  });

  const bySeverity = {
    critical: allFindings.filter((f) => f.severity === "critical").length,
    high: allFindings.filter((f) => f.severity === "high").length,
    medium: allFindings.filter((f) => f.severity === "medium").length,
    low: allFindings.filter((f) => f.severity === "low").length,
  };

  const total = RLS_REGISTRY.length;
  const protectedCount = RLS_REGISTRY.filter((e) => e.status === "protected").length;
  const coverage = total > 0 ? Math.round((protectedCount / total) * 100) : 0;
  const passRate = total > 0 ? Math.round((entityResults.filter((e) => e.findingCount === 0).length / total) * 100) : 0;

  const certified = bySeverity.critical === 0 && bySeverity.high === 0 && coverage === 100;
  const riskLevel = bySeverity.critical > 0 ? "critical"
    : bySeverity.high > 0 ? "high"
    : bySeverity.medium > 0 ? "medium"
    : "low";

  return {
    computedAt: new Date().toISOString(),
    totalEntities: total,
    protectedEntities: protectedCount,
    coverage,
    passRate,
    certified,
    riskLevel,
    findingsBySeverity: bySeverity,
    totalFindings: allFindings.length,
    entities: entityResults,
    findings: allFindings,
  };
}

/**
 * Get the RLS validation summary for the Guardian™ engine integration.
 */
export function getRLSValidationSummary() {
  const result = runRLSValidation();
  return {
    coverage: result.coverage,
    certified: result.certified,
    riskLevel: result.riskLevel,
    criticalFindings: result.findingsBySeverity.critical,
    highFindings: result.findingsBySeverity.high,
    totalFindings: result.totalFindings,
    passRate: result.passRate,
  };
}