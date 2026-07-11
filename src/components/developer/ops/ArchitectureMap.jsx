import React from "react";
import {
  Boxes, Route, Package, Layers, Zap, Users, Layout,
  CreditCard, Code2, Cpu, Radio, Wrench, ChevronRight,
} from "lucide-react";
import { usePlatformState } from "@/lib/PlatformStateContext";
import { scoreToColor } from "@/lib/platformReadinessModel";

const DOT_COLORS = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

const LAYERS = [
  {
    label: "Foundation",
    nodes: [
      { name: "Platform Manifest™", icon: Boxes, workspace: "platform-governance", healthKey: "manifestCoverage" },
    ],
  },
  {
    label: "Core Registries",
    nodes: [
      { name: "Module Registry", icon: Boxes, workspace: "architecture-center", healthKey: "overall" },
      { name: "Route Registry", icon: Route, workspace: "platform-governance", healthKey: "routeCoverage" },
      { name: "Knowledge Pack Registry", icon: Package, workspace: "knowledge-operations", healthKey: "knowledgeCoverage" },
      { name: "Framework Registry", icon: Layers, workspace: "architecture-center", healthKey: "overall" },
    ],
  },
  {
    label: "Derived Registries",
    nodes: [
      { name: "Capability Registry", icon: Zap, workspace: "architecture-center", healthKey: "overall" },
      { name: "AI Persona Registry", icon: Users, workspace: "knowledge-operations", healthKey: "overall" },
      { name: "Workspace Registry", icon: Layout, workspace: "architecture-center", healthKey: "overall" },
      { name: "Subscription Registry", icon: CreditCard, workspace: "platform-analytics", healthKey: "overall" },
      { name: "Feature Flag Registry", icon: Code2, workspace: "architecture-center", healthKey: "overall" },
    ],
  },
  {
    label: "Platform Services",
    nodes: [
      { name: "Platform State Manager™", icon: Cpu, workspace: "runtime-intelligence", healthKey: "overall" },
      { name: "Platform Event Bus™", icon: Radio, workspace: "runtime-intelligence", healthKey: "overall" },
      { name: "Self-Healing Engine™", icon: Wrench, workspace: "security-guardian", healthKey: "overall" },
    ],
  },
];

export default function ArchitectureMap({ onNavigate }) {
  const { health } = usePlatformState();

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-5">
      {LAYERS.map((layer, layerIdx) => (
        <div key={layer.label}>
          {/* Layer label */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">{layer.label}</span>
            {layerIdx > 0 && <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />}
          </div>

          {/* Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {layer.nodes.map((node) => {
              const Icon = node.icon;
              const score = health?.[node.healthKey] ?? health?.overall ?? 100;
              const colorName = scoreToColor(score);
              return (
                <button
                  key={node.name}
                  onClick={() => onNavigate(node.workspace)}
                  className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left"
                >
                  <Icon size={14} className="text-white/40 group-hover:text-white/60 transition-colors flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-white/70 font-medium truncate">{node.name}</div>
                    <div className="text-[9px] text-white/30">{score}%</div>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_COLORS[colorName]}`} />
                  <ChevronRight size={12} className="text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Connector line to next layer */}
          {layerIdx < LAYERS.length - 1 && (
            <div className="flex justify-center mt-3">
              <div className="w-px h-4 bg-white/5" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}