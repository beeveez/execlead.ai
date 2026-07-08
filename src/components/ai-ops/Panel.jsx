import React from "react";

export const CHART_TOOLTIP = { background: "#0d0d14", border: "1px solid #ffffff20", borderRadius: 8, fontSize: 12 };

export default function Panel({ title, icon: Icon, action, children, className = "" }) {
  return (
    <div className={`bg-white/[0.03] border border-white/5 rounded-xl p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 gap-2">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-1.5">
            {Icon && <Icon size={13} className="text-indigo-400" />} {title}
          </h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40">{label}</span>
      <span className={`text-sm font-semibold ${accent || "text-white"}`}>{value}</span>
    </div>
  );
}