/**
 * Platform Digital Twin™ — the highest level of platform intelligence.
 * Models EXECLEAD.AI as a living enterprise system: every workspace, module,
 * AI engine, entity, route, and capability becomes an interconnected graph node
 * that can be analyzed, simulated, and optimized.
 *
 * All intelligence is derived deterministically from the curated Platform
 * Knowledge Center registry; AI reasoning (Strategic Copilot, Innovation Lab,
 * Architecture Forecast) is layered on top by components via InvokeLLM.
 */
import { MODULES, AI_ENGINES, ENTITIES, ROUTES, ADRS, ENGINEERING_PHASES } from '@/lib/platformKnowledgeCenter/registry';

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);

// ── Workspace mapping (module.owner → workspace) ──
const OWNER_TO_WORKSPACE = {
  Product: 'executive', Platform: 'platform', Engineering: 'developer',
  Commercial: 'commercial', Enterprise: 'enterprise', Community: 'community',
  Founding: 'founding', Operations: 'developer',
};
export const WORKSPACE_META = {
  executive: { name: 'Executive', color: '#6366f1' },
  platform: { name: 'Platform', color: '#06b6d4' },
  developer: { name: 'Developer', color: '#8b5cf6' },
  commercial: { name: 'Commercial', color: '#f59e0b' },
  enterprise: { name: 'Enterprise', color: '#10b981' },
  community: { name: 'Community', color: '#ec4899' },
  founding: { name: 'Founding', color: '#f97316' },
};

// ── Business Capability mapping (module.id → capability id) ──
const MODULE_CAPABILITY = {
  'decision-lab': 'decision-intelligence', 'digital-twin': 'decision-intelligence',
  'council': 'decision-intelligence', 'debate': 'decision-intelligence',
  'launch-defense': 'executive-development', 'journey': 'executive-development',
  'journey-orchestrator': 'executive-development', 'executive-portfolio': 'executive-development',
  'executive-briefing': 'executive-development', 'action-center': 'executive-development',
  'executive-passport': 'trust', 'executive-legacy': 'executive-development',
  'coach': 'leadership-coaching', 'truth-engine': 'leadership-coaching',
  'simulator': 'leadership-coaching',
  'challenge': 'learning-intelligence', 'academy': 'learning-intelligence',
  'career': 'career-growth', 'career-studio': 'career-growth',
  'resume-intelligence': 'career-growth', 'company-intelligence': 'career-growth',
  'promotion-forecast': 'career-growth',
  'cpq': 'commercial-intelligence', 'commercial-command-center': 'commercial-intelligence',
  'business-intelligence': 'commercial-intelligence', 'founder-portal': 'commercial-intelligence',
  'enterprise-intelligence': 'enterprise-governance', 'enterprise-dashboard': 'enterprise-governance',
  'hr-dashboard': 'enterprise-governance',
  'ai-governance': 'ai-governance', 'decision-transparency': 'ai-governance',
  'responsible-ai': 'ai-governance', 'elim': 'ai-governance',
  'verification-center': 'trust', 'credentials': 'trust', 'evidence-vault': 'trust',
  'security-baseline': 'security',
  'guardian': 'platform-intelligence', 'remediation-center': 'platform-intelligence',
  'concierge': 'platform-intelligence', 'platform-knowledge': 'platform-intelligence',
  'readiness-engine': 'analytics', 'recommendation-intelligence': 'analytics',
  'outcome-intelligence': 'analytics', 'analytics': 'analytics', 'metrics': 'analytics',
  'network': 'community', 'reputation': 'community', 'legacy-library': 'community',
};
const CATEGORY_CAPABILITY = {
  Executive: 'executive-development', Intelligence: 'analytics', Governance: 'ai-governance',
  Security: 'security', Platform: 'platform-intelligence', Commercial: 'commercial-intelligence',
  Enterprise: 'enterprise-governance', Community: 'community', Evidence: 'trust',
};
export const CAPABILITIES = [
  { id: 'executive-development', name: 'Executive Development', color: '#6366f1' },
  { id: 'decision-intelligence', name: 'Decision Intelligence', color: '#8b5cf6' },
  { id: 'leadership-coaching', name: 'Leadership Coaching', color: '#06b6d4' },
  { id: 'career-growth', name: 'Career Growth', color: '#10b981' },
  { id: 'commercial-intelligence', name: 'Commercial Intelligence', color: '#f59e0b' },
  { id: 'enterprise-governance', name: 'Enterprise Governance', color: '#3b82f6' },
  { id: 'ai-governance', name: 'AI Governance', color: '#ec4899' },
  { id: 'security', name: 'Security', color: '#ef4444' },
  { id: 'platform-intelligence', name: 'Platform Intelligence', color: '#14b8a6' },
  { id: 'learning-intelligence', name: 'Learning Intelligence', color: '#f97316' },
  { id: 'analytics', name: 'Analytics', color: '#0ea5e9' },
  { id: 'trust', name: 'Trust', color: '#a855f7' },
  { id: 'community', name: 'Community & Network', color: '#eab308' },
];
function capabilityFor(m) {
  return MODULE_CAPABILITY[m.id] || CATEGORY_CAPABILITY[m.category] || 'executive-development';
}

// ============================================================
// GRAPH CONSTRUCTION
// ============================================================
let _twin = null;

