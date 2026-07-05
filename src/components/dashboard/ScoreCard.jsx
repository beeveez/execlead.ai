import React from "react";

export default function ScoreCard({ label, value, icon: Icon, color = "indigo" }) {
  const colorMap = {
    indigo: "from-indigo-500/10 to-indigo-500/5 text-indigo-400 border-indigo-500/10",
    purple: "from-purple-500/10 to-purple-500/5 text-purple-400 border-purple-500/10",
    cyan: "from-cyan-500/10 to-cyan-500/5 text-cyan-400 border-cyan-500/10",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/10",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/10",
    pink: "from-pink-500/10 to-pink-500/5 text-pink-400 border-pink-500/10",
  };

  const classes = colorMap[color] || colorMap.indigo;

  return (
    <div className={`bg-gradient-to-br ${classes} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={16} className="opacity-40" />}
      </div>
      <div className="text-2xl font-bold">{value}<span className="text-sm font-normal opacity-50">/100</span></div>
      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-current transition-all duration-700" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}