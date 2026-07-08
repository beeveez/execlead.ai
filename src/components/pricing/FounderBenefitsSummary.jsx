import React from "react";
import { motion } from "framer-motion";
import { Crown, Check, ShieldCheck } from "lucide-react";

const BENEFITS = [
  "25% Lifetime Discount",
  "Lifetime Price Protection",
  "Early Access to New Features",
  "Founder Badge",
  "Founder Community Access",
  "Beta Features",
  "Referral Rewards",
  "Roadmap Voting",
];

export default function FounderBenefitsSummary({ discount = 25 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-amber-500/[0.02] to-transparent p-6 md:p-8 mb-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Crown size={20} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base md:text-lg">🏆 Your Founding Member Benefits</h2>
            <p className="text-amber-400/50 text-xs">Exclusive lifetime entitlements — {discount}% off forever</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
          {BENEFITS.map((benefit, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Check size={13} className="text-amber-400 flex-shrink-0" />
              <span className="text-white/70 text-xs font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        <p className="text-white/40 text-xs leading-relaxed mb-4 max-w-2xl">
          These benefits permanently apply to your account and automatically reduce eligible subscription pricing.
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="text-emerald-400 text-xs font-semibold">✓ Founder Status Active</span>
        </div>
      </div>
    </motion.div>
  );
}