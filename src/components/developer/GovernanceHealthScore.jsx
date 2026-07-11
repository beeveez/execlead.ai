import React from "react";

const STATUS_COLORS = {
  pass: { text: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10", ring: "#10b981" },
  warn: { text: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10", ring: "#f59e0b" },
  fail: { text: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/10", ring: "#ef4444" },
};

function getStatus(score) {
  if (score >= 90) return "pass";
  if (score >= 70) return "warn";
  return "fail";
}

export default function GovernanceHealthScore({ label, score, onClick, icon: Icon }) {
  const status = getStatus(score);
  const colors = STATUS_COLORS[status];

  return (
    <button
      onClick={onClick}
      className={`relative text-left p-4 rounded-xl border ${colors.bg} ${colors.border} hover:scale-[1.02] transition-transform w-full`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={12} className={colors.text} />}
          <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle
              cx="24" cy="24" r="20" fill="none" stroke={colors.ring} strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 20 * (score / 100)} ${2 * Math.PI * 20}`}
              strokeLinecap="round" transform="rotate(-90 24 24)"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{score}</span>
        </div>
        <span className={`text-sm font-bold ${colors.text}`}>{status === "pass" ? "Healthy" : status === "warn" ? "Warning" : "Critical"}</span>
      </div>
    </button>
  );
}