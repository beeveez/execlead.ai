import React, { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ChevronDown, Check, AlertTriangle, X } from "lucide-react";
import { SENTIMENT_STYLES } from "@/lib/councilData";

const SENTIMENT_ICONS = {
  support: <Check size={12} />,
  caution: <AlertTriangle size={12} />,
  oppose: <X size={12} />,
};

export default function CouncilPersonaCard({ persona, perspective, index }) {
  const [expanded, setExpanded] = useState(false);
  const sentiment = perspective?.sentiment || "caution";
  const style = SENTIMENT_STYLES[sentiment];
  const confidence = perspective?.confidence || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`bg-white/[0.03] border rounded-xl p-5 ${style.cell}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl shrink-0">
          {persona.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-white font-semibold text-sm">{persona.name}</div>
          <div className="text-white/30 text-xs truncate">{persona.title}</div>
        </div>
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-medium ${style.badge}`}>
          {SENTIMENT_ICONS[sentiment]}
          {style.label}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${style.dot}`} style={{ width: `${confidence}%` }} />
        </div>
        <span className="text-[10px] text-white/40 font-medium">{confidence}%</span>
      </div>

      {perspective?.stance_summary && (
        <p className="text-white/70 text-sm font-medium mb-2">{perspective.stance_summary}</p>
      )}

      {perspective?.viewpoint && (
        <div className="text-white/50 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{expanded ? perspective.viewpoint : perspective.viewpoint.split("\n")[0]}</ReactMarkdown>
        </div>
      )}

      {perspective?.viewpoint && perspective.viewpoint.includes("\n") && (
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2">
          <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Show less" : "Read full perspective"}
        </button>
      )}

      {(perspective?.key_points?.length > 0 || perspective?.key_concerns?.length > 0) && expanded && (
        <div className="mt-3 space-y-2">
          {perspective.key_points?.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-400/60 mb-1">Key Points</div>
              <ul className="space-y-0.5">
                {perspective.key_points.map((p, i) => (
                  <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                    <span className="text-emerald-400/60 mt-0.5">•</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {perspective.key_concerns?.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-400/60 mb-1">Concerns</div>
              <ul className="space-y-0.5">
                {perspective.key_concerns.map((c, i) => (
                  <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                    <span className="text-amber-400/60 mt-0.5">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {perspective?.conditions && (
            <div className="text-xs text-white/40 italic mt-2">
              <span className="text-white/30">Conditions: </span>{perspective.conditions}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}