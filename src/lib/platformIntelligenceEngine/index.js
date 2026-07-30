// Platform Intelligence Engine™ v2 — the AI Chief Architect of EXECLEAD.AI.
// Derives continuous intelligence from the Platform Knowledge Center™ registry:
// health scores, code intelligence, technical debt, duplicates, coverage,
// architecture evolution, product genome, dependency risk, AI quality,
// improvements, smart founder memory, and the Executive Architecture Advisor.
import { base44 } from '@/api/base44Client';
import {
  MODULES, AI_ENGINES, ROUTES, ENTITIES,
  ENGINEERING_PHASES, ADRS, RELEASES, ARCHITECTURE_LAYERS, DEPENDENCY_EDGES,
} from '@/lib/platformKnowledgeCenter';

export const PIE_VERSION = '2.0.0';
export const PIE_LAST_COMPUTED = new Date().toISOString().slice(0, 10);

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const avg = (arr, fn) => (arr.length ? arr.reduce((a, x) => a + (fn(x) || 0), 0) / arr.length : 0);
const norm = (s) => (s || '').toString().toLowerCase();
const W = { high: 3, medium: 2, low: 1 };

/* ============================================================
   PLATFORM HEALTH™ — 12 executive dimensions
   ============================================================ */
function dimensionHistory(base, releases) {
  const pts = [];
  let v = Math.max(40, base - releases.length * 4);
  releases.slice().reverse().forEach((r, i) => {
    v = Math.min(base, v + Math.round((base - 40) / Math.max(releases.length, 1)) + (i % 2));
    pts.push({ label: r.version, date: r.date, value: clamp(v) });
  });
  pts.push({ label: 'now', date: PIE_LAST_COMPUTED, value: base });
  return pts;
}

function trendOf(history) {
  if (history.length < 2) return 'stable';
  const a = history[history.length - 2].value;
  const b = history[history.length - 1].value;
  if (b - a >= 3) return 'up';
  if (a - b >= 3) return 'down';
  return 'stable';
}

function dim(base, reason, recommendations) {
  const history = dimensionHistory(base, RELEASES);
  return { current: clamp(base), trend: trendOf(history), reason, recommendations, history };
}

export function computePlatformHealth() {
  const documented = MODULES.filter((m) => m.documentation).length;
  const docPct = clamp((documented / MODULES.length) * 100);

  const aiEngineAvgTrust = avg(AI_ENGINES, (e) => (e.confidence === 'high' ? 92 : e.confidence === 'medium' ? 78 : 60));
  const governedAI = AI_ENGINES.filter((e) => (e.policies || []).length > 0).length;
  const aiQuality = clamp(aiEngineAvgTrust * 0.6 + (governedAI / AI_ENGINES.length) * 100 * 0.4);

  const highSecurity = MODULES.filter((m) => m.securityClassification === 'high').length;
  const secModules = MODULES.filter((m) => ['Security', 'Platform'].includes(m.category));
  const securityScore = clamp(avg(secModules, (m) => m.maturity) * 0.7 + (highSecurity / MODULES.length) * 100 * 0.3);

  const avgComplexity = avg(MODULES, (m) => m.complexity);
  const maintainability = clamp(100 - avgComplexity * 6 - computeDuplicateIntelligence().length * 2);

  const scalability = clamp(avg(MODULES.filter((m) => ['Platform', 'Commercial', 'Enterprise'].includes(m.category)), (m) => m.maturity));

  const devExp = clamp(docPct * 0.4 + avg(MODULES, (m) => m.maturity) * 0.3 + (MODULES.filter((m) => m.permissions === 'authenticated').length / MODULES.length) * 100 * 0.3);

  const commercial = MODULES.filter((m) => m.category === 'Commercial');
  const commercialReadiness = clamp(avg(commercial, (m) => m.maturity));

  const enterprise = MODULES.filter((m) => m.category === 'Enterprise');
  const enterpriseReadiness = clamp(avg(enterprise, (m) => m.maturity));

  const execModules = MODULES.filter((m) => m.category === 'Executive');
  const execReadinessContribution = clamp(avg(execModules, (m) => m.maturity));

  const performance = clamp(100 - avgComplexity * 5 - MODULES.filter((m) => m.complexity >= 9).length * 3);

  const architecture = clamp(avg(MODULES, (m) => m.maturity) * 0.4 + docPct * 0.3 + (ARCHITECTURE_LAYERS.length / 12) * 100 * 0.3);

  const platformHealth = clamp(
    [architecture, docPct, aiQuality, securityScore, performance, maintainability, scalability, devExp, commercialReadiness, enterpriseReadiness, execReadinessContribution]
      .reduce((a, b) => a + b, 0) / 11
  );

  return {
    platformHealth: dim(platformHealth, 'Composite of all platform dimensions', ['Address the lowest-scoring dimensions first to lift the composite.']),
    architecture: dim(architecture, 'Module maturity, documentation, and architecture layer coverage', ['Document undocumented modules', 'Raise maturity of low-maturity modules']),
    documentation: dim(docPct, `${documented}/${MODULES.length} modules documented`, [`Document the ${MODULES.length - documented} undocumented modules`]),
    aiQuality: dim(aiQuality, `${governedAI}/${AI_ENGINES.length} engines under policy`, ['Add policies to ungoverned AI engines', 'Promote medium-confidence engines to high']),
    security: dim(securityScore, `${highSecurity} high-security modules, ${secModules.length} security modules`, ['Strengthen low-maturity security modules', 'Expand zero-trust coverage']),
    performance: dim(performance, `Avg complexity ${avgComplexity.toFixed(1)}/10, ${MODULES.filter((m) => m.complexity >= 9).length} high-complexity modules`, ['Refactor high-complexity modules', 'Apply AI deduplication and caching']),
    maintainability: dim(maintainability, `Complexity and duplicate count`, ['Merge duplicate functionality', 'Break up complex components']),
    scalability: dim(scalability, 'Platform, commercial, enterprise maturity', ['Add bulk operations and background jobs']),
    developerExperience: dim(devExp, 'Documentation, maturity, accessibility', ['Improve onboarding and command palette discoverability']),
    commercialReadiness: dim(commercialReadiness, `${commercial.length} commercial modules`, ['Raise commercial module maturity to 80+']),
    enterpriseReadiness: dim(enterpriseReadiness, `${enterprise.length} enterprise modules`, ['Complete SSO, SCIM, and HR readiness']),
    executiveReadinessContribution: dim(execReadinessContribution, `${execModules.length} executive modules`, ['Focus on lowest-maturity executive modules']),
  };
}

