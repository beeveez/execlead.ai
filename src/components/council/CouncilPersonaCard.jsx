import React from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

export default function CouncilPersonaCard({ persona, perspective, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/[0.03] border border-white/5 rounded-xl p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xl">
          {persona.icon}
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{persona.name}</div>
          <div className="text-white/30 text-xs">{persona.title}</div>
        </div>
        <div className="ml-auto text-[10px] text-indigo-400/50 uppercase tracking-wider text-right max-w-[100px]">{persona.perspective}</div>
      </div>
      <div className="text-white/60 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>{perspective}</ReactMarkdown>
      </div>
    </motion.div>
  );
}