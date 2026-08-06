import React, { useState } from "react";
import { ChevronDown, ShieldCheck, TrendingUp, RotateCcw, Download, Pencil } from "lucide-react";
import { fmtCurrency, fmtNum, fmtPct } from "@/lib/enterpriseRoiEngine";

function confColor(label) {
  if (label === "High") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
  if (label === "Medium") return "text-amber-400 bg-amber-500/10 border-amber-500/25";
  return "text-rose-400 bg-rose-500/10 border-rose-500/25";
}

function MetricCard({ m }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">{m.label}</div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${confColor(m.confidence.label)}`}>{m.confidence.label}</span>
      </div>
      <div className="text-2xl font-bold text-white my-1">
        {m.value == null ? "—" : m.unit === "%" ? fmtPct(m.value) : m.unit ? `${fmtNum(m.value)} ${m.unit}` : fmtCurrency(m.value)}
      </div>
      <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300">
        <ChevronDown size={12} className={open ? "rotate-180 transition-transform" : "transition-transform"} /> View Formula
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 text-[11px] text-white/55 border-t border-white/8 pt-2">
          <div><span className="text-white/40">Formula:</span> {m.formula}</div>
          {Object.keys(m.inputs || {}).length > 0 && <div><span className="text-white/40">Inputs:</span> {Object.entries(m.inputs).map(([k, v]) => `${k}=${v}`).join(", ")}</div>}
          {Object.keys(m.assumptions || {}).length > 0 && <div><span className="text-white/40">Assumptions:</span> {Object.entries(m.assumptions).map(([k, v]) => `${k}=${v}`).join(", ")}</div>}
        </div>
      )}
    </div>
  );
}

export default function RoiResults({ roi, onEditAssumptions, onResetAssumptions, onExportCalculations }) {
  const kpis = [
    { label: "Estimated Annual Value", value: fmtCurrency(roi.annualGrossValue) },
    { label: "Estimated Three-Year Value", value: fmtCurrency(roi.threeYearValue) },
    { label: "Administrative Hours Saved", value: `${fmtNum(roi.totalHoursSaved)} hrs` },
    { label: "Leadership Coverage", value: `${fmtPct(roi.currentCoachingCoveragePct)} → ${fmtPct(roi.newCoveragePct)}` },
    { label: "Assessment Capacity", value: `+${fmtNum(roi.assessmentCapacityIncrease)}` },
    { label: "Executive Coaching Capacity", value: `${fmtNum(roi.newCoachingCapacity)} leaders` },
    { label: "Hiring Savings", value: fmtCurrency(roi.executiveHiringSavings) },
    { label: "Operational Efficiency", value: `${roi.leadershipDevelopmentEfficiency}%` },
    { label: "Payback Estimate", value: roi.paybackPeriod ? `${roi.paybackPeriod} months` : "—" },
    { label: "ROI Estimate", value: fmtPct(roi.threeYearROI) },
  ];
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-emerald-400" />
        <h2 className="text-lg font-semibold">Executive Dashboard</h2>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border ${confColor(roi.confidence.label)}`}>
          <ShieldCheck size={11} /> Confidence {roi.confidence.label}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={onEditAssumptions} className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"><Pencil size={11} /> Edit Assumptions</button>
          <button onClick={onResetAssumptions} className="inline-flex items-center gap-1 text-[11px] text-white/50 hover:text-white/80"><RotateCcw size={11} /> Reset Defaults</button>
          <button onClick={onExportCalculations} className="inline-flex items-center gap-1 text-[11px] text-accent-orange hover:text-accent-orange/80"><Download size={11} /> Export Calculations</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1">{k.label}</div>
            <div className="text-base font-bold text-white">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">Transparency Center™ · Every Metric</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {roi.metrics.map((m) => <MetricCard key={m.key} m={m} />)}
      </div>
    </div>
  );
}