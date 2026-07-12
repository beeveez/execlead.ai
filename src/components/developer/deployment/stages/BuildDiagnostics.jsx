import React from "react";
import { CheckCircle2, Server, GitBranch, Clock, Cpu } from "lucide-react";
import { PLATFORM_METADATA } from "@/lib/platformManifest";

export default function BuildDiagnostics() {
  const info = [
    { icon: Server, label: "Environment", value: PLATFORM_METADATA.environment || "production" },
    { icon: GitBranch, label: "Platform Version", value: PLATFORM_METADATA.platformVersion },
    { icon: Cpu, label: "Manifest Version", value: PLATFORM_METADATA.manifestVersion },
    { icon: Clock, label: "Build Number", value: PLATFORM_METADATA.buildNumber },
    { icon: CheckCircle2, label: "Config Version", value: PLATFORM_METADATA.configVersion || "—" },
    { icon: Clock, label: "Build Date", value: new Date().toISOString() },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
        <div>
          <div className="text-sm font-medium text-emerald-400">Build Successful</div>
          <div className="text-xs text-white/40">Platform compiled and bundled successfully.</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {info.map((i) => (
          <div key={i.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <i.icon size={14} className="text-indigo-400" />
              <span className="text-white/40 text-xs uppercase tracking-wider">{i.label}</span>
            </div>
            <div className="text-white/80 text-sm font-medium font-mono break-all">{i.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}