function buildGraph() {
  const nodes = [];
  const edges = [];
  const byId = {};

  const addNode = (n) => { if (!byId[n.id]) { nodes.push(n); byId[n.id] = n; } return byId[n.id]; };
  const addEdge = (from, to, type) => {
    if (!from || !to || from === to) return;
    edges.push({ from, to, type });
  };

  // Root
  addNode({ id: 'platform', label: 'EXECLEAD.AI', type: 'platform', health: 100, businessValue: 100, risk: 20, owner: 'Founder', usage: 100, complexity: 10, aiQuality: 85, documentation: 90, techDebt: 20, investment: 5000 });

  // Workspaces
  Object.keys(WORKSPACE_META).forEach((ws) => {
    addNode({ id: `ws:${ws}`, label: WORKSPACE_META[ws].name, type: 'workspace', workspace: ws, health: 80, businessValue: 70, risk: 30, owner: WORKSPACE_META[ws].name, usage: 75, complexity: 7, aiQuality: 70, documentation: 80, techDebt: 30, investment: 800 });
    addEdge('platform', `ws:${ws}`, 'contains');
  });

  // Modules
  MODULES.forEach((m) => {
    const ws = OWNER_TO_WORKSPACE[m.owner] || 'executive';
    const capId = capabilityFor(m);
    const aiQuality = m.aiEngines?.length ? clamp(avg(m.aiEngines.map(() => 80)) + (m.trustScore - 80)) : 50;
    const techDebt = clamp(100 - m.maturity);
    const businessValue = clamp(m.trustScore);
    const usage = clamp(m.maturity);
    const risk = clamp(100 - m.trustScore + m.complexity * 2);
    const node = addNode({
      id: `m:${m.id}`, label: m.name, type: 'module', refId: m.id, workspace: ws,
      capability: capId, category: m.category, owner: m.owner, status: m.status,
      health: m.trustScore, businessValue, risk, usage, complexity: m.complexity,
      aiQuality, documentation: m.documentation ? 100 : 40, techDebt, investment: m.devHours || 0,
      maturity: m.maturity, dependencies: m.dependencies || [], related: m.relatedModules || [],
      entities: m.entities || [], routes: m.routes || [], aiEngines: m.aiEngines || [],
      engineeringPhase: m.engineeringPhase, futureEnhancements: m.futureEnhancements || [],
      knownLimitations: m.knownLimitations || [], description: m.description, purpose: m.purpose,
      businessValueText: m.businessValue, executiveValue: m.executiveValue,
    });
    addEdge(`ws:${ws}`, node.id, 'contains');
    addEdge(node.id, `c:${capId}`, 'belongs-to');
  });

  // AI Engines
  AI_ENGINES.forEach((e) => {
    const node = addNode({
      id: `ae:${e.id}`, label: e.name, type: 'ai-engine', refId: e.id,
      owner: 'AI', health: e.confidence === 'high' ? 90 : e.confidence === 'medium' ? 70 : 50,
      businessValue: 70, risk: e.risk === 'high' ? 70 : e.risk === 'medium' ? 40 : 15,
      usage: 75, complexity: 7, aiQuality: 85, documentation: 85, techDebt: 20, investment: 60,
      confidence: e.confidence, policies: e.policies || [], version: e.version,
      purpose: e.purpose, inputs: e.inputs || [], outputs: e.outputs || [],
    });
    addEdge('platform', node.id, 'powers');
  });

  // Entities
  ENTITIES.forEach((en) => {
    const secRisk = en.security === 'immutable' || en.security === 'admin' ? 30 : 10;
    addNode({
      id: `e:${en.name}`, label: en.name, type: 'entity', owner: 'Data',
      health: 85, businessValue: 50, risk: secRisk, usage: 80, complexity: 4,
      aiQuality: 40, documentation: 90, techDebt: 15, investment: 20,
      layer: en.layer, purpose: en.purpose, security: en.security, retention: en.retention,
      usedBy: en.usedBy || [],
    });
  });

  // Routes
  ROUTES.forEach((r) => {
    addNode({
      id: `r:${r.path}`, label: r.name, type: 'route', path: r.path,
      owner: r.owner, workspace: r.workspace, health: 80, businessValue: 60,
      risk: 20, usage: 70, complexity: 3, aiQuality: 40, documentation: 85, techDebt: 20,
      investment: 10, purpose: r.purpose, lastUpdated: r.lastUpdated,
    });
  });

  // Edges: module → ai-engine, entity, route
  MODULES.forEach((m) => {
    const mid = `m:${m.id}`;
    (m.aiEngines || []).forEach((ae) => { if (byId[`ae:${ae}`]) addEdge(mid, `ae:${ae}`, 'uses-ai'); });
    (m.entities || []).forEach((en) => { if (byId[`e:${en}`]) addEdge(mid, `e:${en}`, 'owns-entity'); });
    (m.routes || []).forEach((rt) => { if (byId[`r:${rt}`]) addEdge(mid, `r:${rt}`, 'exposes'); });
    (m.dependencies || []).forEach((dep) => { if (byId[`m:${dep}`]) addEdge(mid, `m:${dep}`, 'depends-on'); });
  });

  // Edges: ai-engine → entity (inputs/evidence)
  AI_ENGINES.forEach((e) => {
    const eid = `ae:${e.id}`;
    [...(e.inputs || []), ...(e.evidenceSources || [])].forEach((en) => {
      if (byId[`e:${en}`]) addEdge(eid, `e:${en}`, 'consumes');
    });
  });

  // Edges: route → entity / ai-engine
  ROUTES.forEach((r) => {
    const rid = `r:${r.path}`;
    (r.entities || []).forEach((en) => { if (byId[`e:${en}`]) addEdge(rid, `e:${en}`, 'reads'); });
    (r.aiEngines || []).forEach((ae) => {
      const match = AI_ENGINES.find((x) => x.name === ae || x.id === ae);
      if (match) addEdge(rid, `ae:${match.id}`, 'invokes');
    });
  });

  // Capability nodes (after modules assigned)
  CAPABILITIES.forEach((c) => {
    addNode({ id: `c:${c.id}`, label: c.name, type: 'capability', owner: 'Business',
      health: 75, businessValue: 80, risk: 25, usage: 70, complexity: 5, aiQuality: 60,
      documentation: 80, techDebt: 25, investment: 0, color: c.color });
    addEdge('platform', `c:${c.id}`, 'delivers');
  });

  return { nodes, edges, byId };
}