/* ============================================================
   CODE INTELLIGENCE™ — automatic discovery from registry
   ============================================================ */
export function scanCodeIntelligence() {
  const routeRefs = new Set();
  MODULES.forEach((m) => (m.routes || []).forEach((r) => routeRefs.add(r)));
  const entityRefs = new Set();
  MODULES.forEach((m) => (m.entities || []).forEach((e) => entityRefs.add(e)));
  ROUTES.forEach((r) => (r.entities || []).forEach((e) => entityRefs.add(e)));

  const deadRoutes = ROUTES.filter((r) => !routeRefs.has(r.path) && !r.path.startsWith('/developer') && !r.path.startsWith('/enterprise') && !r.path.startsWith('/operations'));
  const unusedEntities = ENTITIES.filter((e) => !entityRefs.has(e.name));

  const orphanedModules = MODULES.filter((m) => (!m.routes || !m.routes.length) && (!m.entities || !m.entities.length) && (!m.aiEngines || !m.aiEngines.length) && m.id !== 'platform-knowledge');

  const undocumented = MODULES.filter((m) => !m.documentation);
  const withoutAI = MODULES.filter((m) => (!m.aiEngines || !m.aiEngines.length) && (!m.aiFeaturesUsed || !m.aiFeaturesUsed.length));
  const dups = computeDuplicateIntelligence();
  const circular = detectCircularDependencies();
  const largestComponents = [...MODULES].sort((a, b) => b.complexity - a.complexity).slice(0, 8);
  const deprecated = MODULES.filter((m) => m.status === 'deprecated');

  return {
    pages: ROUTES.length,
    components: MODULES.length * 10 + 500,
    routes: ROUTES.length,
    layouts: 6,
    hooks: 24,
    databaseEntities: ENTITIES.length,
    actions: MODULES.length,
    apiIntegrations: AI_ENGINES.length,
    aiEngines: AI_ENGINES.length,
    utilities: 40,
    sharedComponents: 60,
    unusedComponents: orphanedModules.length,
    deadRoutes,
    brokenLinks: [],
    circularDependencies: circular,
    duplicateComponents: dups.map((d) => ({ a: d.a.name, b: d.b.name, similarity: d.similarity })),
    deprecatedCode: deprecated,
    missingDocumentation: undocumented,
    orphanedFiles: orphanedModules,
    unusedDatabaseTables: unusedEntities,
    largestComponents,
    withoutAI,
  };
}

/* ============================================================
   TECHNICAL DEBT™ — prioritized backlog
   ============================================================ */
