import React from "react";
import { Shield, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { POSTURE_DOMAINS, POSTURE_TREND, TOP_RISKS, RECOMMENDED_ACTIONS, computePostureScore } from "@/lib/securityExecutionEngine";

const SEVERITY_COLORS = { critical: "#ef4444", high: "#f59e0b", medium: "#fbbf24", low: "#06b6d4" };

export default function SecurityPostureManager({ onNavigateTab }) {
  const score = computePostureScore(POSTURE_DOMAINS);
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const gradeColor = score >= 90 ? "#10b981" : score >= 80 ? "#06b6d4" : score >= 70 ? "#f59e0b" : "#ef4444";
  const trend = POSTURE_TREND[POSTURE_TREND.length - 1].score - POSTURE_TREND[0].score;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Score gauge + grade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <circle cx="100" cy="100" r="80" fill="none" stroke={gradeColor} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-white">{score}</div>
              <div className="text-xs text-white/40">Security Posture Score™</div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-2xl font-bold" style={{ color: gradeColor }}>{grade}</span>
              <span className="text-white/40 text-xs">Grade</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend >= 0 ? "+" : ""}{trend} pts (7 days)
            </div>
          </div>
        </div>

        {/* Domain breakdown */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Shield size={14} className="text-indigo-400" /> Posture by Security Domain</h3>
          <div className="space-y-2.5">
            {POSTURE_DOMAINS.map((d) => {
              const color = d.score >= 90 ? "#10b981" : d.score >= 80 ? "#06b6d4" : d.score >= 70 ? "#f59e0b" : "#ef4444";
              return (
                <div key={d.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/70">{d.name} <span className="text-white/30 ml-1">({d.weight}%)</span></span>
                      <span className="text-xs font-medium" style={{ color }}>{d.score}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.score}%`, backgroundColor: color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top risks + recommended actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-400" /> Top Security Risks</h3>
          <div className="space-y-2">
            {TOP_RISKS.map((r) => (
              <div key={r.id} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs text-white/80">{r.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${SEVERITY_COLORS[r.severity]}20`, color: SEVERITY_COLORS[r.severity] }}>{r.severity}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/30">
                  <span>Domain: {r.domain}</span><span>Owner: {r.owner}</span><span>Status: {r.status}</span>
                </div>
                <p className="text-[10px] text-white/40 mt-1"><span className="text-emerald-400/60">→</span> {r.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400" /> Recommended Actions</h3>
          <div className="space-y-2">
            {RECOMMENDED_ACTIONS.map((a, i) => {
              const pColor = a.priority === "critical" ? "#ef4444" : a.priority === "high" ? "#f59e0b" : "#06b6d4";
              return (
                <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium mt-0.5" style={{ backgroundColor: `${pColor}20`, color: pColor }}>{a.priority}</span>
                    <div className="flex-1">
                      <p className="text-xs text-white/80">{a.action}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30">
                        <span className="text-emerald-400/60">Impact: {a.impact}</span>
                        <span className="text-white/30">Effort: {a.effort}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}