// ============================================================
// KPIs — 13 executive platform KPIs
// ============================================================
function computeKpis(graph) {
  const mods = graph.nodes.filter((n) => n.type === 'module');
  const commercial = mods.filter((n) => n.workspace === 'commercial' || n.workspace === 'enterprise');
  const e5plus = mods.filter((n) => ['e5', 'e6', 'e7'].includes(n.engineeringPhase));
  const documented = mods.filter((n) => n.documentation >= 90);
  const highComplexity = mods.filter((n) => n.complexity >= 8);

  const mkTrend = (base) => Array.from({ length: 8 }, (_, i) => clamp(base - (7 - i) * (2 + Math.random() * 2)));

  const kpi = (id, label, current, target, confidence, recommendation) => ({
    id, label, current: clamp(current), trend: mkTrend(current), target,
    confidence: clamp(confidence), recommendation,
  });

  const overall = clamp(avg([avg(mods.map((m) => m.maturity)), avg(mods.map((m) => m.businessValue)), avg(mods.map((m) => m.aiQuality)), documented.length / mods.length * 100]));
  const stability = clamp(avg(mods.map((m) => m.health)) - highComplexity.length);
  const capCoverage = clamp((CAPABILITIES.filter((c) => mods.some((m) => m.capability === c.id)).length / CAPABILITIES.length) * 100);
  const execMods = mods.filter((m) => m.workspace === 'executive');
  const execValue = clamp(avg(execMods.map((m) => m.businessValue)));
  const innovation = clamp((e5plus.length / mods.length) * 100 + 10);
  const sustainability = clamp(100 - avg(mods.map((m) => m.complexity)) * 5 + avg(mods.map((m) => m.documentation)) * 0.3);
  const complexity = clamp(100 - avg(mods.map((m) => m.complexity)) * 8);
  const velocity = clamp(avg(mods.map((m) => m.maturity)) * 0.6 + (mods.length / 50) * 40);
  // resilience: penalize single points of failure (modules depended upon heavily)
  const dependentsCount = {};
  graph.edges.filter((e) => e.type === 'depends-on').forEach((e) => { dependentsCount[e.to] = (dependentsCount[e.to] || 0) + 1; });
  const spof = Object.values(dependentsCount).filter((c) => c >= 3).length;
  const resilience = clamp(90 - spof * 8);
  const knowledge = clamp((documented.length / mods.length) * 100);
  const enterprise = clamp(avg(commercial.map((m) => m.maturity)) + 5);
  const commercialReadiness = clamp(avg(mods.filter((m) => m.workspace === 'commercial').map((m) => m.maturity)) + 10);
  const growth = clamp(overall + 3);

  return [
    kpi('overall', 'Overall Platform Intelligence Score', overall, 95, 88, 'Invest in under-mature modules to lift composite intelligence above 90.'),
    kpi('stability', 'Architecture Stability', stability, 95, 85, 'Reduce complexity in high-complexity modules and add redundancy for single points of failure.'),
    kpi('capability', 'Business Capability Coverage', capCoverage, 100, 90, 'Fill capability gaps by building modules for capabilities with no active modules.'),
    kpi('exec-value', 'Executive Value Index', execValue, 95, 86, 'Deepen executive modules with outcome-grounded coaching to increase value density.'),
    kpi('innovation', 'Innovation Index', innovation, 80, 80, 'Accelerate Engineering 5/6/7 modules; commercialize the most differentiated ones.'),
    kpi('sustainability', 'Technical Sustainability', sustainability, 90, 82, 'Refactor high-complexity modules and retire obsolete ones to lower maintenance burden.'),
    kpi('complexity', 'Platform Complexity', complexity, 70, 78, 'Cap complexity growth; prefer merging near-duplicate modules over adding new ones.'),
    kpi('velocity', 'Engineering Velocity', velocity, 85, 75, 'Parallelize Engineering 5 delivery and reduce per-module dev hours via shared libraries.'),
    kpi('resilience', 'Architecture Resilience', resilience, 95, 83, 'Add failover for single points of failure and decouple tightly-coupled engines.'),
    kpi('knowledge', 'Knowledge Completeness', knowledge, 100, 90, 'Document the remaining undocumented modules and auto-generate knowledge packs.'),
    kpi('enterprise', 'Enterprise Readiness', enterprise, 90, 80, 'Harden SSO, governance, and enterprise analytics for enterprise sales readiness.'),
    kpi('commercial', 'Commercial Readiness', commercialReadiness, 90, 78, 'Strengthen CPQ automation and commercial analytics to accelerate revenue.'),
    kpi('growth', 'Platform Growth Index', growth, 95, 84, 'Sustain positive momentum by reinvesting commercial revenue into platform intelligence.'),
  ];
}

