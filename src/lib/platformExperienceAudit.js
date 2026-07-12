/**
 * EXECLEAD.AI — Platform Autonomic Experience Engine™ v3.0
 * -------------------------------------------
 * Discovery Engine™ + Issue Classification Engine™.
 *
 * Scans the Route Registry and Workspace Navigation (the live sidebar
 * source) and classifies every finding with:
 *   severity, auto_repairable, confidence, impact, estimated_fix_time,
 *   dependencies, verification_strategy, and a concrete repair_patch.
 *
 * Auto-repairable findings carry a patch the developer applies in one click.
 * Requires-review findings (permission/auth/business-logic) never get patches.
 */
import { ROUTE_REGISTRY, routeMatches } from "./routeRegistry";
import { WORKSPACE_NAV, getRouteWorkspace } from "./workspaces";

const SEVERITY_WEIGHTS = { critical: 25, high: 12, medium: 6, low: 2 };

const NAV_EXEMPT = [
  "/home", "/onboarding", "/reset-password", "/forgot-password", "/companies/compare",
  "/intelligence/competencies", "/compare-plans", "/notifications", "/connected-accounts", "/cpq/quotes",
];
const FLOW_ROUTES = ["/onboarding", "/reset-password", "/forgot-password"];

// ─── Classification rules per finding type ───
const CLASSIFICATION = {
  orphan_route: {
    severity: "high", auto_repairable: true, confidence: 85, impact: "Page unreachable from sidebar navigation",
    estimated_fix_time: "2 min", dependencies: ["workspaces.js"], verification: "Re-run audit — finding disappears",
  },
  broken_nav: {
    severity: "critical", auto_repairable: false, confidence: 100, impact: "Sidebar link leads to a 404",
    estimated_fix_time: "5 min", dependencies: ["routeRegistry.js", "workspaces.js"], verification: "Re-run audit — finding disappears",
  },
  flow_in_nav: {
    severity: "medium", auto_repairable: true, confidence: 90, impact: "One-time flow clutters persistent navigation",
    estimated_fix_time: "1 min", dependencies: ["workspaces.js"], verification: "Re-run audit — finding disappears",
  },
  duplicate_route: {
    severity: "medium", auto_repairable: false, confidence: 100, impact: "Ambiguous routing — first match wins",
    estimated_fix_time: "3 min", dependencies: ["routeRegistry.js"], verification: "Re-run audit — finding disappears",
  },
  deprecated_in_nav: {
    severity: "medium", auto_repairable: true, confidence: 90, impact: "Deprecated route still shown to users",
    estimated_fix_time: "1 min", dependencies: ["workspaces.js"], verification: "Re-run audit — finding disappears",
  },
  stale_registry: {
    severity: "high", auto_repairable: false, confidence: 100, impact: "Registry entry has no backing component",
    estimated_fix_time: "3 min", dependencies: ["routeRegistry.js"], verification: "Re-run audit — finding disappears",
  },
  active_state_gap: {
    severity: "low", auto_repairable: false, confidence: 70, impact: "Parent nav item won't highlight on detail pages",
    estimated_fix_time: "5 min", dependencies: ["AppLayout.jsx"], verification: "Navigate to child route — parent highlights",
  },
  duplicate_nav_label: {
    severity: "medium", auto_repairable: true, confidence: 80, impact: "Two different routes share a sidebar label — user confusion",
    estimated_fix_time: "2 min", dependencies: ["workspaces.js"], verification: "Re-run audit — finding disappears",
  },
  unassigned_workspace: {
    severity: "low", auto_repairable: true, confidence: 75, impact: "Route not assigned to any workspace — cross-workspace nav gaps",
    estimated_fix_time: "2 min", dependencies: ["workspaces.js"], verification: "Re-run audit — finding disappears",
  },
  inconsistent_label: {
    severity: "low", auto_repairable: true, confidence: 70, impact: "Same route labeled differently across workspaces",
    estimated_fix_time: "2 min", dependencies: ["workspaces.js"], verification: "Re-run audit — finding disappears",
  },
};

function classify(type, extra = {}) {
  const c = CLASSIFICATION[type] || { severity: "low", auto_repairable: false, confidence: 50, impact: "Unknown", estimated_fix_time: "—", dependencies: [], verification: "Re-run audit" };
  return { type, severity: c.severity, auto_repairable: c.auto_repairable, confidence: c.confidence, impact: c.impact, estimated_fix_time: c.estimated_fix_time, dependencies: c.dependencies, verification_strategy: c.verification, ...extra };
}