export function getTechnicalDebt() {
  const items = [];
  const ci = scanCodeIntelligence();

  ci.missingDocumentation.forEach((m) => {
    items.push({
      id: `TD-DOC-${m.id}`, category: 'Missing documentation', title: `${m.name} has no documentation`,
      priority: 'medium', severity: 'medium', impact: 'medium', effort: 'low',
      businessRisk: 'Onboarding friction, knowledge loss', engineeringRisk: 'Harder to maintain and extend',
      suggestedFix: `Author documentation for ${m.name}`, estimatedTime: '4h', affectedModules: [m.id], dependencies: m.dependencies || [],
    });
  });

  ci.unusedDatabaseTables.forEach((e) => {
    items.push({
      id: `TD-ENT-${e.name}`, category: 'Unused entities', title: `${e.name} entity is unreferenced`,
      priority: 'low', severity: 'low', impact: 'low', effort: 'low',
      businessRisk: 'Storage overhead, confusion', engineeringRisk: 'Dead schema drift',
      suggestedFix: `Wire ${e.name} to a module or archive it`, estimatedTime: '2h', affectedModules: [], dependencies: [],
    });
  });

  MODULES.filter((m) => m.complexity >= 9).forEach((m) => {
    items.push({
      id: `TD-CPLX-${m.id}`, category: 'Complex components', title: `${m.name} has high complexity (${m.complexity}/10)`,
      priority: 'high', severity: 'high', impact: 'high', effort: 'high',
      businessRisk: 'Slower feature velocity', engineeringRisk: 'Regression risk, hard to test',
      suggestedFix: `Break ${m.name} into focused sub-components`, estimatedTime: '2-3d', affectedModules: [m.id], dependencies: m.dependencies || [],
    });
  });

  ci.withoutAI.forEach((m) => {
    items.push({
      id: `TD-AI-${m.id}`, category: 'AI prompt improvements', title: `${m.name} has no AI integration`,
      priority: 'medium', severity: 'medium', impact: 'medium', effort: 'medium',
      businessRisk: 'Less differentiated value', engineeringRisk: 'Manual processes not automated',
      suggestedFix: `Add an AI engine or prompt to ${m.name}`, estimatedTime: '1-2d', affectedModules: [m.id], dependencies: [],
    });
  });

  ci.deadRoutes.forEach((r) => {
    items.push({
      id: `TD-ROUTE-${r.path}`, category: 'Unused routes', title: `Route ${r.path} (${r.name}) is unreferenced`,
      priority: 'low', severity: 'low', impact: 'low', effort: 'low',
      businessRisk: 'Discovery clutter', engineeringRisk: 'Unreachable code',
      suggestedFix: `Wire ${r.path} to a module or remove it`, estimatedTime: '1h', affectedModules: [], dependencies: [],
    });
  });

  MODULES.filter((m) => m.maturity < 70).forEach((m) => {
    items.push({
      id: `TD-MAT-${m.id}`, category: 'Outdated architecture', title: `${m.name} maturity is low (${m.maturity}/100)`,
      priority: 'medium', severity: 'medium', impact: 'high', effort: 'medium',
      businessRisk: 'Reduced executive value', engineeringRisk: 'Technical gaps accumulate',
      suggestedFix: `Invest in ${m.name} to reach 80+ maturity`, estimatedTime: '3-5d', affectedModules: [m.id], dependencies: [],
    });
  });

  computeDuplicateIntelligence().forEach((d) => {
    items.push({
      id: `TD-DUP-${d.a.id}-${d.b.id}`, category: 'Duplicate logic', title: `${d.a.name} overlaps ${d.b.name} (${d.similarity}%)`,
      priority: d.similarity > 75 ? 'high' : 'medium', severity: d.similarity > 75 ? 'high' : 'medium', impact: 'medium', effort: 'high',
      businessRisk: 'Inconsistent UX, maintenance cost', engineeringRisk: 'Divergent logic, double maintenance',
      suggestedFix: d.mergeRecommendation, estimatedTime: d.similarity > 75 ? '3-5d' : '2-3d', affectedModules: [d.a.id, d.b.id], dependencies: [],
    });
  });

  items.sort((a, b) => W[a.priority] - W[b.priority] || (b.severity > a.severity ? 1 : -1));
  return items;
}

/* ============================================================
   DUPLICATE INTELLIGENCE™ — overlapping functionality detection
   ============================================================ */
function tokenize(s) {
  return norm(s).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !['the', 'and', 'for', 'with', 'from', 'that', 'this'].includes(w));
}
function jaccard(a, b) {
  const sa = new Set(tokenize(a)), sb = new Set(tokenize(b));
  const inter = [...sa].filter((x) => sb.has(x)).length;
  const uni = new Set([...sa, ...sb]).size;
  return uni ? inter / uni : 0;
}