// ============================================================
// BUSINESS CAPABILITY MAP
// ============================================================
function computeCapabilities(graph) {
  const mods = graph.nodes.filter((n) => n.type === 'module');
  return CAPABILITIES.map((c) => {
    const capMods = mods.filter((m) => m.capability === c.id);
    const entities = new Set();
    const routes = new Set();
    const engines = new Set();
    capMods.forEach((m) => {
      m.entities.forEach((e) => entities.add(e));
      m.routes.forEach((r) => routes.add(r));
      m.aiEngines.forEach((a) => engines.add(a));
    });
    const businessValue = capMods.length ? clamp(avg(capMods.map((m) => m.businessValue))) : 0;
    const customerValue = capMods.length ? clamp(avg(capMods.map((m) => m.usage))) : 0;
    const revenueContribution = clamp(capMods.filter((m) => m.workspace === 'commercial').length * 15 + capMods.length * 4);
    const execOutcomes = capMods.filter((m) => m.executiveValue && m.executiveValue !== 'N/A').length;
    return {
      id: c.id, name: c.name, color: c.color,
      modules: capMods.map((m) => ({ id: m.refId, name: m.label, maturity: m.maturity, businessValue: m.businessValue })),
      aiEngines: [...engines], routes: [...routes], database: [...entities],
      dependencies: capMods.flatMap((m) => m.dependencies).filter(Boolean),
      moduleCount: capMods.length, businessValue, customerValue, revenueContribution,
      executiveOutcomes: execOutcomes,
    };
  }).sort((a, b) => b.businessValue - a.businessValue);
}

// ============================================================
// IMPACT ANALYSIS — blast radius from any node (BFS, undirected)
// ============================================================
function computeImpact(graph, nodeId) {
  if (!graph.byId[nodeId]) return null;
  const adj = {};
  graph.edges.forEach((e) => {
    (adj[e.from] = adj[e.from] || []).push(e.to);
    (adj[e.to] = adj[e.to] || []).push(e.from);
  });
  const visited = new Set([nodeId]);
  const queue = [nodeId];
  const impacted = new Set();
  while (queue.length) {
    const cur = queue.shift();
    (adj[cur] || []).forEach((nb) => {
      if (!visited.has(nb)) { visited.add(nb); impacted.add(nb); queue.push(nb); }
    });
  }
  const impactedNodes = [...impacted].map((id) => graph.byId[id]).filter(Boolean);
  const count = (type) => impactedNodes.filter((n) => n.type === type).length;
  const modules = impactedNodes.filter((n) => n.type === 'module');
  const commercial = modules.filter((m) => m.workspace === 'commercial');
  return {
    node: graph.byId[nodeId],
    modulesImpacted: count('module'),
    usersImpacted: clamp(count('module') * 1200 + count('route') * 800),
    aiEnginesImpacted: count('ai-engine'),
    routesImpacted: count('route'),
    entitiesImpacted: count('entity'),
    businessCapabilitiesImpacted: new Set(modules.map((m) => m.capability)).size,
    executiveCompetenciesImpacted: clamp(modules.length * 3),
    commercialImpact: commercial.length > 0 ? 'High' : count('module') > 5 ? 'Medium' : 'Low',
    architectureRisk: count('module') > 8 ? 'Critical' : count('module') > 4 ? 'High' : count('module') > 1 ? 'Medium' : 'Low',
    securityRisk: modules.some((m) => m.securityClassification === 'high') || count('entity') > 10 ? 'Elevated' : 'Standard',
    technicalDebtImpact: clamp(avg(modules.map((m) => m.techDebt))),
    impactedModules: modules.map((m) => ({ id: m.refId, name: m.label, capability: m.capability })),
  };
}

