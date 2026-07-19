/**
 * UX Audit Engine™ v2.0 — Navigation Intelligence™
 *
 * Redesigned to validate route GOVERNANCE instead of assuming
 * every route must appear in platform navigation.
 *
 * Routes are classified via the Route Registry™ into types:
 *   primary_navigation, secondary_navigation, context_route,
 *   detail_route, modal_route, drawer_route, wizard_step,
 *   hidden_system_route, admin_route, developer_route,
 *   enterprise_route, internal_api_route, auth_route, coming_soon
 *
 * Only meaningful issues are reported:
 *   - Dead links (nav → non-existent route)
 *   - Routes with no classification
 *   - Primary/Secondary routes missing from navigation (true orphans)
 *   - Detail routes with no parent
 *   - Duplicate routes
 *   - Routes missing components
 *   - Deprecated routes still in active navigation
 *   - Routes with incomplete metadata
 */

import { ROUTE_REGISTRY, routeMatches, ROUTE_CLASSIFICATIONS } from './routeRegistry';
import { WORKSPACE_NAV, FOOTER_NAV } from './workspaces';

const ALL_NAV_ITEMS = [
  ...Object.values(WORKSPACE_NAV).flat().flatMap(group =>
    (group.items || []).map(item => ({
      ...item,
      group: group.label,
    }))
  ),
  ...FOOTER_NAV.flatMap(group =>
    (group.items || []).map(item => ({
      ...item,
      group: group.label,
    }))
  ),
];

const AUDIT_VERSION = '2.0';

// ═══════════════════════════════════════════════════════════
// FINDING TYPES
// ═══════════════════════════════════════════════════════════

const FINDING_TYPES = {
  dead_link: { id: 'dead_link', label: 'Dead Link', severity: 'critical', icon: 'Unlink' },
  unclassified_route: { id: 'unclassified_route', label: 'Unclassified Route', severity: 'warning', icon: 'Tag' },
  orphan_nav_route: { id: 'orphan_nav_route', label: 'Navigation Route Missing from Nav', severity: 'warning', icon: 'FileQuestion' },
  missing_parent: { id: 'missing_parent', label: 'Detail Route Missing Parent', severity: 'warning', icon: 'GitBranch' },
  duplicate_route: { id: 'duplicate_route', label: 'Duplicate Route', severity: 'error', icon: 'Copy' },
  missing_component: { id: 'missing_component', label: 'Missing Component', severity: 'error', icon: 'AlertTriangle' },
  deprecated_in_nav: { id: 'deprecated_in_nav', label: 'Deprecated in Navigation', severity: 'warning', icon: 'AlertCircle' },
  incomplete_metadata: { id: 'incomplete_metadata', label: 'Incomplete Route Metadata', severity: 'info', icon: 'Info' },
};

// ── Configurable Scoring Weights ──
// Critical issues have the highest impact; warnings are minimal;
// info findings never reduce the score.
const SCORING_CONFIG = {
  severityWeights: {
    critical: 20,
    error: 10,
    warning: 1,
    info: 0,
  },
  gateBonusPerPassed: 0.5,
  gateBonusMax: 5,
};

const SEVERITY_WEIGHTS = SCORING_CONFIG.severityWeights;

const HEALTH_GRADES = [
  { grade: 'A', min: 90, color: 'emerald', label: 'Excellent' },
  { grade: 'B', min: 80, color: 'amber', label: 'Good' },
  { grade: 'C', min: 70, color: 'orange', label: 'Fair' },
  { grade: 'D', min: 60, color: 'red', label: 'Poor' },
  { grade: 'F', min: 0, color: 'red', label: 'Critical' },
];

function computeHealthGrade(score) {
  return HEALTH_GRADES.find(g => score >= g.min) || HEALTH_GRADES[HEALTH_GRADES.length - 1];
}

function computeReleaseImpact(score, blockingIssues) {
  if (blockingIssues > 0) return { label: 'Blocked', color: 'red', description: `${blockingIssues} blocking issue(s) must be resolved before release` };
  if (score >= 90) return { label: 'Release Ready', color: 'emerald', description: 'Platform meets all quality standards for release' };
  if (score >= 75) return { label: 'Ready with Minor Issues', color: 'amber', description: 'Non-blocking issues should be addressed post-release' };
  return { label: 'Needs Attention', color: 'orange', description: 'Address remaining issues before scheduling release' };
}

