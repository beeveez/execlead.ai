/**
 * EXECLEAD.AI — Executive Identity Graph™ Engine
 * ----------------------------------------------
 * The intelligence layer that connects every professional data object.
 * Defines graph nodes, relationships, impact calculation, and layout.
 */

export const NODE_TYPES = {
  user: { label: 'User', icon: 'User', color: '#6366f1', category: 'core' },
  experience: { label: 'Experience', icon: 'Briefcase', color: '#3b82f6', category: 'career' },
  education: { label: 'Education', icon: 'GraduationCap', color: '#06b6d4', category: 'career' },
  certification: { label: 'Certification', icon: 'Award', color: '#f59e0b', category: 'career' },
  career_goal: { label: 'Career Goal', icon: 'Target', color: '#ef4444', category: 'career' },
  skill: { label: 'Skill', icon: 'Zap', color: '#8b5cf6', category: 'competency' },
  competency: { label: 'Leadership Competency', icon: 'Brain', color: '#a855f7', category: 'competency' },
  leadership_dna: { label: 'Leadership DNA™', icon: 'Dna', color: '#7c3aed', category: 'competency' },
  journey: { label: 'Journey Event', icon: 'Map', color: '#10b981', category: 'activity' },
  achievement: { label: 'Achievement', icon: 'Trophy', color: '#fbbf24', category: 'activity' },
  award: { label: 'Award', icon: 'Medal', color: '#f97316', category: 'activity' },
  publication: { label: 'Publication', icon: 'FileText', color: '#0ea5e9', category: 'activity' },
  membership: { label: 'Membership', icon: 'Users', color: '#14b8a6', category: 'activity' },
  simulation: { label: 'Simulation', icon: 'Cpu', color: '#6366f1', category: 'activity' },
  learning: { label: 'Learning Record', icon: 'BookOpen', color: '#3b82f6', category: 'activity' },
  credential: { label: 'Executive Credential™', icon: 'ShieldCheck', color: '#10b981', category: 'executive' },
  readiness: { label: 'Executive Readiness™', icon: 'TrendingUp', color: '#a855f7', category: 'executive' },
  trust: { label: 'Executive Trust™', icon: 'Shield', color: '#06b6d4', category: 'executive' },
  reputation: { label: 'Executive Reputation™', icon: 'Star', color: '#fbbf24', category: 'executive' },
  portfolio: { label: 'Executive Portfolio™', icon: 'FolderCheck', color: '#10b981', category: 'executive' },
  promotion_forecast: { label: 'Promotion Forecast', icon: 'Rocket', color: '#f59e0b', category: 'executive' },
};

export const RELATIONSHIPS = [
  { source: 'experience', type: 'DEVELOPS', target: 'competency', weight: 2, description: 'Work experience develops leadership competencies' },
  { source: 'certification', type: 'VALIDATES', target: 'skill', weight: 1, description: 'Certification validates a skill' },
  { source: 'certification', type: 'INCREASES', target: 'trust', weight: 3, description: 'Certifications directly increase executive trust' },
  { source: 'simulation', type: 'IMPROVES', target: 'readiness', weight: 3, description: 'Simulation practice improves executive readiness' },
  { source: 'readiness', type: 'UNLOCKS', target: 'credential', weight: 5, description: 'Executive readiness unlocks credential eligibility' },
  { source: 'credential', type: 'INCREASES', target: 'trust', weight: 7, description: 'Credentials increase executive trust' },
  { source: 'trust', type: 'INFLUENCES', target: 'reputation', weight: 10, description: 'Trust influences reputation' },
  { source: 'learning', type: 'SUPPORTS', target: 'promotion_forecast', weight: 2, description: 'Learning supports promotion forecast' },
  { source: 'achievement', type: 'IMPROVES', target: 'portfolio', weight: 1, description: 'Achievements improve portfolio score' },
  { source: 'education', type: 'SUPPORTS', target: 'competency', weight: 1, description: 'Education supports competency development' },
  { source: 'competency', type: 'CONTRIBUTES_TO', target: 'leadership_dna', weight: 5, description: 'Competencies contribute to Leadership DNA' },
  { source: 'leadership_dna', type: 'STRENGTHENS', target: 'readiness', weight: 5, description: 'Leadership DNA strengthens readiness' },
  { source: 'skill', type: 'ENHANCES', target: 'readiness', weight: 1, description: 'Skills enhance readiness' },
  { source: 'award', type: 'IMPROVES', target: 'reputation', weight: 3, description: 'Awards improve reputation' },
  { source: 'publication', type: 'BUILDS', target: 'reputation', weight: 2, description: 'Publications build reputation' },
  { source: 'portfolio', type: 'INDICATES', target: 'readiness', weight: 5, description: 'Portfolio completeness indicates readiness' },
  { source: 'journey', type: 'TRACKS', target: 'readiness', weight: 1, description: 'Journey events track readiness progress' },
  { source: 'career_goal', type: 'ALIGNS_WITH', target: 'competency', weight: 1, description: 'Career goals align with competency development' },
  { source: 'membership', type: 'EXPANDS', target: 'reputation', weight: 1, description: 'Memberships expand reputation' },
  { source: 'trust', type: 'QUALIFIES', target: 'credential', weight: 5, description: 'Trust qualifies for credentials' },
  { source: 'reputation', type: 'BOOSTS', target: 'promotion_forecast', weight: 5, description: 'Reputation boosts promotion forecast' },
];

