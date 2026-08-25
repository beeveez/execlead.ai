import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Brain, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import InteractiveSimulationOutcome from "./InteractiveSimulationOutcome";

// Interactive Simulation Preview — "show, don't tell".
// Lets a visitor make a real executive decision before creating an account,
// then reveals the executive-level analysis EXECLEAD.AI produces after every
// simulation: consequence timeline, stakeholder reactions, financial
// implications, leadership strengths/blind spots, evidence-based readiness
// gain, and one personalized coaching recommendation.
const SCENARIO = {
  setting: "Board Meeting · Q3 Budget Crisis",
  context: "Example Health System — 14,000 employees · $2.1B revenue · healthcare + fintech exposure",
  prompt:
    "The CFO recommends cutting cybersecurity investment 30% ($2.4M) to hit Q3 EPS. The CIO warns critical systems go exposed. The audit committee flags rising threat activity. The board is watching. What do you decide?",
  stakeholders: ["CFO", "CIO / CTO", "Audit Committee", "Board", "Customers", "Employees"],
};

const CHOICES = [
  {
    id: "A",
    label: "Approve the cut",
    summary: "Accept the reduction to protect quarterly performance.",
    verdict: "Short-term win, long-term exposure.",
    consequences: {
      immediate: "Quarterly target met. The CIO escalates the risk register; the security roadmap is frozen; the audit committee records its dissent.",
      thirtyDay: "Critical patches slip. SOC morale drops. One major vendor contract auto-renews at a lower tier, reducing coverage on your most exposed surface.",
      twelveMonth: "A preventable breach is now materially likely. The board faces a disclosure obligation. Customer trust and your personal credibility erode.",
    },
    council: [
      { persona: "CFO", sentiment: "support", note: "Pragmatic — protects the quarter and signals fiscal discipline." },
      { persona: "CIO / CTO", sentiment: "oppose", note: "Exposes critical systems; the eventual breach cost will dwarf the savings." },
      { persona: "Audit Committee", sentiment: "oppose", note: "Approval without a mitigation plan is a governance failure we must record." },
      { persona: "Board", sentiment: "caution", note: "Approval without a risk plan is a governance concern." },
    ],
    financial: "Saves ~$2.4M this quarter. Expected loss exposure rises to ~$9M–$14M (breach + remediation + churn). Net position: negative.",
    competencies: [
      { name: "Business Acumen", delta: +8 },
      { name: "Risk Leadership", delta: -18 },
      { name: "Strategic Thinking", delta: -10 },
    ],
    strengths: ["Fiscal discipline under board scrutiny", "Decisive under pressure"],
    blindSpots: [
      "Accepted unmitigated enterprise risk",
      "Treated security as a cost center, not a capability",
      "No mitigation or phased plan offered",
    ],
    evidenceGained: {
      level: "Emerging",
      competencies: ["Business Acumen"],
      confidence: 52,
      summary: "Commercial instinct demonstrated, but risk leadership and strategic thinking were insufficiently evidenced by this decision.",
    },
    coachingRecommendation:
      "Before approving any capability cut, pair every 'yes' with a written mitigation plan and a 90-day risk review — protect the quarter without gambling the enterprise.",
  },
  {
    id: "B",
    label: "Reject the cut",
    summary: "Preserve the investment; defend the capability.",
    verdict: "Courageous, but incomplete without a plan.",
    consequences: {
      immediate: "Investment preserved. The CIO is reassured. The CFO logs the missed target and formally requests an alternative path.",
      thirtyDay: "The quarter misses by ~6%. You're asked to present a phased cybersecurity ROI model at the next board meeting.",
      twelveMonth: "Security posture holds — but without a reframe, cyber remains a defended cost center rather than an enabled capability.",
    },
    council: [
      { persona: "CIO / CTO", sentiment: "support", note: "Protects the organization's most exposed surface." },
      { persona: "CFO", sentiment: "caution", note: "Defensible — but the quarter still needs an answer." },
      { persona: "Audit Committee", sentiment: "support", note: "Risk-aware; we'll expect the counter-proposal at the next meeting." },
      { persona: "Board", sentiment: "support", note: "Risk-aware leadership; now ask for the counter-proposal." },
    ],
    financial: "Q3 misses ~$2.4M target. Breach exposure held flat. Opportunity cost: unfunded modernization delays revenue-enabling security work by ~9 months.",
    competencies: [
      { name: "Risk Leadership", delta: +14 },
      { name: "Stakeholder Management", delta: +9 },
      { name: "Strategic Thinking", delta: +6 },
    ],
    strengths: ["Protected a critical capability under fiscal pressure", "Risk-aware when it mattered"],
    blindSpots: [
      "Rejected without a counter-proposal",
      "Left the CFO's legitimate concern unaddressed",
      "Offered no phased path forward",
    ],
    evidenceGained: {
      level: "Demonstrated",
      competencies: ["Risk Leadership", "Stakeholder Management"],
      confidence: 71,
      summary: "Risk leadership and stakeholder management clearly demonstrated. Strategic reframe and financial alignment still developing.",
    },
    coachingRecommendation:
      "Every 'no' to a fiscal leader should carry a 'here's how': pair the rejection with a phased, risk-tiered investment plan the board can approve today.",
  },
  {
    id: "C",
    label: "Propose an alternative",
    summary: "Reframe: phased, risk-tiered investment tied to outcomes.",
    verdict: "Executive-grade thinking.",
    consequences: {
      immediate: "The board aligns on a phased, risk-tiered plan. The CFO gets quarterly relief. The CIO keeps critical coverage. You're asked to own the program.",
      thirtyDay: "Risk-tiered funding model approved. Highest-exposure systems funded first. A measurable security ROI dashboard goes live for the board.",
      twelveMonth: "Security is reframed as a capability. Breach exposure drops ~40%. You're recognized as the leader who turned a budget fight into enterprise alignment.",
    },
    council: [
      { persona: "CFO", sentiment: "support", note: "Phased spend preserves the quarter while building capability." },
      { persona: "CIO / CTO", sentiment: "support", note: "Risk-tiered funding protects what matters most." },
      { persona: "Audit Committee", sentiment: "support", note: "Outcome-based and defensible — exactly the governance we expect." },
      { persona: "Board", sentiment: "support", note: "A unifying outcome — exactly what we expect of a future executive." },
    ],
    financial: "Phased spend defers ~$1.6M into Q4–Q5, protecting the quarter. Breach exposure reduced ~$5M. Two revenue projects previously blocked by security gaps are now unblocked.",
    competencies: [
      { name: "Strategic Thinking", delta: +16 },
      { name: "Innovation Leadership", delta: +12 },
      { name: "Decision Quality", delta: +11 },
      { name: "Stakeholder Management", delta: +9 },
    ],
    strengths: [
      "Reframed a false binary",
      "Aligned divergent stakeholders around shared outcomes",
      "Outcome-based decision making under pressure",
      "Strategic courage",
    ],
    blindSpots: [
      "Execution now depends on disciplined phasing",
      "Must prevent scope creep under board enthusiasm",
    ],
    evidenceGained: {
      level: "Verified",
      competencies: ["Strategic Thinking", "Innovation Leadership", "Decision Quality", "Stakeholder Management"],
      confidence: 86,
      summary: "Executive-grade decision making demonstrated across strategy, innovation, decision quality, and stakeholder alignment.",
    },
    coachingRecommendation:
      "Own the rollout: publish the phased milestones publicly and tie every gate to a measurable risk reduction — turn the board's enthusiasm into accountability.",
  },
];

