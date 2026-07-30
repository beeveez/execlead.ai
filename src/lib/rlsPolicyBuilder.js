/**
 * EXECLEAD.AI — RLS Policy Builder™
 * ============================================================
 * Advanced Row-Level Security Enhancement · Version 1.0 · P1
 *
 * Catalog of RLS policy types, support status against the
 * Base44 platform, a Custom Rule Builder (AND/OR composition),
 * and a Policy Explainer that produces a human-readable
 * security summary for any entity's RLS configuration.
 *
 * Platform Capability Matrix:
 *   ✓ Owner Match           — created_by_id == {{user.id}}
 *   ✓ Organization Match    — data.organization_id == {{user.data.organization_id}}
 *   ✓ Tenant Match          — data.tenant_id == {{user.data.tenant_id}}
 *   ✓ Named Role            — user_condition: { role }
 *   ✓ Custom AND/OR Rules   — $and / $or composition
 *   ✓ Public Read           — true / {}
 *   ✗ Service Role          — Platform limitation (enforced at backend layer)
 *   ✗ System Automation     — Platform limitation (asServiceRole bypasses RLS)
 *   ✗ Environment-Specific  — Platform limitation (no env awareness in RLS)
 */
import { RLS_REGISTRY, SECURITY_CLASSIFICATIONS } from "./rlsRegistry";

// ── Policy Type Catalog ──
export const POLICY_TYPES = [
  {
    id: "owner",
    label: "Owner",
    description: "Only the record creator (created_by_id == user.id)",
    supported: true,
    template: { created_by_id: "{{user.id}}" },
    appliesTo: ["read", "create", "update", "delete"],
    category: "identity",
  },
  {
    id: "creator_only",
    label: "Creator Only",
    description: "Alias of Owner — only the creator may access",
    supported: true,
    template: { created_by_id: "{{user.id}}" },
    appliesTo: ["read", "create", "update", "delete"],
    category: "identity",
  },
  {
    id: "organization_match",
    label: "Organization Match",
    description: "Same organization — record.organization_id == user.organization_id",
    supported: true,
    template: { "data.organization_id": "{{user.data.organization_id}}" },
    appliesTo: ["read", "create", "update", "delete"],
    category: "isolation",
    requiresField: "organization_id",
  },
  {
    id: "tenant_match",
    label: "Tenant Match",
    description: "Same tenant — record.tenant_id == user.tenant_id",
    supported: true,
    template: { "data.tenant_id": "{{user.data.tenant_id}}" },
    appliesTo: ["read", "create", "update", "delete"],
    category: "isolation",
    requiresField: "tenant_id",
    note: "Requires a tenant_id field on both the User entity and this entity. EXECLEAD.AI uses organization_id as the tenant boundary.",
  },
  {
    id: "named_role",
    label: "Named Role",
    description: "Specific role(s) — Platform Admin, Org Admin, Workspace Admin, etc.",
    supported: true,
    template: { user_condition: { role: "admin" } },
    appliesTo: ["read", "create", "update", "delete"],
    category: "role",
    roles: [
      "super_admin",
      "platform_admin",
      "admin",
      "developer",
      "enterprise_admin",
      "finance",
      "founder_root_admin",
    ],
  },
  {
    id: "admin_only",
    label: "Admin Only",
    description: "Only the admin role",
    supported: true,
    template: { user_condition: { role: "admin" } },
    appliesTo: ["read", "create", "update", "delete"],
    category: "role",
  },
  {
    id: "public_read",
    label: "Public Read",
    description: "Anyone can read (authenticated or anonymous on public apps)",
    supported: true,
    template: true,
    appliesTo: ["read"],
    category: "visibility",
  },
  {
    id: "service_role",
    label: "Service Role",
    description: "Platform services — Guardian™, EXEC™, Background Jobs, AI Workers, Sync, Scheduled Automation",
    supported: false,
    limitation:
      "Base44 RLS governs app-user requests only. Platform service operations run via base44.asServiceRole in backend functions, which bypass RLS entirely. Service-role access is enforced at the backend-function invocation layer (who can trigger the function), not within RLS rules.",
    category: "service",
  },
  {
    id: "system_automation",
    label: "System Automation",
    description: "Automated platform processes (scheduled jobs, sync, self-healing, recompute)",
    supported: false,
    limitation:
      "System automations execute through base44.asServiceRole and bypass RLS. Access control is enforced by automation triggers and backend-function authorization, not by RLS rules on the entity.",
    category: "service",
  },
  {
    id: "environment",
    label: "Environment-Specific",
    description: "Different policies for development / staging / production",
    supported: false,
    limitation:
      "Base44 RLS rules have no environment awareness. The same RLS policy applies across all environments. Use feature flags or separate entities per environment if environment-scoped access is required.",
    category: "environment",
  },
];

