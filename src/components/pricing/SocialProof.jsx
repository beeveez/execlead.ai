import React from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Target } from "lucide-react";

const TARGET_INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Government", "Consulting",
  "Banking", "Telecommunications", "Energy", "Education", "Manufacturing",
  "Retail", "Media",
];

export default function SocialProof() {
  return (
    <div className="space-y-12">
      {/* Target Industries — Product Vision */}
      <div>
        <p className="text-center text-white/30 text-xs uppercase tracking-widest mb-2">Target Industries</p>
        <p className="text-center text-white/20 text-xs mb-6">Product Vision — industries EXECLEAD.AI is being built to serve</p>
        <div className="flex flex-wrap justify-center gap-3">
          {TARGET_INDUSTRIES.map((industry, i) => (
            <motion.span
              key={industry}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-sm text-white/40 font-medium"
            >
              {industry}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Founding Beta Member Spotlight — Coming Soon */}
      <div className="bg-gradient-to-br from-indigo-500/[0.06] to-transparent border border-indigo-500/15 rounded-2xl p-8 text-center">
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

      {/* Future Analyst Engagement */}
      <div className="bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent border border-white/5 rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Target size={18} className="text-amber-400" />
          <span className="text-white/40 text-xs uppercase tracking-widest">Future Analyst Engagement</span>
        </div>
        <p className="text-white/50 text-sm max-w-xl mx-auto">
          EXECLEAD.AI plans to engage with leading industry analysts as the platform matures toward General Availability.
          Analyst recognition will be displayed here once formally received.
        </p>
        <p className="text-white/20 text-xs mt-3">Future Roadmap — No analyst endorsements have been received or verified</p>
      </div>
    </div>
  );
}