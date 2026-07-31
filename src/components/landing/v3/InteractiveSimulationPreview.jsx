import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, ArrowRight, Sparkles, Brain, Users, Shield, TrendingUp,
  RotateCcw, CheckCircle2, AlertTriangle,
} from "lucide-react";

// Interactive Simulation Preview — "show, don't tell".
// Lets a visitor experience an executive decision before creating an account,
// then reveals the AI coaching, council feedback, competency analysis, and
// readiness impact EXECLEAD.AI produces after every simulation.
const SCENARIO = {
  setting: "Board Meeting",
  prompt:
    "The CFO recommends reducing cybersecurity investment by 30% to meet quarterly targets. The CIO warns this will leave critical systems exposed. The board is watching. What do you do?",
};

const CHOICES = [
  {
    id: "A",
    label: "Approve",
    summary: "Accept the cut to protect quarterly performance.",
    coaching:
      "You protected short-term financials, but you accepted significant enterprise risk without a mitigation plan. Strong executives don't trade durable capability for a single quarter.",
    council: [
      { persona: "CFO", sentiment: "support", note: "Pragmatic — protects the quarter and signals fiscal discipline." },
      { persona: "CTO / CIO", sentiment: "oppose", note: "Exposes critical systems; the breach cost will dwarf the savings." },
      { persona: "Board", sentiment: "caution", note: "Approval without a risk plan is a governance concern." },
    ],
    competencies: [
      { name: "Business Acumen", delta: +8 },
      { name: "Risk Leadership", delta: -18 },
      { name: "Strategic Thinking", delta: -10 },
    ],
    readiness: -2,
    verdict: "Short-term win, long-term exposure.",
  },
  {
    id: "B",
    label: "Reject",
    summary: "Preserve investment; defend the capability.",
    coaching:
      "You protected a critical capability — that's instinct many leaders lack. But rejecting without an alternative leaves the CFO's legitimate concern unaddressed. Pair the 'no' with a plan.",
    council: [
      { persona: "CTO / CIO", sentiment: "support", note: "Protects the organization's most exposed surface." },
      { persona: "CFO", sentiment: "caution", note: "Defensible — but the quarter still needs an answer." },
      { persona: "Board", sentiment: "support", note: "Risk-aware leadership; ask for the counter-proposal." },
    ],
    competencies: [
      { name: "Risk Leadership", delta: +14 },
      { name: "Stakeholder Management", delta: +9 },
      { name: "Strategic Thinking", delta: +6 },
    ],
    readiness: +4,
    verdict: "Courageous, but incomplete without a plan.",
  },
  {
    id: "C",
    label: "Propose an alternative",
    summary: "Reframe: phased investment tied to risk-tiered outcomes.",
    coaching:
      "Excellent. You refused the false binary and reframed the decision around outcomes the whole board can rally behind. This is the move that separates managers from executives.",
    council: [
      { persona: "CFO", sentiment: "support", note: "Phased spend preserves the quarter while building capability." },
      { persona: "CTO / CIO", sentiment: "support", note: "Risk-tiered funding protects what matters most." },
      { persona: "Board", sentiment: "support", note: "A unifying outcome — exactly what we expect of a future executive." },
    ],
    competencies: [
      { name: "Strategic Thinking", delta: +16 },
      { name: "Innovation Leadership", delta: +12 },
      { name: "Decision Quality", delta: +11 },
    ],
    readiness: +6,
    verdict: "Executive-grade thinking.",
  },
];

