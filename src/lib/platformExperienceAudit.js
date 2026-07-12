/**
 * EXECLEAD.AI — Platform Experience Audit™
 * ----------------------------------------
 * Program 11 + diagnostic half of Program 1.
 *
 * Scans the Route Registry (single source of truth for routes) against the
 * Navigation Groups (single source of truth for the sidebar) and surfaces
 * experience-affecting inconsistencies:
 *
 *   orphan_route      — registered route with no sidebar entry (unreachable via nav)
 *   broken_nav        — sidebar item pointing to a non-existent route
 *   flow_in_nav       — one-time flow (onboarding/reset) stuck in persistent sidebar
 *   active_state_gap  — parent route in nav with :param children; exact-match active
 *                       logic means the parent won't highlight on detail pages
 *   duplicate_route   — route registered more than once
 *   deprecated_in_nav — deprecated/archived route still shown in navigation
 *   stale_registry    — registry entry with no component mapping
 *
 * Produces a weighted Executive Experience Score™ (0–100) + a findings list.
 */
import { ROUTE_REGISTRY, routeMatches } from "./routeRegistry";
import { NAV_GROUPS } from "./roles";

const SEVERITY_WEIGHTS = { critical: 25, high: 12, medium: 6, low: 2 };

// Routes that are reachable by other means (redirects, deep links, utility) and
// therefore should NOT be flagged as orphans for lacking a sidebar entry.
const NAV_EXEMPT = ["/home", "/onboarding", "/reset-password", "/forgot-password"];

// One-time flows that should never live in the persistent sidebar.
const FLOW_ROUTES = ["/onboarding", "/reset-password", "/forgot-password"];

export function runPlatformExperienceAudit() {
  const findings = [];

  // Flatten every sidebar item across all role-scoped groups.
  const allNavItems = NAV_GROUPS.flatMap((g) =>
    g.items.map((i) => ({ ...i, group: g.label }))
  );
  const navPaths = new Set(allNavItems.map((i) => i.path));

  // 1. Orphan routes — registered, not public, not exempt, no sidebar entry.
  ROUTE_REGISTRY.forEach((r) => {
    if (r.public || NAV_EXEMPT.includes(r.url)) return;
    if (r.url.includes(":")) return; // detail/child routes are reached via parents
    if (!r.navRefs || r.navRefs.length === 0) {
      findings.push({
        id: `orphan-${r.url}`,
        type: "orphan_route",
        severity: "high",
        title: `Orphan route — ${r.name}`,
        detail: `"${r.url}" is registered but has no sidebar entry. Users cannot reach it from navigation.`,
        route: r.url,
        routeExists: true,
        recommendation: "Add to the appropriate NAV_GROUPS group, or remove if the route is decommissioned.",
      });
    }
  });

  // 2. Broken nav — sidebar item pointing to a route that doesn't exist.
  allNavItems.forEach((item) => {
    const exists = ROUTE_REGISTRY.some((r) => routeMatches(r.url, item.path));
    if (!exists) {
      findings.push({
        id: `broken-nav-${item.group}-${item.path}`,
        type: "broken_nav",
        severity: "critical",
        title: `Broken nav link — ${item.label}`,
        detail: `Sidebar item "${item.label}" (${item.group}) points to "${item.path}", which is not a registered route.`,
        route: item.path,
        routeExists: false,
        recommendation: "Remove the sidebar item or register the missing route.",
      });
    }
  });

  // 3. One-time flows in persistent nav.
  ROUTE_REGISTRY.forEach((r) => {
    if (FLOW_ROUTES.includes(r.url) && r.navRefs && r.navRefs.length > 0) {
      findings.push({
        id: `flow-nav-${r.url}`,
        type: "flow_in_nav",
        severity: "medium",
        title: `One-time flow in persistent nav — ${r.name}`,
        detail: `"${r.url}" is a one-time flow but appears in the sidebar (${r.navRefs.map((n) => n.label).join(", ")}).`,
        route: r.url,
        routeExists: true,
        recommendation: "Remove from persistent sidebar navigation; reach it via redirect only.",
      });
    }
  });

  // 4. Duplicate routes.
  ROUTE_REGISTRY.forEach((r, i) => {
    if (r.duplicate) {
      findings.push({
        id: `dup-${r.url}-${i}`,
        type: "duplicate_route",
        severity: "medium",
        title: `Duplicate route — ${r.url}`,
        detail: `"${r.url}" is registered more than once in the Route Registry.`,
        route: r.url,
        routeExists: true,
        recommendation: "Remove the duplicate entry from routeRegistry.js.",
      });
    }
  });

  // 5. Deprecated routes still in nav.
  ROUTE_REGISTRY.forEach((r) => {
    if (r.deprecated && r.navRefs && r.navRefs.length > 0) {
      findings.push({
        id: `deprecated-nav-${r.url}`,
        type: "deprecated_in_nav",
        severity: "medium",
        title: `Deprecated route in nav — ${r.name}`,
        detail: `"${r.url}" is marked ${r.status} but still appears in navigation.`,
        route: r.url,
        routeExists: true,
        recommendation: "Remove from navigation or restore the route to live status.",
      });
    }
  });

  // 6. Stale registry — entry with no component mapping.
  ROUTE_REGISTRY.forEach((r) => {
    if (!r.hasComponent) {
      findings.push({
        id: `stale-${r.url}`,
        type: "stale_registry",
        severity: "high",
        title: `Registry entry without component — ${r.name}`,
        detail: `"${r.url}" has no component mapping in the Route Registry.`,
        route: r.url,
        routeExists: false,
        recommendation: "Remove from the registry or add the corresponding component.",
      });
    }
  });

  // 7. Active-state gaps — parent route in nav with :param children.
  // AppLayout uses exact pathname match, so the parent won't highlight on detail pages.
  const reportedGaps = new Set();
  ROUTE_REGISTRY.forEach((r) => {
    if (!r.url.includes(":")) return;
    const segments = r.url.split("/").filter(Boolean);
    const parent = "/" + segments.slice(0, -1).join("/");
    if (navPaths.has(parent) && !reportedGaps.has(parent)) {
      reportedGaps.add(parent);
      findings.push({
        id: `active-gap-${parent}`,
        type: "active_state_gap",
        severity: "low",
        title: `Active-state gap — ${parent}`,
        detail: `Child route "${r.url}" exists, but nav active state uses exact match, so "${parent}" won't highlight on detail pages.`,
        route: parent,
        routeExists: true,
        recommendation: "Switch nav active logic to prefix-based matching for parent routes.",
      });
    }
  });

  // Score
  const deduction = findings.reduce((sum, f) => sum + SEVERITY_WEIGHTS[f.severity], 0);
  const score = Math.max(0, Math.min(100, 100 - deduction));

  const by = (type) => findings.filter((f) => f.type === type).length;
  const bySev = (sev) => findings.filter((f) => f.severity === sev).length;

  const summary = {
    totalRoutes: ROUTE_REGISTRY.length,
    totalNavItems: allNavItems.length,
    totalFindings: findings.length,
    criticalCount: bySev("critical"),
    highCount: bySev("high"),
    mediumCount: bySev("medium"),
    lowCount: bySev("low"),
    orphanRoutes: by("orphan_route"),
    brokenNav: by("broken_nav"),
    flowInNav: by("flow_in_nav"),
    duplicates: by("duplicate_route"),
    deprecatedInNav: by("deprecated_in_nav"),
    activeStateGaps: by("active_state_gap"),
    staleRegistry: by("stale_registry"),
  };

  return {
    score,
    tier: scoreTier(score),
    findings,
    summary,
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
};