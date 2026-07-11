import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, HelpCircle } from "lucide-react";
import { EELM_DECISION_CHAIN } from "@/lib/eelmMethodology";
import SectionHeader from "./SectionHeader";

export default function MethodologyDecisionModel() {
  return (
    <section id="decision" className="max-w-5xl mx-auto px-4 py-12">
      <SectionHeader number="05" title="The AI Decision Model" subtitle="EXEC™ never produces recommendations randomly — every recommendation follows this explainable chain" />
      <div className="flex flex-col gap-2 mb-6">
        {EELM_DECISION_CHAIN.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === EELM_DECISION_CHAIN.length - 1;
          return (
            <React.Fragment key={step.id}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="flex items-center gap-3 p-4 rounded-xl border bg-white/[0.02]"
                style={{ borderColor: `${step.color}30` }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${step.color}15` }}>
                  <Icon size={16} style={{ color: step.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{step.label}</div>
                  <div className="text-white/30 text-xs">Step {i + 1} of {EELM_DECISION_CHAIN.length}</div>
                </div>
                <span className="text-xs font-mono text-white/20">{String(i + 1).padStart(2, "0")}</span>
              </motion.div>
              {!isLast && <ArrowRight size={14} className="text-white/20 rotate-90 self-center" />}
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
        <HelpCircle size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-white/60 text-xs leading-relaxed">
          <span className="text-white/80 font-medium">Explainability:</span> Users can always ask "Why are you recommending this?" and EXEC™ answers with the specific evidence, framework rules, and context that produced the recommendation. No black-box AI.
        </p>
      </div>
    </section>
  );
}