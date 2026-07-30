// RBAC Validation Engine™ — enforces the Founder Root Admin Permission Standard™.
import { RBAC_REGISTRY, GENERATED_AT, RESTRICTED_COUNT } from '@/lib/rbacRegistry';

export const FOUNDER_ROOT_ADMIN = 'founder_root_admin';

// Privileged administrative roles that must always be evaluated together.
export const PRIVILEGED_ROLES = ['super_admin', 'platform_admin', 'founder_root_admin'];
export const ADMIN_ROLES = ['super_admin', 'platform_admin', 'admin', 'developer', 'founder_root_admin'];

export const RBAC_STANDARD =
  'Founder Root Admin is the highest operational platform role. Where Super Admin or Platform Admin is granted access on a restricted entity, Founder Root Admin must receive equivalent access. Silent omissions are not allowed; every exception must be explicitly documented with entity, permission, reason, approver, and review date.';

// Documented security exceptions (none currently). Add: { entity, permission, reason, approver, reviewDate }
export const RBAC_EXCEPTIONS = [];

export const OP_LABELS = { create: 'Create', read: 'Read', update: 'Update', delete: 'Delete' };

// Validate a registry snapshot and return an RBAC Consistency Report™.
export function validateRegistry(registry = RBAC_REGISTRY) {
  const restricted = registry.filter((e) =>
    Object.values(e.ops).some((v) => v === 'founder' || v === 'missing')
  );
  const broken = restricted.filter((e) => Object.values(e.ops).includes('missing'));
  const compliant = restricted.length - broken.length;
  return {
    totalEntities: registry.length,
    restrictedCount: restricted.length,
    compliant,
    brokenCount: broken.length,
    broken,
    exceptions: RBAC_EXCEPTIONS,
    generatedAt: GENERATED_AT,
    complianceRate: restricted.length ? Math.round((compliant / restricted.length) * 100) : 100,
  };
}

// Developer Guardrail™ — check a single entity's RLS config for Founder Root Admin omissions.
// Use when creating a new restricted entity to warn before the inconsistency ships.
export function checkEntityRls(rls) {
  const warnings = [];
  if (!rls) return warnings;
  const PRIV = new Set(['super_admin', 'platform_admin']);
  for (const op of ['create', 'read', 'update', 'delete']) {
    const rule = rls[op];
    if (!rule) continue;
    if (Array.isArray(rule.$or)) {
      const hasPriv = rule.$or.some((e) => e && e.user_condition && PRIV.has(e.user_condition.role));
      const hasFounder = rule.$or.some((e) => e && e.user_condition && e.user_condition.role === 'founder_root_admin');
      if (hasPriv && !hasFounder) warnings.push({ op, message: 'founder_root_admin omitted where a privileged admin role is granted' });
    } else if (rule.user_condition && PRIV.has(rule.user_condition.role)) {
      warnings.push({ op, message: 'founder_root_admin omitted (single privileged role rule)' });
    }
  }
  return warnings;
}

export { RBAC_REGISTRY, GENERATED_AT, RESTRICTED_COUNT };