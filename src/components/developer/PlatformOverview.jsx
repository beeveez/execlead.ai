import React, { useMemo } from "react";
import {
  PLATFORM_METADATA,
  validateManifest,
  getManifestCoverage,
} from "@/lib/platformManifest";
import {
  Cpu, Boxes, Zap, Layers, ShieldCheck, Calendar, Globe,
  CheckCircle2, AlertTriangle, XCircle, Code2, Brain,
} from "lucide-react";

export default function PlatformOverview() {
  const warnings = useMemo(() => validateManifest(), []);
  const coverage = useMemo(() => getManifestCoverage(), []);

  const errors = warnings.filter((w) => w.level === "error");
  const warns = warnings.filter((w) => w.level === "warning");
  const infos = warnings.filter((w) => w.level === "info");

  const status = errors.length > 0 ? "critical" : warns.length > 0 ? "warning" : "healthy";

  const statusConfig = {
    healthy: { label: "Healthy", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
    warning: { label: "Warning", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10" },
    critical: { label: "Critical", icon: XCircle, color: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/10" },
  };
  const cfg = statusConfig[status];

  const metaItems = [
    { label: "Platform Name", value: PLATFORM_METADATA.platformName, icon: Globe },
    { label: "Platform Version", value: `v${PLATFORM_METADATA.platformVersion}`, icon: Cpu },
    { label: "Manifest Version", value: `v${PLATFORM_METADATA.manifestVersion}`, icon: Boxes },
    { label: "Knowledge Version", value: `v${PLATFORM_METADATA.knowledgeVersion}`, icon: Brain },
    { label: "Prompt Version", value: `v${PLATFORM_METADATA.promptVersion}`, icon: Zap },
    { label: "Framework Version", value: `v${PLATFORM_METADATA.frameworkVersion}`, icon: Layers },
    { label: "Build Number", value: PLATFORM_METADATA.buildNumber, icon: Code2 },
    { label: "Release Date", value: PLATFORM_METADATA.releaseDate, icon: Calendar },
    { label: "Environment", value: PLATFORM_METADATA.environment, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
        <cfg.icon size={24} className={cfg.color} />
        <div className="flex-1">
          <div className="text-white font-semibold">Platform Status: {cfg.label}</div>
          <div className="text-white/40 text-xs">
            {errors.length} errors · {warns.length} warnings · {infos.length} info
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/60 text-xs">Route Coverage</div>
          <div className="text-white font-bold text-lg">{coverage.routeCoverage}%</div>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {metaItems.map((item, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <item.icon size={12} className="text-white/40" />
              <span className="text-white/30 text-[10px] uppercase tracking-wider">{item.label}</span>
            </div>
            <div className="text-sm text-white/80 font-medium truncate">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Philosophy */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
        <p className="text-white/40 text-sm italic">{PLATFORM_METADATA.philosophy}</p>
      </div>
    </div>
  );
}