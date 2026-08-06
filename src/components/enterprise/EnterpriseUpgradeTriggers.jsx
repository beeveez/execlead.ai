import React from "react";
import { AlertTriangle, TrendingUp, ArrowUpRight } from "lucide-react";
import { evaluateUpgradeTriggers } from "@/lib/enterpriseUpgradeTriggers";

export default function EnterpriseUpgradeTriggers({ utilization }) {
  const triggers = evaluateUpgradeTriggers(utilization || {});
  if (!triggers.length) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
          <TrendingUp size={15} /> Healthy utilization
        </div>
        <p className="text-white/50 text-xs">
          Your organization is well within its allocations. No upgrade actions needed right now.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {triggers.map((t) => (
        <div
          key={t.id}
          className={`rounded-2xl border p-5 ${
            t.severity === "high" ? "border-accent-orange/30 bg-accent-orange/[0.05]" : "border-amber-500/25 bg-amber-500/[0.04]"
          }`}
        >
          <div className="flex items-start gap-2 mb-1.5">
            <AlertTriangle size={15} className={t.severity === "high" ? "text-accent-orange" : "text-amber-400"} />
            <h4 className="text-white text-sm font-semibold">{t.title}</h4>
          </div>
          <p className="text-white/55 text-xs mb-3">{t.message}</p>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-orange">
            <ArrowUpRight size={13} /> {t.cta}
          </div>
        </div>
      ))}
    </div>
  );
}