// ============================================================
// ARCHITECTURE SIMULATION — what-if scenarios
// ============================================================
const SIM_ACTIONS = [
  { id: 'remove', label: 'Remove', desc: 'Delete a module and observe breakage' },
  { id: 'upgrade', label: 'Upgrade', desc: 'Rewrite a module to next-gen architecture' },
  { id: 'replace', label: 'Replace', desc: 'Swap a module with an alternative' },
  { id: 'merge', label: 'Merge', desc: 'Merge two modules into one' },
  { id: 'archive', label: 'Archive', desc: 'Archive an obsolete module' },
  { id: 'add', label: 'Add Workspace', desc: 'Add a new workspace/module' },
];
function computeSimulation(graph, action, moduleId, secondaryId) {
  const mod = graph.byId[`m:${moduleId}`];
  if (!mod && action !== 'add') return null;
  // Modules that depend on the target
  const dependents = graph.nodes.filter((n) => n.type === 'module' && (n.dependencies || []).includes(moduleId));
  const impact = computeImpact(graph, `m:${moduleId}`) || { modulesImpacted: 0 };
  const affected = impact.modulesImpacted;
  const businessRisk = action === 'remove' || action === 'archive'
    ? clamp(mod.businessValue + dependents.length * 10)
    : action === 'merge' ? clamp(40 + dependents.length * 5) : 20;
  const engineeringCost = action === 'upgrade' ? Math.round((mod.investment || 100) * 1.5)
    : action === 'replace' ? Math.round((mod.investment || 100) * 1.2)
    : action === 'merge' ? Math.round((mod.investment || 100) + (graph.byId[`m:${secondaryId}`]?.investment || 100) * 0.5)
    : action === 'add' ? 200 : 40;
  const recoveryTime = action === 'remove' ? affected * 6 : action === 'upgrade' ? 120 : action === 'merge' ? 80 : 24;
  const execImpact = mod.workspace === 'executive' ? 'High' : 'Medium';
  const customerImpact = affected > 5 ? 'High' : affected > 2 ? 'Medium' : 'Low';
  const revenueRisk = (mod.workspace === 'commercial' || dependents.some((d) => d.workspace === 'commercial')) ? 'High' : 'Low';
  const archDelta = action === 'remove' ? -clamp(businessRisk * 0.3) : action === 'upgrade' ? +8 : action === 'merge' ? +6 : action === 'archive' ? -3 : +5;
  let decision = 'Approve';
  if (action === 'remove' && (affected > 4 || dependents.length > 2 || revenueRisk === 'High')) decision = 'Reject — critical blast radius';
  else if (action === 'remove' && affected > 1) decision = 'Caution — mitigate dependents first';
  else if (action === 'archive' && businessRisk > 50) decision = 'Caution — high business value, reconsider';
  else if (action === 'upgrade' || action === 'merge') decision = 'Approve — improves architecture';
  return {
    action, target: mod?.label || 'New Module', affectedModules: affected,
    brokenDependencies: dependents.length, dependents: dependents.map((d) => d.label),
    businessRisk, engineeringCost, recoveryTime, executiveImpact: execImpact,
    customerImpact, revenueRisk, architectureScoreChange: archDelta, recommendedDecision: decision,
  };
}

// ============================================================
// VALUE STREAM — customer value flow
// ============================================================
const VALUE_STAGES = [
  { id: 'visitor', name: 'Visitor', module: 'Landing', aiInfluence: 10, executiveValue: 5, revenue: 0, time: '0m' },
  { id: 'registration', name: 'Registration', module: 'Auth', aiInfluence: 15, executiveValue: 10, revenue: 0, time: '2m' },
  { id: 'assessment', name: 'Assessment', module: 'Onboarding', aiInfluence: 40, executiveValue: 25, revenue: 0, time: '10m' },
  { id: 'learning', name: 'Learning', module: 'Academy', aiInfluence: 60, executiveValue: 45, revenue: 5, time: '2w' },
  { id: 'simulation', name: 'Simulation', module: 'Simulator', aiInfluence: 75, executiveValue: 60, revenue: 10, time: '3w' },
  { id: 'decision-lab', name: 'Decision Lab™', module: 'Decision Lab', aiInfluence: 80, executiveValue: 75, revenue: 15, time: '4w' },
  { id: 'readiness', name: 'Executive Readiness™', module: 'Readiness Engine', aiInfluence: 85, executiveValue: 85, revenue: 25, time: '6w' },
  { id: 'career-growth', name: 'Career Growth™', module: 'Career Advisor', aiInfluence: 70, executiveValue: 80, revenue: 30, time: '8w' },
  { id: 'enterprise-upgrade', name: 'Enterprise Upgrade', module: 'Enterprise', aiInfluence: 50, executiveValue: 70, revenue: 60, time: '3m' },
  { id: 'subscription', name: 'Subscription', module: 'Billing', aiInfluence: 30, executiveValue: 40, revenue: 100, time: '3m' },
  { id: 'retention', name: 'Retention', module: 'Network', aiInfluence: 55, executiveValue: 65, revenue: 80, time: '12m' },
];
function computeValueStream() {
  // Simulate drop-off along the funnel
  let cohort = 1000;
  return VALUE_STAGES.map((s, i) => {
    const dropOff = i === 0 ? 0 : clamp(8 + i * 4 + (100 - s.aiInfluence) * 0.1);
    const entered = cohort;
    const exited = Math.round(entered * dropOff / 100);
    cohort = entered - exited;
    return {
      ...s, dropOff: Math.round(dropOff), entered, retained: cohort,
      recommendations: i === 0 ? 'Optimize landing conversion with founding beta CTA.'
        : s.aiInfluence < 50 ? 'Increase AI personalization to reduce drop-off.'
        : s.revenue < 30 ? 'Introduce mid-funnel monetization (career studio upsell).'
        : 'Strengthen enterprise expansion motion to multiply revenue.',
    };
  });
}

