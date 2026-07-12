import React from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function ExecutiveInsights({ insights }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={14} className="text-amber-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Executive Insights™</h2>
      </div>
      {(!insights || insights.length === 0) ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-center">
          <p className="text-white/30 text-sm">No new insights today.</p>
          <p className="text-white/20 text-xs mt-1">Complete more activities to unlock behavioral patterns.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {insights.map((insight, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2.5 bg-gradient-to-br from-amber-500/5 to-orange-500/[0.02] border border-amber-500/10 rounded-lg px-4 py-3">
              <span className="text-amber-400 text-xs mt-0.5">→</span>
              <p className="text-white/60 text-sm leading-relaxed">{insight}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}