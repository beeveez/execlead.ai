import React from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

const TRACKS = [
  "Technology Leadership",
  "Business Leadership",
  "Finance Leadership",
  "Human Resources Leadership",
  "Sales & Marketing Leadership",
  "Product & Innovation Leadership",
  "Government Leadership",
  "Healthcare Leadership",
  "Education Leadership",
  "Custom Executive Goal",
];

export default function LeadershipTrackCallout() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
      className="rounded-2xl bg-white/[0.03] border border-white/8 p-4 mb-7"
    >
      <div className="flex items-start gap-2 mb-2.5">
        <Target size={14} className="text-accent-orange mt-0.5 shrink-0" />
        <div>
          <div className="text-[13px] font-semibold text-white">Personalized for Your Leadership Journey</div>
          <div className="text-[11px] text-white/45 leading-relaxed mt-0.5">
            Choose your desired executive path and EXECLEAD.AI adapts your assessment, coaching, simulations, roadmap,
            and executive identity to your leadership goals.
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TRACKS.map((t) => (
          <span key={t} className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-white/55 font-medium">
            {t}
          </span>
        ))}
      </div>
      <div className="text-[9px] text-white/25 mt-2">Informational only · selection happens during onboarding.</div>
    </motion.div>
  );
}