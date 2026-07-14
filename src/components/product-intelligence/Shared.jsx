import React from "react";

export function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-400 rounded-full animate-spin" />
    </div>
  );
}

export function Empty({ text = "No data available." }) {
  return <p className="text-white/30 text-sm py-4">{text}</p>;
}

export function Panel({ title, children, action }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/70">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sublabel, color = "indigo" }) {
  const colorMap = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    red: "text-red-400 bg-red-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.indigo}`}>
            <Icon size={18} />
          </div>
        )}
        <span className="text-white/40 text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sublabel && <div className="text-white/30 text-xs mt-1">{sublabel}</div>}
    </div>
  );
}

export function BarRow({ label, value, max, color = "bg-indigo-500/60" }) {
  const pctVal = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-white/50 text-xs w-40 truncate">{label}</span>
      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pctVal}%` }} />
      </div>
      <span className="text-white/60 text-xs font-mono w-10 text-right">{value}</span>
    </div>
  );
}

export function HealthBadge({ score }) {
  const v = score || 0;
  const label = v >= 90 ? "Champion" : v >= 70 ? "Healthy" : v >= 40 ? "At Risk" : "Inactive";
  const color = v >= 90 ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : v >= 70 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : v >= 40 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-400 border-red-500/20";
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color}`}>{label}</span>
  );
}

export function PriorityBadge({ priority }) {
  const color = priority === "high" ? "bg-red-500/10 text-red-400" : priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/40";
  return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${color} uppercase`}>{priority}</span>;
}

export function ScoreRing({ score, max = 100, label, color = "#6366f1" }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const pctVal = max > 0 ? score / max : 0;
  const offset = circumference * (1 - pctVal);
  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="80" className="transform -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="text-lg font-bold text-white -mt-[52px] text-center w-[80px]">{score}</div>
      {label && <div className="text-white/40 text-[10px] mt-4 text-center">{label}</div>}
    </div>
  );
}