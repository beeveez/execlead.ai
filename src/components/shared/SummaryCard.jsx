import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ACCENT_MAP = {
  indigo: "text-indigo-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
  violet: "text-violet-400",
  cyan: "text-cyan-400",
};

export default function SummaryCard({ title, message, path, icon: Icon, accent = "indigo" }) {
  const accentColor = ACCENT_MAP[accent] || ACCENT_MAP.indigo;

  return (
    <Link
      to={path}
      className="block group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className={accentColor} />}
          <h3 className="text-xs font-medium text-white/60">{title}</h3>
        </div>
        <ArrowRight size={12} className="text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-sm text-white/80 mt-2">{message}</p>
    </Link>
  );
}