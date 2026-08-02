import React from "react";
import { motion } from "framer-motion";
import { X, Check, MessageSquare, Brain } from "lucide-react";

// SimulationDifferentiation — positions EXECLEAD.AI against generic AI chat by
// contrasting what each actually does. No marketing hype; observable capability.
const EXECLEAD = [
  "Places you inside executive situations",
  "Evaluates leadership decisions",
  "Measures demonstrated competency",
  "Provides evidence-based coaching",
  "Tracks Executive Readiness™ over time",
];

export default function SimulationDifferentiation() {
  return (
    <section className="py-16 md:py-20 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-accent-orange mb-2">
            <Brain size={13} /><span className="text-[11px] uppercase tracking-wider font-semibold">Why This Is Different</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Not another AI chatbot. An Executive Leadership Operating System.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center"><MessageSquare size={16} className="text-white/40" /></div>
              <div>
                <div className="text-[14px] font-semibold text-white/70">Traditional AI Chat</div>
                <div className="text-[10px] text-white/30">Answers questions</div>
              </div>
            </div>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 text-[12.5px] text-white/45"><Check size={13} className="text-white/30 mt-0.5 shrink-0" />Answers questions</li>
              <li className="flex items-start gap-2 text-[12.5px] text-white/30"><X size={13} className="text-white/20 mt-0.5 shrink-0" />Doesn't evaluate your leadership</li>
              <li className="flex items-start gap-2 text-[12.5px] text-white/30"><X size={13} className="text-white/20 mt-0.5 shrink-0" />No demonstrated competency evidence</li>
              <li className="flex items-start gap-2 text-[12.5px] text-white/30"><X size={13} className="text-white/20 mt-0.5 shrink-0" />No measurable readiness growth</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl border border-accent-orange/25 bg-gradient-to-br from-accent-orange/[0.06] via-white/[0.02] to-transparent p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent-orange/15 flex items-center justify-center"><Brain size={16} className="text-accent-orange" /></div>
              <div>
                <div className="text-[14px] font-semibold text-white">EXECLEAD.AI</div>
                <div className="text-[10px] text-accent-orange/70">Executive Leadership Operating System</div>
              </div>
            </div>
            <ul className="space-y-2.5">
              {EXECLEAD.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12.5px] text-white/75"><Check size={13} className="text-accent-orange mt-0.5 shrink-0" />{item}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}