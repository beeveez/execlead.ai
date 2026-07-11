import React from "react";
import { motion } from "framer-motion";
import { EELM_FRAMEWORKS } from "@/lib/eelmMethodology";
import SectionHeader from "./SectionHeader";

export default function MethodologyFrameworks() {
  return (
    <section id="frameworks" className="max-w-5xl mx-auto px-4 py-12">
      <SectionHeader number="03" title="The Five Core Frameworks" subtitle="Five interconnected frameworks that together model the complete executive" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EELM_FRAMEWORKS.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-5 rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                    <Icon size={18} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-white font-bold text-base">{f.name}</h3>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md" style={{ background: `${f.color}15`, color: f.color }}>
                  {f.question}
                </span>
                <span className="text-white/40 text-xs ml-2">{f.questionLabel}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {f.measures.map((m) => (
                  <span key={m} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] text-white/50">
                    {m}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}