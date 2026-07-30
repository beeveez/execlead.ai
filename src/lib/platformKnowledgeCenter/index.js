import { base44 } from '@/api/base44Client';
import {
  MODULES, AI_ENGINES, ROUTES, ENTITIES,
  ENGINEERING_PHASES, ADRS, RELEASES, ARCHITECTURE_LAYERS, DEPENDENCY_EDGES,
  PK_VERSION, LAST_INDEXED,
} from './registry';

const norm = (s) => (s || '').toString().toLowerCase();

export function searchModules(query) {
  const q = norm(query);
  if (!q) return MODULES;
  return MODULES.filter((m) =>
    [m.name, m.description, m.purpose, m.category, ...(m.aiFeaturesUsed || []), ...(m.entities || []), ...(m.routes || [])]
      .some((f) => norm(f).includes(q))
  );
}

export function searchFeatures(query) {
  const q = norm(query);
  if (!q) return [];
  const match = (fields) => fields.some((f) => norm(f).includes(q));
  const modules = MODULES.filter((m) => match([m.name, m.description, m.purpose])).map((m) => ({ type: 'module', id: m.id, name: m.name, desc: m.description }));
  const engines = AI_ENGINES.filter((e) => match([e.name, e.purpose])).map((e) => ({ type: 'engine', id: e.id, name: e.name, desc: e.purpose }));
  const routes = ROUTES.filter((r) => match([r.name, r.path, r.purpose])).map((r) => ({ type: 'route', id: r.path, name: r.name, desc: r.purpose }));
  const entities = ENTITIES.filter((e) => match([e.name, e.purpose])).map((e) => ({ type: 'entity', id: e.name, name: e.name, desc: e.purpose }));
  return [...modules, ...engines, ...routes, ...entities];
}

export function getModule(id) {
  return MODULES.find((m) => m.id === id || m.name === id);
}

export function getModuleDependencies(id) {
  const downstream = DEPENDENCY_EDGES.filter((e) => e.from === id).map((e) => ({ ...e, module: MODULES.find((m) => m.id === e.to) }));
  const upstream = DEPENDENCY_EDGES.filter((e) => e.to === id).map((e) => ({ ...e, module: MODULES.find((m) => m.id === e.from) }));
  return { downstream, upstream };
}

export function getModulesByPhase(phaseId) {
  return MODULES.filter((m) => m.engineeringPhase === phaseId);
}

export function getModulesByCategory(category) {
  return MODULES.filter((m) => m.category === category);
}

export function getDashboardStats() {
  const totalModules = MODULES.length;
  const aiEngines = AI_ENGINES.length;
  const routes = ROUTES.length;
  const databaseEntities = ENTITIES.length;
  const architectureDecisions = ADRS.length;
  const features = MODULES.length;
  const releases = RELEASES.length;
  const documentationCoverage = Math.round((MODULES.filter((m) => m.documentation).length / totalModules) * 100);
  const avgComplexity = Math.round(MODULES.reduce((a, m) => a + (m.complexity || 0), 0) / totalModules);
  const technicalDebt = MODULES.filter((m) => m.knownLimitations?.length).length;
  const avgTrust = Math.round(MODULES.reduce((a, m) => a + (m.trustScore || 0), 0) / totalModules);
  const avgMaturity = Math.round(MODULES.reduce((a, m) => a + (m.maturity || 0), 0) / totalModules);
  return {
    totalModules, aiEngines, routes, databaseEntities, architectureDecisions, features, releases,
    documentationCoverage, technicalDebt, avgTrust, avgMaturity, avgComplexity,
    searchIndexStatus: 'indexed', version: PK_VERSION, lastIndexed: LAST_INDEXED,
  };
}

