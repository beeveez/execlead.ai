import React from "react";
import { motion } from "framer-motion";
import { EELM_MATURITY_STAGES } from "@/lib/eelmMethodology";
import SectionHeader from "./SectionHeader";

export default function MethodologyMaturity() {
  return (
    <section id="maturity" className="border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <SectionHeader number="06" title="The Leadership Maturity Model" subtitle="Every executive progresses through eight stages — every framework understands these stages" />
        <div className="relative">
          <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-600 via-amber-400 to-yellow-300" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 relative">
            {EELM_MATURITY_STAGES.map((stage, i) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2 border-2 bg-[#0a0a0f] relative z-10"
                  style={{ borderColor: stage.color, color: stage.color }}
                >
                  {stage.level}
                </div>
                <div className="text-white/70 text-xs font-medium leading-tight">{stage.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-6 text-[10px] uppercase tracking-wider text-white/30">
          <span>Beginning</span>
          <span>Continuous Growth →</span>
          <span>Mastery</span>
        </div>
      </div>
    </section>
  );
}