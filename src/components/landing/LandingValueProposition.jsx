import React from "react";
import { motion } from "framer-motion";
import { Gauge, GraduationCap, Award, TrendingUp, Check, Sparkles } from "lucide-react";

const OUTCOMES = [
  { icon: Gauge, title: "Assess", desc: "Measure your Executive Readiness using AI-powered leadership assessment." },
  { icon: GraduationCap, title: "Develop", desc: "Receive personalized coaching, simulations, and learning paths." },
  { icon: Award, title: "Demonstrate", desc: "Build an evidence-based Executive Identity and leadership portfolio." },
  { icon: TrendingUp, title: "Advance", desc: "Track your growth and prepare for your next executive opportunity." },
];

const PERSONALIZATION = [
  "Leadership Track",
  "Target Executive Role",
  "Industry Context",
  "Career Goals",
  "Executive Readiness",
  "Personalized Roadmap",
];

export default function LandingValueProposition() {
  return (
    <>
      {/* Product Definition */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium mb-4">
              <Sparkles size={12} /> The Platform
            </div>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed">
              EXECLEAD.AI is the world's first AI Executive Leadership Operating System that combines
              executive readiness assessment, AI coaching, leadership simulations, personalized development,
              and executive identity into one connected platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition — four outcomes */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Assess. Develop. Demonstrate. Advance.</h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">Four connected outcomes that turn ambition into executive readiness.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OUTCOMES.map((o, i) => (
              <motion.div
                key={o.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-white/[0.02] border border-white/8 p-6 hover:bg-white/[0.04] hover:border-white/15 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-accent-orange/10 flex items-center justify-center mb-4">
                  <o.icon size={20} className="text-accent-orange" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">{o.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{o.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Personalization message */}
      <section className="py-12 px-6 lg:px-8 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Every experience is personalized.</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto mb-5">
            EXECLEAD.AI adapts to each member's chosen leadership path — no two journeys are identical.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PERSONALIZATION.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs text-white/60">
                <Check size={12} className="text-emerald-400/80" /> {p}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-white/30 mt-5 italic">One Leadership Journey. One AI Platform. Every professional has a different destination.</p>
        </div>
      </section>
    </>
  );
}