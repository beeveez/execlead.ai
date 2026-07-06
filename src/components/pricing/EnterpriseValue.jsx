import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, Layers, TrendingDown, BookOpen, TrendingUp, Gauge, Rocket, Shield } from "lucide-react";
import { ENTERPRISE_OUTCOMES } from "@/lib/pricingContent";

const ICONS = { GraduationCap, Users, Layers, TrendingDown, BookOpen, TrendingUp, Gauge, Rocket, Shield };

export default function EnterpriseValue() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ENTERPRISE_OUTCOMES.map((outcome, i) => {
        const Icon = ICONS[outcome.icon];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon size={20} className="text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white mb-2 text-sm">{outcome.title}</h3>
            <p className="text-white/40 text-xs leading-relaxed">{outcome.desc}</p>
          </motion.div>
        );
      })}
    </div>
  );
}