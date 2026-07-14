/**
 * Force-directed graph layout simulation v2.
 *
 * Forces:
 *   forceManyBody()  — charge repulsion (O(n²))
 *   forceLink()      — edge attraction
 *   forceCenter()    — gravity toward canvas center
 *   forceCollide()   — prevents node overlap
 *
 * Initialization: golden-spiral distribution for even spread.
 * Fallback: if simulation fails to stabilize, applyRadialLayout().
 */

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function nodeRadius(n) {
  return 6 + Math.min(n.degree * 0.8, 12);
}

export class ForceSimulation {
  constructor(nodes, edges, width = 800, height = 600) {
    this.width = Math.max(width, 100);
    this.height = Math.max(height, 100);

    const degree = new Map();
    edges.forEach(e => {
      degree.set(e.from, (degree.get(e.from) || 0) + 1);
      degree.set(e.to, (degree.get(e.to) || 0) + 1);
    });

    const n = nodes.length;

    // Golden-spiral initialization — distributes nodes evenly across a wide area
    const spiralRadius = Math.max(this.width, this.height) * 0.6 + n * 1.5;
    this.nodes = nodes.map((node, i) => {
      const t = n > 1 ? i / (n - 1) : 0.5;
      const r = Math.sqrt(t) * spiralRadius;
      const angle = i * GOLDEN_ANGLE;
      return {
        ...node,
        degree: degree.get(node.id) || 0,
        x: this.width / 2 + Math.cos(angle) * r,
        y: this.height / 2 + Math.sin(angle) * r,
        vx: 0, vy: 0, fx: null, fy: null,
      };
    });

    this.edges = edges;
    this.nodeMap = new Map(this.nodes.map(n => [n.id, n]));

    // Simulation parameters — tuned for 50-300 nodes
    this.alpha = 1;
    this.alphaMin = 0.003;
    this.alphaDecay = 0.012;
    this.velocityDecay = 0.55;
    // Charge strength scales with node count to ensure separation
    this.chargeStrength = -(250 + n * 2);
    this.linkDistance = 70;
    this.linkStrength = 0.25;
    this.centerStrength = 0.015;
    this.collisionPadding = 8;
    this.stabilized = false;
  }

  setDimensions(w, h) {
    this.width = Math.max(w, 100);
    this.height = Math.max(h, 100);
  }

  reheat(alpha = 1) { this.alpha = Math.max(this.alpha, alpha); }

  tick() {
    if (this.alpha < this.alphaMin) return false;
    const n = this.nodes.length;
    if (n === 0) return false;
    const cx = this.width / 2, cy = this.height / 2;

    // --- forceManyBody: charge repulsion (O(n²)) ---
    for (let i = 0; i < n; i++) {
      const a = this.nodes[i];
      for (let j = i + 1; j < n; j++) {
        const b = this.nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < 1) distSq = 1;
        const dist = Math.sqrt(distSq);
        const force = this.chargeStrength * this.alpha / distSq;
        const fx = force * dx / dist, fy = force * dy / dist;
        a.vx -= fx; a.vy -= fy;
        b.vx += fx; b.vy += fy;
      }
    }

    // --- forceLink: edge attraction ---
    for (const e of this.edges) {
      const a = this.nodeMap.get(e.from), b = this.nodeMap.get(e.to);
      if (!a || !b) continue;
      let dx = b.x - a.x, dy = b.y - a.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - this.linkDistance) * this.linkStrength * this.alpha;
      const fx = force * dx / dist, fy = force * dy / dist;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }

    // --- forceCenter + integrate ---
    for (const node of this.nodes) {
      node.vx += (cx - node.x) * this.centerStrength * this.alpha;
      node.vy += (cy - node.y) * this.centerStrength * this.alpha;
      node.vx *= this.velocityDecay;
      node.vy *= this.velocityDecay;
      if (node.fx !== null) { node.x = node.fx; node.vx = 0; } else node.x += node.vx;
      if (node.fy !== null) { node.y = node.fy; node.vy = 0; } else node.y += node.vy;
    }

    // --- forceCollide: prevent node overlap (O(n²)) ---
    for (let i = 0; i < n; i++) {
      const a = this.nodes[i];
      const ra = nodeRadius(a) + this.collisionPadding;
      for (let j = i + 1; j < n; j++) {
        const b = this.nodes[j];
        const rb = nodeRadius(b) + this.collisionPadding;
        const minR = ra + rb;
        let dx = b.x - a.x, dy = b.y - a.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < minR * minR) {
          if (distSq < 0.01) {
            // Nodes at exact same position — deterministic nudge
            const angle = (i * 7 + j * 13) % (2 * Math.PI);
            const nudge = minR * 0.5;
            if (a.fx === null) a.x -= Math.cos(angle) * nudge;
            if (a.fy === null) a.y -= Math.sin(angle) * nudge;
            if (b.fx === null) b.x += Math.cos(angle) * nudge;
            if (b.fy === null) b.y += Math.sin(angle) * nudge;
          } else {
            const dist = Math.sqrt(distSq);
            const overlap = (minR - dist) * 0.5;
            const px = dx / dist * overlap, py = dy / dist * overlap;
            if (a.fx === null) a.x -= px;
            if (a.fy === null) a.y -= py;
            if (b.fx === null) b.x += px;
            if (b.fy === null) b.y += py;
          }
        }
      }
    }

    this.alpha *= 1 - this.alphaDecay;
    return true;
  }

  /**
   * Check if the graph has spread out enough to be readable.
   * If not, the caller should fall back to a radial/hierarchical layout.
   */
  hasStabilized() {
    if (this.nodes.length < 2) return true;
    const b = this.getBounds();
    if (!isFinite(b.minX)) return false;
    const w = b.maxX - b.minX;
    const h = b.maxY - b.minY;
    // Graph must span at least 150px in both dimensions
    return w > 150 && h > 150;
  }

  /**
   * Fallback: radial layout by node type.
   * Used when force simulation fails to stabilize.
   */
  applyRadialLayout() {
    const typeRings = {
      workspace: 0, framework: 120, module: 240,
      engine: 340, api: 340, entity: 340, service: 440, registry: 440,
    };
    const byType = {};
    this.nodes.forEach(n => {
      if (!byType[n.type]) byType[n.type] = [];
      byType[n.type].push(n);
    });
    const cx = this.width / 2, cy = this.height / 2;
    Object.entries(byType).forEach(([type, nodes]) => {
      const r = typeRings[type] ?? 300;
      const step = (2 * Math.PI) / Math.max(nodes.length, 1);
      nodes.forEach((n, i) => {
        const angle = i * step;
        n.x = cx + r * Math.cos(angle);
        n.y = cy + r * Math.sin(angle);
        n.fx = n.x; n.fy = n.y;
        n.vx = 0; n.vy = 0;
      });
    });
    this.alpha = 0; // Stop simulation — positions are fixed
    this.stabilized = true;
  }

  fixNode(id, x, y) { const n = this.nodeMap.get(id); if (n) { n.fx = x; n.fy = y; } }
  releaseNode(id) { const n = this.nodeMap.get(id); if (n) { n.fx = null; n.fy = null; } }

  getNodeAt(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const r = nodeRadius(n) + 5;
      const dx = n.x - x, dy = n.y - y;
      if (dx * dx + dy * dy < r * r) return n;
    }
    return null;
  }

  getBounds() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this.nodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    });
    return { minX, minY, maxX, maxY };
  }
}