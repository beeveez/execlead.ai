import React from "react";
import {
  ShieldCheck, Server, GitBranch, Activity, Cpu, Calendar, Rocket,
} from "lucide-react";

// Public Trust Center — customer-facing status card only.
//
// Public Information Disclosure Standard v2.1:
// "Transparent about commitments. Discrete about implementation."
// Internal engineering metadata (Manifest, Knowledge, Framework, Prompt,
// Config, Build, Schema, Repository versions, internal service inventory)
// is NOT published here — it lives in the authenticated Platform Governance
// Center™ for authorized users only.

const STATUS_ITEMS = [
  { label: "Platform Release", value: "Release Candidate 1 (RC1)", icon: GitBranch, tone: "indigo" },
  { label: "Environment", value: "Enterprise Production", icon: Server },
  { label: "Platform Status", value: "Operational", icon: ShieldCheck, tone: "emerald" },
  { label: "Availability", value: "Available", icon: Activity, tone: "emerald" },
  { label: "Enterprise Readiness", value: "Founding Executive Beta", icon: Rocket, tone: "indigo" },
  { label: "Last Platform Update", value: "August 2026", icon: Calendar },
  { label: "Operational Health", value: "Healthy", icon: Activity, tone: "emerald" },
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