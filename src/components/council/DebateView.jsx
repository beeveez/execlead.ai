import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Check, AlertCircle, MinusCircle, HelpCircle } from "lucide-react";
import { DEBATE_TYPE_STYLES } from "@/lib/councilData";

const TYPE_ICONS = {
  agree: <Check size={12} />,
  disagree: <MinusCircle size={12} />,
  concern: <AlertCircle size={12} />,
  question: <HelpCircle size={12} />,
};

export default function DebateView({ debate }) {
  if (!debate) return null;

  return (
    <div className="space-y-4">
      {/* Key debates */}
      {debate.key_debates?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-2">Key Debates</h3>
          <ul className="space-y-1.5">
            {debate.key_debates.map((d, i) => (
              <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                <MessageCircle size={12} className="text-indigo-400/60 mt-0.5 shrink-0" /> {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Debate exchanges */}
      {debate.exchanges?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Board Debate</h3>
          <div className="space-y-3">
            {debate.exchanges.map((ex, i) => {
              const style = DEBATE_TYPE_STYLES[ex.type] || DEBATE_TYPE_STYLES.concern;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 ${style.bg} ${style.color}`}>
                    {TYPE_ICONS[ex.type]} {style.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/40 mb-0.5">
                      <span className="text-white/70 font-medium">{ex.from}</span>
                      {ex.to && ex.to !== ex.from && <> → <span className="text-white/70 font-medium">{ex.to}</span></>}
                    </div>
                    <p className="text-sm text-white/60">{ex.content}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Consensus & Divergence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {debate.consensus_areas?.length > 0 && (
          <div className="bg-emerald-500/[0.05] border border-emerald-500/15 rounded-xl p-4">
            <h3 className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">Areas of Consensus</h3>
            <ul className="space-y-1">
              {debate.consensus_areas.map((c, i) => (
                <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                  <Check size={10} className="text-emerald-400 mt-0.5 shrink-0" /> {c}
                </li>
              ))}
            </ul>
          </div>
        )}
        {debate.divergence_areas?.length > 0 && (
          <div className="bg-amber-500/[0.05] border border-amber-500/15 rounded-xl p-4">
            <h3 className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">Areas of Divergence</h3>
            <ul className="space-y-1">
              {debate.divergence_areas.map((d, i) => (
                <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                  <AlertCircle size={10} className="text-amber-400 mt-0.5 shrink-0" /> {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}