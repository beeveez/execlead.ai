/**
 * UX Audit Engine™ — Automated Platform UX Rule Validation
 *
 * Scans the EXECLEAD.AI platform for violations of the Platform UX Rule:
 *   - Dead links (navigation items pointing to non-existent routes)
 *   - Orphan pages (routes with no navigation references)
 *   - Duplicate routes
 *   - Routes missing component assignments
 *   - Deprecated routes still in active navigation
 *   - Feature-gated routes with no feature definition
 *
 * Generates a UX Audit Report™ with severity-scored findings.
 */

import { ROUTE_REGISTRY, routeMatches } from './routeRegistry';
import { WORKSPACE_NAV } from './workspaces';

// Flatten all navigation items across all workspaces
const ALL_NAV_ITEMS = Object.values(WORKSPACE_NAV).flat().flatMap(group =>
  (group.items || []).map(item => ({
    ...item,
    group: group.label,
  }))
);

const AUDIT_VERSION = '1.0';

// ═══════════════════════════════════════════════════════════
// FINDING TYPES
// ═══════════════════════════════════════════════════════════

const FINDING_TYPES = {
  DEAD_LINK: { id: 'dead_link', label: 'Dead Link', severity: 'critical', icon: 'Unlink' },
  ORPHAN_PAGE: { id: 'orphan_page', label: 'Orphan Page', severity: 'warning', icon: 'FileQuestion' },
  DUPLICATE_ROUTE: { id: 'duplicate_route', label: 'Duplicate Route', severity: 'error', icon: 'Copy' },
  MISSING_COMPONENT: { id: 'missing_component', label: 'Missing Component', severity: 'error', icon: 'AlertTriangle' },
  DEPRECATED_IN_NAV: { id: 'deprecated_in_nav', label: 'Deprecated in Navigation', severity: 'warning', icon: 'AlertCircle' },
  UNGATED_FEATURE_ROUTE: { id: 'ungated_feature_route', label: 'Feature Route Without Feature Gate', severity: 'info', icon: 'Info' },
  MISSING_NAV_LABEL: { id: 'missing_nav_label', label: 'Navigation Item Missing Label', severity: 'info', icon: 'Tag' },
};

const SEVERITY_WEIGHTS = {
  critical: 25,
  error: 15,
  warning: 8,
  info: 2,
};

// ═══════════════════════════════════════════════════════════
// AUDIT SCANS
// ═══════════════════════════════════════════════════════════

function scanDeadLinks() {
  const findings = [];
  const routePaths = ROUTE_REGISTRY.map(r => r.url);

  for (const navItem of ALL_NAV_ITEMS) {
    if (!navItem.path) continue;
    const exists = routePaths.some(rp => routeMatches(rp, navItem.path));
    if (!exists) {
      findings.push({
        type: FINDING_TYPES.DEAD_LINK,
        message: `Navigation "${navItem.label}" links to "${navItem.path}" which is not a registered route`,
        location: `Nav: ${navItem.group} → ${navItem.label}`,
        target: navItem.path,
        recommendation: `Add a route for "${navItem.path}" or update the navigation link`,
      });
    }
  }

  return findings;
}

function scanOrphanPages() {
  const findings = [];

  for (const route of ROUTE_REGISTRY) {
    // Skip auth/public routes — they don't need nav entries
    if (route.public) continue;
    // Skip onboarding — it's a flow, not a nav destination
    if (route.url === '/onboarding') continue;
    // Skip section home — dynamic pattern
    if (route.url.includes(':workspaceId')) continue;
    // Skip nested academy routes
    if (route.url.includes(':courseSlug')) continue;
    // Skip quote portal
    if (route.url.includes(':quoteId')) continue;
    // Skip verify
    if (route.url.includes(':verificationId')) continue;
    // Skip username
    if (route.url.includes(':username')) continue;
    // Skip community
    if (route.url.includes(':communityId')) continue;
    // Skip event detail
    if (route.url.includes('/events/:id')) continue;

    if (!route.navRefs || route.navRefs.length === 0) {
      findings.push({
        type: FINDING_TYPES.ORPHAN_PAGE,
        message: `Route "${route.url}" (${route.name}) has no navigation references — users cannot discover it`,
        location: `Route: ${route.url}`,
        target: route.url,
        recommendation: `Add "${route.name}" to a navigation group or mark it as intentionally hidden`,
      });
    }
  }

  return findings;
}

