import React from "react";
import { motion } from "framer-motion";
import { EELM_PRINCIPLES } from "@/lib/eelmMethodology";
import SectionHeader from "./SectionHeader";

export default function MethodologyPrinciples() {
  return (
    <section id="principles" className="max-w-5xl mx-auto px-4 py-12">
      <SectionHeader number="01" title="The Five Principles of EELM™" subtitle="Every executive interaction follows these five governing principles" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EELM_PRINCIPLES.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`p-5 rounded-xl border border-white/10 bg-white/[0.02] ${i === 4 ? "lg:col-span-3 md:col-span-2" : ""}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}15`, border: `1px solid ${p.color}30` }}>
                  <Icon size={18} style={{ color: p.color }} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Principle {p.number}</div>
                  <h3 className="text-white font-bold text-lg leading-none mt-0.5">{p.name}</h3>
                </div>
              </div>
              <p className="text-white/60 text-sm mb-3">{p.summary}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.objectives.map((obj) => (
                  <span key={obj} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] text-white/50">
                    {obj}
                  </span>
                ))}
                {p.closing && <span className="px-2 py-1 rounded-md text-[11px] italic" style={{ color: p.color }}>{p.closing}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}