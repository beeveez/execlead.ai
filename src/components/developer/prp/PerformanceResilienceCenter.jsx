import React, { useState, useMemo } from "react";
import {
  Gauge, TrendingUp, AlertTriangle, Brain, Shield, Activity,
  DollarSign, Award, CheckCircle2, Info,
} from "lucide-react";
import { ENTERPRISE_RESILIENCE_SCORE, getErsLevel, PERFORMANCE_SUMMARY } from "@/lib/performanceResilienceEngine";
import { computeProductionReadinessCertification } from "@/lib/productionReadinessEngine";
import PerformanceDashboard from "./PerformanceDashboard";
import ScalabilityValidation from "./ScalabilityValidation";
import SubsystemBottlenecks from "./SubsystemBottlenecks";
import AIResilience from "./AIResilience";
import ResilienceEngineering from "./ResilienceEngineering";
import Observability from "./Observability";
import CostProjection from "./CostProjection";
import EnterpriseResilienceScore from "./EnterpriseResilienceScore";
import ProductionReadinessCertification from "./ProductionReadinessCertification";

const TABS = [
  { id: "performance", name: "Performance", icon: Gauge, Component: PerformanceDashboard },
  { id: "scalability", name: "Scalability", icon: TrendingUp, Component: ScalabilityValidation },
  { id: "bottlenecks", name: "Bottlenecks", icon: AlertTriangle, Component: SubsystemBottlenecks },
  { id: "ai-resilience", name: "AI Resilience", icon: Brain, Component: AIResilience },
  { id: "resilience", name: "Resilience", icon: Shield, Component: ResilienceEngineering },
  { id: "observability", name: "Observability", icon: Activity, Component: Observability },
  { id: "cost", name: "Cost", icon: DollarSign, Component: CostProjection },
  { id: "ers", name: "ERS™", icon: Award, Component: EnterpriseResilienceScore },
  { id: "certification", name: "Certification", icon: CheckCircle2, Component: ProductionReadinessCertification },
];

export default function PerformanceResilienceCenter() {
  const [activeTab, setActiveTab] = useState("performance");
  const ersMaturity = getErsLevel(ENTERPRISE_RESILIENCE_SCORE);
  const cert = useMemo(() => computeProductionReadinessCertification(), []);
  const isGo = cert.recommendation === "GO";

  const active = TABS.find((t) => t.id === activeTab) || TABS[0];
  const ActiveComponent = active.Component;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-white/5 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* ERS Ring */}
          <div className="relative flex-shrink-0">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="55" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
              <circle
                cx="65" cy="65" r="55" fill="none" stroke={ersMaturity.color} strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 55 * (ENTERPRISE_RESILIENCE_SCORE / 100)} ${2 * Math.PI * 55}`}
                strokeLinecap="round" transform="rotate(-90 65 65)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{ENTERPRISE_RESILIENCE_SCORE}</span>
              <span className="text-[9px] text-white/30 uppercase tracking-wider flex items-center gap-1">
                ERS™
                {/* ERS™ definition — existing meaning: weighted composite of the 10 resilience dimensions, mapped to the existing maturity levels */}
                <span className="group/ers relative inline-flex cursor-help">
                  <Info size={9} className="text-white/30" />
                  <span className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-2 w-60 -translate-x-1/2 rounded-lg border border-white/10 bg-[#0d0d14] p-2.5 text-[9px] font-normal normal-case tracking-normal leading-relaxed text-white/60 opacity-0 shadow-xl transition-opacity group-hover/ers:opacity-100">
                    Enterprise Resilience Score™ — weighted composite of the 10 resilience dimensions (each dimension carries a fixed weight), expressed as a 0–100 score and mapped to the maturity levels L0 Fragile → L5 Mission-Critical.
                  </span>
                </span>
              </span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-lg font-bold text-white mb-1">Performance & Resilience Gate™</h2>
            <p className="text-sm text-white/50 mb-2">
              {ersMaturity.short} — Resilience Validation · Pre-Launch Engineering Gate
            </p>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className={`text-[10px] px-2 py-1 rounded border font-bold ${isGo ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                Production: {cert.recommendation}
              </span>
              {!isGo && cert.conditionalGo && (
                <span className="text-[10px] px-2 py-1 rounded border bg-amber-500/10 border-amber-500/20 text-amber-400">
                  Conditional
                </span>
              )}
              <span className="text-[10px] text-white/30">v1.0 · P0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Launch Gate — count derived from the existing workflow status data (no new scoring) */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Activity size={14} className={isGo ? "text-emerald-400" : "text-red-400"} />
          <span className="text-xs font-medium text-white/70">Production Launch Gate</span>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded border font-bold ${isGo ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {cert.recommendation}
        </span>
        <span className="text-xs text-white/50">
          {PERFORMANCE_SUMMARY.degradeCount > 0
            ? `${PERFORMANCE_SUMMARY.degradeCount} workflows require remediation`
            : "No workflows require remediation"}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                  : "border-white/5 text-white/50 hover:bg-white/[0.03] hover:text-white/80"
              }`}
            >
              <Icon size={13} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="animate-fade-in">
        <ActiveComponent />
      </div>
    </div>
  );
}