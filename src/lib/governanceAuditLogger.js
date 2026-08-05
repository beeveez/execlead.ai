import { base44 } from "@/api/base44Client";

/**
 * Governance Audit Logger™ — Platform Governance Center™
 * --------------------------------------------------------
 * Shared security helper for internal governance entities
 * (GovernanceCertificate, PlatformStateEvent).
 *
 * Workspace Isolation™: these records are INTERNAL PLATFORM
 * GOVERNANCE data. Only authenticated users holding a trusted
 * administrative role may create them. Public, member, executive
 * (role "user"), and anonymous sessions are never permitted to
 * create — callers must gate persistence with canCreateGovernanceRecord().
 *
 * Every permitted create:
 *   1. Requires an authenticated user (canCreateGovernanceRecord checks user.id).
 *   2. Records createdBy (built-in created_by_id) + createdAt (built-in created_date).
 *   3. Stamps user_role + request_id on the record for traceability.
 *   4. Emits an immutable GovernanceAuditLog entry.
 */

// Trusted administrative roles that may create governance records.
// Mirrors the create RLS on GovernanceCertificate / PlatformStateEvent /
// GovernanceAuditLog. Public/member/executive/anonymous are excluded by design.
export const GOVERNANCE_CREATE_ROLES = [
  "founder_root_admin",
  "super_admin",
  "platform_admin",
  "admin",
  "developer",
];

/**
 * Returns true only when the current user is authenticated AND holds a
 * role permitted to create internal governance records.
 */
export function canCreateGovernanceRecord(user) {
  return Boolean(user?.id) && GOVERNANCE_CREATE_ROLES.includes(user?.role);
}

/**
 * Generate a correlation request ID for a governance create operation.
 */
export function newGovernanceRequestId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {}
  return `gov-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Emit an immutable GovernanceAuditLog entry for a governance create.
 * Fire-and-forget; failures are swallowed so they never break the caller.
 *
 * @param {Object} opts
 * @param {string} opts.entity     - Entity name (e.g. "GovernanceCertificate")
 * @param {Object} opts.record     - The record payload that was created
 * @param {Object} opts.user       - The authenticated user object
 * @param {string} opts.requestId  - Correlation ID stamped on the record
 * @param {string} [opts.workspace]- Originating workspace (default "developer")
 */
export function logGovernanceCreate({ entity, record, user, requestId, workspace }) {
  if (!user?.id) return;
  try {
    base44.entities.GovernanceAuditLog.create({
      audit_id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      request_id: requestId,
      requester_id: user.id,
      requester_name: user.full_name || user.email || "Unknown",
      requester_email: user.email || "",
      action: `governance.${entity}.create`,
      decision: "approved",
      decision_notes: `Autonomous governance create by ${user.role || "unknown"} role`,
      new_values_json: JSON.stringify(record).slice(0, 4000),
      timestamp: new Date().toISOString(),
      workspace: workspace || "developer",
      risk_level: "low",
      impact_level: "low",
      risk_score: 0,
    }).catch(() => {});
  } catch {}
}