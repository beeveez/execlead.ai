import React from "react";

const TREND_ICONS = {
  up: "↑",
  down: "↓",
  stable: "→",
};

export default function DashboardKPI({ icon: Icon, label, value, sub, trend, color = "indigo" }) {
  const colorMap = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    teal: "text-teal-400 bg-teal-500/10",
    violet: "text-violet-400 bg-violet-500/10",
    red: "text-red-400 bg-red-500/10",
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={14} />
        </div>
        <span className="text-white/40 text-xs uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-white text-2xl font-bold">{value}</span>
        {sub && <span className="text-white/30 text-xs">{sub}</span>}
        {trend && (
          <span className={`text-xs ml-auto ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-white/30"}`}>
            {TREND_ICONS[trend] || trend}
          </span>
        )}
      </div>
    </div>
  );
}