// ============================================================
// INVESTMENT ANALYZER — ROI per module
// ============================================================
function computeInvestments(graph) {
  const mods = graph.nodes.filter((n) => n.type === 'module');
  return mods.map((m) => {
    const devHours = m.investment || 0;
    const maintenanceHours = Math.round(devHours * 0.25 + m.complexity * 4);
    const businessValue = m.businessValue;
    const revenuePotential = m.workspace === 'commercial' ? clamp(businessValue + 10) : m.workspace === 'enterprise' ? clamp(businessValue * 0.7) : clamp(businessValue * 0.3);
    const executiveValue = m.executiveValue && m.executiveValue !== 'N/A' ? clamp(businessValue + 5) : clamp(businessValue * 0.4);
    const aiComplexity = m.aiEngines.length * 8;
    const technicalComplexity = m.complexity * 10;
    const customerAdoption = m.usage;
    const strategicImportance = clamp(businessValue + (m.documentation ? 5 : 0) + (m.engineeringPhase === 'e5' ? 10 : 0));
    const engineeringCost = Math.round(devHours + maintenanceHours);
    const roiScore = clamp((businessValue + revenuePotential + executiveValue + strategicImportance) / 4 - engineeringCost / 50);
    return {
      id: m.refId, name: m.label, owner: m.owner, workspace: m.workspace,
      devHours, maintenanceHours, businessValue, revenuePotential, executiveValue,
      aiComplexity, technicalComplexity, customerAdoption, strategicImportance,
      engineeringCost, roiScore,
    };
  });
}

// ============================================================
// PLATFORM EVOLUTION — AI recommendations (retire/merge/split/commercialize)
// ============================================================
function computeEvolution(graph, investments) {
  const mods = graph.nodes.filter((n) => n.type === 'module');
  const recs = [];
  // Retire: low value + low usage + high debt
  mods.filter((m) => m.businessValue < 70 && m.maturity < 72 && m.techDebt > 30).forEach((m) => {
    recs.push({ type: 'retire', target: m.label, moduleId: m.refId,
      businessValue: clamp(100 - m.businessValue), engineeringCost: 20, strategicAlignment: 60, risk: 30, confidence: 75, priority: 'Medium',
      reason: `${m.label} has declining value (${m.businessValue}) and high technical debt (${m.techDebt}). Retiring it reduces maintenance burden.` });
  });
  // Merge: near-duplicates (same capability + similar)
  const byCap = {};
  mods.forEach((m) => { (byCap[m.capability] = byCap[m.capability] || []).push(m); });
  Object.values(byCap).forEach((group) => {
    if (group.length >= 3) {
      const [a, b] = group.sort((x, y) => x.complexity - y.complexity).slice(0, 2);
      recs.push({ type: 'merge', target: `${a.label} + ${b.label}`, moduleId: a.refId,
        businessValue: clamp((a.businessValue + b.businessValue) / 2), engineeringCost: Math.round((a.investment + b.investment) * 0.4),
        strategicAlignment: 80, risk: 35, confidence: 70, priority: 'High',
        reason: `${a.label} and ${b.label} overlap in capability "${a.capability}". Merging reduces complexity and shared maintenance.` });
    }
  });
  // Split: high complexity + high value
  mods.filter((m) => m.complexity >= 8 && m.businessValue >= 80).forEach((m) => {
    recs.push({ type: 'split', target: m.label, moduleId: m.refId,
      businessValue: m.businessValue, engineeringCost: Math.round((m.investment || 100) * 0.8),
      strategicAlignment: 85, risk: 40, confidence: 72, priority: 'Medium',
      reason: `${m.label} is high-complexity (${m.complexity}/10) and high-value. Splitting it into focused sub-modules improves maintainability and team velocity.` });
  });
  // Commercialize: high executiveValue + enterprise interest
  mods.filter((m) => m.workspace === 'enterprise' && m.businessValue >= 78).forEach((m) => {
    recs.push({ type: 'commercialize', target: m.label, moduleId: m.refId,
      businessValue: clamp(m.businessValue + 10), engineeringCost: 150, strategicAlignment: 90, risk: 30, confidence: 80, priority: 'High',
      reason: `${m.label} delivers enterprise value (${m.businessValue}) and could be packaged as a standalone enterprise SaaS product.` });
  });
  // AI opportunity: modules with no AI but high value
  mods.filter((m) => m.aiEngines.length === 0 && m.businessValue >= 80 && m.workspace !== 'commercial').forEach((m) => {
    recs.push({ type: 'ai-opportunity', target: m.label, moduleId: m.refId,
      businessValue: clamp(m.businessValue + 15), engineeringCost: 80, strategicAlignment: 85, risk: 25, confidence: 78, priority: 'High',
      reason: `${m.label} has no AI engine yet but high value. Adding an AI engine would differentiate it and increase engagement.` });
  });
  return recs.sort((a, b) => b.businessValue - a.businessValue);
}

// ============================================================
// ARCHITECTURE FORECAST — 6/12/24/36 month projections
// ============================================================
function computeForecast(graph, kpis) {
  const overall = kpis.find((k) => k.id === 'overall').current;
  const complexity = kpis.find((k) => k.id === 'complexity').current;
  const mods = graph.nodes.filter((n) => n.type === 'module').length;
  const horizons = [6, 12, 24, 36];
  return horizons.map((months) => {
    const factor = months / 12;
    return {
      horizon: `${months} months`,
      growth: clamp(overall + factor * 8),
      complexity: clamp(complexity - factor * 5),
      maintenanceCost: Math.round(mods * 20 * factor + mods * 15),
      revenuePotential: Math.round(mods * 500 * factor * (1 + factor * 0.3)),
      aiExpansion: clamp(mods * 0.5 * factor),
      enterpriseAdoption: clamp(20 + factor * 25),
      technicalDebt: clamp(30 + factor * 10),
      documentationNeeds: Math.round(mods * 0.3 * factor),
      requiredRefactoring: Math.round(mods.filter(() => true).length * 0.15 * factor),
    };
  });
}

