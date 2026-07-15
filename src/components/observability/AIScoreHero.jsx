import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function AIScoreHero({ aiScore, metrics }) {
  const scoreColor = aiScore.score >= 90 ? "border-emerald-500/30" : aiScore.score >= 75 ? "border-amber-500/30" : "border-rose-500/30";
  const scoreText = aiScore.score >= 90 ? "text-emerald-400" : aiScore.score >= 75 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 via-cyan-500/[0.02] to-transparent border border-indigo-500/10 rounded-2xl p-6">
      <div className="flex items-center gap-8 flex-wrap">
        <div className="flex flex-col items-center">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${scoreColor}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${scoreText}`}>{aiScore.score}</div>
              <div className="text-[9px] text-white/30 uppercase">AI Score™</div>
            </div>
          </div>
          <span className={`text-[10px] font-semibold uppercase tracking-wider mt-2 ${scoreText}`}>{aiScore.label}</span>
        </div>
        <div className="flex-1 min-w-[300px] grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Optimization" value={`${metrics.optimizationRate}%`} icon={CheckCircle} color="text-emerald-400" />
          <MiniStat label="Avg Latency" value={`${metrics.avgLatency}ms`} color="text-cyan-400" />
          <MiniStat label="Cache Hits" value={`${metrics.cacheHitRate}%`} color="text-violet-400" />
          <MiniStat label="Policy Pass" value={`${metrics.policyPassRate}%`} color="text-amber-400" />
          <MiniStat label="Provider Health" value={`${metrics.providerSuccessRate}%`} color="text-emerald-400" />
          <MiniStat label="Success Rate" value={`${metrics.successRate}%`} color="text-emerald-400" />
          <MiniStat label="Monthly Cost" value={`$${metrics.costThisMonth.toFixed(2)}`} color="text-cyan-400" />
          <MiniStat label="Credits Saved" value={metrics.totalCreditsSavedOpt.toLocaleString()} color="text-emerald-400" />
        </div>
      </div>
      {/* Score Components */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {Object.entries(aiScore.components).map(([key, comp]) => (
            <div key={key} className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
              <div className="text-[9px] text-white/30 uppercase truncate">{comp.label}</div>
              <div className={`text-sm font-bold ${comp.score >= 90 ? "text-emerald-400" : comp.score >= 70 ? "text-amber-400" : "text-rose-400"}`}>{comp.score}</div>
              <div className="text-[8px] text-white/20">{comp.weight}</div>
              <div className="mt-1 h-1 bg-white/[0.02] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${comp.score >= 90 ? "bg-emerald-500/40" : comp.score >= 70 ? "bg-amber-500/40" : "bg-rose-500/40"}`} style={{ width: `${comp.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color = "text-white" }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="text-[9px] uppercase tracking-wider text-white/40 mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}