import React, { useMemo } from "react";
import { Target, TrendingUp, Database, Search, AlertCircle, Link2, Clock, Activity, Gauge, User, FileWarning, Boxes, ShieldCheck } from "lucide-react";
import { computeMetadataScorecard } from "@/lib/metadataIntelligenceEngine";

export default function MetadataScorecard({ report }) {
  const sc = useMemo(() => computeMetadataScorecard(report), [report]);

  const trendIcon = sc.trend.direction === "up" ? "↗" : sc.trend.direction === "down" ? "↘" : "→";
  const trendColor = sc.trend.direction === "up" ? "#10b981" : sc.trend.direction === "down" ? "#ef4444" : "#f59e0b";
  const confidenceColor = sc.confidence === "High" ? "#10b981" : sc.confidence === "Medium" ? "#f59e0b" : "#ef4444";

  const fields = [
    { label: "Current Coverage", value: `${sc.currentCoverage}%`, icon: Target, color: "#818cf8" },
    { label: "Target", value: `${sc.target}%`, icon: ShieldCheck, color: "#10b981" },
    { label: "Remaining", value: `${sc.remaining}%`, icon: TrendingUp, color: "#ef4444" },
    { label: "Registered Assets", value: sc.registeredAssets, icon: Boxes, color: "#818cf8" },
    { label: "Discovered Assets", value: sc.discoveredAssets, icon: Database, color: "#60a5fa" },
    { label: "Missing Metadata", value: sc.missingMetadata, icon: AlertCircle, color: "#f59e0b" },
    { label: "Missing Registries", value: sc.missingRegistries, icon: FileWarning, color: "#ef4444" },
    { label: "Missing Manifest Entries", value: sc.missingManifestEntries, icon: Database, color: "#ef4444" },
    { label: "Missing Relationships", value: sc.missingRelationships, icon: Link2, color: "#a78bfa" },
    { label: "Last Scan", value: sc.lastScan, icon: Clock, color: "#64748b" },
    { label: "Next Scan", value: sc.nextScan, icon: Clock, color: "#64748b" },
    { label: "Current Trend", value: `${trendIcon} ${sc.trend.label}`, icon: Activity, color: trendColor },
    { label: "Confidence", value: sc.confidence, icon: Gauge, color: confidenceColor },
    { label: "Engineering Owner", value: sc.engineeringOwner, icon: User, color: "#818cf8" },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Metadata Intelligence™ — Live Scorecard</h3>
        <span className="text-[10px] text-white/30 ml-auto">All values from live telemetry</span>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5 text-[10px]">
          <span className="text-indigo-400 font-medium">Current: {sc.currentCoverage}%</span>
          <span className="text-emerald-400 font-medium">Target: {sc.target}%</span>
        </div>
        <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div className="absolute h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${sc.currentCoverage}%` }} />
          <div className="absolute h-full w-0.5 bg-emerald-400" style={{ left: "99.5%" }} />
        </div>
        <div className="flex items-center justify-between mt-1 text-[9px] text-white/30">
          <span>0%</span>
          <span className="text-emerald-400/50">{sc.remaining}% to production</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {fields.map((f) => (
          <div key={f.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <f.icon size={10} style={{ color: f.color }} />
              <span className="text-[9px] text-white/40 uppercase tracking-wider truncate">{f.label}</span>
            </div>
            <div className="text-sm font-bold truncate" style={{ color: f.color }}>{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}