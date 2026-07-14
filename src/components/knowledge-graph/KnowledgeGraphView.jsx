import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  getKnowledgeGraph, applyFilters, getNode, getImpactCategorized,
  shortestPath, getGraphStats,
} from "@/lib/knowledgeGraphEngine";
import { ForceSimulation } from "@/lib/forceSimulation";
import KnowledgeGraphCanvas from "./KnowledgeGraphCanvas";
import GraphInspector from "./GraphInspector";
import GraphControls from "./GraphControls";
import { AlertTriangle, Route, X } from "lucide-react";

export default function KnowledgeGraphView() {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [hoveredId, setHoveredId] = useState(null);
  const [pathMode, setPathMode] = useState(false);
  const [pathStart, setPathStart] = useState(null);
  const [pathResult, setPathResult] = useState(null);
  const [impactResult, setImpactResult] = useState(null);
  const [filters, setFilters] = useState({ nodeType: "all", workspace: "all", relationship: "all", status: "all" });
  const [layout, setLayout] = useState("force");
  const [contextMenu, setContextMenu] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const fitRef = useRef(null);

  const graph = useMemo(() => getKnowledgeGraph(), []);
  const stats = useMemo(() => getGraphStats(), []);
  const filteredGraph = useMemo(() => applyFilters(graph, filters), [graph, filters]);
  const simulation = useMemo(() => new ForceSimulation(filteredGraph.nodes, filteredGraph.edges), [filteredGraph]);

  // Apply layout
  useEffect(() => {
    if (layout === "force") {
      simulation.nodes.forEach(n => { n.fx = null; n.fy = null; });
      simulation.reheat();
    } else {
      applyLayout(simulation, layout);
    }
  }, [simulation, layout]);

  // Fullscreen tracking
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setContextMenu(null);
        if (pathMode) { setPathMode(false); setPathStart(null); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pathMode]);

  const handleSelect = useCallback((nodeId, opts) => {
    if (pathMode && nodeId) {
      if (!pathStart) {
        setPathStart(nodeId);
      } else if (pathStart !== nodeId) {
        const path = shortestPath(pathStart, nodeId);
        setPathResult({ start: pathStart, end: nodeId, path });
        setPathMode(false);
        setPathStart(null);
        setSelectedIds(new Set([nodeId]));
      }
      return;
    }
    if (nodeId === null) {
      setSelectedIds(new Set());
      setImpactResult(null);
    } else if (opts?.shift) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
        return next;
      });
    } else {
      setSelectedIds(new Set([nodeId]));
      setImpactResult(null);
    }
  }, [pathMode, pathStart]);

  const handleAnalyzeImpact = useCallback(() => {
    if (contextMenu?.nodeId) {
      setImpactResult(getImpactCategorized(contextMenu.nodeId));
      setSelectedIds(new Set([contextMenu.nodeId]));
    }
    setContextMenu(null);
  }, [contextMenu]);

  const handleExport = useCallback((type) => {
    if (type === "json") {
      download("knowledge-graph.json", JSON.stringify({ nodes: filteredGraph.nodes, edges: filteredGraph.edges }, null, 2), "application/json");
    } else if (type === "png") {
      const canvas = containerRef.current?.querySelector("canvas");
      if (canvas) {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "knowledge-graph.png";
        a.click();
      }
    } else if (type === "svg") {
      exportSVG(simulation);
    }
  }, [filteredGraph, simulation]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  const selectedNode = selectedIds.size === 1 ? getNode([...selectedIds][0]) : null;
  const impactNodeIds = impactResult ? new Set(impactResult.nodes.map(n => n.id)) : null;

  return (
    <div ref={containerRef} className={`flex flex-col ${isFullscreen ? "h-screen bg-[#0a0a0f] p-4" : "h-[600px]"}`}>
      <GraphControls
        layout={layout} onLayoutChange={setLayout}
        filters={filters} onFilterChange={setFilters}
        onExport={handleExport} onFit={() => fitRef.current?.()}
        onTogglePath={() => { setPathMode(!pathMode); setPathStart(null); setPathResult(null); }}
        pathMode={pathMode}
        onToggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen}
        stats={stats}
      />

      {pathMode && (
        <div className="mb-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[11px] text-indigo-300 flex items-center gap-2">
          <Route size={12} />
          {pathStart ? "Select end node…" : "Select start node…"}
          <button onClick={() => { setPathMode(false); setPathStart(null); }} className="ml-auto"><X size={12} /></button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden border border-white/10 rounded-xl">
        <KnowledgeGraphCanvas
          simulation={simulation}
          selectedIds={selectedIds}
          hoveredId={hoveredId}
          pathNodeIds={pathResult?.path || []}
          impactNodeIds={impactNodeIds}
          onHover={setHoveredId}
          onSelect={handleSelect}
          onDoubleClick={() => {}}
          onContextMenu={(id, x, y) => setContextMenu({ nodeId: id, x, y })}
          onFitRef={fitRef}
        />
        {(selectedNode || impactResult || pathResult) && (
          <GraphInspector
            node={selectedNode}
            impactResult={impactResult}
            pathResult={pathResult}
            onClose={() => { setSelectedIds(new Set()); setImpactResult(null); setPathResult(null); }}
          />
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div className="fixed z-50 bg-[#0d0d14] border border-white/10 rounded-lg shadow-2xl py-1 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}>
            <button onClick={handleAnalyzeImpact} className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-white/60 hover:bg-white/5">
              <AlertTriangle size={12} className="text-amber-400" /> Analyze Impact
            </button>
            <button onClick={() => { setPathMode(true); setPathStart(contextMenu.nodeId); setContextMenu(null); }}
              className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-white/60 hover:bg-white/5">
              <Route size={12} className="text-indigo-400" /> Start Path From Here
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// LAYOUTS
// ============================================================

function applyLayout(sim, layout) {
  const w = sim.width || 800, h = sim.height || 600;

  if (layout === "hierarchical") {
    const typeOrder = ["framework", "workspace", "module", "api", "entity", "service", "engine", "registry"];
    const byLevel = {};
    sim.nodes.forEach(n => {
      const level = typeOrder.indexOf(n.type);
      const l = level >= 0 ? level : 3;
      if (!byLevel[l]) byLevel[l] = [];
      byLevel[l].push(n);
    });
    Object.entries(byLevel).forEach(([level, nodes]) => {
      const y = 50 + parseInt(level) * (h / (typeOrder.length + 1));
      const spacing = w / (nodes.length + 1);
      nodes.forEach((n, i) => { n.x = spacing * (i + 1); n.y = y; n.fx = n.x; n.fy = n.y; });
    });
  } else if (layout === "radial") {
    const rings = { workspace: 0, framework: 120, module: 240, engine: 340, api: 340, entity: 340, service: 440, registry: 440 };
    const byType = {};
    sim.nodes.forEach(n => { if (!byType[n.type]) byType[n.type] = []; byType[n.type].push(n); });
    const cx = w / 2, cy = h / 2;
    Object.entries(byType).forEach(([type, nodes]) => {
      const r = rings[type] || 300;
      nodes.forEach((n, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI;
        n.x = cx + r * Math.cos(angle); n.y = cy + r * Math.sin(angle);
        n.fx = n.x; n.fy = n.y;
      });
    });
  } else if (layout === "workspace") {
    const positions = {
      executive: { x: w * 0.25, y: h * 0.25 }, enterprise: { x: w * 0.75, y: h * 0.25 },
      operations: { x: w * 0.25, y: h * 0.75 }, developer: { x: w * 0.75, y: h * 0.75 },
    };
    const byWs = {};
    sim.nodes.forEach(n => {
      const ws = n.data?.workspace || (n.type === "workspace" ? n.id.replace("workspace:", "") : "executive");
      if (!byWs[ws]) byWs[ws] = [];
      byWs[ws].push(n);
    });
    Object.entries(byWs).forEach(([ws, nodes]) => {
      const pos = positions[ws] || positions.executive;
      const r = 40 + Math.sqrt(nodes.length) * 15;
      nodes.forEach((n, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI;
        n.x = pos.x + r * Math.cos(angle); n.y = pos.y + r * Math.sin(angle);
        n.fx = n.x; n.fy = n.y;
      });
    });
  } else if (layout === "tree") {
    const incoming = new Set();
    sim.edges.forEach(e => { if (["Depends On", "Belongs To", "Powered By"].includes(e.type)) incoming.add(e.to); });
    const roots = sim.nodes.filter(n => !incoming.has(n.id));
    const levels = {}, queue = roots.map(n => ({ id: n.id, level: 0 })), visited = new Set();
    while (queue.length > 0) {
      const { id, level } = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      levels[id] = Math.max(levels[id] || 0, level);
      sim.edges.filter(e => e.from === id && ["Depends On", "Belongs To", "Powered By"].includes(e.type))
        .forEach(e => queue.push({ id: e.to, level: level + 1 }));
    }
    sim.nodes.forEach(n => { if (levels[n.id] === undefined) levels[n.id] = 0; });
    const maxLevel = Math.max(...Object.values(levels), 1);
    const byLevel = {};
    sim.nodes.forEach(n => { const l = levels[n.id]; if (!byLevel[l]) byLevel[l] = []; byLevel[l].push(n); });
    Object.entries(byLevel).forEach(([level, nodes]) => {
      const y = 50 + (parseInt(level) / maxLevel) * (h - 100);
      const spacing = w / (nodes.length + 1);
      nodes.forEach((n, i) => { n.x = spacing * (i + 1); n.y = y; n.fx = n.x; n.fy = n.y; });
    });
  }
}

// ============================================================
// EXPORT HELPERS
// ============================================================

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportSVG(sim) {
  const bounds = sim.getBounds();
  if (!isFinite(bounds.minX)) return;
  const padding = 50;
  const w = bounds.maxX - bounds.minX + padding * 2;
  const h = bounds.maxY - bounds.minY + padding * 2;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${bounds.minX - padding} ${bounds.minY - padding} ${w} ${h}" style="background:#0a0a0f">`;
  sim.edges.forEach(e => {
    const a = sim.nodeMap.get(e.from), b = sim.nodeMap.get(e.to);
    if (!a || !b) return;
    svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
  });
  sim.nodes.forEach(n => {
    const r = 6 + Math.min(n.degree * 0.8, 12);
    svg += `<circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${n.color}30" stroke="${n.color}" stroke-width="1.5"/>`;
    svg += `<text x="${n.x}" y="${n.y + r + 12}" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="10" font-family="sans-serif">${escapeXml(n.label)}</text>`;
  });
  svg += "</svg>";
  download("knowledge-graph.svg", svg, "image/svg+xml");
}

function escapeXml(str) {
  return str.replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}