import React from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { EELM_INTELLIGENCE_LOOP } from "@/lib/eelmMethodology";
import SectionHeader from "./SectionHeader";

export default function MethodologyLoop() {
  return (
    <section id="loop" className="border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <SectionHeader number="02" title="The Executive Intelligence Loop" subtitle="The heartbeat of EXECLEAD.AI — every interaction cycles through this loop" />
        <div className="flex flex-col items-center gap-2">
          {EELM_INTELLIGENCE_LOOP.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === EELM_INTELLIGENCE_LOOP.length - 1;
            return (
              <React.Fragment key={step.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl border bg-white/[0.02] w-full max-w-xs"
                  style={{ borderColor: `${step.color}30` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${step.color}15` }}>
                    <Icon size={14} style={{ color: step.color }} />
                  </div>
                  <span className="text-white font-medium text-sm">{step.label}</span>
                </motion.div>
                {!isLast && <ArrowDown size={14} className="text-white/20" />}
                {isLast && (
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-xs text-white/30 italic mt-1">
                    ↺ The loop continues with every interaction
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}