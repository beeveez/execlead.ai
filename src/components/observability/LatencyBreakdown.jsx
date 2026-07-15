import React from 'react';
import { Clock, Zap, Shield, Cpu, Server } from 'lucide-react';

const STAGES = [
  { key: "optimization_time_ms", label: "Optimization", icon: Zap, color: "bg-indigo-500/30", text: "text-indigo-400" },
  { key: "policy_time_ms", label: "Policy Evaluation", icon: Shield, color: "bg-amber-500/30", text: "text-amber-400" },
  { key: "routing_time_ms", label: "Model Routing", icon: Cpu, color: "bg-cyan-500/30", text: "text-cyan-400" },
  { key: "provider_time_ms", label: "Provider (LLM)", icon: Server, color: "bg-violet-500/30", text: "text-violet-400" },
];

export default function LatencyBreakdown({ metrics }) {
  const totalTime = metrics.avgOptimizationTime + metrics.avgPolicyTime + metrics.avgRoutingTime + metrics.avgProviderTime || 1;
  const stages = STAGES.map((s) => ({
    ...s,
    value: metrics[s.key] || 0,
    pct: Math.round(((metrics[s.key] || 0) / totalTime) * 100),
  }));

  // Identify bottleneck (highest percentage stage)
  const bottleneck = stages.reduce((max, s) => s.value > max.value ? s : max, stages[0]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
        <Clock size={14} className="text-cyan-400" />
        Latency Breakdown — Per Pipeline Stage
      </h3>
      <div className="text-center mb-4">
        <span className="text-2xl font-bold text-white">{metrics.avgLatency}ms</span>
        <span className="text-[10px] text-white/30 ml-2">avg total response time</span>
      </div>
      {/* Stacked bar */}
      <div className="flex h-6 rounded-full overflow-hidden mb-4">
        {stages.map((s) => (
          <div
            key={s.key}
            className={s.color}
            style={{ width: `${Math.max(s.pct, 2)}%` }}
            title={`${s.label}: ${s.value}ms (${s.pct}%)`}
          />
        ))}
      </div>
      {/* Stage details */}
      <div className="space-y-2">
        {stages.map((s) => (
          <div key={s.key} className="flex items-center gap-3">
            <s.icon size={11} className={s.text} />
            <span className="text-[11px] text-white/50 flex-1">{s.label}</span>
            <span className="text-[11px] text-white/60">{s.value}ms</span>
            <span className="text-[9px] text-white/30 w-8 text-right">{s.pct}%</span>
            {s === bottleneck && (
              <span className="text-[8px] text-rose-400/60 uppercase">bottleneck</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}