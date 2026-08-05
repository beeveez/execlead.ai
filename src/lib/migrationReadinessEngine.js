// Migration Readiness Engine™
// Phase 1 — Platform Dependency Audit (Migration Dependency Report).
// Phase 9 — Migration Health Dashboard™ scoring across all categories.
// Honest baseline reflecting the current codebase; scores rise as consumers
// migrate onto the abstraction layers.

export const READINESS_TARGET = 95;

export const READINESS_CATEGORIES = [
  { key: 'dependency_audit', label: 'Dependency Audit', phase: 1, target: 95, description: 'Phase 1 audit of direct platform references.' },
  { key: 'platform_coupling', label: 'Platform Coupling', phase: '—', target: 95, description: 'Inverse of direct Base44 coupling from UI.' },
  { key: 'repository_coverage', label: 'Repository Coverage', phase: 3, target: 95, description: 'Data access routed through Repository Layer™.' },
  { key: 'service_coverage', label: 'Service Coverage', phase: 2, target: 95, description: 'Business logic behind Platform Services Layer™.' },
  { key: 'prompt_registry', label: 'Prompt Registry Coverage', phase: 5, target: 95, description: 'Prompts centralized in Prompt Registry™.' },
  { key: 'configuration', label: 'Configuration Coverage', phase: 7, target: 95, description: 'Config centralized in Configuration Registry™.' },
  { key: 'event_adoption', label: 'Event Adoption', phase: 8, target: 95, description: 'Module-to-module via platform events.' },
  { key: 'exec_context', label: 'Executive Context Adoption', phase: 6, target: 95, description: 'AI consumes only ExecutiveContextService™.' },
];

// Phase 1 — Dependency Audit findings (representative baseline of the current codebase).
export const DEPENDENCY_AUDIT = [
  { id: 'DEP-001', type: 'entity', classification: 'Critical', location: '150+ pages/components', description: 'Direct base44.entities.<X> CRUD calls from UI components (Dashboard, Coach, Simulator, Landing, Profile, etc.).', status: 'open', recommendation: 'Route through Repository Layer™ (Phase 3) + Platform Services (Phase 2).' },
  { id: 'DEP-002', type: 'ai', classification: 'Critical', location: 'Coach, Simulator, Concierge, ai.js, simulationIntelligenceEngine', description: 'Direct base44.integrations.Core.InvokeLLM calls with inline prompts.', status: 'open', recommendation: 'Route through AIService™ (Phase 4) + Prompt Registry™ (Phase 5).' },
  { id: 'DEP-003', type: 'auth', classification: 'Medium', location: 'AuthContext, many pages', description: 'Direct base44.auth.me/isAuthenticated/updateMe/logout calls.', status: 'partial', recommendation: 'Wrap in UserService™ (Phase 2). Auth backend stays Base44.' },
  { id: 'DEP-004', type: 'storage', classification: 'Medium', location: 'Resume, Identity, Evidence flows', description: 'Direct UploadFile + localStorage usage.', status: 'open', recommendation: 'Route file ops through a StorageService™; keep Base44 as backend.' },
  { id: 'DEP-005', type: 'config', classification: 'Low', location: 'launchMode, modelRouterEngine, featureCatalog', description: 'Hard-coded provider/model/feature configuration.', status: 'open', recommendation: 'Centralize in Configuration Registry™ (Phase 7).' },
  { id: 'DEP-006', type: 'connector', classification: 'Low', location: 'Airtable/Gmail backend functions', description: 'Direct connector usage in backend functions.', status: 'acceptable', recommendation: 'Already isolated in backend functions; keep as-is.' },
];

// Layer existence flags — true once the abstraction module ships.
const LAYER_FLAGS = {
  repository_layer: true,
  ai_service: true,
  prompt_registry: true,
  configuration_registry: true,
  platform_services: false,
  exec_context_engine: true,
  event_bus: true,
};

// Baseline adoption ratios (fraction of consumers migrated onto each layer).
const ADOPTION = {
  repository_consumers: 0.0,
  service_consumers: 0.0,
  prompt_consumers: 0.0,
  config_consumers: 0.2,
  event_consumers: 0.25,
  exec_context_consumers: 0.35,
};

const pct = (n) => Math.round(n * 100);

export function getCategoryScores() {
  return READINESS_CATEGORIES.map((c) => {
    let score = 0;
    switch (c.key) {
      case 'dependency_audit': score = 100; break;
      case 'platform_coupling': score = 15; break;
      case 'repository_coverage': score = LAYER_FLAGS.repository_layer ? Math.max(5, pct(ADOPTION.repository_consumers)) : 0; break;
      case 'service_coverage': score = LAYER_FLAGS.platform_services ? pct(ADOPTION.service_consumers) : 0; break;
      case 'prompt_registry': score = LAYER_FLAGS.prompt_registry ? Math.max(10, pct(ADOPTION.prompt_consumers)) : 0; break;
      case 'configuration': score = pct(ADOPTION.config_consumers); break;
      case 'event_adoption': score = LAYER_FLAGS.event_bus ? pct(ADOPTION.event_consumers) : 0; break;
      case 'exec_context': score = LAYER_FLAGS.exec_context_engine ? pct(ADOPTION.exec_context_consumers) : 0; break;
      default: score = 0;
    }
    const gap = Math.max(0, c.target - score);
    const status = score >= c.target ? 'on_target' : score >= c.target * 0.6 ? 'in_progress' : 'at_risk';
    return { ...c, score, gap, status };
  });
}

export function getOverallReadiness() {
  const cats = getCategoryScores();
  const avg = Math.round(cats.reduce((s, c) => s + c.score, 0) / cats.length);
  return { score: avg, target: READINESS_TARGET, gap: Math.max(0, READINESS_TARGET - avg) };
}

export function getDependencyReport() {
  const groups = { Critical: [], Medium: [], Low: [] };
  DEPENDENCY_AUDIT.forEach((d) => { (groups[d.classification] || groups.Low).push(d); });
  const summary = {
    total: DEPENDENCY_AUDIT.length,
    critical: groups.Critical.length,
    medium: groups.Medium.length,
    low: groups.Low.length,
    open: DEPENDENCY_AUDIT.filter((d) => d.status === 'open').length,
    partial: DEPENDENCY_AUDIT.filter((d) => d.status === 'partial').length,
    acceptable: DEPENDENCY_AUDIT.filter((d) => d.status === 'acceptable').length,
  };
  return { groups, summary };
}

export const MIGRATION_PHASES = [
  { phase: 1, name: 'Platform Dependency Audit', status: 'complete' },
  { phase: 2, name: 'Platform Services Layer™', status: 'not_started' },
  { phase: 3, name: 'Repository Layer™', status: 'scaffolded' },
  { phase: 4, name: 'AI Abstraction (AIService™)', status: 'scaffolded' },
  { phase: 5, name: 'Prompt Registry™', status: 'scaffolded' },
  { phase: 6, name: 'Executive Context Engine™', status: 'partial' },
  { phase: 7, name: 'Configuration Registry™', status: 'scaffolded' },
  { phase: 8, name: 'Event Architecture', status: 'partial' },
  { phase: 9, name: 'Migration Health Dashboard™', status: 'complete' },
];

export default {
  READINESS_TARGET, READINESS_CATEGORIES, DEPENDENCY_AUDIT, MIGRATION_PHASES,
  getCategoryScores, getOverallReadiness, getDependencyReport,
};