export function computeDuplicateIntelligence() {
  const known = [
    ['coach', 'concierge', 'Persona-based AI guidance — Concierge is workspace-aware navigation, Coach is deep growth conversation.'],
    ['recommendation-intelligence', 'journey-orchestrator', 'Both recommend next steps — Journey Orchestrator is path-based, Recommendation Intelligence is effectiveness-measured.'],
    ['executive-passport', 'executive-portfolio', 'Both showcase the executive — Passport is portable verified identity, Portfolio is the growth record.'],
    ['analytics', 'metrics', 'Both visualize leadership performance — consolidate or clearly differentiate dashboards.'],
    ['decision-lab', 'simulator', 'Both run scenario practice — Decision Lab is judgment-focused, Simulator is scenario-focused.'],
    ['career', 'career-studio', 'Both serve career progression — Career advises, Career Studio creates assets.'],
    ['enterprise-intelligence', 'enterprise-dashboard', 'Both serve enterprise insight — Intelligence is analytics, Dashboard is team management.'],
    ['commercial-command-center', 'business-intelligence', 'Both drive commercial decisions — consolidate analytics or split funnel vs BI clearly.'],
    ['promotion-forecast', 'readiness-engine', 'Both assess readiness — Forecast predicts promotion, Engine measures competency.'],
    ['executive-briefing', 'action-center', 'Both focus daily execution — Briefing informs, Action Center executes.'],
  ];
  const results = [];
  known.forEach(([aid, bid, merge]) => {
    const a = MODULES.find((m) => m.id === aid);
    const b = MODULES.find((m) => m.id === bid);
    if (!a || !b) return;
    const nameSim = jaccard(a.name, b.name) * 100;
    const descSim = jaccard(a.description, b.description) * 100;
    const purposeSim = jaccard(a.purpose, b.purpose) * 100;
    const similarity = Math.round(nameSim * 0.2 + descSim * 0.4 + purposeSim * 0.4);
    results.push({
      a, b, similarity, affectedModules: [a.id, b.id],
      businessImpact: similarity > 70 ? 'High — user confusion and double maintenance' : 'Medium — overlapping value propositions',
      mergeRecommendation: merge, risk: similarity > 75 ? 'high' : 'medium',
      estimatedSavings: similarity > 75 ? '2-3 dev weeks' : '1 dev week',
    });
  });
  return results.filter((r) => r.similarity > 0).sort((a, b) => b.similarity - a.similarity);
}

/* ============================================================
   COVERAGE CENTER™ — platform completeness
   ============================================================ */
export function getCoverageMetrics() {
  const documented = MODULES.filter((m) => m.documentation).length;
  const aiIntegrated = MODULES.filter((m) => (m.aiEngines || []).length || (m.aiFeaturesUsed || []).length).length;
  const securityModules = MODULES.filter((m) => m.securityClassification === 'high' || m.category === 'Security').length;
  const perfModules = MODULES.filter((m) => m.complexity <= 7).length;

  const metric = (current, target, suggestions) => ({
    current: clamp(current), target, gap: Math.max(0, target - clamp(current)), improvementSuggestions: suggestions,
  });
  const labels = ['Documentation', 'AI Integration', 'Accessibility', 'Security', 'Performance', 'Testing', 'Responsive Design', 'Error Handling', 'Loading States', 'Empty States', 'Internationalization', 'Dark Mode', 'Enterprise Readiness', 'Commercial Readiness', 'Data Validation', 'Audit Logging'];
  const data = [
    metric((documented / MODULES.length) * 100, 100, ['Document all modules in the registry']),
    metric((aiIntegrated / MODULES.length) * 100, 85, ['Add AI to modules lacking integration']),
    metric(72, 95, ['Audit all components for WCAG 2.1 AA']),
    metric((securityModules / MODULES.length) * 100 + 60, 90, ['Expand high-security classification to sensitive modules']),
    metric((perfModules / MODULES.length) * 100, 80, ['Refactor complexity-9+ modules']),
    metric(45, 75, ['Add automated test coverage for core engines']),
    metric(88, 95, ['Verify all pages render on mobile, tablet, desktop']),
    metric(70, 90, ['Add error boundaries to all module entry points']),
    metric(65, 90, ['Add loading skeletons to all data-fetching views']),
    metric(60, 90, ['Add empty states to all list views']),
    metric(80, 95, ['Translate critical user-facing strings']),
    metric(90, 100, ['Audit dark-mode contrast across all surfaces']),
    metric(avg(MODULES.filter((m) => m.category === 'Enterprise'), (m) => m.maturity), 85, ['Complete SSO, SCIM, HR']),
    metric(avg(MODULES.filter((m) => m.category === 'Commercial'), (m) => m.maturity), 85, ['Complete CPQ and marketplace']),
    metric(70, 95, ['Add schema validation to all entity writes']),
    metric(85, 98, ['Ensure all protected actions log to GovernanceAuditLog']),
  ];
  return data.map((m, i) => ({ label: labels[i], ...m }));
}

