import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { FEATURE_GROUPS } from "@/lib/pricingContent";

const TIER_CONFIG = [
  { id: "professional", label: "Professional", price: "$29/mo", accent: "indigo", note: "Everything in Free, plus:" },
  { id: "executive", label: "Executive", price: "$79/mo", accent: "purple", note: "Everything in Professional, plus:" },
  { id: "enterprise", label: "Enterprise", price: "Custom", accent: "emerald", note: "Everything in Executive, plus:" },
];

const ACCENT_MAP = {
  indigo: { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", dot: "bg-indigo-500" },
  purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", dot: "bg-purple-500" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-500" },
};

function TierColumn({ config, isMobile }) {
  const groups = FEATURE_GROUPS[config.id];
  const accent = ACCENT_MAP[config.accent];

  const content = (
    <div className="space-y-5">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${accent.bg} ${accent.border} border`}>
        <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
        <span className={`text-xs font-semibold ${accent.text}`}>{config.label}</span>
        <span className="text-white/20 text-xs">·</span>
        <span className="text-white/40 text-xs">{config.price}</span>
      </div>
      <p className="text-white/30 text-xs">{config.note}</p>
      {groups.map((group, i) => (
        <div key={i}>
          <h4 className={`text-xs font-semibold uppercase tracking-wider ${accent.text} mb-2`}>{group.category}</h4>
          <ul className="space-y-1.5">
            {group.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-xs text-white/50">
                <Check size={12} className={`${accent.text} mt-0.5 flex-shrink-0`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        {content}
      </div>
    );
  }

  return (
    <div className={`bg-white/[0.02] border border-white/5 rounded-2xl p-6 ${config.id === "executive" ? `ring-1 ${accent.border}` : ""}`}>
      {content}
    </div>
  );
}

export default function FeatureShowcase() {
  const [activeTier, setActiveTier] = useState(0);

  return (
    <div>
      {/* Desktop: 3 columns */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-5">
        {TIER_CONFIG.map((config) => (
          <TierColumn key={config.id} config={config} />
        ))}
      </div>

      {/* Mobile: tabs */}
      <div className="lg:hidden">
        <div className="flex gap-2 mb-5">
          {TIER_CONFIG.map((config, i) => {
            const accent = ACCENT_MAP[config.accent];
            return (
              <button
                key={config.id}
                onClick={() => setActiveTier(i)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTier === i ? `${accent.bg} ${accent.text} ${accent.border} border` : "bg-white/5 text-white/40"
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTier}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <TierColumn config={TIER_CONFIG[activeTier]} isMobile />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}