const RING_LAYOUT = [
  { radius: 0, types: ['user'] },
  { radius: 120, types: ['readiness', 'trust', 'reputation', 'portfolio', 'promotion_forecast', 'credential'] },
  { radius: 230, types: ['skill', 'competency', 'leadership_dna'] },
  { radius: 340, types: ['journey', 'achievement', 'award', 'publication', 'simulation', 'learning', 'membership'] },
  { radius: 450, types: ['experience', 'education', 'certification', 'career_goal'] },
];

export function getNodePositions(centerX = 500, centerY = 425) {
  const positions = {};
  for (const ring of RING_LAYOUT) {
    if (ring.radius === 0) {
      positions[ring.types[0]] = { x: centerX, y: centerY };
    } else {
      const count = ring.types.length;
      ring.types.forEach((type, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        positions[type] = {
          x: centerX + ring.radius * Math.cos(angle),
          y: centerY + ring.radius * Math.sin(angle),
        };
      });
    }
  }
  return positions;
}

export function getIncomingRelationships(nodeType) {
  return RELATIONSHIPS.filter(r => r.target === nodeType);
}

export function getOutgoingRelationships(nodeType) {
  return RELATIONSHIPS.filter(r => r.source === nodeType);
}

export function getDependentModules(nodeType) {
  const visited = new Set();
  const queue = [nodeType];
  const dependents = [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    const outgoing = RELATIONSHIPS.filter(r => r.source === current);
    for (const rel of outgoing) {
      if (!dependents.includes(rel.target)) dependents.push(rel.target);
      queue.push(rel.target);
    }
  }
  return dependents.filter(d => d !== nodeType);
}

/**
 * Build an impact tree from a source node.
 * Returns a tree structure: { nodeType, children: [{ relationship, children: {...} }] }
 * Cycle-safe via per-path visited set.
 */
export function buildImpactTree(nodeType, visited = new Set(), depth = 0) {
  if (depth > 6) return null;
  if (visited.has(nodeType)) return { nodeType, children: [], cyclic: true };
  const newVisited = new Set(visited);
  newVisited.add(nodeType);
  const outgoing = RELATIONSHIPS.filter(r => r.source === nodeType);
  const children = outgoing.map(rel => ({
    relationship: rel,
    children: buildImpactTree(rel.target, newVisited, depth + 1),
  }));
  return { nodeType, children };
}

/**
 * Flatten the impact tree into a list of steps with depth info.
 */
export function flattenImpactTree(tree, depth = 0, relationship = null) {
  if (!tree) return [];
  const items = [];
  if (relationship) {
    items.push({
      depth,
      source: relationship.source,
      type: relationship.type,
      target: tree.nodeType,
      weight: relationship.weight,
      cyclic: tree.cyclic,
    });
  }
  if (tree.children) {
    for (const child of tree.children) {
      items.push(...flattenImpactTree(child.children, depth + 1, child.relationship));
    }
  }
  return items;
}

/**
 * Calculate total cumulative impact from a source node.
 */
export function calculateTotalImpact(nodeType) {
  const tree = buildImpactTree(nodeType);
  const steps = flattenImpactTree(tree);
  const uniqueTargets = new Map();
  for (const step of steps) {
    if (!step.cyclic) {
      const current = uniqueTargets.get(step.target) || 0;
      uniqueTargets.set(step.target, current + step.weight);
    }
  }
  return {
    steps,
    totalImpact: Array.from(uniqueTargets.entries()).map(([target, weight]) => ({ target, weight })),
    affectedModules: Array.from(uniqueTargets.keys()),
  };
}