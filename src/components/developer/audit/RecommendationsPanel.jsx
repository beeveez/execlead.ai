import React from "react";
import { generateRecommendations } from "@/lib/platformSelfHealingEngine";
import { AlertOctagon, AlertTriangle, Info, ArrowRight } from "lucide-react";

const PRIORITY_META = {
  critical: { icon: AlertOctagon, color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { icon: AlertTriangle, color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  medium: { icon: Info, color: "#eab308", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { icon: Info, color: "#6366f1", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
};

export default function RecommendationsPanel({ result }) {
  const recs = generateRecommendations(result);
  if (recs.length === 0) return null;
  return (
    <div>
      <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Recommendations™</h2>
      <div className="space-y-3">
        {recs.map((r, i) => {
          const meta = PRIORITY_META[r.priority] || PRIORITY_META.medium;
          const Icon = meta.icon;
          return (
            <div key={i} className={`rounded-lg border ${meta.border} ${meta.bg} p-3`}>
              <div className="flex items-start gap-2">
                <Icon size={14} style={{ color: meta.color }} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{r.title}</p>
                  <p className="text-white/50 text-xs mt-1">{r.detail}</p>
                  <p className="text-white/40 text-xs mt-1.5 flex items-start gap-1">
                    <ArrowRight size={11} className="mt-0.5 flex-shrink-0" /> {r.action}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}