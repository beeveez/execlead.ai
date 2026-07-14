/**
 * EXECLEAD.AI — Knowledge Graph™ Engine v2.0
 * ============================================================
 * True graph with typed nodes (Module, Framework, Workspace,
 * AI Engine, Service, API, Entity, Registry) and typed edges.
 *
 * Supports: impact analysis, shortest path, knowledge path,
 * filtering, degree-based importance, connected-set queries.
 */
import {
  MODULE_REGISTRY, FRAMEWORK_REGISTRY, WORKSPACE_REGISTRY,
  AI_PERSONA_REGISTRY, CAPABILITY_REGISTRY, KNOWLEDGE_PACK_REGISTRY,
} from "./platformManifest";

// ============================================================
// TYPES
// ============================================================

export const NODE_TYPES = {
  MODULE: "module", FRAMEWORK: "framework", WORKSPACE: "workspace",
  ENGINE: "engine", SERVICE: "service", API: "api", ENTITY: "entity", REGISTRY: "registry",
};

export const RELATIONSHIPS = {
  DEPENDS_ON: "Depends On", USES: "Uses", PROVIDES: "Provides", EXTENDS: "Extends",
  REFERENCES: "References", BELONGS_TO: "Belongs To", OWNED_BY: "Owned By",
  POWERED_BY: "Powered By", OWNS: "Owns", REPLACED_BY: "Replaced By", SUCCESSOR_TO: "Successor To",
};

export const NODE_COLORS = {
  module: "#6366f1", framework: "#f59e0b", workspace: "#06b6d4",
  engine: "#10b981", service: "#8b5cf6", api: "#ec4899", entity: "#14b8a6", registry: "#f97316",
};

export const NODE_TYPE_LABELS = {
  module: "Module", framework: "Framework", workspace: "Workspace",
  engine: "AI Engine", service: "Service", api: "API", entity: "Entity", registry: "Registry",
};

// ============================================================
// STATIC DATA FOR ADDITIONAL NODE TYPES
// ============================================================

const BACKEND_FUNCTIONS = [
  "accountDeletion","aiWorkforce","calculateJobMatch","executiveEvents","getAIOperations",
  "getProductInsights","getScopedNotifications","jobApplicationTools","joinCommunity",
  "manageCodeOfConduct","manageConfig","manageELIM","manageExecutiveWallet","manageIdentityTransfer",
  "manageIdentityVerification","manageIntelligence","manageJourney","manageLegacyLibrary",
  "manageReputation","manageSecurityOperations","manageTimeCapsule","organizationDangerZone",
  "partnershipOps","processReferral","recomputeIntelligence","reserveFoundingMembership",
  "resolveSubscription","runProductAI","runScheduledReports","scimServer","syncExecKnowledge",
  "syncJobs","syncPlatformManifest","testEmailConnection",
];

const KEY_ENTITIES = [
  "User","UserProfile","Organization","Subscription","Company","Task","Notification","Feedback",
  "ExecutiveWallet","ExecutiveReputation","SecuritySession","NetworkConnection","LeadershipLetter",
  "FoundingMember","CareerOpportunity","LessonProgress","ExecutiveCompetency","FeatureFlag",
  "BetaApplication","Vendor","ProcurementRequest","EnterpriseReport","ArchitectureProposal",
  "ConsentRecord","TelemetryEvent",
];

const REGISTRY_NAMES = [
  "Route Registry","Module Registry","Framework Registry","Workspace Registry",
  "Knowledge Pack Registry","AI Persona Registry","Capability Registry","Feature Flag Registry",
  "Subscription Registry",
];

const SERVICE_NAMES = [
  "AI Service","Database Service","Auth Service","Email Service",
  "File Storage Service","Analytics Service","Telemetry Service",
];

