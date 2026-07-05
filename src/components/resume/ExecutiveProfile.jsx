import React from "react";
import { Target, TrendingUp, Crown, DollarSign, Zap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const SCORES = [
  { key: "executive_readiness_score", label: "Executive Readiness", icon: Target, color: "#6366f1" },
  { key: "promotion_readiness", label: "Promotion Readiness", icon: TrendingUp, color: "#10b981" },
  { key: "leadership_maturity", label: "Leadership Maturity", icon: Crown, color: "#a855f7" },
  { key: "commercial_maturity", label: "Commercial Maturity", icon: DollarSign, color: "#06b6d4" },
  { key: "executive_presence", label: "Executive Presence", icon: Zap, color: "#f59e0b" },
  { key: "communication_assessment", label: "Communication", icon: MessageSquare, color: "#ec4899" },
];

function CompetencyMap({ title, items, color }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-white/60">{item.skill}</span>
              <span className="text-sm font-medium" style={{ color }}>{item.level}/100</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${item.level}%` }} transition={{ delay: i * 0.05, duration: 0.5 }} className="h-full rounded-full" style={{ backgroundColor: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExecutiveProfile({ data }) {
  if (!data) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SCORES.map((s, i) => {
          const val = data[s.key] || 0;
          return (
            <motion.div key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <s.icon size={18} style={{ color: s.color }} />
              <div className="text-3xl font-bold text-white mt-2">{val}</div>
              <div className="text-white/30 text-xs">{s.label}</div>
              <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: s.color }} />
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CompetencyMap title="Technical Competency Map" items={data.technical_competency_map} color="#6366f1" />
        <CompetencyMap title="Leadership Competency Map" items={data.leadership_competency_map} color="#a855f7" />
      </div>
    </div>
  );
}