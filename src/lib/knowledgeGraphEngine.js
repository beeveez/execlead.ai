/**
 * EXECLEAD.AI — Knowledge Graph™ Engine
 * ============================================================
 * Evolves the EXEC™ Knowledge Index into a Knowledge Graph™.
 *
 * Every platform module, framework, workspace, engine, and
 * service becomes a graph node with typed relationships.
 *
 * Supports queries:
 *   "What depends on Executive Trust™?"
 *   "Show modules related to Leadership DNA™."
 *   "What breaks if I remove Platform State Manager™?"
 *   "Which workspace owns Product Intelligence™?"
 *   "What framework powers Executive Passport™?"
 */
import {
  MODULE_REGISTRY, FRAMEWORK_REGISTRY, WORKSPACE_REGISTRY,
  AI_PERSONA_REGISTRY, CAPABILITY_REGISTRY, KNOWLEDGE_PACK_REGISTRY,
} from "./platformManifest";
import { EXEC_FRAMEWORK_HIERARCHY } from "./execKnowledgeBase";

// ============================================================
// TYPES
// ============================================================

export const NODE_TYPES = {
  MODULE: "module",
  FRAMEWORK: "framework",
  WORKSPACE: "workspace",
  ENGINE: "engine",
  SERVICE: "service",
};

export const RELATIONSHIPS = {
  DEPENDS_ON: "Depends On",
  USES: "Uses",
  PROVIDES: "Provides",
  EXTENDS: "Extends",
  REFERENCES: "References",
  BELONGS_TO: "Belongs To",
  OWNED_BY: "Owned By",
  POWERED_BY: "Powered By",
  REPLACED_BY: "Replaced By",
  SUCCESSOR_TO: "Successor To",
};

export const NODE_COLORS = {
  module: "#6366f1",
  framework: "#f59e0b",
  workspace: "#06b6d4",
  engine: "#10b981",
  service: "#8b5cf6",
};

export const NODE_TYPE_LABELS = {
  module: "Module",
  framework: "Framework",
  workspace: "Workspace",
  engine: "AI Engine",
  service: "Platform Service",
};

// ============================================================
// GRAPH BUILDER
// ============================================================

