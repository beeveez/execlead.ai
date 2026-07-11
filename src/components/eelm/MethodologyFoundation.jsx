import React from "react";
import { motion } from "framer-motion";
import { BookOpen, BadgeCheck, CheckCircle2, Sparkles } from "lucide-react";
import { EELM_RESEARCH_DOMAINS, EELM_TRANSPARENCY_ITEMS, EELM_SUCCESS_CRITERIA, EELM_PHILOSOPHY, EELM_DISCLAIMER } from "@/lib/eelmMethodology";
import SectionHeader from "./SectionHeader";

export default function MethodologyFoundation() {
  return (
    <>
      <section id="research" className="max-w-5xl mx-auto px-4 py-12">
        <SectionHeader number="09" title="Research Foundation" subtitle="EELM™ is informed by established leadership and organizational research" />
        <div className="flex flex-wrap gap-2">
          {EELM_RESEARCH_DOMAINS.map((domain, i) => (
            <motion.span
              key={domain}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/10 text-xs text-white/60"
            >
              {domain}
            </motion.span>
          ))}
        </div>
        <p className="text-white/30 text-xs mt-4 italic">{EELM_DISCLAIMER}</p>
      </section>

      <section id="transparency" className="border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <SectionHeader number="10" title="Transparency" subtitle="EXEC™ explains its reasoning — no black-box AI" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {EELM_TRANSPARENCY_ITEMS.map((item, i) => (
              <motion.div key={item} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                <BadgeCheck size={14} className="text-blue-400 flex-shrink-0" />
                <span className="text-white/70 text-sm">EXEC™ explains {item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <SectionHeader number="11" title="Success Criteria" subtitle="How we measure whether EELM™ is fulfilling its mission" />
        <div className="space-y-2">
          {EELM_SUCCESS_CRITERIA.map((criteria, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }} className="flex items-start gap-3 p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.02]">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-white/70 text-sm">{criteria}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="philosophy" className="border-t border-white/5 bg-gradient-to-b from-transparent to-indigo-500/5">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Sparkles size={24} className="text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 leading-relaxed">{EELM_PHILOSOPHY.statement}</h2>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-8">
            {EELM_PHILOSOPHY.principles.map((p) => (
              <span key={p} className="text-white/50 text-sm">{p}</span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {EELM_PHILOSOPHY.closing.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400"
              >
                {c}
              </motion.span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}