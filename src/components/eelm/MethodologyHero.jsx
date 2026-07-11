import React from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import { EELM_NAME, EELM_VERSION, EELM_TAGLINE, EELM_CORE_BELIEF, EELM_DISCLAIMER } from "@/lib/eelmMethodology";

export default function MethodologyHero() {
  return (
    <div className="relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
            <Brain size={12} />
            EELM™ Version {EELM_VERSION}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
            EXECLEAD Executive
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Leadership Methodology™
            </span>
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto mb-8">{EELM_TAGLINE}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-2xl mx-auto p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Our Core Belief</span>
          </div>
          <p className="text-white/90 text-base md:text-lg font-medium leading-relaxed mb-3">
            "{EELM_CORE_BELIEF.statement}"
          </p>
          <p className="text-white/50 text-sm leading-relaxed">{EELM_CORE_BELIEF.elaboration}</p>
        </motion.div>

        <p className="text-white/30 text-xs mt-6 max-w-xl mx-auto">{EELM_DISCLAIMER}</p>
      </div>
    </div>
  );
}