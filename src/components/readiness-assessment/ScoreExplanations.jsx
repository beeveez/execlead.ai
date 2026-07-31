import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

/**
 * Executive Score Explanations™ — every major metric fully explained.
 */
export default function ScoreExplanations({ explanations }) {
  if (!explanations?.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/[0.02] border border-white/8 p-5">
      <div className="flex items-center gap-2 mb-4"><Info size={15} className="text-indigo-400" /><div><div className="text-[10px] uppercase tracking-wider text-white/30">Confidence Explanations</div><h3 className="text-sm font-semibold text-white">Understanding Your Scores</h3></div></div>
      <div className="space-y-4">
        {explanations.map((e, i) => (
          <div key={i} className="rounded-xl bg-white/[0.02] border border-white/8 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-white">{e.metric}</span>
              <span className="text-sm font-bold text-accent-orange">{e.current}</span>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              {[['Meaning', e.meaning], ['Why it matters', e.whyItMatters], ['Evidence used', e.evidenceUsed], ['How to improve', e.howToImprove], ['Expected time', e.expectedTime], ['Related learning', e.relatedLearning], ['Related simulation', e.relatedSimulation], ['Related coach', e.relatedCoach]].map(([k, v]) => (
                <div key={k} className="flex flex-col"><dt className="text-white/30 text-[10px] uppercase tracking-wider">{k}</dt><dd className="text-white/65">{v}</dd></div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </motion.div>
  );
}