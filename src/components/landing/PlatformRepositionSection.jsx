import React from "react";
import { motion } from "framer-motion";
import { Cpu, Brain, GraduationCap, Compass, Fingerprint, Briefcase, Trophy, TrendingUp, Sparkles } from "lucide-react";

const CAPABILITIES = [
  "Executive Coach™", "Executive Simulator™", "Leadership Academy™", "Executive Journey™",
  "Executive Identity™", "Executive Portfolio™", "Executive Success Stories™", "Promotion Forecast™", "Executive Concierge™",
];

export default function PlatformRepositionSection() {
  return (
    <section className="py-16 md:py-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium mb-4">
            <Sparkles size={12} /> The Operating System
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">EXECLEAD.AI is the world's first AI Executive Leadership Operating System.</h2>
          <p className="text-white/55 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            After your assessment, every capability automatically personalizes itself to your leadership goals.
          </p>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {CAPABILITIES.map((c, i) => (
            <motion.span
              key={c}
              initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs text-white/60 font-medium"
            >
              {c}
            </motion.span>
          ))}
        </div>
        <p className="text-lg font-semibold text-accent-orange">The platform adapts to you.</p>
      </div>
    </section>
  );
}