export function getPolicyType(id) {
  return POLICY_TYPES.find((p) => p.id === id);
}

export function getSupportedPolicyTypes() {
  return POLICY_TYPES.filter((p) => p.supported);
}

export function getPlatformLimitations() {
  return POLICY_TYPES.filter((p) => !p.supported);
}

// ── Custom Rule Builder ──
// Compose multiple policy conditions with AND or OR logic.
// conditions: [{ typeId, role?, field? }]
// logic: "and" | "or"
// returns an RLS rule object
export function composeRule(conditions, logic = "or") {
  const branches = conditions.map((c) => {
    const type = getPolicyType(c.typeId);
    if (!type || !type.supported) return null;
    if (c.typeId === "named_role" && c.role) {
      return { user_condition: { role: c.role } };
    }
    if (c.typeId === "organization_match" && c.field) {
      return { [`data.${c.field}`]: "{{user.data.organization_id}}" };
    }
    if (c.typeId === "tenant_match" && c.field) {
      return { [`data.${c.field}`]: "{{user.data.tenant_id}}" };
    }
    // deep clone template
    return JSON.parse(JSON.stringify(type.template));
  }).filter(Boolean);

  if (branches.length === 0) return {};
  if (branches.length === 1) return branches[0];
  return { [`$${logic}`]: branches };
}

// ── Policy Explainer ──
// Produce a human-readable security summary for an entity's RLS config.
export function explainPolicy(entityName, rlsConfig, classification) {
  const parts = [];
  const classLabel = SECURITY_CLASSIFICATIONS[classification]?.label || classification;

  const opExplanations = [];
  const ops = ["create", "read", "update", "delete"];
  ops.forEach((op) => {
    const rule = rlsConfig?.[op];
    opExplanations.push(explainOperation(op, rule));
  });

  const readExp = opExplanations.find((e) => e.op === "read");
  const writeExp = ["create", "update", "delete"]
    .map((o) => opExplanations.find((e) => e.op === o))
    .filter(Boolean);

  let summary;
  if (classification === "user") {
    summary = `This entity is isolated by user ownership. ${readExp.summary} ${writeExp.map((w) => w.summary).join(" ")}`.trim();
  } else if (classification === "organization") {
    summary = `This entity is isolated by organization membership. ${readExp.summary} ${writeExp.map((w) => w.summary).join(" ")}`.trim();
  } else if (classification === "platform") {
    summary = `This entity is platform-scoped. ${readExp.summary} ${writeExp.map((w) => w.summary).join(" ")}`.trim();
  } else {
    summary = `This entity is public for reads. ${readExp.summary} ${writeExp.map((w) => w.summary).join(" ")}`.trim();
  }

  // Platform capability note
  const platformNote =
    "Platform-level tenant and service-role isolation is enforced by Base44 and backend-function authorization, not by entity RLS rules.";

  return {
    entity: entityName,
    classification: classLabel,
    operations: opExplanations,
    summary,
    platformNote,
  };
}