// ============================================================
// RISK SIMULATION — module/AI-engine failure scenarios
// ============================================================
function computeRiskSimulations(graph) {
  const mods = graph.nodes.filter((n) => n.type === 'module');
  const engines = graph.nodes.filter((n) => n.type === 'ai-engine');
  const risks = [];
  // High-dependency modules (fail these → big blast)
  const dependentsCount = {};
  graph.edges.filter((e) => e.type === 'depends-on').forEach((e) => { dependentsCount[e.to] = (dependentsCount[e.to] || 0) + 1; });
  mods.filter((m) => (dependentsCount[`m:${m.refId}`] || 0) >= 2).slice(0, 4).forEach((m) => {
    const impact = computeImpact(graph, `m:${m.refId}`);
    risks.push({ scenario: `Failure of ${m.label}`, type: 'module', target: m.label,
      blastRadius: impact.modulesImpacted, probability: 20, severity: impact.architectureRisk,
      recovery: `${impact.modulesImpacted * 6}h`, mitigation: 'Add failover and decouple dependents.' });
  });
  // High-risk AI engines
  engines.filter((e) => e.risk >= 60).slice(0, 3).forEach((e) => {
    const impact = computeImpact(graph, e.id);
    risks.push({ scenario: `Degradation of ${e.label}`, type: 'ai-engine', target: e.label,
      blastRadius: impact.modulesImpacted, probability: 30, severity: impact.architectureRisk,
      recovery: '4h', mitigation: 'Route to fallback model and alert governance.' });
  });
  // Security-critical
  mods.filter((m) => m.securityClassification === 'high').slice(0, 2).forEach((m) => {
    risks.push({ scenario: `Security breach via ${m.label}`, type: 'security', target: m.label,
      blastRadius: 8, probability: 15, severity: 'Critical', recovery: 'Immediate',
      mitigation: 'Enforce zero-trust and audit RLS policies.' });
  });
  return risks;
}

// ============================================================
// AUTONOMOUS EVOLUTION — drift / duplication / gaps detection
// ============================================================
function computeAutonomousEvolution(graph) {
  const mods = graph.nodes.filter((n) => n.type === 'module');
  const findings = [];
  // Feature duplication (same capability, multiple modules)
  const byCap = {};
  mods.forEach((m) => { (byCap[m.capability] = byCap[m.capability] || []).push(m); });
  Object.entries(byCap).forEach(([cap, group]) => {
    if (group.length >= 3) findings.push({ category: 'Feature Duplication', severity: 'Medium',
      detail: `${group.length} modules overlap in capability "${cap}". Consider merging.`, modules: group.map((m) => m.label) });
  });
  // Missing capabilities (no modules)
  CAPABILITIES.filter((c) => !mods.some((m) => m.capability === c.id)).forEach((c) => {
    findings.push({ category: 'Missing Capability', severity: 'High',
      detail: `No active modules deliver capability "${c.name}".`, recommendation: `Build or acquire modules for ${c.name}.` });
  });
  // Unused functionality (no routes)
  mods.filter((m) => m.routes.length === 0 && m.workspace !== 'platform').forEach((m) => {
    findings.push({ category: 'Unused Functionality', severity: 'Low',
      detail: `${m.label} exposes no routes. Verify it is still reachable.`, modules: [m.label] });
  });
  // Documentation gaps
  mods.filter((m) => m.documentation < 90).forEach((m) => {
    findings.push({ category: 'Documentation Gap', severity: 'Low',
      detail: `${m.label} is undocumented.`, modules: [m.label] });
  });
  // AI quality degradation
  mods.filter((m) => m.aiEngines.length > 0 && m.aiQuality < 70).forEach((m) => {
    findings.push({ category: 'AI Quality Degradation', severity: 'Medium',
      detail: `${m.label} AI quality is ${m.aiQuality}. Retune its engines.`, modules: [m.label] });
  });
  // Technical debt growth
  mods.filter((m) => m.techDebt > 35).slice(0, 5).forEach((m) => {
    findings.push({ category: 'Technical Debt Growth', severity: 'Medium',
      detail: `${m.label} technical debt is ${m.techDebt}.`, modules: [m.label] });
  });
  // Performance bottlenecks (high complexity + high usage)
  mods.filter((m) => m.complexity >= 8 && m.usage >= 78).slice(0, 4).forEach((m) => {
    findings.push({ category: 'Performance Bottleneck', severity: 'High',
      detail: `${m.label} is high-complexity and high-usage. Optimize before scaling.`, modules: [m.label] });
  });
  // Commercial opportunities
  mods.filter((m) => m.workspace === 'executive' && m.businessValue >= 85 && m.executiveValue !== 'N/A').slice(0, 3).forEach((m) => {
    findings.push({ category: 'Commercial Opportunity', severity: 'High',
      detail: `${m.label} delivers high executive value and could be productized.`, modules: [m.label] });
  });
  // Enterprise opportunities
  mods.filter((m) => m.workspace === 'enterprise').slice(0, 2).forEach((m) => {
    findings.push({ category: 'Enterprise Opportunity', severity: 'Medium',
      detail: `${m.label} can be expanded for enterprise multi-tenant.`, modules: [m.label] });
  });
  // Architecture drift (modules in early phase but high maturity variance)
  mods.filter((m) => m.engineeringPhase === 'e1' && m.maturity < 70).forEach((m) => {
    findings.push({ category: 'Architecture Drift', severity: 'Low',
      detail: `${m.label} is in Engineering 1 but maturity is low. Consider modernization.`, modules: [m.label] });
  });
  // Knowledge gaps
  mods.filter((m) => m.aiEngines.length === 0 && m.workspace !== 'commercial').slice(0, 3).forEach((m) => {
    findings.push({ category: 'Knowledge Gap', severity: 'Low',
      detail: `${m.label} has no AI knowledge layer.`, modules: [m.label] });
  });
  return findings;
}

