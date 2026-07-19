/**
 * EXECLEAD.AI — PLATFORM HARDENING ENGINE™
 * ============================================================
 * Version 1.0 · Priority: P0 · Status: Release Blocking
 *
 * Aggregates 5 hardening domains (UX, Performance, Security,
 * Testing, Stability) into a single hardening assessment with
 * automated quality gates that block RC2 expansion until passed.
 *
 * Consumes LIVE scores from existing platform engines — no
 * independent health calculations. Domains without automated
 * telemetry are honestly marked as "pending audit" rather than
 * fabricated.
 *
 * SUCCESS CRITERIA — Platform is Hardening-Ready when:
 *   • Guardian™ Validation ≥ 95%
 *   • Platform Health ≥ 95%
 *   • Rollout Readiness ≥ 95%
 *   • No Critical Bugs
 *   • No High Severity Security Issues
 *   • No Memory Leaks
 *   • No Critical Performance Bottlenecks
 *   • AI Quality Verified
 *   • Knowledge Synchronization Healthy
 *   • Test Pass Rate ≥ 98%
 *   • Accessibility WCAG AA Compliant
 *   • Lighthouse ≥ 95
 */

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

export const HARDENING_DOMAINS = [
  {
    id: 'ux', name: 'UX Refinement', weight: 20, target: 95, phase: 1,
    icon: 'Palette',
    description: 'Visual consistency, responsiveness, accessibility, navigation, empty/loading/error/success states, keyboard navigation, color contrast, EXEC™ Cursor behavior, microinteractions',
    deepLink: '/developer/experience-audit',
  },
  {
    id: 'performance', name: 'Performance Optimization', weight: 20, target: 95, phase: 2,
    icon: 'Gauge',
    description: 'Initial page load, route transitions, API latency, database response, AI response time, bundle size, Lighthouse ≥95, FCP <2s, LCP <2.5s, INP <200ms',
    deepLink: '/developer/performance',
  },
  {
    id: 'security', name: 'Security Validation', weight: 25, target: 95, phase: 3,
    icon: 'ShieldCheck',
    description: 'Authentication, authorization, RBAC, founder permissions, session handling, JWT, input/output validation, CSRF/XSS/injection protection, rate limiting, secrets management, audit logging, OWASP Top 10',
    deepLink: '/developer/security-intelligence',
  },
  {
    id: 'testing', name: 'Comprehensive Testing', weight: 20, target: 98, phase: 4,
    icon: 'FlaskConical',
    description: 'Unit, integration, end-to-end, regression, cross-browser, accessibility, stress, load, concurrency, security, negative, and AI workflow testing across every module, API, dashboard, metric, and flow',
    deepLink: '/developer/diagnostics',
  },
  {
    id: 'stability', name: 'Platform Stability', weight: 15, target: 95, phase: 5,
    icon: 'Activity',
    description: '72-hour continuous monitoring: memory leaks, unhandled exceptions, API failures, sync failures, background jobs, queue processing, automation execution, notification delivery, database health, crash rate, recovery time, availability',
    deepLink: '/developer/stability',
  },
];

export const QUALITY_GATES = [
  { id: 'guardian', label: 'Guardian™ Validation ≥ 95%', metric: 'guardianScore', threshold: 95, operator: 'gte', deepLink: '/guardian' },
  { id: 'platform_health', label: 'Platform Health ≥ 95%', metric: 'platformHealth', threshold: 95, operator: 'gte', deepLink: '/developer/stability' },
  { id: 'rollout_readiness', label: 'Rollout Readiness ≥ 95%', metric: 'rolloutReadiness', threshold: 95, operator: 'gte', deepLink: '/founder/lifecycle' },
  { id: 'no_critical_bugs', label: 'No Critical Bugs', metric: 'criticalBugs', threshold: 0, operator: 'eq' },
  { id: 'no_high_security', label: 'No High Severity Security Issues', metric: 'highSecurityIssues', threshold: 0, operator: 'eq', deepLink: '/developer/security-intelligence' },
  { id: 'no_memory_leaks', label: 'No Memory Leaks', metric: 'memoryLeaks', threshold: 0, operator: 'eq' },
  { id: 'no_perf_bottlenecks', label: 'No Critical Performance Bottlenecks', metric: 'criticalPerfBottlenecks', threshold: 0, operator: 'eq' },
  { id: 'ai_quality', label: 'AI Quality Verified', metric: 'aiQualityVerified', threshold: true, operator: 'eq', deepLink: '/developer/ai-optimization' },
  { id: 'knowledge_sync', label: 'Knowledge Synchronization Healthy', metric: 'knowledgeSyncHealthy', threshold: true, operator: 'eq', deepLink: '/developer/knowledge-sync' },
  { id: 'test_pass_rate', label: 'Test Pass Rate ≥ 98%', metric: 'testPassRate', threshold: 98, operator: 'gte' },
  { id: 'accessibility', label: 'Accessibility WCAG AA Compliant', metric: 'accessibilityWCAGAA', threshold: true, operator: 'eq' },
  { id: 'lighthouse', label: 'Lighthouse ≥ 95', metric: 'lighthouseScore', threshold: 95, operator: 'gte' },
];

