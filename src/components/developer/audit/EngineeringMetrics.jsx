import React from "react";
import { computeEngineeringMetrics } from "@/lib/platformSelfHealingEngine";
import {
  Wrench, CheckCircle2, Clock, AlertTriangle, RotateCcw,
  TrendingDown, Timer, Sparkles, Gauge, ShieldCheck,
} from "lucide-react";

export default function EngineeringMetrics({ result }) {
  const m = computeEngineeringMetrics(result);
  const cards = [
    { label: "Total Findings", value: m.totalFindings, icon: AlertTriangle, color: "#f59e0b" },
    { label: "Auto-Repairable", value: m.autoRepairable, icon: Wrench, color: "#10b981" },
    { label: "Repaired Today", value: m.repairedToday, icon: CheckCircle2, color: "#10b981" },
    { label: "Pending Review", value: m.pendingReview, icon: Clock, color: "#eab308" },
    { label: "Verification", value: `${m.verificationSuccessRate}%`, icon: ShieldCheck, color: "#6366f1" },
    { label: "Rollbacks", value: m.rollbackCount, icon: RotateCcw, color: "#ef4444" },
    { label: "Recurring", value: m.recurringCount, icon: TrendingDown, color: "#f59e0b" },
    { label: "Tech Debt", value: `${m.technicalDebtHours}h`, icon: Timer, color: "#a855f7" },
    { label: "Hours Saved", value: `${m.engineeringHoursSaved}h`, icon: Sparkles, color: "#10b981" },
    { label: "Exp. Score", value: m.experienceScore, icon: Gauge, color: "#6366f1" },
  ];
  return (
    <div>
      <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Engineering Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/40 text-[11px]">{c.label}</span>
                <Icon size={12} style={{ color: c.color }} className="opacity-60" />
              </div>
              <div className="text-xl font-bold" style={{ color: c.color }}>{c.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}