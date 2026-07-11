import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { EELM_EVIDENCE_SOURCES } from "@/lib/eelmMethodology";
import SectionHeader from "./SectionHeader";

const CATEGORY_COLORS = {
  "Self-Reported": "#94a3b8",
  "Assessment": "#8b5cf6",
  "Behavioral": "#f59e0b",
  "Performance": "#10b981",
  "Learning": "#06b6d4",
  "Contribution": "#ec4899",
  "Community": "#f97316",
  "Activity": "#64748b",
  "Trust": "#22c55e",
};

export default function MethodologyEvidence() {
  const categories = [...new Set(EELM_EVIDENCE_SOURCES.map((s) => s.category))];
  return (
    <section id="evidence" className="border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <SectionHeader number="04" title="The Evidence Model" subtitle="Every recommendation is evidence-based — confidence increases as evidence accumulates" />
        <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-300/80 text-xs">
            {EELM_EVIDENCE_SOURCES.length} evidence sources across {categories.length} categories — self-declaration alone is never sufficient.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {EELM_EVIDENCE_SOURCES.map((src, i) => {
            const color = CATEGORY_COLORS[src.category] || "#94a3b8";
            return (
              <motion.div
                key={src.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: (i % 8) * 0.04 }}
                className="p-3 rounded-lg border border-white/5 bg-white/[0.02]"
              >
                <div className="text-white/80 text-xs font-medium mb-1">{src.label}</div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">{src.category}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}