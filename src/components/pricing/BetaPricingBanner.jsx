import React from "react";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

export default function BetaPricingBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.03] to-transparent p-5 md:p-6 mb-12"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Rocket size={18} className="text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-amber-400 font-bold text-sm mb-2">🚀 Founding Private Beta™</h3>
          <div className="space-y-1.5">
            <p className="text-white/60 text-sm leading-relaxed">
              Beta participants are not charged during the current beta program.
            </p>
            <p className="text-white/50 text-xs leading-relaxed">
              Commercial subscriptions will only become available after General Availability. All pricing displayed is illustrative and subject to change.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}