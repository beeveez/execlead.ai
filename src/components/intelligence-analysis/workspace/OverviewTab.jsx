import React from "react";
import { Activity, AlertCircle, Target, TrendingUp, Boxes, Sparkles, BarChart3 } from "lucide-react";

function Stat({ label, value, color = "text-white" }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-bold text-sm ${color}`}>{value}</p>
    </div>
  );
}

export default function OverviewTab({ bundle }) {
  const s = bundle.summary;
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3"><Activity size={14} className="text-amber-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Score Overview</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat label="Overall Score" value={`${s.overallScore} / ${s.target}`} color="text-white" />
          <Stat label="Issue Count" value={s.issueCount} color="text-amber-400" />
          <Stat label="Resolved" value={s.resolvedCount} color="text-emerald-400" />
          <Stat label="Pending" value={s.pendingCount} color="text-red-400" />
          <Stat label="Severity" value={s.severity} color={s.severity === "high" ? "text-red-400" : s.severity === "medium" ? "text-amber-400" : "text-blue-400"} />
          <Stat label="Trend" value={s.trend} color={s.trend === "up" ? "text-emerald-400" : s.trend === "down" ? "text-red-400" : "text-white/60"} />
          <Stat label="Est. Improvement" value={s.estimatedImprovement} color="text-emerald-400" />
          <Stat label="Business Impact" value={s.severity === "high" ? "High" : s.severity === "medium" ? "Medium" : "Low"} color="text-indigo-400" />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3"><Target size={14} className="text-amber-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Impact Analysis</h3></div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-xs"><span className="text-white/40">Current Score</span><span className="text-white font-medium">{bundle.impactAnalysis.currentScore}</span></div>
          <div className="flex justify-between text-xs"><span className="text-white/40">Target Score</span><span className="text-white font-medium">{bundle.impactAnalysis.targetScore}</span></div>
          <div className="flex justify-between text-xs"><span className="text-white/40">Improvement</span><span className="text-emerald-400 font-medium">+{bundle.impactAnalysis.improvement}</span></div>
          <div className="flex justify-between text-xs"><span className="text-white/40">Projected Final</span><span className="text-emerald-400 font-medium">{bundle.impactAnalysis.projectedFinalScore}</span></div>
          <div className="flex justify-between text-xs"><span className="text-white/40">Risk Reduction</span><span className="text-white/60">{bundle.impactAnalysis.riskReduction}</span></div>
          <div className="flex justify-between text-xs"><span className="text-white/40">Governance</span><span className="text-white/60">{bundle.impactAnalysis.governanceImprovement}</span></div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3"><AlertCircle size={14} className="text-amber-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Business Impact</h3></div>
        <div className="space-y-2">
          {Object.entries(s.businessImpact || {}).map(([cat, items]) => items?.length > 0 && (
            <div key={cat} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <p className="text-indigo-300 text-[10px] uppercase tracking-wider mb-1">{cat}</p>
              {items.map((imp, i) => <p key={i} className="text-white/60 text-xs">• {imp}</p>)}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3"><Sparkles size={14} className="text-amber-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">AI Recommendations</h3></div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(bundle.aiRecommendations).map(([key, items]) => (
            <div key={key} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <p className="text-amber-400 text-[10px] uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, " $1").trim()}</p>
              {items.length === 0 ? <p className="text-white/30 text-xs">None</p> : items.map((f, i) => <p key={i} className="text-white/60 text-xs">• {f.title} <span className="text-emerald-400">({f.expectedImprovement})</span></p>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}