import React, { useState } from "react";
import { Swords, ChevronDown } from "lucide-react";
import { getBattlecard } from "@/lib/competitiveIntelligence";

function Card({ title, children }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-wider text-accent-orange font-semibold mb-1">{title}</div>
      <div className="text-xs text-white/70 leading-relaxed">{children}</div>
    </div>
  );
}

function Battlecard({ c }) {
  const [open, setOpen] = useState(true);
  const b = getBattlecard(c) || {};
  return (
    <div className="rounded-2xl border border-accent-orange/20 bg-white/[0.02] p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <span className="text-white text-sm font-semibold">{c.company_name}</span>
        <ChevronDown size={15} className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3">
          <Card title="Executive Summary">{b.executive_summary}</Card>
          <Card title="When customers choose {competitor}">{b.when_customers_choose}</Card>
          <Card title="Questions to ask prospects">{b.questions_to_ask}</Card>
          <Card title="EXECLEAD.AI strengths">{b.execlead_strengths}</Card>
          <Card title="Appropriate differentiation">{b.differentiation}</Card>
          <Card title="When {competitor} may be a stronger fit">{b.when_competitor_stronger}</Card>
        </div>
      )}
    </div>
  );
}

export default function IntelBattlecards({ competitors }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Swords size={16} className="text-accent-orange" />
        <h2 className="text-lg font-semibold">Enterprise Battlecards</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {competitors.map((c) => <Battlecard key={c.id} c={c} />)}
      </div>
    </div>
  );
}