import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain, Building2, ArrowRight, ShieldCheck, Clock, Gauge,
  Users, Sparkles, Quote, PlayCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

// FlagshipSimulationHero — the signature product-led-growth experience.
// Teases a realistic executive dilemma, invites the visitor to launch the
// simulation, and positions EXECLEAD.AI's evidence-based approach before any
// account is created.
const SCENARIO = {
  company: "Atrius Health Systems",
  crisis: "Cybersecurity Budget Crisis",
  industry: "Healthcare",
  difficulty: "Executive",
  time: "8–10 minutes",
  stakeholders: ["Board", "CEO", "CFO", "CIO / CTO", "Audit Committee"],
  outcome: "Evidence-Based Executive Feedback",
  dilemma:
    "The CFO recommends cutting cybersecurity investment 30% to hit quarterly EPS. The CIO warns critical systems will go exposed. The audit committee flags rising threat activity. The board demands a decision — now.",
};

export default function FlagshipSimulationHero({ authed }) {
  const ctaTo = authed ? "/assessment" : "/beta";

  const launchSimulation = () => {
    try { base44.analytics.track({ eventName: "flagship_simulation_launched", properties: { source: "hero" } }); } catch (e) {}
    document.getElementById("solution")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const startAssessment = () => {
    try { base44.analytics.track({ eventName: "assessment_started", properties: { source: "flagship_hero" } }); } catch (e) {}
  };

  return (
    <section className="relative py-16 md:py-24 px-6 lg:px-8 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent-orange/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* Left — narrative + CTAs */}
        <div>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-xs text-accent-orange font-semibold mb-5">
            <Sparkles size={12} /> FLAGSHIP EXECUTIVE SIMULATION™
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold tracking-tight leading-[1.1] mb-5">
            Experience Executive Leadership <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">Before You Need It.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-base text-white/60 leading-relaxed mb-7 max-w-xl">
            Step into a realistic executive board meeting where every decision has measurable business consequences. Take one Executive Simulation and discover how EXECLEAD.AI develops Executive Readiness™ through evidence — not opinion.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
            <button onClick={launchSimulation} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25">
              <PlayCircle size={18} /> Launch Executive Simulation™
            </button>
            <Link to={ctaTo} onClick={startAssessment} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/15 text-white/80 font-medium px-6 py-3.5 rounded-xl transition-colors">
              Take Executive Readiness Assessment™ <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Social proof — credibility, not hype */}
          <div className="flex items-start gap-2.5 max-w-md">
            <Quote size={16} className="text-accent-orange/50 mt-0.5 shrink-0" />
            <p className="text-[12.5px] text-white/45 italic leading-relaxed">
              "This simulation measures executive judgment using realistic business scenarios and evidence-based leadership competencies."
            </p>
          </div>
        </div>

        {/* Right — scenario highlight + live dilemma preview */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/8 bg-gradient-to-r from-accent-orange/[0.08] to-transparent">
            <Building2 size={15} className="text-accent-orange" />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white truncate">{SCENARIO.company}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">{SCENARIO.crisis}</div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange font-semibold">FLAGSHIP</span>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Meta icon={Building2} label="Industry" value={SCENARIO.industry} />
              <Meta icon={Gauge} label="Difficulty" value={SCENARIO.difficulty} />
              <Meta icon={Clock} label="Estimated Time" value={SCENARIO.time} />
              <Meta icon={ShieldCheck} label="Outcome" value={SCENARIO.outcome} />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Users size={12} className="text-white/40" />
                <span className="text-[10px] uppercase tracking-wider text-white/40">Stakeholders</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SCENARIO.stakeholders.map((s) => (
                  <span key={s} className="text-[10.5px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/8 text-white/65">{s}</span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Brain size={12} className="text-accent-orange/80" />
                <span className="text-[10px] uppercase tracking-wider text-accent-orange/70 font-semibold">Live Preview · The Dilemma</span>
              </div>
              <p className="text-[13px] text-white/75 leading-relaxed mb-3">{SCENARIO.dilemma}</p>
              <p className="text-[13px] font-medium text-white">What would you do?</p>
              <p className="text-[10px] text-white/30 mt-2">Launch the simulation to make the call — and face the consequences.</p>
            </div>

            <button onClick={launchSimulation} className="w-full inline-flex items-center justify-center gap-2 bg-accent-orange/10 hover:bg-accent-orange/15 border border-accent-orange/25 text-accent-orange font-medium py-3 rounded-xl transition-colors text-[13px]">
              <PlayCircle size={16} /> Launch Executive Simulation™
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/8 px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-white/35" />
        <span className="text-[9px] uppercase tracking-wider text-white/35">{label}</span>
      </div>
      <div className="text-[12.5px] font-medium text-white/85">{value}</div>
    </div>
  );
}