export const RELEASE_READINESS = {
  ready: { label: 'Ready', color: 'emerald', textColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', description: 'All quality gates passed — platform approved for RC2 expansion' },
  conditionally_ready: { label: 'Conditionally Ready', color: 'amber', textColor: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', description: 'No failed gates — pending metrics require completion before approval' },
  blocked: { label: 'Blocked', color: 'red', textColor: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', description: 'One or more quality gates failed — RC2 expansion blocked until resolved' },
};

export const HARDENING_PHASES = [
  { phase: 1, name: 'UX Refinement', status: 'audit', items: ['Landing Page', 'Dashboard', 'Executive Workspace', 'Developer Workspace', 'Founder Workspace', 'Operations Workspace', 'Enterprise Workspace', 'Authentication', 'Pricing', 'Journey', 'Executive Coach™', 'Skills Intelligence™', 'Leadership DNA™', 'Career Intelligence™', 'Resume AI™', 'Executive Simulator™', 'Guardian™', 'Founder Governance™', 'Platform Activity Center™', 'Settings'] },
  { phase: 2, name: 'Performance Optimization', status: 'audit', items: ['Lazy loading', 'Code splitting', 'Image optimization', 'Component memoization', 'Virtual scrolling', 'Cache strategy', 'Request deduplication', 'Database indexing', 'AI request batching', 'Background processing'] },
  { phase: 3, name: 'Security Validation', status: 'audit', items: ['Authentication', 'Authorization', 'RBAC', 'Founder permissions', 'Session handling', 'JWT', 'API validation', 'Input validation', 'Output encoding', 'CSRF protection', 'XSS protection', 'SQL/NoSQL injection', 'Rate limiting', 'Secrets management', 'Audit logging', 'OWASP Top 10'] },
  { phase: 4, name: 'Comprehensive Testing', status: 'audit', items: ['Unit Testing', 'Integration Testing', 'End-to-End Testing', 'Regression Testing', 'Cross-browser Testing', 'Accessibility Testing', 'Stress Testing', 'Load Testing', 'Concurrency Testing', 'Security Testing', 'Negative Testing', 'AI Workflow Testing'] },
  { phase: 5, name: 'Platform Stability', status: 'audit', items: ['72-hour continuous monitoring', 'Memory leaks', 'Unhandled exceptions', 'API failures', 'Synchronization failures', 'Background jobs', 'Queue processing', 'Automation execution', 'Notification delivery', 'Database health', 'Crash rate', 'Recovery time', 'Availability'] },
];

function evaluateGate(gate, value) {
  if (value === undefined || value === null) {
    return { ...gate, passed: false, pending: true, value: null };
  }
  let passed = false;
  switch (gate.operator) {
    case 'gte': passed = value >= gate.threshold; break;
    case 'eq': passed = value === gate.threshold; break;
    case 'lte': passed = value <= gate.threshold; break;
    default: passed = false;
  }
  return { ...gate, passed, pending: false, value };
}

/**
 * Compute the full Platform Hardening assessment.
 *
 * @param {Object} inputs — metrics from all platform engines
 * @returns {Object} Full hardening state with domains, gates, issues, release readiness
 */
export function computeHardeningAssessment(inputs) {
  // ── Domain Scores ──
  const domains = HARDENING_DOMAINS.map((d) => {
    const score = inputs[`${d.id}Score`];
    const pending = score === null || score === undefined;
    const passed = !pending && score >= d.target;
    return {
      ...d,
      score: pending ? null : clamp(score),
      status: pending ? 'pending' : passed ? 'pass' : 'fail',
      pending,
      detail: inputs[`${d.id}Detail`] || null,
    };
  });

  // ── Overall Score (weighted average of available domains only) ──
  const available = domains.filter((d) => !d.pending);
  const totalWeight = available.reduce((s, d) => s + d.weight, 0);
  const overallScore = totalWeight > 0
    ? clamp(available.reduce((s, d) => s + d.score * d.weight, 0) / totalWeight)
    : 0;
  const pendingDomainCount = domains.filter((d) => d.pending).length;

  // ── Quality Gates ──
  const gates = QUALITY_GATES.map((g) => evaluateGate(g, inputs[g.metric]));
  const passedGates = gates.filter((g) => g.passed).length;
  const failedGates = gates.filter((g) => !g.passed && !g.pending).length;
  const pendingGates = gates.filter((g) => g.pending).length;
  const allGatesPassed = failedGates === 0 && pendingGates === 0 && passedGates === gates.length;

  // ── Release Readiness ──
  let releaseReadiness = 'blocked';
  if (allGatesPassed) releaseReadiness = 'ready';
  else if (failedGates === 0 && pendingGates > 0) releaseReadiness = 'conditionally_ready';

  // ── Issues Summary ──
  const issues = {
    openDefects: inputs.openDefects ?? 0,
    criticalIssues: inputs.criticalBugs ?? 0,
    warnings: inputs.warnings ?? 0,
    blockedReleaseItems: failedGates,
  };

  return {
    domains,
    overallScore,
    pendingDomainCount,
    gates,
    passedGates,
    failedGates,
    pendingGates,
    allGatesPassed,
    releaseReadiness,
    issues,
    trend: inputs.trend || [],
    computedAt: new Date().toISOString(),
  };
}