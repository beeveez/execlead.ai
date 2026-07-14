/**
 * Force-directed graph layout simulation.
 * O(n²) charge force — suitable for up to ~250 nodes.
 */
export class ForceSimulation {
  constructor(nodes, edges, width = 800, height = 600) {
    this.width = width;
    this.height = height;

    const degree = new Map();
    edges.forEach(e => {
      degree.set(e.from, (degree.get(e.from) || 0) + 1);
      degree.set(e.to, (degree.get(e.to) || 0) + 1);
    });

    this.nodes = nodes.map(n => ({
      ...n,
      degree: degree.get(n.id) || 0,
      x: width / 2 + (Math.random() - 0.5) * 400,
      y: height / 2 + (Math.random() - 0.5) * 300,
      vx: 0, vy: 0, fx: null, fy: null,
    }));
    this.edges = edges;
    this.nodeMap = new Map(this.nodes.map(n => [n.id, n]));
    this.alpha = 1;
    this.alphaMin = 0.005;
    this.alphaDecay = 0.0228;
    this.velocityDecay = 0.6;
    this.chargeStrength = -180;
    this.linkDistance = 90;
    this.linkStrength = 0.3;
    this.centerStrength = 0.02;
  }

  setDimensions(w, h) { this.width = w; this.height = h; }
  reheat(alpha = 1) { this.alpha = Math.max(this.alpha, alpha); }

  tick() {
    if (this.alpha < this.alphaMin) return false;
    const n = this.nodes.length;
    const cx = this.width / 2, cy = this.height / 2;

    // Charge (repulsion) — O(n²)
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

    // Link attraction
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

    // Centering + integrate
    for (const node of this.nodes) {
      node.vx += (cx - node.x) * this.centerStrength * this.alpha;
      node.vy += (cy - node.y) * this.centerStrength * this.alpha;
      node.vx *= this.velocityDecay;
      node.vy *= this.velocityDecay;
      if (node.fx !== null) { node.x = node.fx; node.vx = 0; } else node.x += node.vx;
      if (node.fy !== null) { node.y = node.fy; node.vy = 0; } else node.y += node.vy;
    }

    this.alpha *= 1 - this.alphaDecay;
    return true;
  }

  fixNode(id, x, y) { const n = this.nodeMap.get(id); if (n) { n.fx = x; n.fy = y; } }
  releaseNode(id) { const n = this.nodeMap.get(id); if (n) { n.fx = null; n.fy = null; } }

  getNodeAt(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const r = 6 + Math.min(n.degree * 0.8, 12) + 5;
      const dx = n.x - x, dy = n.y - y;
      if (dx * dx + dy * dy < r * r) return n;
    }
    return null;
  }

  getBounds() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this.nodes.forEach(n => {
      if (n.x < minX) minX = n.x; if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x; if (n.y > maxY) maxY = n.y;
    });
    return { minX, minY, maxX, maxY };
  }
}