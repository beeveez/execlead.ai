import React from "react";
import { TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { SCALING_STAGES } from "@/lib/scalabilityAssessmentEngine";

const STATUS_STYLES = {
  "Ready today": "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  "Minor optimization required": "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  "Architectural review required": "bg-amber-500/10 border-amber-500/20 text-amber-400",
  "Platform partnership required": "bg-orange-500/10 border-orange-500/20 text-orange-400",
  "Custom architecture required": "bg-red-500/10 border-red-500/20 text-red-400",
};

/**
 * Scaling Plan — 5 stages from 100 to 1,000,000 users.
 */
export default function ScalingPlan() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Scaling Plan</h3>
        <span className="text-[10px] text-white/30 ml-auto">5 stages — 100 → 1,000,000 users</span>
      </div>

      <div className="space-y-3">
        {SCALING_STAGES.map((stage) => (
          <div key={stage.stage} className="rounded-lg border border-white/5 overflow-hidden">
            {/* Stage Header */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-indigo-400">{stage.stage}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white">{stage.milestone}</div>
              </div>
              <span className={`text-[9px] px-2 py-1 rounded border whitespace-nowrap ${STATUS_STYLES[stage.status] || "bg-white/5 border-white/10 text-white/40"}`}>
                {stage.status}
              </span>
            </div>

            {/* Stage Details */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <DetailRow label="Infrastructure" value={stage.infrastructure} />
              <DetailRow label="Database" value={stage.database} />
              <DetailRow label="Caching" value={stage.caching} />
              <DetailRow label="CDN" value={stage.cdn} />
              <DetailRow label="Load Balancing" value={stage.loadBalancing} />
              <DetailRow label="Queue Workers" value={stage.queueWorkers} />
              <DetailRow label="AI Optimization" value={stage.aiOptimization} />
              <DetailRow label="Cost" value={stage.cost} highlight />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-white/30 uppercase tracking-wider w-24 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-[11px] flex-1 ${highlight ? "text-amber-300/80 font-medium" : "text-white/60"}`}>{value}</span>
    </div>
  );
}