export function getFounderMemoryInsights() {
  const built = MODULES.filter((m) => m.status === 'active');
  const recentlyAdded = [...MODULES].sort((a, b) => (b.estimatedBuildDate || '').localeCompare(a.estimatedBuildDate || '')).slice(0, 8);
  const withoutDocs = MODULES.filter((m) => !m.documentation);
  const withoutAI = MODULES.filter((m) => !m.aiEngines?.length);
  const incomplete = MODULES.filter((m) => (m.knownLimitations || []).length > 0);
  const needsPolish = MODULES.filter((m) => m.maturity < 75).sort((a, b) => a.maturity - b.maturity);
  // duplicate detection: similar names
  const nameGroups = {};
  MODULES.forEach((m) => {
    const key = norm(m.name).replace(/[^a-z0-9]/g, '').slice(0, 10);
    (nameGroups[key] = nameGroups[key] || []).push(m.name);
  });
  const duplicates = Object.values(nameGroups).filter((g) => g.length > 1);
  // entities unused by any route/module
  const usedEntities = new Set();
  ROUTES.forEach((r) => (r.entities || []).forEach((e) => usedEntities.add(e)));
  MODULES.forEach((m) => (m.entities || []).forEach((e) => usedEntities.add(e)));
  const unusedEntities = ENTITIES.filter((e) => !usedEntities.has(e.name));
  return {
    builtCount: built.length,
    recentlyAdded,
    withoutDocs,
    withoutAI,
    incomplete,
    needsPolish,
    duplicates,
    unusedEntities,
    upcomingPriorities: incomplete.slice(0, 6).map((m) => m.name),
    highestValue: needsPolish.filter((m) => m.complexity >= 7).slice(0, 5).map((m) => ({ name: m.name, maturity: m.maturity })),
  };
}

export function generateModuleDocumentation(mod) {
  if (!mod) return null;
  return {
    executiveSummary: `${mod.name} — ${mod.description}. Purpose: ${mod.purpose}.`,
    businessValue: mod.businessValue || 'N/A',
    executiveValue: mod.executiveValue || 'N/A',
    architecture: `Category: ${mod.category}. Owner: ${mod.owner}. Engineering phase: ${mod.engineeringPhase}. Complexity: ${mod.complexity}/10.`,
    database: (mod.entities || []).length ? mod.entities.join(', ') : 'No direct entities',
    ai: (mod.aiFeaturesUsed || []).length ? mod.aiFeaturesUsed.join(', ') : 'No direct AI features',
    dependencies: (mod.dependencies || []).join(', ') || 'None',
    security: `Classification: ${mod.securityClassification}. Permissions: ${mod.permissions}.`,
    futureEnhancements: (mod.futureEnhancements || []).join('; ') || 'None planned',
    knownIssues: (mod.knownLimitations || []).join('; ') || 'None known',
  };
}

const REGISTRY_CONTEXT = () => {
  const modSum = MODULES.map((m) => `- ${m.name} [${m.category}]: ${m.description}`).join('\n');
  const engSum = AI_ENGINES.map((e) => `- ${e.name}: ${e.purpose}`).join('\n');
  const phaseSum = ENGINEERING_PHASES.map((p) => `${p.name}: ${p.features.join(', ')}`).join('\n');
  return `MODULES:\n${modSum}\n\nAI ENGINES:\n${engSum}\n\nENGINEERING PHASES:\n${phaseSum}`;
};

export async function askPlatformAI(question) {
  if (!question?.trim()) return { answer: 'Ask me anything about the EXECLEAD.AI platform.', related: [] };
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You are the AI Documentation Assistant for EXECLEAD.AI, a platform of executive leadership tools. Answer the user's question using ONLY the registry context below. Be concise, cite specific module/engine names, and list related modules. If the answer isn't in the registry, say so.\n\nREGISTRY CONTEXT:\n${REGISTRY_CONTEXT()}\n\nQUESTION: ${question}\n\nAnswer concisely in 2-4 sentences, then list "Related:" module names.`,
    response_json_schema: {
      type: 'object',
      properties: {
        answer: { type: 'string' },
        related: { type: 'array', items: { type: 'string' } },
      },
    },
  });
  return { answer: res.answer, related: res.related || [] };
}

export { MODULES, AI_ENGINES, ROUTES, ENTITIES, ENGINEERING_PHASES, ADRS, RELEASES, ARCHITECTURE_LAYERS, DEPENDENCY_EDGES };