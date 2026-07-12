import React from "react";
import { Link } from "react-router-dom";
import { usePlatformState } from "@/lib/PlatformStateContext";
import { useGovernancePipeline } from "@/lib/GovernancePipelineContext";
import { useGuardian } from "@/lib/GuardianContext";
import { computeStabilityScore, PENDING_METRICS, STABILITY_TARGETS } from "@/lib/platformStabilityEngine";
import StabilityScoreHero from "@/components/developer/stability/StabilityScoreHero";
import StabilityCategories from "@/components/developer/stability/StabilityCategories";
import FindingsTable from "@/components/developer/stability/FindingsTable";
import { Activity, Server, Database, HardDrive, CheckCircle2, Clock, AlertCircle } from "lucide-react";

function InfrastructureCard({ label, value, icon: Icon }) {
  const color = value >= 95 ? "#10b981" : value >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={13} style={{ color }} />
          <span className="text-xs text-white/60">{label}</span>
        </div>
        <span className="text-lg font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function PlatformStabilityDashboard() {
  const platformState = usePlatformState();
  const { certificate } = useGovernancePipeline();
  const guardian = useGuardian();

  const stability = computeStabilityScore({ platformState, guardian, certificate });
  const findings = platformState.findings || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Activity size={12} className="text-emerald-400" />
          Platform Stability™
        </div>
        <h1 className="text-2xl font-bold text-white">Platform Stability Dashboard™</h1>
        <p className="text-white/40 text-sm mt-1">
          Real-time stability telemetry aggregated from Guardian™, Platform Manifest™, Governance Pipeline™, and infrastructure health checks.
        </p>
      </div>

      {/* Score Hero */}
      <StabilityScoreHero
        score={stability.overall}
        tier={stability.tier}
        tierColor={stability.tierColor}
        metrics={stability.metrics}
      />

      {/* Category Breakdown */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">Stability Dimensions</h2>
        <StabilityCategories categories={stability.categories} />
      </div>

      {/* Infrastructure Health */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">Infrastructure Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <InfrastructureCard label="API Health" value={platformState.apiHealth || 100} icon={Server} />
          <InfrastructureCard label="Database Health" value={platformState.databaseHealth || 100} icon={Database} />
          <InfrastructureCard label="Cache Health" value={platformState.cacheHealth || 100} icon={HardDrive} />
          <InfrastructureCard label="Queue Health" value={platformState.queueHealth || 100} icon={Activity} />
        </div>
      </div>

      {/* Findings + Governance Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <FindingsTable findings={findings} />
        </div>
        <div className="space-y-4">
          {/* Governance Certificate Issues */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="text-sm font-bold text-white mb-3">Governance Issues</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">Failures</span>
                <span className="text-sm font-bold text-red-400">{certificate?.failures || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">Warnings</span>
                <span className="text-sm font-bold text-amber-400">{certificate?.warnings || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">Repair Actions</span>
                <span className="text-sm font-bold text-cyan-400">{certificate?.repairActions || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">Certified</span>
                <span className={`text-sm font-bold ${certificate?.certified ? "text-emerald-400" : "text-red-400"}`}>
                  {certificate?.certified ? "Yes" : "No"}
                </span>
              </div>
            </div>
            {certificate && (
              <Link to="/developer/governance" className="block mt-3 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
                View Governance Pipeline →
              </Link>
            )}
          </div>

          {/* Success Targets */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="text-sm font-bold text-white mb-3">Success Targets</div>
            <div className="space-y-2">
              {STABILITY_TARGETS.map((target) => {
                const current = target.current(stability.metrics);
                const isBoolean = typeof current === "boolean";
                const isMet = isBoolean ? current === false : current === 0;
                return (
                  <div key={target.metric} className="flex items-center justify-between">
                    <span className="text-[11px] text-white/50">{target.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isMet ? "text-emerald-400" : "text-red-400"}`}>
                        {isBoolean ? (current ? "Yes" : "No") : current}
                      </span>
                      {isMet ? <CheckCircle2 size={12} className="text-emerald-400" /> : <AlertCircle size={12} className="text-red-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Metrics — Honest Transparency */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">Monitoring Pending</h2>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <p className="text-[11px] text-white/40 leading-relaxed mb-3">
            These stability metrics are not yet tracked by live telemetry. We display them honestly as "Monitoring Pending"
            rather than fabricating values. Each requires a specific instrumentation integration.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PENDING_METRICS.map((metric) => (
              <div key={metric.id} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <Clock size={12} className="text-white/30 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-medium text-white/60">{metric.label}</div>
                  <p className="text-[9px] text-white/30 mt-0.5">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}