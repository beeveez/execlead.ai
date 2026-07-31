import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, TrendingUp, Building2, ArrowRight, Check } from "lucide-react";

// Three outcome-focused experience cards — replace any page-directory section.
// Each sells an outcome, names the capabilities it includes, and drives one CTA.
const CARDS = [
  {
    icon: Swords,
    accent: "accent-orange",
    headline: "Practice Executive Leadership",
    copy: "Experience realistic executive scenarios before they happen — and learn from every decision you make.",
    includes: ["Executive Simulator™", "Executive Debate™", "Executive Council™"],
    cta: "Try Executive Simulator",
    to: "/simulator",
    visitorTo: "/beta",
  },
  {
    icon: TrendingUp,
    accent: "indigo",
    headline: "Accelerate Your Career",
    copy: "Measure, strengthen, and demonstrate your executive readiness with evidence-based growth.",
    includes: ["Executive Readiness™", "Leadership DNA™", "Executive Coach™", "Executive Portfolio™"],
    cta: "Start Executive Readiness Assessment™",
    to: "/assessment",
    visitorTo: "/beta",
  },
  {
    icon: Building2,
    accent: "emerald",
    headline: "Develop Future Leaders",
    copy: "Build executive capability across your organization with enterprise leadership development.",
    includes: ["Succession Planning™", "Leadership Analytics™", "Talent Intelligence™", "Enterprise Dashboard™"],
    cta: "Book Enterprise Demo",
    to: "/contact",
    visitorTo: "/contact",
  },
];

const accentMap = {
  "accent-orange": { ring: "ring-accent-orange/30", border: "border-accent-orange/40", bg: "bg-accent-orange/[0.06]", text: "text-accent-orange", icon: "bg-accent-orange/15 text-accent-orange", btn: "bg-accent-orange hover:bg-accent-orange/90" },
  indigo: { ring: "ring-indigo-500/30", border: "border-indigo-500/40", bg: "bg-indigo-500/[0.06]", text: "text-indigo-400", icon: "bg-indigo-500/15 text-indigo-400", btn: "bg-indigo-500 hover:bg-indigo-600" },
  emerald: { ring: "ring-emerald-500/30", border: "border-emerald-500/40", bg: "bg-emerald-500/[0.06]", text: "text-emerald-400", icon: "bg-emerald-500/15 text-emerald-400", btn: "bg-emerald-600 hover:bg-emerald-500" },
};

export default function OutcomeExperienceCards({ authed }) {
  return (
    <section className="py-20 md:py-24 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-accent-orange mb-3">
            <ArrowRight size={13} /><span className="text-[11px] uppercase tracking-wider font-semibold">Three Ways to Grow</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Choose your outcome. We'll handle the journey.</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">Every path leads to becoming executive ready — practiced, measured, and proven.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map((card, i) => {
            const a = accentMap[card.accent];
            const dest = authed ? card.to : card.visitorTo;
            return (
              <motion.div key={card.headline}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border ${a.border} ${a.bg} p-6 flex flex-col`}>
                <div className={`w-11 h-11 rounded-xl ${a.icon} flex items-center justify-center mb-4`}>
                  <card.icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{card.headline}</h3>
                <p className="text-[13px] text-white/50 leading-relaxed mb-4">{card.copy}</p>

                <div className="mb-5">
                  <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Includes</div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.includes.map((inc) => (
                      <span key={inc} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03] border border-white/8 text-[11px] ${a.text}`}>
                        <Check size={10} /> {inc}
                      </span>
                    ))}
                  </div>
                </div>

                <Link to={dest} className={`mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl ${a.btn} text-white text-[13px] font-semibold transition-colors`}>
                  {card.cta} <ArrowRight size={15} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}