export default function InteractiveSimulationPreview({ authed }) {
  const [choice, setChoice] = useState(null);
  const selected = CHOICES.find((c) => c.id === choice);
  const ctaTo = authed ? "/assessment" : "/beta";
  const completedRef = useRef(false);

  // Funnel: Simulation Completed fires once when the Executive Debrief renders.
  useEffect(() => {
    if (selected && !completedRef.current) {
      completedRef.current = true;
      try { base44.analytics.track({ eventName: "flagship_simulation_completed", properties: { choice: selected.id } }); } catch (e) {}
    }
  }, [selected]);

  const selectChoice = (id) => {
    setChoice(id);
    try { base44.analytics.track({ eventName: "flagship_simulation_started", properties: { choice: id } }); } catch (e) {}
  };

  return (
    <section id="solution" className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-accent-orange mb-3">
            <Brain size={13} /><span className="text-[11px] uppercase tracking-wider font-semibold">The Solution · Experience It</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Practice the moments that matter — before they happen.</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">Make an executive decision right now and review the structured leadership feedback EXECLEAD.AI provides.</p>
        </div>

        {/* Scenario */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8 bg-white/[0.02]">
            <Building2 size={14} className="text-accent-orange" />
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">{SCENARIO.setting}</span>
            <span className="ml-auto text-[10px] text-white/30">Executive Simulator™</span>
          </div>
          <div className="p-6">
            <p className="text-[11px] text-white/35 mb-2">{SCENARIO.context}</p>
            <p className="mb-3 text-[11px] leading-relaxed text-amber-300/80">The scenario, organization, people, metrics, and all other details are fictional and for demonstration only unless explicitly identified as verified real information.</p>
            <p className="text-[15px] text-white/80 leading-relaxed mb-4">{SCENARIO.prompt}</p>

            {/* Stakeholders */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <Users size={12} className="text-white/40" />
              <span className="text-[10px] uppercase tracking-wider text-white/30">Stakeholders</span>
              {SCENARIO.stakeholders.map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/8 text-white/55">{s}</span>
              ))}
            </div>

            {/* Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CHOICES.map((c) => {
                const active = choice === c.id;
                return (
                  <button key={c.id}
                    onClick={() => selectChoice(c.id)}
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

            {/* Outcome — flagship executive analysis */}
            <AnimatePresence mode="wait">
              {selected && (
                <InteractiveSimulationOutcome choice={selected} onReset={() => setChoice(null)} ctaTo={ctaTo} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}