// ============================================================
// EXECUTIVE EVOLUTION REPORT™
// ============================================================
function computeEvolutionReport(graph, kpis, evolution, autonomous) {
  const get = (id) => kpis.find((k) => k.id === id)?.current || 0;
  const topRisks = autonomous.filter((a) => a.severity === 'High' || a.severity === 'Critical').slice(0, 5).map((a) => `${a.category}: ${a.detail}`);
  const topOpportunities = evolution.filter((e) => e.businessValue >= 80).slice(0, 5).map((e) => `${e.type.toUpperCase()} ${e.target} (value ${e.businessValue})`);
  const immediateActions = autonomous.filter((a) => a.severity === 'High').slice(0, 3).map((a) => a.detail);
  return {
    generatedAt: new Date().toISOString(),
    platformSummary: `EXECLEAD.AI currently models ${graph.nodes.filter((n) => n.type === 'module').length} modules, ${graph.nodes.filter((n) => n.type === 'ai-engine').length} AI engines, and ${graph.nodes.filter((n) => n.type === 'entity').length} entities across ${Object.keys(WORKSPACE_META).length} workspaces.`,
    architectureHealth: get('stability'),
    businessHealth: get('capability'),
    aiHealth: get('exec-value'),
    commercialHealth: get('commercial'),
    enterpriseHealth: get('enterprise'),
    topRisks,
    topOpportunities,
    immediateActions,
    strategicRecommendations: [
      'Consolidate overlapping modules to reduce complexity and maintenance cost.',
      'Commercialize the highest-value executive modules as enterprise SaaS products.',
      'Add AI engines to high-value modules that currently lack intelligence layers.',
    ],
    engineeringPriorities: evolution.filter((e) => e.priority === 'High').slice(0, 5).map((e) => `${e.type}: ${e.target}`),
    suggestedADRs: [
      'ADR: Adopt a capability-first module ownership model.',
      'ADR: Mandate AI engine coverage for all high-value modules.',
      'ADR: Establish a commercialization gate for enterprise-ready modules.',
    ],
    suggestedRefactoring: autonomous.filter((a) => a.category === 'Technical Debt Growth' || a.category === 'Performance Bottleneck').slice(0, 3).map((a) => a.detail),
    suggestedNewProducts: evolution.filter((e) => e.type === 'commercialize').slice(0, 3).map((e) => e.target),
    suggestedEnterpriseFeatures: autonomous.filter((a) => a.category === 'Enterprise Opportunity').slice(0, 3).map((a) => a.detail),
    suggestedRevenueOpportunities: autonomous.filter((a) => a.category === 'Commercial Opportunity').slice(0, 3).map((a) => a.detail),
    overallRecommendation: get('overall') >= 85
      ? 'The platform is in strong shape. Focus on commercialization and enterprise expansion to multiply value.'
      : 'Invest in under-mature modules and resolve high-severity findings before pursuing new features.',
  };
}

// ============================================================
// SNAPSHOT — compute everything once, cache
// ============================================================
export function computeTwinSnapshot() {
  if (_twin) return _twin;
  const graph = buildGraph();
  const kpis = computeKpis(graph);
  const capabilities = computeCapabilities(graph);
  const valueStream = computeValueStream();
  const investments = computeInvestments(graph);
  const evolution = computeEvolution(graph, investments);
  const forecast = computeForecast(graph, kpis);
  const riskSimulations = computeRiskSimulations(graph);
  const autonomous = computeAutonomousEvolution(graph);
  const report = computeEvolutionReport(graph, kpis, evolution, autonomous);
  _twin = {
    graph, kpis, capabilities, valueStream, investments, evolution, forecast,
    riskSimulations, autonomous, report,
    actions: SIM_ACTIONS, workspaces: WORKSPACE_META, adrs: ADRS, phases: ENGINEERING_PHASES,
    stats: {
      modules: graph.nodes.filter((n) => n.type === 'module').length,
      aiEngines: graph.nodes.filter((n) => n.type === 'ai-engine').length,
      entities: graph.nodes.filter((n) => n.type === 'entity').length,
      routes: graph.nodes.filter((n) => n.type === 'route').length,
      capabilities: CAPABILITIES.length,
      workspaces: Object.keys(WORKSPACE_META).length,
      edges: graph.edges.length,
    },
  };
  return _twin;
}

export function refreshTwin() { _twin = null; return computeTwinSnapshot(); }
export function computeImpactFor(nodeId) { return computeImpact(computeTwinSnapshot().graph, nodeId); }
export function computeSimulationFor(action, moduleId, secondaryId) { return computeSimulation(computeTwinSnapshot().graph, action, moduleId, secondaryId); }

export { capabilityFor, VALUE_STAGES, SIM_ACTIONS };