import React from "react";
import { Gauge, TrendingUp, TrendingDown, CheckCircle, Zap, Target, Activity } from "lucide-react";
import { PERFORMANCE_DOMAINS, SCORE_TREND, OPTIMIZATION_RECOMMENDATIONS, computePerformanceScore } from "@/lib/performanceExecutionEngine";

const PRIORITY_COLORS = { high: "#f59e0b", medium: "#06b6d4", low: "#6366f1" };
const STATUS_COLORS = { completed: "#10b981", "in_progress": "#06b6d4", planned: "#6366f1" };

export default function PerformanceScoreGauge({ onNavigateTab }) {
  const score = computePerformanceScore();
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const gradeColor = score >= 90 ? "#10b981" : score >= 80 ? "#06b6d4" : score >= 70 ? "#f59e0b" : "#ef4444";
  const trend = SCORE_TREND[SCORE_TREND.length - 1].score - SCORE_TREND[0].score;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score gauge */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <circle cx="100" cy="100" r="80" fill="none" stroke={gradeColor} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-white">{score}</div>
              <div className="text-xs text-white/40">Performance Score™</div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5">
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
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Gauge size={14} className="text-indigo-400" /> Performance by Domain</h3>
          <div className="space-y-2.5">
            {PERFORMANCE_DOMAINS.map((d) => {
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
                    <div className="flex items-center justify-between mt-0.5 text-[9px] text-white/30">
                      <span>Target: {d.target}</span>
                      <span>Actual: <span className="text-white/50">{d.actual}</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Optimization recommendations */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Zap size={14} className="text-amber-400" /> Performance Optimization Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {OPTIMIZATION_RECOMMENDATIONS.map((o) => {
            const pColor = PRIORITY_COLORS[o.priority] || "#6366f1";
            const sColor = STATUS_COLORS[o.status] || "#6366f1";
            return (
              <div key={o.id} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                <div className="flex items-start gap-2">
                  {o.status === "completed" ? <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" /> : <Target size={14} className="text-indigo-400 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${sColor}20`, color: sColor }}>{o.status.replace(/_/g, " ")}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${pColor}20`, color: pColor }}>{o.priority}</span>
                      <span className="text-[10px] text-white/30">{o.category}</span>
                    </div>
                    <p className="text-xs text-white/80">{o.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px]">
                      <span className="text-emerald-400/60">Impact: {o.impact}</span>
                      <span className="text-white/30">Effort: {o.effort}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}