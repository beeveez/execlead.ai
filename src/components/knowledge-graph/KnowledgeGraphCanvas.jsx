import React, { useRef, useEffect, useCallback } from "react";
import { getConnectedSet } from "@/lib/knowledgeGraphEngine";

function nodeRadius(n) { return 6 + Math.min(n.degree * 0.8, 12); }
function truncate(str, max) { return !str ? "" : str.length > max ? str.substring(0, max - 1) + "…" : str; }

export default function KnowledgeGraphCanvas({
  simulation, selectedIds, hoveredId, pathNodeIds, impactNodeIds,
  onHover, onSelect, onDoubleClick, onContextMenu, onFitRef,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const dragRef = useRef(null);
  const stateRef = useRef({ selectedIds, hoveredId, pathNodeIds, impactNodeIds });

  useEffect(() => {
    stateRef.current = { selectedIds, hoveredId, pathNodeIds, impactNodeIds };
  }, [selectedIds, hoveredId, pathNodeIds, impactNodeIds]);

  // Resize handling
  useEffect(() => {
    const canvas = canvasRef.current, container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      simulation.setDimensions(rect.width, rect.height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [simulation]);

  // Fit to screen
  const fit = useCallback(() => {
    const bounds = simulation.getBounds();
    if (!isFinite(bounds.minX)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.width / dpr, ch = canvas.height / dpr;
    const padding = 60;
    const graphW = bounds.maxX - bounds.minX + padding * 2;
    const graphH = bounds.maxY - bounds.minY + padding * 2;
    const k = Math.min(cw / graphW, ch / graphH, 2);
    transformRef.current = {
      x: cw / 2 - (bounds.minX + bounds.maxX) / 2 * k,
      y: ch / 2 - (bounds.minY + bounds.maxY) / 2 * k,
      k,
    };
  }, [simulation]);

  useEffect(() => { if (onFitRef) onFitRef.current = fit; }, [fit, onFitRef]);
  useEffect(() => { const t = setTimeout(() => fit(), 600); return () => clearTimeout(t); }, [fit]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const loop = () => {
      simulation.tick();
      draw(ctx, canvas, simulation, transformRef.current, stateRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [simulation]);

  // Coordinate conversion
  const toGraph = (sx, sy) => {
    const t = transformRef.current;
    return { x: (sx - t.x) / t.k, y: (sy - t.y) / t.k };
  };

  // Mouse handlers
  const onMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const { x, y } = toGraph(sx, sy);
    const node = simulation.getNodeAt(x, y);
    if (node) {
      if (e.shiftKey) {
        onSelect(node.id, { shift: true });
      } else {
        dragRef.current = { type: "node", nodeId: node.id, sx, sy, moved: false };
        simulation.fixNode(node.id, x, y);
        simulation.reheat();
      }
    } else {
      dragRef.current = { type: "pan", sx, sy, start: { ...transformRef.current }, moved: false };
    }
  };

  const onMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    if (dragRef.current) {
      if (dragRef.current.type === "node") {
        const { x, y } = toGraph(sx, sy);
        simulation.fixNode(dragRef.current.nodeId, x, y);
        simulation.reheat();
        dragRef.current.moved = true;
      } else {
        const dx = sx - dragRef.current.sx, dy = sy - dragRef.current.sy;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.moved = true;
        transformRef.current = { x: dragRef.current.start.x + dx, y: dragRef.current.start.y + dy, k: dragRef.current.start.k };
      }
    } else {
      const { x, y } = toGraph(sx, sy);
      const node = simulation.getNodeAt(x, y);
      onHover(node?.id || null);
      if (canvasRef.current) canvasRef.current.style.cursor = node ? "pointer" : "grab";
    }
  };

  const onMouseUp = (e) => {
    if (dragRef.current) {
      if (dragRef.current.type === "node") {
        simulation.releaseNode(dragRef.current.nodeId);
        if (!dragRef.current.moved && !e.shiftKey) onSelect(dragRef.current.nodeId);
      } else if (!dragRef.current.moved && !e.shiftKey) {
        onSelect(null);
      }
      dragRef.current = null;
    }
  };

  const onWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const t = transformRef.current;
    const delta = -e.deltaY * 0.001;
    const newK = Math.max(0.1, Math.min(4, t.k * (1 + delta)));
    const ratio = newK / t.k;
    transformRef.current = { x: sx - (sx - t.x) * ratio, y: sy - (sy - t.y) * ratio, k: newK };
  };

  const onDblClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = toGraph(e.clientX - rect.left, e.clientY - rect.top);
    const node = simulation.getNodeAt(x, y);
    if (node) onDoubleClick(node.id);
  };

  const onCtx = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = toGraph(e.clientX - rect.left, e.clientY - rect.top);
    const node = simulation.getNodeAt(x, y);
    if (node) onContextMenu(node.id, e.clientX, e.clientY);
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-h-[400px] bg-white/[0.01]">
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onDoubleClick={onDblClick}
        onContextMenu={onCtx}
        className="absolute inset-0"
        style={{ cursor: "grab" }}
      />
      {simulation.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-white/30">No nodes match the current filters</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CANVAS RENDERER
// ============================================================

function draw(ctx, canvas, sim, transform, state) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr, h = canvas.height / dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.k, transform.k);

  const { selectedIds, hoveredId, pathNodeIds, impactNodeIds } = state;
  const focusId = hoveredId || (selectedIds?.size === 1 ? [...selectedIds][0] : null);
  const connected = focusId ? getConnectedSet(focusId) : null;
  const pathSet = pathNodeIds?.length > 0 ? new Set(pathNodeIds) : null;
  const impactSet = impactNodeIds;

  // Edges
  sim.edges.forEach(e => {
    const a = sim.nodeMap.get(e.from), b = sim.nodeMap.get(e.to);
    if (!a || !b) return;
    const inPath = pathSet?.has(e.from) && pathSet?.has(e.to);
    const highlighted = !focusId || (connected?.has(e.from) && connected?.has(e.to));
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = inPath ? "#f59e0b" : highlighted ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.03)";
    ctx.lineWidth = inPath ? 2.5 : highlighted ? 1 : 0.5;
    ctx.stroke();
  });

  // Nodes
  sim.nodes.forEach(n => {
    const r = nodeRadius(n);
    const isHovered = n.id === hoveredId;
    const isSelected = selectedIds?.has(n.id);
    const inPath = pathSet?.has(n.id);
    const isImpacted = impactSet?.has(n.id);
    const highlighted = !focusId || connected?.has(n.id);

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);

    if (isImpacted) { ctx.fillStyle = "#f59e0b30"; ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2.5; }
    else if (inPath) { ctx.fillStyle = "#f59e0b25"; ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2.5; }
    else if (isSelected) { ctx.fillStyle = n.color + "40"; ctx.strokeStyle = n.color; ctx.lineWidth = 2.5; }
    else if (isHovered) { ctx.fillStyle = n.color + "30"; ctx.strokeStyle = n.color; ctx.lineWidth = 2; }
    else { ctx.fillStyle = highlighted ? n.color + "25" : n.color + "06"; ctx.strokeStyle = highlighted ? n.color + "80" : n.color + "15"; ctx.lineWidth = 1; }
    ctx.fill();
    ctx.stroke();

    if (transform.k > 0.5 || isHovered || isSelected || inPath || isImpacted) {
      ctx.fillStyle = (isHovered || isSelected || inPath) ? "rgba(255,255,255,0.85)" : highlighted ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.15)";
      ctx.font = `${isHovered || isSelected ? "bold " : ""}10px ui-sans-serif, system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(truncate(n.label, 18), n.x, n.y + r + 12);
    }
  });
}