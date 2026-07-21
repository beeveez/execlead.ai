import React from 'react';
import { TrendingUp, Star, ThumbsUp, AlertCircle, CheckCircle2, RotateCw, ArrowUp } from 'lucide-react';

export default function AIQualityPanel({ quality, improvement }) {
  const { score, grade, factors, trend } = quality;
  const metrics = improvement.metrics || {};

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-white">AI Quality Score™</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-sm font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400">{grade}</span>
          <div className="flex items-center gap-0.5 text-[10px] text-emerald-400">
            <ArrowUp size={10} /> {trend}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Quality Factors</h4>
        {factors.map((f) => (
          <div key={f.id} className="flex items-center gap-2">
            <span className="text-[11px] text-white/60 w-32 shrink-0">{f.label}</span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${f.score}%`, background: f.score >= 90 ? '#10b981' : f.score >= 75 ? '#f59e0b' : '#ef4444' }} />
            </div>
            <span className="text-[11px] font-bold text-white w-8 text-right">{f.score}</span>
            <span className="text-[9px] text-white/30 w-8">{f.weight}%</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard icon={Star} label="Avg Rating" value={`${metrics.avgRating || 0}/5`} color="#f59e0b" />
        <MetricCard icon={ThumbsUp} label="Helpful Rate" value={`${metrics.helpfulRate || 0}%`} color="#10b981" />
        <MetricCard icon={AlertCircle} label="Hallucination" value={`${metrics.hallucinationRate || 0}%`} color="#ef4444" />
        <MetricCard icon={CheckCircle2} label="Acceptance" value={`${metrics.acceptanceRate || 0}%`} color="#6366f1" />
        <MetricCard icon={RotateCw} label="Retry Rate" value={`${metrics.retryRate || 0}%`} color="#f97316" />
        <MetricCard icon={ArrowUp} label="Escalation" value={`${metrics.escalationRate || 0}%`} color="#a855f7" />
      </div>

      <div className="mt-4 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
        <span className="text-[11px] text-cyan-300">Responsible AI Improvement Actions™: Auto-generated recommendations from feedback trends, hallucination reports, and acceptance patterns are queued for the AI Platform Team review.</span>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
      <Icon size={14} style={{ color }} className="mx-auto mb-1" />
      <div className="text-sm font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}