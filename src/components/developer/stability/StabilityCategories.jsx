import React from "react";
import { AlertOctagon, ShieldCheck, Boxes, Server, FileCheck, Route } from "lucide-react";

const ICONS = { AlertOctagon, ShieldCheck, Boxes, Server, FileCheck, Route };

function scoreColor(score) {
  if (score >= 90) return "#10b981";
  if (score >= 70) return "#06b6d4";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function StabilityCategories({ categories }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map((cat) => {
        const Icon = ICONS[cat.icon] || AlertOctagon;
        const color = scoreColor(cat.score);
        return (
          <div key={cat.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color }} />
                <span className="text-xs font-medium text-white/70">{cat.label}</span>
              </div>
              <span className="text-lg font-bold" style={{ color }}>{cat.score}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${cat.score}%`, backgroundColor: color }}
              />
            </div>
            <div className="text-[9px] text-white/30 mt-1.5">Weight: {cat.weight}%</div>
          </div>
        );
      })}
    </div>
  );
}