function buildGraph() {
  const nodeMap = new Map();
  const edges = [];
  const edgeSet = new Set();

  function addNode(id, label, type, data) {
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { id, label, type, data, color: NODE_COLORS[type] || "#6b7280" });
    }
  }

  function addEdge(from, to, type) {
    if (!from || !to || from === to) return;
    const key = `${from}|${to}|${type}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push({ from, to, type });
  }

  // --- Framework nodes ---
  FRAMEWORK_REGISTRY.forEach(f => {
    addNode(`framework:${f.frameworkId}`, f.name, NODE_TYPES.FRAMEWORK, f);
    (f.dependencies || []).forEach(dep => {
      addEdge(`framework:${f.frameworkId}`, `framework:${dep}`, RELATIONSHIPS.DEPENDS_ON);
    });
  });

  // --- Workspace nodes ---
  WORKSPACE_REGISTRY.forEach(w => {
    addNode(`workspace:${w.workspaceId}`, w.name, NODE_TYPES.WORKSPACE, w);
  });

  // --- AI Persona / Engine nodes ---
  AI_PERSONA_REGISTRY.forEach(p => {
    addNode(`engine:${p.personaId}`, p.name || p.personaId, NODE_TYPES.ENGINE, p);
  });

  // --- Module nodes ---
  MODULE_REGISTRY.forEach(m => {
    addNode(`module:${m.moduleId}`, m.moduleName, NODE_TYPES.MODULE, m);

    // Module → Workspace (Belongs To)
    if (m.workspace) {
      addEdge(`module:${m.moduleId}`, `workspace:${m.workspace}`, RELATIONSHIPS.BELONGS_TO);
    }

    // Module → Framework (Powered By) via knowledge pack → framework
    if (m.knowledgePack) {
      const pack = KNOWLEDGE_PACK_REGISTRY.find(p => p.packId === m.knowledgePack);
      if (pack?.supportedFramework) {
        addEdge(`module:${m.moduleId}`, `framework:${pack.supportedFramework}`, RELATIONSHIPS.POWERED_BY);
      }
    }

    // Module → Persona (Owned By)
    if (m.aiPersona) {
      addEdge(`module:${m.moduleId}`, `engine:${m.aiPersona}`, RELATIONSHIPS.OWNED_BY);
    }

    // Module → Module (parent: Belongs To, from route hierarchy)
    const parts = m.route.split("/").filter(Boolean);
    if (parts.length > 1) {
      const parentPath = "/" + parts.slice(0, -1).join("/");
      const parent = MODULE_REGISTRY.find(p => p.route === parentPath);
      if (parent) {
        addEdge(`module:${m.moduleId}`, `module:${parent.moduleId}`, RELATIONSHIPS.BELONGS_TO);
      }
    }
  });

  // --- Related modules (shared framework + workspace → References) ---
  MODULE_REGISTRY.forEach(m => {
    if (!m.knowledgePack) return;
    const related = MODULE_REGISTRY.filter(other =>
      other.moduleId !== m.moduleId &&
      other.workspace === m.workspace &&
      other.knowledgePack === m.knowledgePack
    );
    related.forEach(r => {
      addEdge(`module:${m.moduleId}`, `module:${r.moduleId}`, RELATIONSHIPS.REFERENCES);
    });
  });

  // --- Capability → Module/Engine (References / Uses) ---
  CAPABILITY_REGISTRY.forEach(c => {
    addNode(`capability:${c.capabilityId}`, c.name, NODE_TYPES.ENGINE, c);
    if (c.framework) {
      addEdge(`capability:${c.capabilityId}`, `framework:${c.framework}`, RELATIONSHIPS.POWERED_BY);
    }
    if (c.aiPersona) {
      addEdge(`capability:${c.capabilityId}`, `engine:${c.aiPersona}`, RELATIONSHIPS.USES);
    }
    (c.dependencies || []).forEach(dep => {
      addEdge(`capability:${c.capabilityId}`, `framework:${dep}`, RELATIONSHIPS.DEPENDS_ON);
    });
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

export function getNode(id) {
  const { nodeMap } = getKnowledgeGraph();
  return nodeMap.get(id);
}

export function findNodeByLabel(label) {
  if (!label) return null;
  const { nodes } = getKnowledgeGraph();
  const lower = label.toLowerCase();
  return nodes.find(n => n.label.toLowerCase() === lower)
    || nodes.find(n => n.label.toLowerCase().includes(lower))
    || null;
}

export function getDirectRelationships(nodeId) {
  const { edges, nodeMap } = getKnowledgeGraph();
  return edges
    .filter(e => e.from === nodeId || e.to === nodeId)
    .map(e => {
      const isOutgoing = e.from === nodeId;
      return {
        type: e.type,
        direction: isOutgoing ? "outgoing" : "incoming",
        node: nodeMap.get(isOutgoing ? e.to : e.from),
      };
    })
    .filter(r => r.node);
}

/**
 * Impact Analysis: "What breaks if I remove X?"
 * Returns all nodes that transitively depend on the target.
 */
export function impactAnalysis(nodeId) {
  const { edges, nodeMap } = getKnowledgeGraph();
  const visited = new Set();
  const queue = [nodeId];
  const dependents = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    edges
      .filter(e => e.to === current && e.from !== nodeId)
      .forEach(e => {
        if (!visited.has(e.from)) {
          dependents.add(e.from);
          queue.push(e.from);
        }
      });
  }

  return Array.from(dependents).map(id => nodeMap.get(id)).filter(Boolean);
}

/**
 * Knowledge Path: module → framework → root methodology.
 */
export function getKnowledgePath(nodeId) {
  const { edges } = getKnowledgeGraph();
  const path = [nodeId];
  const visited = new Set();

  // Follow Powered By → framework
  const poweredBy = edges.find(e => e.from === nodeId && e.type === RELATIONSHIPS.POWERED_BY);
  if (poweredBy) {
    path.push(poweredBy.to);
    let current = poweredBy.to;
    while (current && !visited.has(current)) {
      visited.add(current);
      const dep = edges.find(e => e.from === current && e.type === RELATIONSHIPS.DEPENDS_ON);
      if (dep && !path.includes(dep.to)) {
        path.push(dep.to);
        current = dep.to;
      } else {
        break;
      }
    }
  }

  return path;
}

/**
 * Get all modules in a workspace.
 */
export function getModulesByWorkspace(workspaceId) {
  return getKnowledgeGraph().nodes.filter(n =>
    n.type === NODE_TYPES.MODULE && n.data?.workspace === workspaceId
  );
}

/**
 * Get all modules powered by a framework.
 */
export function getModulesByFramework(frameworkId) {
  const { edges, nodeMap } = getKnowledgeGraph();
  const moduleIds = edges
    .filter(e => e.to === `framework:${frameworkId}` && e.type === RELATIONSHIPS.POWERED_BY)
    .map(e => e.from);
  return moduleIds.map(id => nodeMap.get(id)).filter(Boolean);
}

/**
 * Search nodes by label, alias, or description.
 */
export function searchNodes(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return getKnowledgeGraph().nodes.filter(n =>
    n.label.toLowerCase().includes(q) ||
    (n.data?.aliases && n.data.aliases.some(a => a.toLowerCase().includes(q))) ||
    (n.data?.description && n.data.description.toLowerCase().includes(q))
  ).slice(0, 30);
}

/**
 * Get graph statistics.
 */
export function getGraphStats() {
  const { nodes, edges } = getKnowledgeGraph();
  const byType = {};
  nodes.forEach(n => { byType[n.type] = (byType[n.type] || 0) + 1; });
  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    byType,
  };
}