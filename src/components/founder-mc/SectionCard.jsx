import React from "react";

export default function SectionCard({ title, subtitle, icon: Icon, accent = "indigo", children, action }) {
  const accents = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    violet: "text-violet-400 bg-violet-500/10",
    rose: "text-rose-400 bg-rose-500/10",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accents[accent] || accents.indigo}`}>
              <Icon size={16} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-[11px] text-white/40">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}