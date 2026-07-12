import React from "react";
import { Cpu, Calendar, Hash, GitBranch, Database, Settings, Server, FileText, ShieldCheck } from "lucide-react";
import { PLATFORM_METADATA } from "@/lib/platformManifest";
import { CLASSIFICATION_LEVELS } from "@/lib/trustCenterExtendedData";

const META_ITEMS = [
  { label: "Platform Version", value: PLATFORM_METADATA.platformVersion, icon: GitBranch },
  { label: "Build Number", value: PLATFORM_METADATA.buildNumber, icon: Hash },
  { label: "Manifest Version", value: PLATFORM_METADATA.manifestVersion, icon: Database },
  { label: "Knowledge Pack Version", value: PLATFORM_METADATA.knowledgeVersion, icon: Cpu },
  { label: "Framework Version", value: PLATFORM_METADATA.frameworkVersion, icon: FileText },
  { label: "Configuration Version", value: PLATFORM_METADATA.configVersion, icon: Settings },
  { label: "Environment", value: PLATFORM_METADATA.environment, icon: Server },
  { label: "Release Version", value: PLATFORM_METADATA.releaseVersion, icon: GitBranch },
];

export default function PlatformInformationCard() {
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Cpu size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Platform Information™</h3>
            <p className="text-[10px] text-white/30">Version-controlled platform metadata</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck size={11} className="text-emerald-400" />
            <span className="text-[10px] font-medium text-emerald-400">Public</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {META_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} className="text-white/30" />
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">{item.label}</span>
                </div>
                <span className="text-xs font-mono font-medium text-white/80 break-all">{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Document Classification Levels</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(CLASSIFICATION_LEVELS).map(([level, cfg]) => (
            <div key={level} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-white/70">{level}</div>
                <div className="text-[9px] text-white/30 truncate">{cfg.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-white/30">
        <Calendar size={11} />
        Generated: {new Date().toLocaleString()} by EXEC™ — Enterprise Trust Center™ v2.0
      </div>
    </div>
  );
}