// ─── Repair patch generators (for auto_repairable findings only) ───
function navPatch(action, file, location, description, before, after) {
  return { action, file, location, description, before, after };
}

// Flatten all nav items across all workspaces
function flattenNav() {
  const items = [];
  for (const [wsId, groups] of Object.entries(WORKSPACE_NAV)) {
    for (const g of groups) {
      for (const item of g.items) {
        items.push({ ...item, group: g.label, workspace: wsId });
      }
    }
  }
  return items;
}

export function runPlatformExperienceAudit() {
  const findings = [];
  const allNavItems = flattenNav();

  // 1. Orphan routes — registered, not public, not exempt, no sidebar entry
  ROUTE_REGISTRY.forEach((r) => {
    if (r.public || NAV_EXEMPT.includes(r.url)) return;
    if (r.url.includes(":")) return;
    // Check if any nav item matches (including param routes' parents)
    const hasNav = allNavItems.some((i) => routeMatches(r.url, i.path) || routeMatches(i.path, r.url));
    if (!hasNav) {
      // Find the best workspace to add it to
      const ws = getRouteWorkspace(r.url) || ["executive"];
      const patch = navPatch(
        "add_nav_item",
        "src/lib/workspaces.js",
        `WORKSPACE_NAV.${ws[0]} (appropriate group)`,
        `Add "${r.name}" to the ${ws[0]} workspace sidebar`,
        "(route not present in any sidebar group)",
        `{ path: "${r.url}", label: "${r.name}", icon: <icon> },`
      );
      findings.push({
        id: `orphan-${r.url}`,
        signature: `orphan_route:${r.url}`,
        title: `Orphan route — ${r.name}`,
        detail: `"${r.url}" is registered but has no sidebar entry. Users cannot reach it from navigation.`,
        route: r.url, routeExists: true,
        recommendation: "Add to the appropriate workspace nav group, or remove if decommissioned.",
        ...classify("orphan_route", { repair_patch: patch }),
      });
    }
  });

  // 2. Broken nav — sidebar item pointing to a non-existent route
  allNavItems.forEach((item) => {
    const exists = ROUTE_REGISTRY.some((r) => routeMatches(r.url, item.path));
    if (!exists) {
      findings.push({
        id: `broken-${item.workspace}-${item.group}-${item.path}`,
        signature: `broken_nav:${item.path}`,
        title: `Broken nav link — ${item.label}`,
        detail: `Sidebar item "${item.label}" (${item.workspace} → ${item.group}) points to "${item.path}", which is not a registered route.`,
        route: item.path, routeExists: false,
        recommendation: "Remove the sidebar item or register the missing route.",
        ...classify("broken_nav"),
      });
    }
  });

  // 3. One-time flows in persistent nav
  allNavItems.forEach((item) => {
    if (FLOW_ROUTES.includes(item.path)) {
      findings.push({
        id: `flow-${item.path}`,
        signature: `flow_in_nav:${item.path}`,
        title: `One-time flow in nav — ${item.label}`,
        detail: `"${item.path}" is a one-time flow but appears in the ${item.workspace} sidebar (${item.group}).`,
        route: item.path, routeExists: true,
        recommendation: "Remove from persistent sidebar; reach via redirect only.",
        ...classify("flow_in_nav", {
          repair_patch: navPatch("remove_nav_item", "src/lib/workspaces.js",
            `WORKSPACE_NAV.${item.workspace} → ${item.group}`,
            `Remove "${item.label}" — it's a one-time flow, not a persistent destination`,
            `{ path: "${item.path}", label: "${item.label}", ... },`,
            "(removed)"),
        }),
      });
    }
  });

  // 4. Duplicate routes
  const seen = {};
  ROUTE_REGISTRY.forEach((r) => {
    if (seen[r.url]) {
      findings.push({
        id: `dup-${r.url}-${r.component}`,
        signature: `duplicate_route:${r.url}`,
        title: `Duplicate route — ${r.url}`,
        detail: `"${r.url}" is registered more than once in the Route Registry.`,
        route: r.url, routeExists: true,
        recommendation: "Remove the duplicate entry from routeRegistry.js.",
        ...classify("duplicate_route"),
      });
    }
    seen[r.url] = true;
  });

  // 5. Deprecated routes in nav
  ROUTE_REGISTRY.forEach((r) => {
    if (r.deprecated && allNavItems.some((i) => routeMatches(r.url, i.path))) {
      findings.push({
        id: `deprecated-${r.url}`,
        signature: `deprecated_in_nav:${r.url}`,
        title: `Deprecated route in nav — ${r.name}`,
        detail: `"${r.url}" is marked ${r.status} but still appears in navigation.`,
        route: r.url, routeExists: true,
        recommendation: "Remove from navigation or restore to live status.",
        ...classify("deprecated_in_nav", {
          repair_patch: navPatch("remove_nav_item", "src/lib/workspaces.js",
            `WORKSPACE_NAV (where ${r.url} appears)`,
            `Remove deprecated route "${r.name}" from navigation`,
            `{ path: "${r.url}", ... },`, "(removed)"),
        }),
      });
    }
  });

  // 6. Stale registry — no component
  ROUTE_REGISTRY.forEach((r) => {
    if (!r.hasComponent) {
      findings.push({
        id: `stale-${r.url}`,
        signature: `stale_registry:${r.url}`,
        title: `Registry entry without component — ${r.name}`,
        detail: `"${r.url}" has no component mapping in the Route Registry.`,
        route: r.url, routeExists: false,
        recommendation: "Remove from the registry or add the corresponding component.",
        ...classify("stale_registry"),
      });
    }
  });

  // 7. Active-state gaps — REMOVED: parent routes with :param children (e.g. /academy → /academy/:courseSlug)
  // are a normal pattern. React Router's NavLink uses prefix matching by default (the `end` prop opts INTO
  // exact matching, not away from it), so parent nav items DO highlight on child routes. This check was a false positive.

  // 8. Duplicate nav labels — same label, different paths within a workspace
  const labelMap = {};
  allNavItems.forEach((item) => {
    const key = `${item.workspace}:${item.label}`;
    if (!labelMap[key]) labelMap[key] = [];
    labelMap[key].push(item);
  });
  Object.entries(labelMap).forEach(([key, items]) => {
    if (items.length > 1) {
      const paths = items.map((i) => i.path);
      findings.push({
        id: `dup-label-${key}`,
        signature: `duplicate_nav_label:${key}`,
        title: `Duplicate nav label — ${items[0].label}`,
        detail: `Label "${items[0].label}" in ${items[0].workspace} → ${items[0].group} is used for routes: ${paths.join(", ")}`,
        route: paths[0], routeExists: true,
        recommendation: "Rename one of the items to disambiguate.",
        ...classify("duplicate_nav_label", {
          repair_patch: navPatch("rename_label", "src/lib/workspaces.js",
            `WORKSPACE_NAV.${items[0].workspace} → ${items[0].group}`,
            `Rename "${items[0].label}" to distinguish it from the other entry`,
            `{ path: "${items[1].path}", label: "${items[0].label}", ... },`,
            `{ path: "${items[1].path}", label: "${items[0].label} (alt)", ... },`),
        }),
      });
    }
  });

  // 9. Unassigned workspace — route not in ROUTE_WORKSPACE map and not derivable by prefix
  ROUTE_REGISTRY.forEach((r) => {
    if (r.public || NAV_EXEMPT.includes(r.url)) return;
    if (r.url.includes(":")) return;
    const ws = getRouteWorkspace(r.url);
    if (!ws) {
      findings.push({
        id: `unassigned-ws-${r.url}`,
        signature: `unassigned_workspace:${r.url}`,
        title: `Unassigned workspace — ${r.name}`,
        detail: `"${r.url}" is not assigned to any workspace in the ROUTE_WORKSPACE map. Cross-workspace navigation may be inconsistent.`,
        route: r.url, routeExists: true,
        recommendation: "Add the route to the ROUTE_WORKSPACE map in workspaces.js.",
        ...classify("unassigned_workspace", {
          repair_patch: navPatch("add_workspace_assignment", "src/lib/workspaces.js",
            "ROUTE_WORKSPACE map",
            `Assign "${r.url}" to the appropriate workspace(s)`,
            `// "${r.url}" not present in ROUTE_WORKSPACE`,
            `"${r.url}": ["executive"],`),
        }),
      });
    }
  });

  // 10. Inconsistent label — same path, different labels WITHIN the same workspace only.
  // Cross-workspace label differences are intentional (different personas use different terminology
  // for the same route — e.g. "Marketplace" for executives vs "Marketplace Management" for platform admins).
  const wsPathLabels = {};
  allNavItems.forEach((item) => {
    const key = `${item.workspace}|${item.path}`;
    if (!wsPathLabels[key]) wsPathLabels[key] = new Set();
    wsPathLabels[key].add(item.label);
  });
  Object.entries(wsPathLabels).forEach(([key, labels]) => {
    if (labels.size > 1) {
      const [ws, path] = key.split("|");
      findings.push({
        id: `inconsistent-label-${key}`,
        signature: `inconsistent_label:${key}`,
        title: `Inconsistent label — ${path}`,
        detail: `"${path}" is labeled differently within the ${ws} workspace: ${[...labels].join(" vs ")}`,
        route: path, routeExists: true,
        recommendation: "Standardize the label within this workspace.",
        ...classify("inconsistent_label", {
          repair_patch: navPatch("rename_label", "src/lib/workspaces.js",
            `WORKSPACE_NAV.${ws}`,
            `Standardize the label for "${path}" within the ${ws} workspace`,
            `Labels: ${[...labels].join(", ")}`,
            `Use a single label`),
        }),
      });
    }
  });

  // ─── Multi-dimensional score ───
  const dims = {
    navigation: findings.filter((f) => ["orphan_route", "broken_nav", "flow_in_nav", "active_state_gap", "duplicate_nav_label"].includes(f.type)),
    routing: findings.filter((f) => ["duplicate_route", "stale_registry", "unassigned_workspace"].includes(f.type)),
    consistency: findings.filter((f) => ["inconsistent_label", "deprecated_in_nav"].includes(f.type)),
  };

  const dimScore = (list) => Math.max(0, 100 - list.reduce((s, f) => s + SEVERITY_WEIGHTS[f.severity], 0));
  const dimensions = [
    { name: "Navigation", score: dimScore(dims.navigation), count: dims.navigation.length },
    { name: "Routing", score: dimScore(dims.routing), count: dims.routing.length },
    { name: "Consistency", score: dimScore(dims.consistency), count: dims.consistency.length },
    { name: "Discoverability", score: dimScore(dims.navigation.concat(dims.routing)), count: dims.navigation.length + dims.routing.length },
  ];

  const deduction = findings.reduce((s, f) => s + SEVERITY_WEIGHTS[f.severity], 0);
  const score = Math.max(0, Math.min(100, 100 - deduction));
  const autoRepairable = findings.filter((f) => f.auto_repairable);
  const requiresReview = findings.filter((f) => !f.auto_repairable);

  const bySev = (sev) => findings.filter((f) => f.severity === sev).length;

  return {
    score,
    tier: scoreTier(score),
    findings,
    dimensions,
    summary: {
      totalRoutes: ROUTE_REGISTRY.length,
      totalNavItems: allNavItems.length,
      totalFindings: findings.length,
      criticalCount: bySev("critical"),
      highCount: bySev("high"),
      mediumCount: bySev("medium"),
      lowCount: bySev("low"),
      autoRepairable: autoRepairable.length,
      requiresReview: requiresReview.length,
      expectedScoreAfterRepair: Math.max(0, Math.min(100, score + autoRepairable.reduce((s, f) => s + SEVERITY_WEIGHTS[f.severity], 0))),
    },
    routeTable: ROUTE_REGISTRY,
    generatedAt: new Date().toISOString(),
  };
}

export function scoreTier(score) {
  if (score >= 90) return { label: "World-Class", color: "#10b981" };
  if (score >= 75) return { label: "Excellent", color: "#6366f1" };
  if (score >= 60) return { label: "Good", color: "#eab308" };
  if (score >= 40) return { label: "Needs Work", color: "#f59e0b" };
  return { label: "Critical", color: "#ef4444" };
}

export const FINDING_TYPE_LABELS = {
  orphan_route: "Orphan Route",
  broken_nav: "Broken Nav Link",
  flow_in_nav: "Flow In Nav",
  duplicate_route: "Duplicate Route",
  deprecated_in_nav: "Deprecated In Nav",
  stale_registry: "Stale Registry",
  active_state_gap: "Active-State Gap",
  duplicate_nav_label: "Duplicate Nav Label",
  unassigned_workspace: "Unassigned Workspace",
  inconsistent_label: "Inconsistent Label",
};