function buildExecutiveSummary(audit, healthScore, blockingIssues) {
  const grade = computeHealthGrade(healthScore);
  const gatesPassed = Object.values(audit.qualityGates).filter(Boolean).length;
  const gatesTotal = Object.keys(audit.qualityGates).length;
  const remainingWarnings = audit.bySeverity.warning || 0;
  const releaseImpact = computeReleaseImpact(healthScore, blockingIssues);

  const recommendations = [];
  if (audit.bySeverity.critical > 0) recommendations.push(`Resolve ${audit.bySeverity.critical} critical issue(s) — these block release`);
  if (audit.bySeverity.error > 0) recommendations.push(`Fix ${audit.bySeverity.error} error(s) in route configuration`);
  if (remainingWarnings > 0) recommendations.push(`Review ${remainingWarnings} warning(s) — non-blocking but should be tracked`);
  if (gatesPassed < gatesTotal) recommendations.push(`Pass ${gatesTotal - gatesPassed} remaining quality gate(s)`);
  if (recommendations.length === 0) recommendations.push('No action required — platform is in excellent health');

  return {
    overallHealth: healthScore,
    healthGrade: grade.grade,
    healthGradeLabel: grade.label,
    healthGradeColor: grade.color,
    qualityGatesPassed: gatesPassed,
    qualityGatesTotal: gatesTotal,
    remainingWarnings,
    releaseImpact,
    recommendedActions: recommendations,
  };
}

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
        type: FINDING_TYPES.dead_link,
        message: `Navigation "${navItem.label}" links to "${navItem.path}" which is not a registered route`,
        location: `Nav: ${navItem.group} → ${navItem.label}`,
        target: navItem.path,
        recommendation: `Add a route for "${navItem.path}" or update the navigation link`,
      });
    }
  }

  return findings;
}

// ── NEW: Classification-based orphan detection ──
// Only flags routes that SHOULD be in navigation (primary/secondary)
// but aren't. Context, detail, admin, developer, enterprise routes
// are intentionally not in nav — they don't generate warnings.
function scanOrphanNavRoutes() {
  const findings = [];

  for (const route of ROUTE_REGISTRY) {
    if (!route.needsNav) continue;
    if (route.url === '/' || route.url === '/onboarding') continue;

    if (!route.navRefs || route.navRefs.length === 0) {
      findings.push({
        type: FINDING_TYPES.orphan_nav_route,
        message: `Route "${route.url}" (${route.name}) is classified as ${route.navTypeLabel} but has no navigation references`,
        location: `Route: ${route.url} [${route.navTypeLabel}]`,
        target: route.url,
        recommendation: `Add "${route.name}" to a navigation group, or reclassify it as a context_route if intentionally hidden`,
      });
    }
  }

  return findings;
}

function scanUnclassifiedRoutes() {
  const findings = [];

  for (const route of ROUTE_REGISTRY) {
    if (!route.navType) {
      findings.push({
        type: FINDING_TYPES.unclassified_route,
        message: `Route "${route.url}" (${route.name}) has no navigation classification`,
        location: `Route: ${route.url}`,
        target: route.url,
        recommendation: `Add a navType classification in the Route Registry`,
      });
    }
  }

  return findings;
}

function scanMissingParent() {
  const findings = [];
  const routePaths = ROUTE_REGISTRY.map(r => r.url);

  for (const route of ROUTE_REGISTRY) {
    if (route.navType !== 'detail_route') continue;
    if (!route.parentRoute) {
      findings.push({
        type: FINDING_TYPES.missing_parent,
        message: `Detail route "${route.url}" (${route.name}) has no identifiable parent route`,
        location: `Route: ${route.url}`,
        target: route.url,
        recommendation: `Ensure a parent list/index route exists for this detail page`,
      });
    } else {
      const parentExists = routePaths.some(rp => routeMatches(rp, route.parentRoute));
      if (!parentExists) {
        findings.push({
          type: FINDING_TYPES.missing_parent,
          message: `Detail route "${route.url}" references parent "${route.parentRoute}" which is not registered`,
          location: `Route: ${route.url} → Parent: ${route.parentRoute}`,
          target: route.parentRoute,
          recommendation: `Register the parent route "${route.parentRoute}" or fix the parent path`,
        });
      }
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
        type: FINDING_TYPES.duplicate_route,
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
        type: FINDING_TYPES.missing_component,
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
        type: FINDING_TYPES.deprecated_in_nav,
        message: `Route "${route.url}" (${route.name}) is deprecated but still appears in navigation`,
        location: `Nav refs: ${route.navRefs.map(n => n.label).join(', ')}`,
        target: route.url,
        recommendation: `Remove deprecated route from navigation or update its status`,
      });
    }
  }

  return findings;
}

function scanIncompleteMetadata() {
  const findings = [];

  for (const route of ROUTE_REGISTRY) {
    const missing = [];
    if (!route.routeId) missing.push('routeId');
    if (!route.name || route.name === route.url) missing.push('name');
    if (!route.workspace) missing.push('workspace');
    if (!route.navType) missing.push('navType');
    if (!route.visibility) missing.push('visibility');
    if (!route.requiredRole) missing.push('requiredRole');

    if (missing.length > 0) {
      findings.push({
        type: FINDING_TYPES.incomplete_metadata,
        message: `Route "${route.url}" is missing metadata: ${missing.join(', ')}`,
        location: `Route: ${route.url}`,
        target: route.url,
        recommendation: `Complete the route metadata in the Route Registry`,
      });
    }
  }

  return findings;
}