const MODULE_API_MAP = {
  career: ["calculateJobMatch","jobApplicationTools"], wallet: ["manageExecutiveWallet"],
  reputation: ["manageReputation"], journey: ["manageJourney"],
  intelligence: ["manageIntelligence","recomputeIntelligence"], elim: ["manageELIM"],
  "legacy-library": ["manageLegacyLibrary","manageCodeOfConduct"],
  "identity-verification": ["manageIdentityVerification"], "identity-transfer": ["manageIdentityTransfer"],
  network: ["joinCommunity"], founder: ["reserveFoundingMembership","manageTimeCapsule"],
  billing: ["resolveSubscription"], security: ["manageSecurityOperations"],
  developer: ["syncExecKnowledge","syncPlatformManifest"], product: ["runProductAI","getProductInsights"],
  "ai-command-center": ["getAIOperations","aiWorkforce"], admin: ["getScopedNotifications"],
  enterprise: ["scimServer","organizationDangerZone"], partnerships: ["partnershipOps"],
  events: ["executiveEvents"], reports: ["runScheduledReports"], email: ["testEmailConnection"],
  referrals: ["processReferral"], config: ["manageConfig"],
};

const MODULE_ENTITY_MAP = {
  billing: ["Subscription","EnterpriseReport"], wallet: ["ExecutiveWallet"],
  reputation: ["ExecutiveReputation"], security: ["SecuritySession"],
  enterprise: ["Organization","Vendor","ProcurementRequest"], companies: ["Company"],
  network: ["NetworkConnection","LeadershipLetter"], "legacy-library": ["LeadershipLetter"],
  founder: ["FoundingMember"], career: ["CareerOpportunity"], feedback: ["Feedback"],
  profile: ["UserProfile"], academy: ["LessonProgress"], intelligence: ["ExecutiveCompetency"],
  journey: ["LessonProgress"], notifications: ["Notification"], referrals: ["FoundingMember"],
  "feature-flags": ["FeatureFlag"], "beta-operations": ["BetaApplication"],
  "architecture-governance": ["ArchitectureProposal"], privacy: ["ConsentRecord"],
  observability: ["TelemetryEvent"], "release-readiness": ["EnterpriseReport"],
};

// ============================================================
// GRAPH BUILDER
// ============================================================

