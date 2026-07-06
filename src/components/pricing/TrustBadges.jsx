import React from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, EyeOff, FileCheck, ScrollText, KeyRound, Headset } from "lucide-react";
import { TRUST_BADGES } from "@/lib/pricingContent";

const ICONS = { Lock, ShieldCheck, EyeOff, FileCheck, ScrollText, KeyRound, Headset };

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {TRUST_BADGES.map((badge, i) => {
        const Icon = ICONS[badge.icon];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-3 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5 transition-all">
              <Icon size={18} className="text-white/40 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-white/60 text-xs font-semibold mb-1">{badge.title}</h3>
            <p className="text-white/25 text-[10px] leading-tight">{badge.desc}</p>
          </motion.div>
        );
      })}
    </div>
  );
}