function scanDuplicates() {
  const findings = [];
  const seen = new Map();

  for (const route of ROUTE_REGISTRY) {
    if (seen.has(route.url)) {
      findings.push({
        type: FINDING_TYPES.DUPLICATE_ROUTE,
        message: `Route "${route.url}" is registered more than once`,
        location: `Route: ${route.url}`,
        target: route.url,
        recommendation: `Remove the duplicate route declaration`,
      });
    }
    seen.set(route.url, true);
  }

  return findings;
}

function scanMissingComponents() {
  const findings = [];

  for (const route of ROUTE_REGISTRY) {
    if (!route.hasComponent) {
      findings.push({
        type: FINDING_TYPES.MISSING_COMPONENT,
        message: `Route "${route.url}" (${route.name}) has no component assigned`,
        location: `Route: ${route.url}`,
        target: route.url,
        recommendation: `Assign a React component to this route`,
      });
    }
  }

  return findings;
}

function scanDeprecatedInNav() {
  const findings = [];

  for (const route of ROUTE_REGISTRY) {
    if (route.deprecated && route.navRefs.length > 0) {
      findings.push({
        type: FINDING_TYPES.DEPRECATED_IN_NAV,
        message: `Route "${route.url}" (${route.name}) is deprecated but still appears in navigation`,
        location: `Nav refs: ${route.navRefs.map(n => n.label).join(', ')}`,
        target: route.url,
        recommendation: `Remove deprecated route from navigation or update its status`,
      });
    }
  }

  return findings;
}

function scanUngatedFeatureRoutes() {
  const findings = [];

  for (const route of ROUTE_REGISTRY) {
    // Protected routes should have feature gates
    if (!route.public && !route.feature && !route.permission) {
      findings.push({
        type: FINDING_TYPES.UNGATED_FEATURE_ROUTE,
        message: `Route "${route.url}" (${route.name}) has no feature gate or permission restriction`,
        location: `Route: ${route.url}`,
        target: route.url,
        recommendation: `Consider adding a feature gate or permission check`,
      });
    }
  }

  return findings;
}

// ═══════════════════════════════════════════════════════════
// MAIN AUDIT RUNNER
// ═══════════════════════════════════════════════════════════

export function runUXAudit() {
  const allFindings = [
    ...scanDeadLinks(),
    ...scanOrphanPages(),
    ...scanDuplicates(),
    ...scanMissingComponents(),
    ...scanDeprecatedInNav(),
    ...scanUngatedFeatureRoutes(),
  ];

  // Compute severity breakdown
  const bySeverity = { critical: 0, error: 0, warning: 0, info: 0 };
  const byType = {};

  for (const f of allFindings) {
    bySeverity[f.type.severity] = (bySeverity[f.type.severity] || 0) + 1;
    byType[f.type.id] = (byType[f.type.id] || 0) + 1;
  }

  // Compute UX Health Score (100 - weighted deductions, clamped to 0)
  const totalDeduction = allFindings.reduce(
    (sum, f) => sum + (SEVERITY_WEIGHTS[f.type.severity] || 0),
    0
  );
  const healthScore = Math.max(0, 100 - totalDeduction);

  // Determine pass/fail
  const blockingIssues = allFindings.filter(
    f => f.type.severity === 'critical' || f.type.severity === 'error'
  ).length;

  return {
    auditVersion: AUDIT_VERSION,
    auditedAt: new Date().toISOString(),
    totalRoutes: ROUTE_REGISTRY.length,
    totalNavItems: ALL_NAV_ITEMS.length,
    totalFindings: allFindings.length,
    findings: allFindings,
    bySeverity,
    byType,
    healthScore,
    blockingIssues,
    passed: blockingIssues === 0,
    qualityGates: {
      noDeadLinks: byType.dead_link === 0 || !byType.dead_link,
      noOrphanPages: byType.orphan_page === 0 || !byType.orphan_page,
      noDuplicates: byType.duplicate_route === 0 || !byType.duplicate_route,
      noMissingComponents: byType.missing_component === 0 || !byType.missing_component,
      noDeprecatedInNav: byType.deprecated_in_nav === 0 || !byType.deprecated_in_nav,
    },
  };
}

export { FINDING_TYPES, SEVERITY_WEIGHTS };