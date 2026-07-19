/**
 * Interactive Component Migration Registry™
 *
 * Defines the canonical mapping between legacy component patterns
 * and the shared Interactive* components that replace them.
 *
 * Used by the Interactive Component Migration Report dashboard.
 */

export const INTERACTIVE_COMPONENTS = [
  { name: 'InteractiveCard™', file: 'InteractiveCard.jsx', replaces: ['Card (interactive)', 'motion.div cards', 'dashboard cards'], status: 'available', purpose: 'Full-card click surface for navigation, modals, drawers, actions' },
  { name: 'InteractiveMetric™', file: 'InteractiveMetric.jsx', replaces: ['MetricCard', 'KPI cards', 'score displays'], status: 'available', purpose: 'Universal Metric Intelligence™ — every metric opens a drill-down' },
  { name: 'InteractiveWidget™', file: 'InteractiveWidget.jsx', replaces: ['WidgetCard', 'dashboard widgets', 'summary panels'], status: 'available', purpose: 'Universal dashboard widget — entire surface clickable' },
  { name: 'InteractiveChart™', file: 'InteractiveChart.jsx', replaces: ['chart wrappers', 'analytics panels'], status: 'available', purpose: 'Every chart opens a detailed analysis view' },
  { name: 'InteractiveTimeline™', file: 'InteractiveTimeline.jsx', replaces: ['timeline items', 'history rows'], status: 'available', purpose: 'Every timeline event is clickable' },
  { name: 'InteractiveProgress™', file: 'InteractiveProgress.jsx', replaces: ['ProgressCard', 'progress bars', 'health indicators'], status: 'available', purpose: 'Every progress bar opens a breakdown' },
  { name: 'InteractiveArticle™', file: 'InteractiveArticle.jsx', replaces: ['ArticleCard', 'content cards'], status: 'available', purpose: 'Every article card opens the full article' },
  { name: 'InteractiveRoadmap™', file: 'InteractiveRoadmap.jsx', replaces: ['RoadmapCard', 'milestone cards'], status: 'available', purpose: 'Every roadmap item opens detail' },
  { name: 'InteractiveInsight™', file: 'InteractiveInsight.jsx', replaces: ['InsightCard', 'recommendation cards'], status: 'available', purpose: 'Every AI insight is actionable' },
];

export const LEGACY_PATTERNS = [
  { pattern: '<MetricCard>', replacement: '<InteractiveMetric>', severity: 'error', status: 'enforced' },
  { pattern: '<ProgressCard>', replacement: '<InteractiveProgress>', severity: 'error', status: 'enforced' },
  { pattern: '<WidgetCard>', replacement: '<InteractiveWidget>', severity: 'error', status: 'enforced' },
  { pattern: '<InsightCard>', replacement: '<InteractiveInsight>', severity: 'error', status: 'enforced' },
  { pattern: '<RoadmapCard>', replacement: '<InteractiveRoadmap>', severity: 'error', status: 'enforced' },
  { pattern: '<ArticleCard>', replacement: '<InteractiveArticle>', severity: 'error', status: 'enforced' },
  { pattern: '<Card> (interactive)', replacement: '<InteractiveWidget>', severity: 'warning', status: 'review' },
  { pattern: 'motion.div (clickable)', replacement: '<InteractiveCard>', severity: 'warning', status: 'review' },
];

export const MIGRATION_TARGETS = [
  // ── Landing Page ──
  { workspace: 'Marketing Website', page: 'Landing.jsx', route: '/', status: 'in_progress', components: ['Feature Cards → InteractiveCard', 'Journey Cards → InteractiveCard', 'Learning Path Pills → InteractiveCard', 'Pricing Tiers → InteractiveCard'], migratedCount: 2, totalCount: 4 },

  // ── Developer Workspace ──
  { workspace: 'Developer Workspace', page: 'PlatformHardeningDashboard.jsx', route: '/developer/hardening', status: 'migrated', components: ['Domain Score Grid (already interactive)', 'Quality Gate List', 'Issue Summary Bar'], migratedCount: 3, totalCount: 3 },
  { workspace: 'Developer Workspace', page: 'UXAuditReport.jsx', route: '/developer/ux-audit', status: 'migrated', components: ['Finding Cards (expandable)', 'Quality Gate Chips'], migratedCount: 2, totalCount: 2 },
  { workspace: 'Developer Workspace', page: 'DeveloperConsole.jsx', route: '/developer', status: 'in_progress', components: ['Workspace Modules Grid', 'Diagnostic Panels'], migratedCount: 1, totalCount: 2 },

  // ── Operations Workspace ──
  { workspace: 'Operations Workspace', page: 'ProductCommandCenter.jsx', route: '/operations', status: 'in_progress', components: ['Metric Cards', 'Domain Navigation Cards'], migratedCount: 0, totalCount: 2 },

  // ── Founder Workspace ──
  { workspace: 'Founder Workspace', page: 'FounderOverview.jsx', route: '/founder', status: 'in_progress', components: ['Benefit Cards', 'Quick Access Links'], migratedCount: 0, totalCount: 2 },

  // ── Executive Workspace ──
  { workspace: 'Executive Workspace', page: 'Dashboard.jsx', route: '/dashboard', status: 'in_progress', components: ['Score Cards', 'Recommendation Cards', 'Timeline Items'], migratedCount: 0, totalCount: 3 },

  // ── Enterprise Workspace ──
  { workspace: 'Enterprise Workspace', page: 'EnterpriseCommandCenter.jsx', route: '/enterprise/command-center', status: 'pending', components: ['Domain Cards', 'KPI Cards'], migratedCount: 0, totalCount: 2 },
];

export function getMigrationStats() {
  const total = MIGRATION_TARGETS.reduce((sum, t) => sum + t.totalCount, 0);
  const migrated = MIGRATION_TARGETS.reduce((sum, t) => sum + t.migratedCount, 0);
  const inProgress = MIGRATION_TARGETS.filter(t => t.status === 'in_progress').length;
  const pending = MIGRATION_TARGETS.filter(t => t.status === 'pending').length;
  const fullyMigrated = MIGRATION_TARGETS.filter(t => t.status === 'migrated').length;
  const completionRate = total > 0 ? Math.round((migrated / total) * 100) : 0;

  return {
    totalTargets: MIGRATION_TARGETS.length,
    totalComponents: total,
    migratedComponents: migrated,
    completionRate,
    inProgress,
    pending,
    fullyMigrated,
    availableInteractiveComponents: INTERACTIVE_COMPONENTS.length,
    enforcedPatterns: LEGACY_PATTERNS.filter(p => p.status === 'enforced').length,
  };
}