import React, { useState } from "react";
import { Swords, ChevronDown } from "lucide-react";
import { getBattlecard } from "@/lib/competitiveIntelligence";

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="mb-2.5">
      <div className="text-[10px] uppercase tracking-wider text-accent-orange font-semibold mb-0.5">{label}</div>
      <div className="text-xs text-white/70 leading-relaxed">{value}</div>
    </div>
  );
}

function Battlecard({ c }) {
  const [open, setOpen] = useState(true);
  const b = getBattlecard(c) || {};
  const fields = [
    ["Executive Summary", b.executive_summary], ["Ideal Customer Profile", b.ideal_customer_profile],
    ["Primary Messaging", b.primary_messaging], ["Strengths", b.strengths],
    ["Differentiators", b.differentiators], ["When EXECLEAD.AI Wins", b.when_execlead_wins],
    ["When Competitor May Be Stronger", b.when_competitor_stronger], ["Discovery Questions", b.discovery_questions],
    ["Positioning Guidance", b.positioning_guidance], ["Risk Areas", b.risk_areas],
    ["Recommended Demo Focus", b.recommended_demo_focus], ["Recommended Proof Points", b.recommended_proof_points],
    ["Objection Handling", b.objection_handling], ["Relevant Customer Personas", b.customer_personas],
  ];
  return (
    <div className="rounded-2xl border border-accent-orange/20 bg-white/[0.02] p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <span className="text-white text-sm font-semibold">{c.company_name}</span>
        <ChevronDown size={15} className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3">{fields.map(([l, v]) => <Row key={l} label={l} value={v} />)}</div>}
    </div>
  );
}

export default function IntelBattlecards({ competitors }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><Swords size={16} className="text-accent-orange" /><h2 className="text-lg font-semibold">Enterprise Battlecards™</h2></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{competitors.map((c) => <Battlecard key={c.id} c={c} />)}</div>
    </div>
  );
}