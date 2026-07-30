import React from "react";
import { ShieldCheck, AlertTriangle, Gauge, TrendingDown } from "lucide-react";

/**
 * GovernanceHero — enterprise governance score + AI Risk Score™ summary.
 */
export default function GovernanceHero({ dashboard }) {
  if (!dashboard) return null;
  const govColor = dashboard.governanceScore >= 70 ? "#10b981" : dashboard.governanceScore >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-emerald-400" />
        <h3 className="text-white font-semibold text-sm">AI Governance Center™</h3>
        <span className="text-[10px] text-white/30">Enterprise control plane for responsible AI</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric icon={ShieldCheck} label="Governance Score" value={`${dashboard.governanceScore}`} suffix="/100" color={govColor} />
        <Metric icon={Gauge} label="Policy Compliance" value={`${dashboard.policyCompliance}`} suffix="%" color="#6366f1" />
        <Metric icon={AlertTriangle} label="Human Reviews" value={`${dashboard.humanReviews}`} color="#f59e0b" />
        <Metric icon={TrendingDown} label="Policy Violations" value={`${dashboard.policyViolations}`} color="#ef4444" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
        <Mini label="Model Performance" value={`${dashboard.modelPerformance}%`} />
        <Mini label="Prompt Drift" value={`${dashboard.promptDrift} version(s)`} />
        <Mini label="Active Model" value={dashboard.activeModelVersion} />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, suffix, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}<span className="text-xs text-white/30 font-normal">{suffix}</span></div>
    </div>
  );
}
function Mini({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}