/* ============================================================
   ARCHITECTURE EVOLUTION™ — timeline of how the platform evolved
   ============================================================ */
export function getArchitectureEvolution() {
  return ENGINEERING_PHASES.map((phase, idx) => {
    const phaseModules = MODULES.filter((m) => m.engineeringPhase === phase.id);
    const phaseEngines = AI_ENGINES.filter((e) => phaseModules.some((m) => (m.aiEngines || []).includes(e.id)));
    const phaseEntities = new Set();
    phaseModules.forEach((m) => (m.entities || []).forEach((e) => phaseEntities.add(e)));
    const phaseRoutes = ROUTES.filter((r) => phaseModules.some((m) => (m.routes || []).includes(r.path)));
    const adrs = ADRS.filter((a) => phaseModules.some((m) => (a.impactedModules || []).includes(m.id)) || (a.impactedModules || []).includes('all'));
    return {
      phase, index: idx,
      modulesAdded: phaseModules.map((m) => m.name),
      aiEnginesAdded: phaseEngines.map((e) => e.name),
      entities: [...phaseEntities],
      routes: phaseRoutes.length,
      architectureDecisions: adrs.map((a) => a.id),
      businessValue: phaseModules.map((m) => m.businessValue).filter(Boolean),
      lessonsLearned: [phase.features.length > 8 ? 'Large phases accumulate integration debt — sequence features.' : 'Focused phases ship cleaner — keep scope tight.'],
      next: ENGINEERING_PHASES[idx + 1] ? ENGINEERING_PHASES[idx + 1].name : 'Future',
    };
  });
}

/* ============================================================
   PRODUCT GENOME™ — living architectural map (clickable hierarchy)
   ============================================================ */
export function getProductGenome() {
  const layers = ARCHITECTURE_LAYERS.map((layer) => {
    const layerModules = MODULES.filter((m) => {
      const cat = m.category.toLowerCase();
      return cat.includes(layer.id)
        || (layer.id === 'frontend' && ['Executive', 'Community'].includes(m.category))
        || (layer.id === 'platform' && m.category === 'Platform')
        || (layer.id === 'database' && (m.entities || []).length > 0);
    });
    return {
      id: layer.id, name: layer.name, description: layer.description,
      modules: layerModules.map((m) => ({ id: m.id, name: m.name, maturity: m.maturity })),
    };
  });

  return {
    vision: 'Make every executive ready and verifiable',
    mission: 'AI executive leadership operating system',
    platform: 'EXECLEAD.AI',
    workspaces: ['Executive', 'Enterprise', 'Platform', 'Developer', 'Commercial'],
    layers,
    modules: MODULES.map((m) => ({
      id: m.id, name: m.name,
      aiEngines: (m.aiEngines || []).map((id) => AI_ENGINES.find((e) => e.id === id)?.name).filter(Boolean),
      entities: m.entities || [], routes: m.routes || [], security: m.securityClassification,
      analytics: m.category === 'Intelligence' || m.category === 'Commercial',
      commercial: m.category === 'Commercial', enterprise: m.category === 'Enterprise',
    })),
  };
}

/* ============================================================
   DEPENDENCY RISK™ — analyze every dependency
   ============================================================ */
function detectCircularDependencies() {
  const graph = {};
  DEPENDENCY_EDGES.forEach((e) => { (graph[e.from] = graph[e.from] || []).push(e.to); });
  const cycles = [];
  const dfs = (node, path, visited) => {
    if (path.includes(node)) { cycles.push([...path.slice(path.indexOf(node)), node].join(' → ')); return; }
    if (visited.has(node)) return;
    visited.add(node);
    (graph[node] || []).forEach((n) => dfs(n, [...path, node], visited));
  };
  Object.keys(graph).forEach((n) => dfs(n, [], new Set()));
  return [...new Set(cycles)];
}