function explainOperation(op, rule) {
  if (rule === undefined || rule === null || (typeof rule === "object" && Object.keys(rule).length === 0)) {
    return {
      op,
      status: "open",
      label: "Open",
      summary: op === "read" ? "Anyone can read." : `Anyone can ${op}.`,
      detail: "No RLS rule — unrestricted access.",
    };
  }
  if (rule === true) {
    return {
      op,
      status: "public",
      label: "Public",
      summary: op === "read" ? "Anyone can read." : `Public ${op}.`,
      detail: "Explicit public access.",
    };
  }
  if (rule.user_condition?.role === "__immutable__") {
    return {
      op,
      status: "immutable",
      label: "Immutable",
      summary: `${op === "create" ? "System creates" : "No one may"} ${op} — immutable audit record.`,
      detail: "Append-only / immutable enforcement.",
    };
  }
  // Detect owner
  if (rule.created_by_id === "{{user.id}}") {
    return {
      op,
      status: "owner",
      label: "Owner",
      summary: `Only the creator can ${op}.`,
      detail: "created_by_id == user.id",
    };
  }
  // Detect organization match
  const orgKey = Object.keys(rule).find((k) => k.startsWith("data.") && rule[k] === "{{user.data.organization_id}}");
  if (orgKey) {
    return {
      op,
      status: "organization",
      label: "Organization",
      summary: `Same-organization users can ${op}.`,
      detail: `${orgKey} == user.organization_id`,
    };
  }
  // Detect tenant match
  const tenantKey = Object.keys(rule).find((k) => k.startsWith("data.") && rule[k] === "{{user.data.tenant_id}}");
  if (tenantKey) {
    return {
      op,
      status: "tenant",
      label: "Tenant",
      summary: `Same-tenant users can ${op}.`,
      detail: `${tenantKey} == user.tenant_id`,
    };
  }
  // Detect named role (single)
  if (rule.user_condition?.role) {
    return {
      op,
      status: "role",
      label: `Role: ${rule.user_condition.role}`,
      summary: `Only ${rule.user_condition.role} role can ${op}.`,
      detail: `user_condition.role == ${rule.user_condition.role}`,
    };
  }
  // Detect $or / $and composition
  if (rule.$or || rule.$and) {
    const logic = rule.$or ? "OR" : "AND";
    const branches = rule.$or || rule.$and;
    const branchLabels = branches.map((b) => {
      if (b.created_by_id === "{{user.id}}") return "Owner";
      if (b.user_condition?.role === "__immutable__") return "Immutable";
      if (b.user_condition?.role) return `Role(${b.user_condition.role})`;
      const ok = Object.keys(b).find((k) => k.startsWith("data."));
      if (ok && b[ok] === "{{user.data.organization_id}}") return "Organization";
      if (ok && b[ok] === "{{user.data.tenant_id}}") return "Tenant";
      return "Condition";
    });
    return {
      op,
      status: "composite",
      label: `Composite (${logic})`,
      summary: `${op.charAt(0).toUpperCase() + op.slice(1)} allowed for: ${branchLabels.join(` ${logic} `)}.`,
      detail: `${logic} of ${branchLabels.length} conditions`,
    };
  }
  return {
    op,
    status: "custom",
    label: "Custom Rule",
    summary: `${op.charAt(0).toUpperCase() + op.slice(1)} governed by a custom rule.`,
    detail: JSON.stringify(rule),
  };
}

// ── Build a full entity RLS config from editor selections ──
export function buildEntityPolicy(selections) {
  // selections: { create: { conditions, logic }, read: {...}, update: {...}, delete: {...} }
  const config = {};
  Object.keys(selections).forEach((op) => {
    const sel = selections[op];
    if (!sel || !sel.conditions || sel.conditions.length === 0) {
      config[op] = {}; // open
      return;
    }
    config[op] = composeRule(sel.conditions, sel.logic);
  });
  return config;
}