import React, { useState } from "react";
import { Compass, ChevronDown } from "lucide-react";
import { getPositioning } from "@/lib/competitiveIntelligence";

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="mb-2.5">
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">{label}</div>
      <div className="text-xs text-white/70 leading-relaxed">{value}</div>
    </div>
  );
}

function Canvas({ c }) {
  const [open, setOpen] = useState(true);
  const p = getPositioning(c) || {};
  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-white/[0.02] p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <span className="text-white text-sm font-semibold">{c.company_name}</span>
        <ChevronDown size={15} className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Row label="Primary Customer" value={p.primary_customer} />
          <Row label="Primary Problem Solved" value={p.primary_problem_solved} />
          <Row label="Core Differentiator" value={p.core_differentiator} />
          <Row label="Sales Messaging" value={p.sales_messaging} />
          <Row label="Enterprise Positioning" value={p.enterprise_positioning} />
          <Row label="AI Strategy" value={p.ai_strategy} />
          <Row label="Leadership Philosophy" value={p.leadership_philosophy} />
          <Row label="Go-To-Market Strategy" value={p.gtm_strategy} />
          <Row label="EXECLEAD.AI Differentiation" value={p.execlead_differentiation} />
          <Row label="Competitive Opportunity" value={p.competitive_opportunity} />
          <Row label="Competitive Risk" value={p.competitive_risk} />
        </div>
      )}
    </div>
  );
}

export default function IntelPositioning({ competitors }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Compass size={16} className="text-indigo-400" />
        <h2 className="text-lg font-semibold">Positioning Canvas</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {competitors.map((c) => <Canvas key={c.id} c={c} />)}
      </div>
    </div>
  );
}