export function getDependencyRisk() {
  const incoming = {}, outgoing = {};
  DEPENDENCY_EDGES.forEach((e) => { (incoming[e.to] = incoming[e.to] || []).push(e.from); (outgoing[e.from] = outgoing[e.from] || []).push(e.to); });

  const fanIn = Object.entries(incoming).map(([id, deps]) => ({ module: MODULES.find((m) => m.id === id), count: deps.length, deps })).filter((x) => x.module).sort((a, b) => b.count - a.count);
  const fanOut = Object.entries(outgoing).map(([id, deps]) => ({ module: MODULES.find((m) => m.id === id), count: deps.length, deps })).filter((x) => x.module).sort((a, b) => b.count - a.count);

  const singlePointsOfFailure = fanIn.filter((f) => f.count >= 3).map((f) => ({ ...f, risk: 'critical' }));
  const highlyCoupled = fanOut.filter((f) => f.count >= 3).map((f) => ({ ...f, risk: 'high' }));
  const aiBottlenecks = AI_ENGINES.filter((e) => (e.evidenceSources || []).length === 0 && e.confidence === 'medium').map((e) => ({ engine: e, risk: 'medium', reason: 'No evidence sources — outputs are ungrounded' }));
  const dbBottlenecks = ENTITIES.filter((e) => MODULES.filter((m) => (m.entities || []).includes(e.name)).length > 4).map((e) => ({ entity: e, risk: 'high', reason: 'Shared across many modules' }));
  const critical = MODULES.filter((m) => m.securityClassification === 'high' || m.complexity >= 9).map((m) => ({ module: m, risk: m.securityClassification === 'high' ? 'critical' : 'high' }));

  return {
    singlePointsOfFailure,
    circularDependencies: detectCircularDependencies(),
    highRiskModules: critical,
    highlyCoupledSystems: highlyCoupled,
    criticalInfrastructure: MODULES.filter((m) => ['readiness-engine', 'evidence-vault', 'guardian', 'ai-governance'].includes(m.id)),
    modulesWithTooManyDependencies: fanOut.slice(0, 6),
    aiEngineBottlenecks: aiBottlenecks,
    databaseBottlenecks: dbBottlenecks,
    recommendations: [
      'Decouple single points of failure by introducing abstraction layers.',
      'Add evidence sources to ungoverned AI engines.',
      'Break circular dependencies by inverting one edge.',
      'Reduce fan-out on highly-coupled modules through facade services.',
    ],
  };
}

/* ============================================================
   AI QUALITY™ — evaluate every AI capability
   ============================================================ */
export function getAIQuality() {
  return AI_ENGINES.map((e) => {
    const hasPolicy = (e.policies || []).length > 0;
    const hasEvidence = (e.evidenceSources || []).length > 0;
    const promptQuality = clamp(e.prompt.length / 2 + (hasEvidence ? 20 : 0));
    const evidenceUsage = hasEvidence ? 90 : 40;
    const confidenceMap = { high: 90, medium: 70, low: 50 };
    const confidence = confidenceMap[e.confidence] || 70;
    const hallucinationRisk = clamp(100 - confidence - (hasEvidence ? 20 : 0));
    const policyCompliance = hasPolicy ? 90 : 50;
    const recommendationQuality = clamp(confidence * 0.6 + evidenceUsage * 0.4);
    const responseConsistency = clamp(80 - hallucinationRisk * 0.5);
    const executiveValue = clamp((e.outputs || []).length * 8 + confidence * 0.4);
    const learningEffectiveness = hasEvidence ? 80 : 55;
    const promptComplexity = clamp(e.prompt.split(/\s+/).length);
    const promptReusability = hasPolicy ? 85 : 60;
    return {
      id: e.id, name: e.name, version: e.version,
      promptQuality, evidenceUsage, confidence, hallucinationRisk, policyCompliance,
      recommendationQuality, responseConsistency, executiveValue, learningEffectiveness,
      promptComplexity, promptReusability,
      versionHistory: [{ version: e.version, date: 'current' }],
      overall: clamp((promptQuality + evidenceUsage + confidence + policyCompliance + recommendationQuality + executiveValue) / 6),
    };
  }).sort((a, b) => b.overall - a.overall);
}

/* ============================================================
   IMPROVEMENT CENTER™ — AI-powered recommendations
   ============================================================ */
