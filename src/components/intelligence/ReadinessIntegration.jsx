import React from "react";
import { Link } from "react-router-dom";
import { Target, ArrowRight, TrendingUp } from "lucide-react";

export default function ReadinessIntegration({ domainSummary, profile }) {
  const promotionReadiness = profile?.promotion_readiness || 0;
  const boardReadiness = Math.round(
    ((domainSummary.find((d) => d.id === "lead_legacy")?.score || 0) +
     (domainSummary.find((d) => d.id === "lead_business")?.score || 0) +
     (domainSummary.find((d) => d.id === "lead_people")?.score || 0)) / 3
  );
  const careerReadiness = profile?.interview_readiness || 0;
  const targetRoleReadiness = Math.round(
    domainSummary.reduce((sum, d) => sum + d.score, 0) / domainSummary.length
  );

  const metrics = [
    { label: "Promotion Readiness", value: promotionReadiness, target: 80, icon: TrendingUp, color: "#6366f1" },
    { label: "Board Readiness", value: boardReadiness, target: 75, icon: Target, color: "#8b5cf6" },
    { label: "Career Readiness", value: careerReadiness, target: 80, icon: Target, color: "#06b6d4" },
    { label: "Target Role Readiness", value: targetRoleReadiness, target: 85, icon: TrendingUp, color: "#f59e0b" },
  ];

  return (
    <section id="section-readiness" className="scroll-mt-20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-indigo-400" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Executive Readiness™</h2>
        </div>
        <Link to="/executive-readiness" className="flex items-center gap-1 text-xs text-indigo-400 hover:gap-2 transition-all">
          Full Readiness Report <ArrowRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metrics.map((m) => {
          const gap = m.target - m.value;
          return (
            <div key={m.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                    <m.icon size={14} style={{ color: m.color }} />
                  </div>
                  <span className="text-sm text-white/70 font-medium">{m.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{m.value}</span>
                  <span className="text-xs text-white/30">/{m.target}</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(m.value, 100)}%`, background: m.color }} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-white/30">Target: {m.target}</span>
                <span className={`text-[10px] font-medium ${gap > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {gap > 0 ? `${gap} pts to target` : "Target achieved"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Gap Analysis</h3>
        <div className="space-y-2">
          {metrics.filter((m) => m.target - m.value > 0).sort((a, b) => (b.target - b.value) - (a.target - a.value)).map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <span className="text-xs text-white/60 w-40">{m.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-amber-400/50" style={{ width: `${Math.min((m.target - m.value) / m.target * 100, 100)}%` }} />
              </div>
              <span className="text-xs text-amber-400 font-medium w-16 text-right">{m.target - m.value} pts</span>
            </div>
          ))}
          {metrics.every((m) => m.target - m.value <= 0) && (
            <p className="text-emerald-400 text-xs text-center py-2">All readiness targets achieved. Outstanding!</p>
          )}
        </div>
      </div>
    </section>
  );
}