function buildGraph() {
  const nodeMap = new Map();
  const edges = [];
  const edgeSet = new Set();

  function addNode(id, label, type, data) {
    if (!nodeMap.has(id)) nodeMap.set(id, { id, label, type, data, color: NODE_COLORS[type] || "#6b7280" });
  }
  function addEdge(from, to, type) {
    if (!from || !to || from === to) return;
    const key = `${from}|${to}|${type}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push({ from, to, type });
  }

  // Frameworks
  FRAMEWORK_REGISTRY.forEach(f => {
    addNode(`framework:${f.frameworkId}`, f.name, NODE_TYPES.FRAMEWORK, f);
    (f.dependencies || []).forEach(dep => addEdge(`framework:${f.frameworkId}`, `framework:${dep}`, RELATIONSHIPS.DEPENDS_ON));
  });

  // Workspaces
  WORKSPACE_REGISTRY.forEach(w => addNode(`workspace:${w.workspaceId}`, w.name, NODE_TYPES.WORKSPACE, w));

  // AI Personas
  AI_PERSONA_REGISTRY.forEach(p => addNode(`engine:${p.personaId}`, p.name || p.personaId, NODE_TYPES.ENGINE, p));

  // Modules + edges
  MODULE_REGISTRY.forEach(m => {
    addNode(`module:${m.moduleId}`, m.moduleName, NODE_TYPES.MODULE, m);
    if (m.workspace) addEdge(`module:${m.moduleId}`, `workspace:${m.workspace}`, RELATIONSHIPS.BELONGS_TO);
    if (m.knowledgePack) {
      const pack = KNOWLEDGE_PACK_REGISTRY.find(p => p.packId === m.knowledgePack);
      if (pack?.supportedFramework) addEdge(`module:${m.moduleId}`, `framework:${pack.supportedFramework}`, RELATIONSHIPS.POWERED_BY);
    }
    if (m.aiPersona) addEdge(`module:${m.moduleId}`, `engine:${m.aiPersona}`, RELATIONSHIPS.OWNED_BY);
    // Parent module
    const parts = m.route.split("/").filter(Boolean);
    if (parts.length > 1) {
      const parentPath = "/" + parts.slice(0, -1).join("/");
      const parent = MODULE_REGISTRY.find(p => p.route === parentPath);
      if (parent) addEdge(`module:${m.moduleId}`, `module:${parent.moduleId}`, RELATIONSHIPS.BELONGS_TO);
    }
    // API edges
    (MODULE_API_MAP[m.moduleId] || []).forEach(api => addEdge(`module:${m.moduleId}`, `api:${api}`, RELATIONSHIPS.USES));
    // Entity edges
    (MODULE_ENTITY_MAP[m.moduleId] || []).forEach(e => addEdge(`module:${m.moduleId}`, `entity:${e}`, RELATIONSHIPS.USES));
  });

  // Related modules (shared framework + workspace)
  MODULE_REGISTRY.forEach(m => {
    if (!m.knowledgePack) return;
    MODULE_REGISTRY.filter(o => o.moduleId !== m.moduleId && o.workspace === m.workspace && o.knowledgePack === m.knowledgePack)
      .forEach(r => addEdge(`module:${m.moduleId}`, `module:${r.moduleId}`, RELATIONSHIPS.REFERENCES));
  });

  // API nodes
  BACKEND_FUNCTIONS.forEach(fn => addNode(`api:${fn}`, fn.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()).trim(), NODE_TYPES.API, { name: fn }));

  // Entity nodes
  KEY_ENTITIES.forEach(e => addNode(`entity:${e}`, e, NODE_TYPES.ENTITY, { name: e }));

  // Registry nodes
  REGISTRY_NAMES.forEach(r => addNode(`registry:${r}`, r, NODE_TYPES.REGISTRY, { name: r }));
  MODULE_REGISTRY.filter(m => m.workspace === "developer").forEach(m =>
    REGISTRY_NAMES.forEach(r => addEdge(`module:${m.moduleId}`, `registry:${r}`, RELATIONSHIPS.REFERENCES))
  );

  // Service nodes
  SERVICE_NAMES.forEach(s => addNode(`service:${s}`, s, NODE_TYPES.SERVICE, { name: s }));
  MODULE_REGISTRY.forEach(m => {
    addEdge(`module:${m.moduleId}`, `service:Database Service`, RELATIONSHIPS.USES);
    addEdge(`module:${m.moduleId}`, `service:Auth Service`, RELATIONSHIPS.USES);
    if (m.aiPersona) addEdge(`module:${m.moduleId}`, `service:AI Service`, RELATIONSHIPS.USES);
  });

  return { nodes: Array.from(nodeMap.values()), edges, nodeMap };
}

let _graph = null;
export function getKnowledgeGraph() {
  if (!_graph) _graph = buildGraph();
  return _graph;
}

// ============================================================
// QUERY API
// ============================================================

export function getNode(id) { return getKnowledgeGraph().nodeMap.get(id); }

export function findNodeByLabel(label) {
  if (!label) return null;
  const { nodes } = getKnowledgeGraph();
  const lower = label.toLowerCase();
  return nodes.find(n => n.label.toLowerCase() === lower) || nodes.find(n => n.label.toLowerCase().includes(lower)) || null;
}

export function getDirectRelationships(nodeId) {
  const { edges, nodeMap } = getKnowledgeGraph();
  return edges.filter(e => e.from === nodeId || e.to === nodeId).map(e => {
    const isOut = e.from === nodeId;
    return { type: e.type, direction: isOut ? "outgoing" : "incoming", node: nodeMap.get(isOut ? e.to : e.from) };
  }).filter(r => r.node);
}

export function getConnectedSet(nodeId) {
  const { edges } = getKnowledgeGraph();
  const set = new Set([nodeId]);
  edges.forEach(e => { if (e.from === nodeId) set.add(e.to); if (e.to === nodeId) set.add(e.from); });
  return set;
}

export function impactAnalysis(nodeId) {
  const { edges, nodeMap } = getKnowledgeGraph();
  const visited = new Set(), queue = [nodeId], dependents = new Set();
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    edges.filter(e => e.to === current && e.from !== nodeId).forEach(e => {
      if (!visited.has(e.from)) { dependents.add(e.from); queue.push(e.from); }
    });
  }
  return Array.from(dependents).map(id => nodeMap.get(id)).filter(Boolean);
}

export function getImpactCategorized(nodeId) {
  const impacted = impactAnalysis(nodeId);
  const byType = {};
  impacted.forEach(n => { byType[n.type] = (byType[n.type] || 0) + 1; });
  const riskScore = Math.min(100, impacted.length * 4 + Object.keys(byType).length * 8);
  return { nodes: impacted, byType, riskScore, totalCount: impacted.length };
}

export function getKnowledgePath(nodeId) {
  const { edges } = getKnowledgeGraph();
  const path = [nodeId], visited = new Set();
  const poweredBy = edges.find(e => e.from === nodeId && e.type === RELATIONSHIPS.POWERED_BY);
  if (poweredBy) {
    path.push(poweredBy.to);
    let current = poweredBy.to;
    while (current && !visited.has(current)) {
      visited.add(current);
      const dep = edges.find(e => e.from === current && e.type === RELATIONSHIPS.DEPENDS_ON);
      if (dep && !path.includes(dep.to)) { path.push(dep.to); current = dep.to; } else break;
    }
  }
  return path;
}

export function shortestPath(fromId, toId) {
  const { edges } = getKnowledgeGraph();
  const adj = new Map();
  edges.forEach(e => {
    if (!adj.has(e.from)) adj.set(e.from, []);
    if (!adj.has(e.to)) adj.set(e.to, []);
    adj.get(e.from).push(e.to);
    adj.get(e.to).push(e.from);
  });
  const visited = new Set([fromId]);
  const queue = [[fromId]];
  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];
    if (current === toId) return path;
    for (const next of (adj.get(current) || [])) {
      if (!visited.has(next)) { visited.add(next); queue.push([...path, next]); }
    }
  }
  return [];
}

export function getNodeDegree(nodeId) {
  return getKnowledgeGraph().edges.filter(e => e.from === nodeId || e.to === nodeId).length;
}

export function getModulesByWorkspace(workspaceId) {
  return getKnowledgeGraph().nodes.filter(n => n.type === NODE_TYPES.MODULE && n.data?.workspace === workspaceId);
}

export function getModulesByFramework(frameworkId) {
  const { edges, nodeMap } = getKnowledgeGraph();
  return edges.filter(e => e.to === `framework:${frameworkId}` && e.type === RELATIONSHIPS.POWERED_BY).map(e => nodeMap.get(e.from)).filter(Boolean);
}

export function searchNodes(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return getKnowledgeGraph().nodes.filter(n =>
    n.label.toLowerCase().includes(q) ||
    (n.data?.aliases && n.data.aliases.some(a => a.toLowerCase().includes(q))) ||
    (n.data?.description && n.data.description.toLowerCase().includes(q))
  ).slice(0, 30);
}

export function applyFilters(graph, filters) {
  if (!filters) return graph;
  const { nodeType, workspace, relationship, status } = filters;
  const hasFilter = [nodeType, workspace, relationship, status].some(v => v && v !== "all");
  if (!hasFilter) return graph;
  const filteredNodes = graph.nodes.filter(n => {
    if (nodeType && nodeType !== "all" && n.type !== nodeType) return false;
    if (workspace && workspace !== "all") {
      const nodeWs = n.data?.workspace || (n.type === "workspace" ? n.id.replace("workspace:", "") : null);
      if (nodeWs !== workspace) return false;
    }
    if (status && status !== "all" && n.data?.status !== status) return false;
    return true;
  });
  const nodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = graph.edges.filter(e => {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) return false;
    if (relationship && relationship !== "all" && e.type !== relationship) return false;
    return true;
  });
  return { nodes: filteredNodes, edges: filteredEdges, nodeMap: new Map(filteredNodes.map(n => [n.id, n])) };
}

export function getGraphStats() {
  const { nodes, edges } = getKnowledgeGraph();
  const byType = {};
  nodes.forEach(n => { byType[n.type] = (byType[n.type] || 0) + 1; });
  return { totalNodes: nodes.length, totalEdges: edges.length, byType };
}

// ============================================================
// NEIGHBORHOOD EXPLORATION API
// ============================================================

/**
 * Build a subgraph containing only the specified node IDs
 * and edges between them.
 */
export function buildSubgraph(nodeIds) {
  const { edges, nodeMap } = getKnowledgeGraph();
  const idSet = nodeIds instanceof Set ? nodeIds : new Set(nodeIds);
  const nodes = Array.from(idSet).map(id => nodeMap.get(id)).filter(Boolean);
  const visibleEdges = edges.filter(e => idSet.has(e.from) && idSet.has(e.to));
  return { nodes, edges: visibleEdges, nodeMap: new Map(nodes.map(n => [n.id, n])) };
}

/**
 * Get the neighborhood of a root node up to a given depth.
 * Returns a subgraph with the root and all nodes within `depth` hops.
 */
export function getNeighborhood(rootId, depth = 1) {
  const { edges } = getKnowledgeGraph();
  const visibleIds = new Set([rootId]);
  let frontier = [rootId];
  for (let d = 0; d < depth; d++) {
    const next = [];
    for (const id of frontier) {
      edges.forEach(e => {
        if (e.from === id && !visibleIds.has(e.to)) { visibleIds.add(e.to); next.push(e.to); }
        else if (e.to === id && !visibleIds.has(e.from)) { visibleIds.add(e.from); next.push(e.from); }
      });
    }
    frontier = next;
  }
  return buildSubgraph(visibleIds);
}

/**
 * Expand the visible node set by one of:
 *   "level"        — add all direct neighbors of currently visible nodes
 *   "dependencies" — add nodes that visible nodes depend on (hierarchical edges)
 *   "references"   — add nodes that reference or are referenced by visible nodes
 *   "workspace"    — add all modules in the same workspace as the root
 */
export function expandNodes(currentIds, expandType) {
  const { edges, nodeMap } = getKnowledgeGraph();
  const current = currentIds instanceof Set ? currentIds : new Set(currentIds);
  const added = new Set();

  if (expandType === "workspace") {
    const workspaces = new Set();
    current.forEach(id => {
      const node = nodeMap.get(id);
      if (node?.data?.workspace) workspaces.add(node.data.workspace);
      if (node?.type === "workspace") workspaces.add(node.id.replace("workspace:", ""));
    });
    nodeMap.forEach(node => {
      if (node.data?.workspace && workspaces.has(node.data.workspace)) added.add(node.id);
    });
  } else {
    const hierarchicalTypes = [RELATIONSHIPS.DEPENDS_ON, RELATIONSHIPS.POWERED_BY, RELATIONSHIPS.BELONGS_TO];
    for (const id of current) {
      edges.forEach(e => {
        if (expandType === "level") {
          if (e.from === id && !current.has(e.to)) added.add(e.to);
          else if (e.to === id && !current.has(e.from)) added.add(e.from);
        } else if (expandType === "dependencies") {
          if (e.from === id && hierarchicalTypes.includes(e.type) && !current.has(e.to)) added.add(e.to);
          if (e.to === id && hierarchicalTypes.includes(e.type) && !current.has(e.from)) added.add(e.from);
        } else if (expandType === "references") {
          if (e.from === id && e.type === RELATIONSHIPS.REFERENCES && !current.has(e.to)) added.add(e.to);
          else if (e.to === id && e.type === RELATIONSHIPS.REFERENCES && !current.has(e.from)) added.add(e.from);
        }
      });
    }
  }

  const allIds = new Set([...current, ...added]);
  return { ...buildSubgraph(allIds), addedCount: added.size };
}

/**
 * Check whether a node participates in a hierarchical structure
 * (has incoming or outgoing Depends On / Powered By / Belongs To edges).
 * Used to determine whether Tree layout is valid.
 */
export function hasHierarchicalStructure(rootId) {
  const { edges } = getKnowledgeGraph();
  const hierarchicalTypes = [RELATIONSHIPS.DEPENDS_ON, RELATIONSHIPS.POWERED_BY, RELATIONSHIPS.BELONGS_TO];
  return edges.some(e =>
    (e.from === rootId || e.to === rootId) && hierarchicalTypes.includes(e.type)
  );
}