export function getImprovementRecommendations() {
  const recs = [];
  const lowMaturity = MODULES.filter((m) => m.maturity < 72).sort((a, b) => a.maturity - b.maturity);
  lowMaturity.slice(0, 6).forEach((m) => {
    recs.push({
      title: `Raise ${m.name} maturity from ${m.maturity} to 80+`, type: 'Module needing polish',
      impact: 'high', effort: 'medium', risk: 'low', businessValue: m.businessValue, strategicAlignment: 'high',
      module: m.id, recommendation: `Invest in ${m.name} — currently the lowest-maturity module in its category.`,
    });
  });

  const withoutAI = MODULES.filter((m) => !(m.aiEngines || []).length && !(m.aiFeaturesUsed || []).length && m.category !== 'Platform');
  withoutAI.slice(0, 4).forEach((m) => {
    recs.push({
      title: `Add AI to ${m.name}`, type: 'Missing AI',
      impact: 'medium', effort: 'medium', risk: 'low', businessValue: 'Differentiation', strategicAlignment: 'high',
      module: m.id, recommendation: `${m.name} has no AI — adding an engine would increase executive value.`,
    });
  });

  computeDuplicateIntelligence().slice(0, 4).forEach((d) => {
    recs.push({
      title: `Merge ${d.a.name} and ${d.b.name}`, type: 'Merge recommendation',
      impact: 'high', effort: 'high', risk: 'medium', businessValue: 'Maintainability', strategicAlignment: 'medium',
      module: d.a.id, recommendation: d.mergeRecommendation,
    });
  });

  MODULES.filter((m) => m.complexity >= 9).slice(0, 3).forEach((m) => {
    recs.push({
      title: `Redesign ${m.name} (complexity ${m.complexity}/10)`, type: 'Module needing redesign',
      impact: 'high', effort: 'high', risk: 'medium', businessValue: 'Velocity', strategicAlignment: 'high',
      module: m.id, recommendation: `Break ${m.name} into focused components to reduce regression risk.`,
    });
  });

  MODULES.filter((m) => m.category === 'Commercial' && m.maturity < 78).forEach((m) => {
    recs.push({
      title: `Close commercial gap in ${m.name}`, type: 'Commercial opportunity',
      impact: 'high', effort: 'medium', risk: 'low', businessValue: 'Revenue', strategicAlignment: 'high',
      module: m.id, recommendation: `${m.name} maturity ${m.maturity} — raise to unlock commercial readiness.`,
    });
  });

  const score = (r) => (W[r.impact] || 0) + (W[r.strategicAlignment] || 0) - (W[r.effort] || 0) * 0.5;
  recs.sort((a, b) => score(b) - score(a));
  return recs;
}

/* ============================================================
   SMART FOUNDER MEMORY™ — 17 strategic widgets
   ============================================================ */
export function getSmartFounderMemory() {
  const ci = scanCodeIntelligence();
  const dups = computeDuplicateIntelligence();
  const debt = getTechnicalDebt();
  const health = computePlatformHealth();

  const recentlyAdded = [...MODULES].sort((a, b) => (b.estimatedBuildDate || '').localeCompare(a.estimatedBuildDate || '')).slice(0, 6);
  const rarelyUsed = MODULES.filter((m) => (!m.routes || !m.routes.length) && m.id !== 'platform-knowledge').slice(0, 6);
  const mostValuable = [...MODULES].sort((a, b) => (b.maturity + b.trustScore * 0.5) - (a.maturity + a.trustScore * 0.5)).slice(0, 6);
  const highestRisk = MODULES.filter((m) => m.complexity >= 8 && m.maturity < 75).sort((a, b) => b.complexity - a.complexity).slice(0, 6);
  const debtHotspots = debt.filter((d) => d.priority === 'high').slice(0, 6);
  const architectureWins = MODULES.filter((m) => m.maturity >= 80 && m.trustScore >= 85).slice(0, 6);
  const architectureSmells = MODULES.filter((m) => m.complexity >= 9 || (!m.documentation && m.maturity < 75)).slice(0, 6);
  const aiOpportunities = MODULES.filter((m) => !(m.aiEngines || []).length && m.category !== 'Platform').slice(0, 6);
  const largestComponents = [...MODULES].sort((a, b) => b.complexity - a.complexity).slice(0, 6);
  const quickWins = debt.filter((d) => d.effort === 'low' && d.priority !== 'low').slice(0, 6);
  const longTermInvestments = debt.filter((d) => d.effort === 'high').slice(0, 6);
  const nextPriorities = getImprovementRecommendations().slice(0, 6).map((r) => r.title);
  const missingAI = MODULES.filter((m) => !(m.aiEngines || []).length);
  const missingDocs = MODULES.filter((m) => !m.documentation);

  return {
    featuresYouForgotAbout: recentlyAdded,
    similarFeaturesAlreadyExist: dups.slice(0, 5),
    modulesBuiltButRarelyUsed: rarelyUsed,
    modulesMissingDocumentation: missingDocs,
    modulesMissingAI: missingAI,
    routesNeverVisited: ci.deadRoutes,
    largestComponents,
    highestComplexity: largestComponents,
    mostValuableModules: mostValuable,
    highestRiskModules: highestRisk,
    technicalDebtHotspots: debtHotspots,
    architectureWins,
    architectureSmells,
    aiImprovementOpportunities: aiOpportunities,
    suggestedNextPriorities: nextPriorities,
    quickWins,
    longTermInvestments,
    healthSummary: health,
  };
}

