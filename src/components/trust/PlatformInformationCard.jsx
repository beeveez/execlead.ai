import React from "react";
import {
  ShieldCheck, Server, GitBranch, Activity, Cpu, Calendar, Layers, Rocket,
} from "lucide-react";
import { PLATFORM_METADATA } from "@/lib/platformManifest";

// Public Trust Center — customer-facing status card only.
//
// Design principle: "Transparent about commitments. Discrete about implementation."
// Internal engineering metadata (Manifest, Knowledge, Framework, Prompt, Config,
// Build, Schema, Repository versions, classification taxonomy, internal service
// inventory) is NOT published here. Those live in the authenticated
// Platform Governance Center™ for authorized users only.
//
// Customer-friendly value mapping (per Public Information Disclosure Standard):
//   Manifest Version    → removed
//   Knowledge Version   → removed
//   Framework Version   → "Enterprise Framework · Current"
//   Configuration Version → removed
//   Build Number        → "Last Platform Update · <month year>"
//   Internal Release #  → removed
//   Platform Version    → "Platform Release · v<releaseVersion>"

function formatLastUpdate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recent";
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return "Recent";
  }
}

const STATUS_ITEMS = [
  { label: "Platform Release", value: `v${PLATFORM_METADATA.releaseVersion}`, icon: GitBranch },
  { label: "Release Channel", value: "Production", icon: Server },
  { label: "Platform Status", value: "Healthy", icon: ShieldCheck, tone: "emerald" },
  { label: "Availability", value: "Operational", icon: Activity, tone: "emerald" },
  { label: "Enterprise Framework", value: "Current", icon: Layers },
  { label: "Last Platform Update", value: formatLastUpdate(PLATFORM_METADATA.releaseDate), icon: Calendar },
  { label: "Enterprise Readiness", value: "Private Beta", icon: Rocket, tone: "indigo" },
];

const toneClasses = {
  emerald: "text-emerald-400",
  indigo: "text-indigo-400",
  default: "text-white/80",
};

export default function PlatformInformationCard() {
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Cpu size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Platform Status</h3>
            <p className="text-[10px] text-white/30">Customer-facing platform status and availability</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-400">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATUS_ITEMS.map((item) => {
            const Icon = item.icon;
            const tone = toneClasses[item.tone] || toneClasses.default;
            return (
              <div key={item.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} className="text-white/30" />
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">{item.label}</span>
                </div>
                <span className={`text-xs font-medium ${tone}`}>{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-white/30">
        <Calendar size={11} />
        Generated: {new Date().toLocaleString()} · Enterprise Trust Center™
      </div>
    </div>
  );
}