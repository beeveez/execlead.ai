/**
 * Executive Intelligence Graph™
 * ============================================================
 * Connects platform intelligence — no isolated intelligence.
 *
 * Maps how modules influence each other:
 *
 *   Decision → Leadership DNA → Promotion Forecast
 *            → Journey → Coach → Dashboard
 *
 * Used to understand propagation paths and ensure
 * every intelligence update flows to connected modules.
 */

// ============================================================
// INTELLIGENCE NODES
// ============================================================

export const INTELLIGENCE_NODES = [
  { id: "decision", label: "Decision Intelligence™", category: "leadership" },
  { id: "leadership_dna", label: "Leadership DNA", category: "leadership" },
  { id: "promotion_forecast", label: "Promotion Forecast", category: "leadership" },
  { id: "journey", label: "Journey", category: "platform" },
  { id: "coach", label: "Executive Coach", category: "coach" },
  { id: "dashboard", label: "Dashboard", category: "platform" },
  { id: "briefing", label: "Executive Briefing™", category: "platform" },
  { id: "action_center", label: "Action Center", category: "platform" },
  { id: "simulator", label: "Executive Simulator", category: "learning" },
  { id: "academy", label: "Academy", category: "learning" },
  { id: "challenge", label: "Daily Challenge", category: "learning" },
  { id: "resume", label: "Resume AI", category: "career" },
  { id: "evidence", label: "Evidence Vault™", category: "identity" },
  { id: "reputation", label: "Executive Reputation", category: "leadership" },
  { id: "digital_twin", label: "Digital Twin™", category: "leadership" },
  { id: "memory", label: "Executive Memory™", category: "platform" },
  { id: "recommendations", label: "Recommendation Engine™", category: "platform" },
];

// ============================================================
// INTELLIGENCE EDGES (connections)
// ============================================================

export const INTELLIGENCE_EDGES = [
  // Decision → Leadership DNA → Promotion Forecast
  { from: "decision", to: "leadership_dna", label: "informs" },
  { from: "leadership_dna", to: "promotion_forecast", label: "feeds" },
  { from: "promotion_forecast", to: "journey", label: "updates" },
  { from: "journey", to: "coach", label: "guides" },
  { from: "coach", to: "dashboard", label: "refreshes" },
  { from: "coach", to: "briefing", label: "notes" },
  { from: "coach", to: "memory", label: "consolidates" },

  // Simulator → DNA → Forecast
  { from: "simulator", to: "leadership_dna", label: "updates" },
  { from: "simulator", to: "promotion_forecast", label: "recalculates" },
  { from: "simulator", to: "recommendations", label: "regenerates" },

  // Academy → Journey → Forecast
  { from: "academy", to: "journey", label: "progresses" },
  { from: "academy", to: "promotion_forecast", label: "recalculates" },
  { from: "academy", to: "recommendations", label: "regenerates" },

  // Challenge → Journey
  { from: "challenge", to: "journey", label: "updates" },
  { from: "challenge", to: "recommendations", label: "regenerates" },

  // Resume → Forecast
  { from: "resume", to: "promotion_forecast", label: "recalculates" },
  { from: "resume", to: "journey", label: "updates" },

  // Evidence → Forecast
  { from: "evidence", to: "promotion_forecast", label: "strengthens" },
  { from: "evidence", to: "journey", label: "updates" },

  // Reputation → Dashboard
  { from: "reputation", to: "dashboard", label: "displays" },

  // Digital Twin → Forecast
  { from: "digital_twin", to: "promotion_forecast", label: "models" },
  { from: "digital_twin", to: "recommendations", label: "informs" },

  // Memory → Coach
  { from: "memory", to: "coach", label: "enriches" },
  { from: "memory", to: "recommendations", label: "personalizes" },

  // Recommendations → Dashboard / Action Center / Coach
  { from: "recommendations", to: "dashboard", label: "powers" },
  { from: "recommendations", to: "action_center", label: "populates" },
  { from: "recommendations", to: "coach", label: "guides" },
  { from: "recommendations", to: "briefing", label: "informs" },

  // Briefing → Dashboard
  { from: "briefing", to: "dashboard", label: "summarizes" },

  // Action Center → Journey
  { from: "action_center", to: "journey", label: "progresses" },
  { from: "action_center", to: "recommendations", label: "regenerates" },
];

// ============================================================
// GRAPH API
// ============================================================

export function getNode(id) {
  return INTELLIGENCE_NODES.find((n) => n.id === id) || null;
}

export function getOutgoingEdges(nodeId) {
  return INTELLIGENCE_EDGES.filter((e) => e.from === nodeId);
}

export function getIncomingEdges(nodeId) {
  return INTELLIGENCE_EDGES.filter((e) => e.to === nodeId);
}

export function getConnectedNodes(nodeId) {
  const outgoing = getOutgoingEdges(nodeId).map((e) => e.to);
  const incoming = getIncomingEdges(nodeId).map((e) => e.from);
  return [...new Set([...outgoing, ...incoming])];
}

/**
 * Trace the propagation path from a source node.
 * Returns all nodes that will be affected by a change at the source.
 */
export function tracePropagation(sourceId, visited = new Set()) {
  if (visited.has(sourceId)) return [];
  visited.add(sourceId);

  const direct = getOutgoingEdges(sourceId).map((e) => e.to);
  let allAffected = [...direct];

  for (const targetId of direct) {
    const further = tracePropagation(targetId, visited);
    allAffected = [...allAffected, ...further];
  }

  return [...new Set(allAffected)];
}

export function getGraphStats() {
  const nodeCount = INTELLIGENCE_NODES.length;
  const edgeCount = INTELLIGENCE_EDGES.length;
  const categories = [...new Set(INTELLIGENCE_NODES.map((n) => n.category))];
  const avgConnections = (edgeCount * 2) / nodeCount;

  return {
    nodeCount,
    edgeCount,
    categories: categories.length,
    avgConnections: Math.round(avgConnections * 10) / 10,
    connectedness: Math.round((edgeCount / (nodeCount * (nodeCount - 1))) * 1000) / 10,
  };
}

export function getGraphHealth() {
  const stats = getGraphStats();
  const isolatedNodes = INTELLIGENCE_NODES.filter(
    (n) => getConnectedNodes(n.id).length === 0
  );
  return {
    ...stats,
    isolatedNodes: isolatedNodes.length,
    healthScore: isolatedNodes.length === 0 ? 100 : Math.round(((stats.nodeCount - isolatedNodes.length) / stats.nodeCount) * 100),
  };
}