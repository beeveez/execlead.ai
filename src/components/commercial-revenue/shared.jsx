import React from "react";
import { HelpCircle } from "lucide-react";

export const fmtCurrency = (n) => {
  if (n === null || n === undefined || n === "") return "—";
  if (n === 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
};

export const fmtNum = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString());

export const KIND_META = {
  live: { label: "Live", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  projected: { label: "Projected", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25", dot: "bg-indigo-400" },
  architecture: { label: "Architecture", color: "text-white/40", bg: "bg-white/5", border: "border-white/10", dot: "bg-white/30" },
};

export function StatusPill({ kind }) {
  const m = KIND_META[kind] || KIND_META.architecture;
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold uppercase ${m.color} ${m.bg} ${m.border}`}><span className={`w-1 h-1 rounded-full ${m.dot}`} />{m.label}</span>;
}

export function KpiCard({ label, value, kind, description, icon: Icon, color }) {
  const m = KIND_META[kind] || KIND_META.architecture;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-2">
        {Icon ? <Icon size={15} className={color || m.color} /> : <span />}
        <StatusPill kind={kind} />
      </div>
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-0.5 flex items-center gap-1">{label}{description && <span className="cursor-help" title={description}><HelpCircle size={9} className="text-white/30" /></span>}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}

export function SectionHeader({ icon: Icon, title, subtitle, color }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">{Icon && <Icon size={18} className={color || "text-indigo-400"} />}<h2 className="text-xl font-bold text-white">{title}</h2></div>
      {subtitle && <p className="text-white/45 text-sm">{subtitle}</p>}
    </div>
  );
}

export function MetricRow({ label, value, kind }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/80 font-medium">{value}</span>
        <StatusPill kind={kind} />
      </div>
    </div>
  );
}

export function BetaBanner() {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-3 mb-6">
      <p className="text-xs text-amber-300/90 leading-relaxed"><span className="font-semibold">Founding Private Beta™ — Commercial Architecture.</span> Live metrics reflect beta-stage activity. Projected metrics apply planned GA pricing to current usage. Architecture metrics are defined and awaiting data at General Availability. This engine does not alter product functionality or pricing.</p>
    </div>
  );
}

export function AiInsightCard({ insight, supportingMetrics, trendAnalysis, confidence, recommendedAction }) {
  const confColor = confidence === "High" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" : confidence === "Medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/25" : "text-white/50 bg-white/5 border-white/10";
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 mb-1"><span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase ${confColor}`}>{confidence || "Medium"} confidence</span></div>
      <div className="text-xs text-white/80 font-medium mb-1">{insight}</div>
      {supportingMetrics && <div className="text-[11px] text-white/55 mb-1">Metrics: {supportingMetrics}</div>}
      {trendAnalysis && <div className="text-[11px] text-white/45 mb-1">Trend: {trendAnalysis}</div>}
      {recommendedAction && <div className="text-[11px] text-indigo-400/80">Recommended action: {recommendedAction}</div>}
    </div>
  );
}