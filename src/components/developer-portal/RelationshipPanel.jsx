import React, { useMemo } from "react";
import {
  findNodeByLabel, getDirectRelationships, getKnowledgePath,
  getKnowledgeGraph, NODE_TYPES,
} from "@/lib/knowledgeGraphEngine";
import { ArrowRight, GitBranch, Layers, Box, Cpu, Map } from "lucide-react";

/**
 * Displays Knowledge Graph™ relationships for a Developer Portal doc.
 * Automatically looks up the node by the doc's title.
 */
export default function RelationshipPanel({ doc }) {
  const node = useMemo(() => findNodeByLabel(doc?.title), [doc?.title]);

  if (!node) return null;

  const relationships = getDirectRelationships(node.id);
  const knowledgePath = getKnowledgePath(node.id);

  // Categorize relationships
  const related = relationships.filter(r => r.type === "References" || r.type === "Extends");
  const dependencies = relationships.filter(r => r.type === "Depends On" || r.type === "Uses");
  const framework = relationships.find(r => r.type === "Powered By");
  const workspace = relationships.find(r => r.type === "Belongs To" && r.node?.type === NODE_TYPES.WORKSPACE);
  const service = relationships.find(r => r.type === "Owned By" && r.node?.type === NODE_TYPES.ENGINE);

  const hasAny = related.length > 0 || dependencies.length > 0 || framework || workspace || service || knowledgePath.length > 1;

  if (!hasAny) return null;

  return (
    <div className="mt-6 pt-6 border-t border-white/5">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
        <GitBranch size={14} /> Knowledge Graph™
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Framework */}
        {framework && (
          <InfoCard icon={Box} label="Framework" value={framework.node.label} color={framework.node.color} />
        )}

        {/* Workspace */}
        {workspace && (
          <InfoCard icon={Layers} label="Workspace" value={workspace.node.label} color={workspace.node.color} />
        )}

        {/* Platform Service / Engine */}
        {service && (
          <InfoCard icon={Cpu} label="AI Engine" value={service.node.label} color={service.node.color} />
        )}

        {/* Knowledge Path */}
        {knowledgePath.length > 1 && (
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 md:col-span-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Map size={11} className="text-white/20" />
              <span className="text-[9px] uppercase tracking-widest text-white/30">Knowledge Path</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {knowledgePath.map((id, i) => {
                const pathNode = getNodeById(id);
                if (!pathNode) return null;
                return (
                  <React.Fragment key={i}>
                    {i > 0 && <ArrowRight size={10} className="text-white/20" />}
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: pathNode.color + "15",
                        color: pathNode.color,
                        border: `1px solid ${pathNode.color}40`,
                      }}
                    >
                      {pathNode.label}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Dependencies */}
        {dependencies.length > 0 && (
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 md:col-span-2">
            <span className="text-[9px] uppercase tracking-widest text-white/30">Dependencies ({dependencies.length})</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {dependencies.slice(0, 12).map((r, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50"
                >
                  {r.node.label}
                </span>
              ))}
              {dependencies.length > 12 && (
                <span className="text-[10px] text-white/30">+{dependencies.length - 12} more</span>
              )}
            </div>
          </div>
        )}

        {/* Related Modules */}
        {related.length > 0 && (
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 md:col-span-2">
            <span className="text-[9px] uppercase tracking-widest text-white/30">Related Modules ({related.length})</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {related.slice(0, 12).map((r, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50"
                >
                  {r.node.label}
                </span>
              ))}
              {related.length > 12 && (
                <span className="text-[10px] text-white/30">+{related.length - 12} more</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getNodeById(id) {
  return getKnowledgeGraph().nodeMap.get(id);
}

function InfoCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-white/20" />
        <span className="text-[9px] uppercase tracking-widest text-white/30">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-xs text-white/70 font-medium">{value}</span>
      </div>
    </div>
  );
}