// ═══════════════════════════════════════════════════════════
// NAVIGATION REPORT
// ═══════════════════════════════════════════════════════════

function buildNavigationReport(findings) {
  const byClassification = {};
  for (const route of ROUTE_REGISTRY) {
    byClassification[route.navType] = (byClassification[route.navType] || 0) + 1;
  }

  const orphanFindings = findings.filter(f => f.type.id === 'orphan_nav_route');
  const metadataFindings = findings.filter(f => f.type.id === 'incomplete_metadata');

  return {
    totalRoutes: ROUTE_REGISTRY.length,
    primaryRoutes: byClassification.primary_navigation || 0,
    secondaryRoutes: byClassification.secondary_navigation || 0,
    contextRoutes: byClassification.context_route || 0,
    detailRoutes: byClassification.detail_route || 0,
    hiddenRoutes: byClassification.hidden_system_route || 0,
    enterpriseRoutes: byClassification.enterprise_route || 0,
    developerRoutes: byClassification.developer_route || 0,
    adminRoutes: byClassification.admin_route || 0,
    authRoutes: byClassification.auth_route || 0,
    wizardRoutes: byClassification.wizard_step || 0,
    orphanRoutes: orphanFindings.length,
    routesMissingMetadata: metadataFindings.length,
    footerRoutes: ROUTE_REGISTRY.filter(r => r.navRefs?.some(n => n.group === 'Footer Navigation')).length,
    byClassification,
  };
}

// ═══════════════════════════════════════════════════════════
// MAIN AUDIT RUNNER
// ═══════════════════════════════════════════════════════════

export function runUXAudit() {
  const allFindings = [
    ...scanDeadLinks(),
    ...scanOrphanNavRoutes(),
    ...scanUnclassifiedRoutes(),
    ...scanMissingParent(),
    ...scanDuplicates(),
    ...scanMissingComponents(),
    ...scanDeprecatedInNav(),
    ...scanIncompleteMetadata(),
  ];

  const bySeverity = { critical: 0, error: 0, warning: 0, info: 0 };
  const byType = {};

  for (const f of allFindings) {
    bySeverity[f.type.severity] = (bySeverity[f.type.severity] || 0) + 1;
    byType[f.type.id] = (byType[f.type.id] || 0) + 1;
  }

  // ── Calibrated Health Score ──
  // Deductions are proportional to severity; info findings never reduce score.
  const totalDeduction = allFindings.reduce(
    (sum, f) => sum + (SCORING_CONFIG.severityWeights[f.type.severity] || 0),
    0
  );

  // Quality gate bonus — each passed gate adds confidence, capped.
  const gatesPassedCount = Object.values({
    noDeadLinks: !byType.dead_link,
    noOrphanNavRoutes: !byType.orphan_nav_route,
    noUnclassifiedRoutes: !byType.unclassified_route,
    noMissingParents: !byType.missing_parent,
    noDuplicates: !byType.duplicate_route,
    noMissingComponents: !byType.missing_component,
    noDeprecatedInNav: !byType.deprecated_in_nav,
    noIncompleteMetadata: !byType.incomplete_metadata,
  }).filter(Boolean).length;

  const gateBonus = Math.min(
    gatesPassedCount * SCORING_CONFIG.gateBonusPerPassed,
    SCORING_CONFIG.gateBonusMax
  );

  const healthScore = Math.max(0, Math.min(100, Math.round((100 - totalDeduction + gateBonus) * 10) / 10));

  const blockingIssues = allFindings.filter(
    f => f.type.severity === 'critical' || f.type.severity === 'error'
  ).length;

  // ── Footer pages validation ──
  const REQUIRED_FOOTER_PATHS = ['/pricing', '/about', '/contact', '/legal', '/trust-center'];
  const footerPagesRegistered = REQUIRED_FOOTER_PATHS.every(path => {
    const route = ROUTE_REGISTRY.find(r => r.url === path);
    return route && route.navRefs && route.navRefs.length > 0;
  });

  const navigationReport = buildNavigationReport(allFindings);

  const qualityGates = {
    noDeadLinks: !byType.dead_link,
    noOrphanNavRoutes: !byType.orphan_nav_route,
    noUnclassifiedRoutes: !byType.unclassified_route,
    noMissingParents: !byType.missing_parent,
    noDuplicates: !byType.duplicate_route,
    noMissingComponents: !byType.missing_component,
    noDeprecatedInNav: !byType.deprecated_in_nav,
    noIncompleteMetadata: !byType.incomplete_metadata,
    footerPagesRegistered,
  };

  const executiveSummary = buildExecutiveSummary(
    { qualityGates, bySeverity },
    healthScore,
    blockingIssues
  );

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
    qualityGates,
    navigationReport,
    routeClassifications: ROUTE_CLASSIFICATIONS,
    scoringConfig: SCORING_CONFIG,
    executiveSummary,
  };
}

export { FINDING_TYPES, SEVERITY_WEIGHTS, ROUTE_CLASSIFICATIONS, SCORING_CONFIG };