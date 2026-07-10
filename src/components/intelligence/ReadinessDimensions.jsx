import React from "react";
import { motion } from "framer-motion";
import { ArrowUp, Minus, ArrowDown } from "lucide-react";

const TREND_META = {
  above_benchmark: { label: "Above Benchmark", icon: ArrowUp, color: "text-emerald-400", barColor: "bg-emerald-500" },
  approaching: { label: "Approaching", icon: ArrowUp, color: "text-amber-400", barColor: "bg-amber-500" },
  below_benchmark: { label: "Below Benchmark", icon: ArrowDown, color: "text-red-400", barColor: "bg-red-500/60" },
};

/**
 * ReadinessDimensions — 12 competency cards showing current score,
 * industry benchmark, improvement trend, and AI recommendation.
 */
export default function ReadinessDimensions({ dimensions = [] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-semibold text-sm">Readiness Dimensions</h3>
        <p className="text-white/30 text-xs">Each competency is assessed against industry benchmarks.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dimensions.map((dim, i) => {
          const trend = TREND_META[dim.trend] || TREND_META.below_benchmark;
          return (
            <motion.div
              key={dim.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{dim.icon}</span>
                  <span className="text-white/80 text-xs font-medium">{dim.label}</span>
                </div>
                <trend.icon size={12} className={trend.color} />
              </div>

              {/* Score vs benchmark bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white font-bold">{dim.current}</span>
                  <span className="text-white/30">Benchmark: {dim.benchmark}</span>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${trend.barColor} rounded-full transition-all duration-700`} style={{ width: `${dim.current}%` }} />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white/40" style={{ left: `${dim.benchmark}%` }} />
                </div>
              </div>

              <p className="text-white/40 text-[10px] leading-relaxed">{dim.recommendation}</p>
              {dim.gap > 0 && (
                <span className="inline-block mt-2 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-500/10 text-amber-400">
                  {dim.gap} pts to benchmark
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}