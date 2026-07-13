import React from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageSquare } from "lucide-react";

export default function BetaSpotlight() {
  return (
    <div className="bg-gradient-to-br from-indigo-500/[0.06] to-transparent border border-indigo-500/15 rounded-2xl p-8 md:p-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={20} className="text-indigo-400" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Founding Beta Member Spotlight™</h3>
        <p className="text-white/40 text-sm leading-relaxed max-w-md mx-auto mb-4">
          As our founding members activate and begin their leadership journeys, their stories will be featured here.
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40">
          <MessageSquare size={12} />
          Coming Soon — Real Member Stories
        </div>
      </motion.div>
    </div>
  );
}