export default function InteractiveSimulationPreview({ authed }) {
  const [choice, setChoice] = useState(null);
  const selected = CHOICES.find((c) => c.id === choice);

  const ctaTo = authed ? "/assessment" : "/beta";

  return (
    <section id="solution" className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-accent-orange mb-3">
            <Brain size={13} /><span className="text-[11px] uppercase tracking-wider font-semibold">The Solution · Experience It</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Practice the moments that matter — before they happen.</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">Don't read about a feature. Make an executive decision right now and see exactly what EXECLEAD.AI gives you back.</p>
        </div>

        {/* Scenario */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8 bg-white/[0.02]">
            <Building2 size={14} className="text-accent-orange" />
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">{SCENARIO.setting}</span>
            <span className="ml-auto text-[10px] text-white/30">Executive Simulator™</span>
          </div>
          <div className="p-6">
            <p className="text-[15px] text-white/80 leading-relaxed mb-6">{SCENARIO.prompt}</p>

            {/* Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CHOICES.map((c) => {
                const active = choice === c.id;
                return (
                  <button key={c.id}
                    onClick={() => setChoice(c.id)}
                    className={`text-left rounded-xl border p-4 transition-all ${active ? "border-accent-orange/50 bg-accent-orange/[0.06] ring-1 ring-accent-orange/30" : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[12px] font-bold ${active ? "bg-accent-orange text-white" : "bg-white/8 text-white/60"}`}>{c.id}</span>
                      <span className="text-[14px] font-semibold text-white">{c.label}</span>
                    </div>
                    <p className="text-[11.5px] text-white/45 leading-relaxed">{c.summary}</p>
                  </button>
                );
              })}
            </div>

            {/* Outcome */}
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div key={selected.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="mt-6 space-y-5">
                  {/* Verdict + Readiness */}
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center gap-2">
                      {selected.readiness > 0 ? <CheckCircle2 size={15} className="text-emerald-400" /> : <AlertTriangle size={15} className="text-amber-400" />}
                      <span className="text-[13px] font-medium text-white/85">{selected.verdict}</span>
                    </div>
                    <span className={`text-[13px] font-bold ${selected.readiness > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                      {selected.readiness > 0 ? "+" : ""}{selected.readiness} Executive Readiness™
                    </span>
                  </div>

                  {/* AI Coaching */}
                  <div className="rounded-xl border border-accent-orange/20 bg-accent-orange/[0.04] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-accent-orange" />
                      <span className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold">AI Executive Coaching</span>
                    </div>
                    <p className="text-[13px] text-white/70 leading-relaxed">{selected.coaching}</p>
                  </div>

                  {/* Council + Competencies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={14} className="text-indigo-400" />
                        <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">Executive Council Feedback</span>
                      </div>
                      <div className="space-y-2.5">
                        {selected.council.map((p) => (
                          <div key={p.persona} className="flex items-start gap-2">
                            <SentimentDot sentiment={p.sentiment} />
                            <div>
                              <span className="text-[12px] font-medium text-white/75">{p.persona}</span>
                              <p className="text-[11px] text-white/45 leading-snug">{p.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">Competency Analysis</span>
                      </div>
                      <div className="space-y-3">
                        {selected.competencies.map((c) => (
                          <div key={c.name}>
                            <div className="flex items-center justify-between text-[12px] mb-1">
                              <span className="text-white/65">{c.name}</span>
                              <span className={`font-semibold ${c.delta > 0 ? "text-emerald-400" : "text-rose-400"}`}>{c.delta > 0 ? "+" : ""}{c.delta}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${c.delta > 0 ? "bg-emerald-500/70" : "bg-rose-500/60"}`} style={{ width: `${50 + c.delta}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-accent-orange/[0.06] to-transparent p-4">
                    <div className="flex items-center gap-2 text-[12px] text-white/55">
                      <Shield size={14} className="text-accent-orange/70" /> This is a fraction of what your full report includes.
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setChoice(null)} className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors">
                        <RotateCcw size={12} /> Try another
                      </button>
                      <Link to={ctaTo} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-[13px] font-semibold transition-colors">
                        See Your Full Readiness Report <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function SentimentDot({ sentiment }) {
  const color = { support: "bg-emerald-400", caution: "bg-amber-400", oppose: "bg-rose-400" }[sentiment] || "bg-white/40";
  return <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${color}`} />;
}