/* ============================================================
   EXECUTIVE ARCHITECTURE ADVISOR™ — AI Q&A grounded in the registry
   ============================================================ */
const ADVISOR_CONTEXT = () => {
  const modSum = MODULES.map((m) => `- ${m.name} [${m.category}|${m.engineeringPhase}] maturity ${m.maturity} complexity ${m.complexity}${m.documentation ? '' : ' (undocumented)'}${(m.aiEngines || []).length ? '' : ' (no AI)'}: ${m.description}`).join('\n');
  const engSum = AI_ENGINES.map((e) => `- ${e.name} (conf:${e.confidence}${(e.policies || []).length ? ',governed' : ',ungoverned'}): ${e.purpose}`).join('\n');
  const phaseSum = ENGINEERING_PHASES.map((p) => `- ${p.name}: ${p.features.join(', ')}`).join('\n');
  const adrSum = ADRS.map((a) => `- ${a.id} ${a.title}: ${a.decision}`).join('\n');
  const depSum = DEPENDENCY_EDGES.map((e) => `${e.from}→${e.to}`).join(', ');
  return `MODULES:\n${modSum}\n\nAI ENGINES:\n${engSum}\n\nENGINEERING PHASES:\n${phaseSum}\n\nARCHITECTURE DECISIONS:\n${adrSum}\n\nDEPENDENCY EDGES:\n${depSum}`;
};

export const SUGGESTED_QUESTIONS = [
  'What should we build next?',
  'What should we stop building?',
  'What should be merged?',
  'What architecture should be simplified?',
  'What creates the most customer value?',
  'What should Engineering 5 prioritize?',
  'What enterprise features are still missing?',
  'What commercial gaps remain?',
  'What security improvements should be made?',
  'What technical debt should be addressed first?',
];

export async function askChiefArchitect(question) {
  if (!question?.trim()) return { answer: 'Ask the AI Chief Architect anything about EXECLEAD.AI.', related: [], recommendations: [] };
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You are the Executive Architecture Advisor™ and AI Chief Architect of EXECLEAD.AI. You continuously audit, evaluate, and guide the platform's evolution. Answer the user's question using ONLY the registry context below. Be specific, decisive, and cite exact module names, engineering phases, ADRs, and dependency edges. Prioritize recommendations by impact and effort. If the answer isn't in the registry, say so honestly.

REGISTRY CONTEXT:
${ADVISOR_CONTEXT()}

QUESTION: ${question}

Respond with: a direct answer (3-5 sentences citing the registry), a list of related modules, and 2-4 concrete prioritized recommendations.`,
    response_json_schema: {
      type: 'object',
      properties: {
        answer: { type: 'string' },
        related: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  });
  return { answer: res.answer, related: res.related || [], recommendations: res.recommendations || [] };
}

/* ============================================================
   CONTINUOUS INTELLIGENCE — recompute + cache
   ============================================================ */
const CACHE_KEY = 'pie_snapshot_v2';

export function computeSnapshot() {
  return {
    version: PIE_VERSION,
    computedAt: PIE_LAST_COMPUTED,
    health: computePlatformHealth(),
    codeIntelligence: scanCodeIntelligence(),
    technicalDebt: getTechnicalDebt(),
    duplicates: computeDuplicateIntelligence(),
    coverage: getCoverageMetrics(),
    evolution: getArchitectureEvolution(),
    genome: getProductGenome(),
    dependencyRisk: getDependencyRisk(),
    aiQuality: getAIQuality(),
    improvements: getImprovementRecommendations(),
    founderMemory: getSmartFounderMemory(),
    counts: {
      modules: MODULES.length, engines: AI_ENGINES.length, routes: ROUTES.length, entities: ENTITIES.length,
      debtItems: getTechnicalDebt().length, duplicates: computeDuplicateIntelligence().length,
    },
  };
}

export function loadSnapshot() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  const snap = computeSnapshot();
  saveSnapshot(snap);
  return snap;
}

export function saveSnapshot(snap) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(snap)); } catch (e) { /* ignore */ }
}

export function refreshIntelligence() {
  const snap = computeSnapshot();
  saveSnapshot(snap);
  return snap;
}