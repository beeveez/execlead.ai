import React from "react";
import {
  getDirectRelationships, getKnowledgePath, getKnowledgeGraph,
  NODE_TYPE_LABELS, RELATIONSHIPS,
} from "@/lib/knowledgeGraphEngine";
import { X, AlertTriangle, Route, ArrowRight } from "lucide-react";

export default function GraphInspector({ node, impactResult, pathResult, onClose }) {
  if (!node && !impactResult && !pathResult) {
    return (
      <div className="w-72 flex-shrink-0 border-l border-white/5 p-4">
        <p className="text-xs text-white/30 text-center mt-12">Click a node to inspect</p>
      </div>
    );
  }

  const rels = node ? getDirectRelationships(node.id) : [];
  const deps = rels.filter(r => (r.type === RELATIONSHIPS.DEPENDS_ON || r.type === RELATIONSHIPS.USES) && r.direction === "outgoing");
  const usedBy = rels.filter(r => (r.type === RELATIONSHIPS.DEPENDS_ON || r.type === RELATIONSHIPS.USES) && r.direction === "incoming");
  const related = rels.filter(r => r.type === RELATIONSHIPS.REFERENCES || r.type === RELATIONSHIPS.EXTENDS);
  const engines = rels.filter(r => r.type === RELATIONSHIPS.OWNED_BY || r.type === RELATIONSHIPS.POWERED_BY);
  const knowledgePath = node ? getKnowledgePath(node.id) : [];

  return (
    <div className="w-72 flex-shrink-0 border-l border-white/5 overflow-y-auto">
      {/* Header */}
      {node && (
        <div className="p-4 border-b border-white/5 sticky top-0 bg-[#0a0a0f] z-10">
          <div className="flex items-start gap-2">
            <span className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ background: node.color }} />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">{node.label}</h3>
              <span className="text-[10px] uppercase tracking-widest text-white/30">{NODE_TYPE_LABELS[node.type]}</span>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={14} /></button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Impact */}
        {impactResult && (
          <Section icon={AlertTriangle} title="Impact Analysis" color="text-amber-400">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-amber-400">{impactResult.riskScore}</span>
              <span className="text-[10px] text-white/40">Risk Score / 100</span>
            </div>
            <p className="text-[10px] text-white/40 mb-2">{impactResult.totalCount} nodes affected</p>
            {Object.entries(impactResult.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between text-[11px] py-0.5">
                <span className="text-white/40">{NODE_TYPE_LABELS[type] || type}</span>
                <span className="text-amber-400/80">{count}</span>
              </div>
            ))}
          </Section>
        )}

        {/* Path */}
        {pathResult && pathResult.path.length > 0 && (
          <Section icon={Route} title="Path Analysis" color="text-indigo-400">
            <p className="text-[10px] text-white/40 mb-2">{pathResult.path.length} nodes · {pathResult.path.length - 1} hops</p>
            <div className="space-y-1">
              {pathResult.path.map((id, i) => {
                const n = getKnowledgeGraph().nodeMap.get(id);
                if (!n) return null;
                return (
                  <div key={i} className="flex items-center gap-1.5 text-[11px]">
                    {i > 0 && <ArrowRight size={10} className="text-white/20" />}
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: n.color }} />
                    <span className="text-white/50">{n.label}</span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Overview */}
        {node?.data?.description && (
          <Section title="Overview">
            <p className="text-xs text-white/50 leading-relaxed">
              {node.data.description.substring(0, 200)}{node.data.description.length > 200 ? "…" : ""}
            </p>
          </Section>
        )}

        {/* Details */}
        {node && (
          <Section title="Details">
            {node.data?.owner && <Meta label="Owner" value={node.data.owner} />}
            {node.data?.workspace && <Meta label="Workspace" value={node.data.workspace} />}
            {node.data?.status && <Meta label="Status" value={node.data.status} />}
            {node.data?.permissions && <Meta label="Permissions" value={node.data.permissions} />}
            {node.data?.featureFlag && <Meta label="Feature Flag" value={node.data.featureFlag} />}
            {node.data?.route && <Meta label="Navigation" value={node.data.route} />}
          </Section>
        )}

        {/* Dependencies */}
        {deps.length > 0 && (
          <Section title={`Dependencies (${deps.length})`}>
            {deps.slice(0, 10).map((r, i) => <RelRow key={i} rel={r} />)}
            {deps.length > 10 && <span className="text-[9px] text-white/20">+{deps.length - 10} more</span>}
          </Section>
        )}

        {/* Used By */}
        {usedBy.length > 0 && (
          <Section title={`Used By (${usedBy.length})`}>
            {usedBy.slice(0, 10).map((r, i) => <RelRow key={i} rel={r} />)}
            {usedBy.length > 10 && <span className="text-[9px] text-white/20">+{usedBy.length - 10} more</span>}
          </Section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <Section title={`Related (${related.length})`}>
            {related.slice(0, 10).map((r, i) => <RelRow key={i} rel={r} />)}
            {related.length > 10 && <span className="text-[9px] text-white/20">+{related.length - 10} more</span>}
          </Section>
        )}

        {/* AI Engines */}
        {engines.length > 0 && (
          <Section title="AI Engines & Frameworks">
            {engines.map((r, i) => <RelRow key={i} rel={r} />)}
          </Section>
        )}

        {/* Knowledge Path */}
        {knowledgePath.length > 1 && (
          <Section title="Knowledge Path">
            <div className="flex items-center gap-1 flex-wrap">
              {knowledgePath.map((id, i) => {
                const n = getKnowledgeGraph().nodeMap.get(id);
                if (!n) return null;
                return (
                  <React.Fragment key={i}>
                    {i > 0 && <ArrowRight size={10} className="text-white/20" />}
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: n.color + "15", color: n.color }}>{n.label}</span>
                  </React.Fragment>
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, color, children }) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-widest text-white/30 mb-2 flex items-center gap-1.5">
        {Icon && <Icon size={11} className={color || "text-white/30"} />} {title}
      </h4>
      {children}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="flex justify-between text-[11px] py-0.5">
      <span className="text-white/30">{label}</span>
      <span className="text-white/60 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function RelRow({ rel }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] py-0.5">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: rel.node.color }} />
      <span className="text-white/50">{rel.node.label}</span>
      <span className="text-[8px] text-white/20 ml-auto">{NODE_TYPE_LABELS[rel.node.type]}</span>
    </div>
  );
}