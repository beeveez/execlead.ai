import React, { useState } from "react";
import { Swords, ChevronDown } from "lucide-react";
import { getBattlecard } from "@/lib/competitiveIntelligence";
import IntelBattleSimulator from "@/components/competitive-intel/IntelBattleSimulator";

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
    ["Executive Summary", b.executive_summary], ["Ideal Customer", b.ideal_customer], ["Buying Signals", b.buying_signals],
    ["Discovery Questions", b.discovery_questions], ["Typical Objections", b.typical_objections],
    ["EXECLEAD.AI Differentiation", b.execlead_differentiation], ["Competitive Risks", b.competitive_risks],
    ["When EXECLEAD.AI Wins", b.when_execlead_wins], ["When Competitor Wins", b.when_competitor_wins],
    ["Recommended Demo", b.recommended_demo], ["Proof Points", b.proof_points],
    ["Executive Messaging", b.executive_messaging], ["Closing Strategy", b.closing_strategy],
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
  const [view, setView] = useState("battlecards");
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Swords size={16} className="text-accent-orange" /><h2 className="text-lg font-semibold">Enterprise Battlecards™</h2></div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setView("battlecards")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === "battlecards" ? "bg-accent-orange/15 text-accent-orange border border-accent-orange/30" : "text-white/40 hover:text-white/70 border border-transparent"}`}>Battlecards</button>
          <button onClick={() => setView("simulator")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === "simulator" ? "bg-accent-orange/15 text-accent-orange border border-accent-orange/30" : "text-white/40 hover:text-white/70 border border-transparent"}`}>Battle Simulator</button>
        </div>
      </div>
      {view === "battlecards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{competitors.map((c) => <Battlecard key={c.id} c={c} />)}</div>
      ) : (
        <IntelBattleSimulator competitors={competitors} />
      )}
    </div>
  );
}