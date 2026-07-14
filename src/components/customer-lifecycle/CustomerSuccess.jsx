import React, { useState } from "react";
import { Heart, AlertTriangle, TrendingUp, MessageSquare, Brain, Zap, Shield } from "lucide-react";
import { SectionCard, StatCard, ScoreRing, StatusBadge, EmptyState, RISK_COLORS } from "./Shared";

const RISK_FILTERS = ["all", "critical", "high", "medium", "low", "healthy"];

export default function CustomerSuccess({ data, onSelectCustomer }) {
  const [riskFilter, setRiskFilter] = useState("all");
  const { customers } = data;

  const filtered = riskFilter === "all" ? customers : customers.filter((c) => c.health.riskLevel === riskFilter);
  const sorted = [...filtered].sort((a, b) => a.health.total - b.health.total);

  const critical = customers.filter((c) => c.health.riskLevel === "critical").length;
  const high = customers.filter((c) => c.health.riskLevel === "high").length;
  const healthy = customers.filter((c) => c.health.riskLevel === "healthy").length;
  const avgHealth = customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.health.total, 0) / customers.length) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Avg Health" value={`${avgHealth}/100`} icon={Heart} accent="emerald" />
        <StatCard label="Critical Risk" value={critical} icon={AlertTriangle} accent="rose" />
        <StatCard label="High Risk" value={high} icon={AlertTriangle} accent="amber" />
        <StatCard label="Healthy" value={healthy} icon={Heart} accent="emerald" />
      </div>

      <div className="flex gap-1 flex-wrap">
        {RISK_FILTERS.map((r) => (
          <button key={r} onClick={() => setRiskFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${riskFilter === r ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"}`}>
            {r}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {sorted.slice(0, 20).map((c, i) => (
          <div key={i} onClick={() => onSelectCustomer?.(c)}
            className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-white/10 flex items-center justify-center text-white text-xs font-bold">
                  {(c.fullName || c.email || "?")[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">{c.fullName || c.email}</p>
                  <p className="text-white/30 text-xs">{c.email}</p>
                </div>
              </div>
              <ScoreRing score={c.health.total} size={48} />
            </div>
            <div className="grid grid-cols-5 gap-1 text-xs">
              <div className="text-center">
                <p className="text-white/30 text-[10px]">Eng</p>
                <p className="text-white/60">{c.health.engagement}</p>
              </div>
              <div className="text-center">
                <p className="text-white/30 text-[10px]">Learn</p>
                <p className="text-white/60">{c.health.learning}</p>
              </div>
              <div className="text-center">
                <p className="text-white/30 text-[10px]">Lead</p>
                <p className="text-white/60">{c.health.leadership}</p>
              </div>
              <div className="text-center">
                <p className="text-white/30 text-[10px]">Support</p>
                <p className="text-white/60">{c.health.support}</p>
              </div>
              <div className="text-center">
                <p className="text-white/30 text-[10px]">AI</p>
                <p className="text-white/60">{c.health.aiUsage}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <StatusBadge status={c.health.riskLevel} color={c.health.riskLevel} />
              <span className="text-white/30 text-xs">{c.lifecycleStage.replace(/_/g, " ")}</span>
            </div>
          </div>
        ))}
      </div>

      {sorted.length === 0 && <EmptyState message="No customers match this risk level" />}
    </div>
  );
}