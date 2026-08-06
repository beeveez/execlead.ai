import React from "react";
import { Castle, Check, Shield } from "lucide-react";
import { SectionHeader, BetaBanner } from "@/components/commercial-revenue/shared";
import { computeMoat, MOAT_STATUS_META } from "@/lib/competitiveIntelligence";

export default function IntelMoat({ competitors }) {
  const moat = computeMoat(competitors);
  const levelColor = moat.score >= 60 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" : moat.score >= 40 ? "text-sky-400 bg-sky-500/10 border-sky-500/25" : "text-amber-400 bg-amber-500/10 border-amber-500/25";

  return (
    <div>
      <SectionHeader icon={Castle} title="EXECLEAD.AI Moat™" subtitle="Measures EXECLEAD.AI's unique differentiation — not a competitor score. Evaluates Executive Readiness™, Executive Identity™, Evidence-Based Development™, Simulations, Success Stories, Enterprise Assessment, Executive Journey, Context, Trust, Responsible AI, Explainability, and Unified Platform." />
      <BetaBanner />
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4 flex items-center gap-4">
        <div className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center ${levelColor}`}>
          <span className="text-2xl font-bold leading-none">{moat.score}</span>
          <span className="text-[8px] uppercase">Moat Score</span>
        </div>
        <div>
          <div className="text-sm text-white font-semibold">{moat.level}</div>
          <div className="text-xs text-white/55 mt-1">{moat.advCount} of {moat.pillars.length} pillars are unique competitive advantages · {moat.needsCount} need attention</div>
          <div className="text-[11px] text-white/40 mt-1">EXECLEAD.AI competes through strategic clarity, evidence-based positioning, and differentiated executive leadership outcomes — not feature parity.</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {moat.pillars.map((p) => {
          const meta = MOAT_STATUS_META[p.status];
          return (
            <div key={p.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-sm text-white font-medium">{p.label}</div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase whitespace-nowrap ${meta.color} ${meta.bg} ${meta.border}`}>{p.status}</span>
              </div>
              <div className="text-[11px] text-white/45">
                {p.features.length === 0 ? "Conceptual pillar (no direct matrix feature)." : `Anchored to: ${p.features.join(", ")}`}
              </div>
              {p.competitorSupport > 0 && <div className="text-[11px] text-amber-400/70 mt-0.5">{p.competitorSupport} competitor(s) overlap this area</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}