import React from "react";
import { Activity, AlertTriangle, TrendingUp, Zap, Database, Gauge, Shield } from "lucide-react";
import {
  PLATFORM_HEALTH_METRICS,
  AI_CREDIT_THRESHOLDS,
  RATE_LIMIT,
  EXECUTIVE_ALERTS,
  SUCCESS_CRITERIA,
  STRATEGY_META,
} from "@/lib/scalabilityStrategy";

const CATEGORY_ICONS = {
  AI: Zap,
  API: Activity,
  Database: Database,
  Cache: TrendingUp,
  Automation: Gauge,
  Realtime: Activity,
  System: Shield,
};

const CATEGORY_COLORS = {
  AI: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  API: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Database: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Cache: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Automation: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  Realtime: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  System: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

/**
 * Platform Health Center™ — the operational dashboard from the
 * Scalability & Performance Strategy (Section 7).
 * Displays live platform metrics, alert thresholds, and success criteria.
 */
export default function PlatformHealthCenter() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-emerald-400" />
        <h3 className="text-sm font-bold text-white">Platform Health Center™</h3>
        <span className="text-[10px] text-white/30 ml-auto">Strategy v{STRATEGY_META.version} · {STRATEGY_META.status}</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-5">
        {PLATFORM_HEALTH_METRICS.map((m) => {
          const Icon = CATEGORY_ICONS[m.category] || Activity;
          const colorClass = CATEGORY_COLORS[m.category] || CATEGORY_COLORS.System;
          return (
            <div key={m.id} className={`rounded-lg border p-3 ${colorClass}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} />
                <span className="text-[10px] font-medium opacity-80">{m.category}</span>
              </div>
              <div className="text-xs font-bold text-white leading-tight">{m.label}</div>
              <div className="text-[10px] text-white/40 mt-0.5">Unit: {m.unit}</div>
            </div>
          );
        })}
      </div>

      {/* Rate Limit & AI Credit Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {/* Rate Limit Protection */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Gauge size={12} className="text-blue-400" />
            <span className="text-xs font-bold text-white">Rate Limit Protection™</span>
          </div>
          <div className="text-[10px] text-white/40 mb-2">
            App-level ceiling: <span className="text-white/60 font-mono">{RATE_LIMIT.appLevelCeiling} {RATE_LIMIT.unit}</span>
          </div>
          <div className="space-y-1">
            {RATE_LIMIT.thresholds.map((t) => (
              <div key={t.level} className="flex items-center justify-between text-[11px]">
                <span className="text-white/60">{t.level} at {t.at}/{RATE_LIMIT.appLevelCeiling}</span>
                <span className="text-white/40">{t.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Credit Monitor */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} className="text-violet-400" />
            <span className="text-xs font-bold text-white">AI Credit Monitor™</span>
          </div>
          <div className="space-y-1">
            {AI_CREDIT_THRESHOLDS.map((t) => (
              <div key={t.level} className="flex items-center justify-between text-[11px]">
                <span className="text-white/60">{t.level} ≥ {t.threshold}%</span>
                <span className="text-white/40">{t.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Alerts */}
      <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.02] p-3 mb-5">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle size={12} className="text-amber-400" />
          <span className="text-xs font-bold text-white">Executive Alerting™ — Auto-notify Founder</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {EXECUTIVE_ALERTS.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-white/50">
              <span className={`w-1.5 h-1.5 rounded-full ${a.severity === "Critical" ? "bg-red-400" : a.severity === "High" ? "bg-amber-400" : "bg-yellow-400"}`} />
              {a.condition}
            </div>
          ))}
        </div>
      </div>

      {/* Success Criteria */}
      <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.02] p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Shield size={12} className="text-emerald-400" />
          <span className="text-xs font-bold text-white">Success Criteria</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {SUCCESS_CRITERIA.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-white/50">
              <span className="text-emerald-400/70">✓</span>
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}