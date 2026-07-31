import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Brain, Gauge, Fingerprint, Sparkles, TrendingUp, Check } from "lucide-react";

const REASONS = [
  "Personalized Executive Coaching",
  "Leadership Simulations",
  "Executive Readiness Assessment™",
  "Evidence-Based Executive Identity",
  "AI-Powered Development Journey",
  "Leadership Progress Tracking",
];

export default function WhyProfessionalsUseSection() {
  return (
    <section className="py-16 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Why Professionals Use EXECLEAD.AI</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto">One intelligent platform built around measurable executive growth.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REASONS.map((r, i) => (
            <motion.div
              key={r}
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/8 px-4 py-3.5"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Check size={15} className="text-emerald-400" />
              </div>
              <span className="text-sm text-white/70 font-medium">{r}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}