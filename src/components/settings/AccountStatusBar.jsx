import React from "react";
import { Link } from "react-router-dom";
import { Check, X, AlertTriangle, ChevronRight } from "lucide-react";

function StatusItem({ item }) {
  const { label, value, status } = item;
  const isOk = status === "ok";
  const isWarn = status === "warn";
  const color = isOk ? "text-emerald-400" : isWarn ? "text-amber-400" : status === "error" ? "text-red-400" : "text-white/60";
  const Icon = isOk ? Check : isWarn ? AlertTriangle : status === "error" ? X : null;

  const inner = (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group h-full">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">{label}</div>
        <div className={`flex items-center gap-1.5 text-sm font-medium ${color}`}>
          {Icon && <Icon size={12} className="shrink-0" />}
          <span className="truncate">{value}</span>
        </div>
      </div>
      <ChevronRight size={14} className="text-white/10 group-hover:text-white/30 transition-colors shrink-0" />
    </div>
  );

  if (item.to) return <Link to={item.to}>{inner}</Link>;
  if (item.onClick) return <button onClick={item.onClick} className="w-full text-left">{inner}</button>;
  return inner;
}

export default function AccountStatusBar({ items }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Account Status</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {items.map(item => (
          <StatusItem key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}