import React, { useMemo } from "react";
import { Layers, ChevronRight, Zap, Clock, TrendingUp, Target } from "lucide-react";
import { computeMetadataEngineeringTasks } from "@/lib/metadataIntelligenceEngine";
import { ROUTE_REGISTRY, MODULE_REGISTRY } from "@/lib/platformManifest";

const REGISTRY_WEIGHT = 1 / 6;

function buildRegistryBreakdown(report, tasks) {
  // Map each missing entry to its registry for proportional score gain
  const entryByRegistry = {};
  tasks.tasks.forEach((t) => {
    const key = t.category;
    if (!entryByRegistry[key]) entryByRegistry[key] = [];
    entryByRegistry[key].push(t);
  });

  const registries = [
    {
      id: "routes",
      label: "Routes™",
      icon: Layers,
      color: "indigo",
      coverage: report.routeCoverage.pct,
      complete: report.routeCoverage.complete,
      total: report.routeCoverage.total,
      missing: report.routeCoverage.missingEntries.length,
      entries: entryByRegistry["Route"] || [],
      deepLink: "/developer/governance",
    },
    {
      id: "modules",
      label: "Modules™",
      icon: Layers,
      color: "purple",
      coverage: report.moduleCoverage.pct,
      complete: report.moduleCoverage.complete,
      total: report.moduleCoverage.total,
      missing: report.moduleCoverage.missingEntries.length,
      entries: entryByRegistry["Module"] || [],
      deepLink: "/developer/governance",
    },
    {
      id: "frameworks",
      label: "Frameworks™",
      icon: Layers,
      color: "cyan",
      coverage: report.frameworkCoverage.pct,
      complete: report.frameworkCoverage.complete,
      total: report.frameworkCoverage.total,
      missing: report.frameworkCoverage.detailed.filter((f) => f.missingFields.length > 0).length,
      entries: [],
      deepLink: "/developer/governance",
    },
    {
      id: "personas",
      label: "Personas™",
      icon: Layers,
      color: "pink",
      coverage: report.personaCoverage.pct,
      complete: report.personaCoverage.complete,
      total: report.personaCoverage.total,
      missing: report.personaCoverage.unregistered.length + report.personaCoverage.detailed.reduce((s, p) => s + p.missingFields.length, 0),
      entries: entryByRegistry["Persona"] || [],
      deepLink: "/developer/governance",
    },
    {
      id: "knowledge",
      label: "Knowledge Packs™",
      icon: Layers,
      color: "emerald",
      coverage: report.knowledgeCoverage.pct,
      complete: report.knowledgeCoverage.covered,
      total: report.knowledgeCoverage.total,
      missing: report.knowledgeCoverage.missing,
      entries: entryByRegistry["Knowledge Entry"] || [],
      deepLink: "/developer/governance",
    },
    {
      id: "capabilities",
      label: "Capabilities™",
      icon: Layers,
      color: "amber",
      coverage: report.capabilityCoverage.pct,
      complete: report.capabilityCoverage.complete,
      total: report.capabilityCoverage.total,
      missing: report.capabilityCoverage.brokenChains.length,
      entries: [],
      deepLink: "/developer/governance",
    },
  ];

  // Compute score gain and est. hours per registry
  return registries.map((r) => {
    const scoreGain = r.entries.reduce((s, e) => s + e.scoreGain, 0);
    const estHours = r.entries.reduce((s, e) => s + e.estimatedHours, 0);
    const roi = estHours > 0 ? scoreGain / estHours : 0;
    return {
      ...r,
      scoreGain: Math.round(scoreGain * 100) / 100,
      estHours: Math.round(estHours * 10) / 10,
      estLabel: estHours === 0 ? "—" : estHours < 1 ? `${Math.round(estHours * 60)}m` : `${r.estHours}h`,
      roi,
      roiLabel: roi >= 0.5 ? "High ROI" : roi >= 0.15 ? "Medium ROI" : roi > 0 ? "Low ROI" : "—",
    };
  }).sort((a, b) => {
    // Sort by score gain descending — highest impact first
    if (b.scoreGain !== a.scoreGain) return b.scoreGain - a.scoreGain;
    return b.roi - a.roi;
  });
}

const COLOR_MAP = {
  indigo: { text: "text-indigo-400", bg: "bg-indigo-500/5", border: "border-indigo-500/20", bar: "bg-indigo-500" },
  purple: { text: "text-purple-400", bg: "bg-purple-500/5", border: "border-purple-500/20", bar: "bg-purple-500" },
  cyan: { text: "text-cyan-400", bg: "bg-cyan-500/5", border: "border-cyan-500/20", bar: "bg-cyan-500" },
  pink: { text: "text-pink-400", bg: "bg-pink-500/5", border: "border-pink-500/20", bar: "bg-pink-500" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20", bar: "bg-emerald-500" },
  amber: { text: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20", bar: "bg-amber-500" },
};

export default function MetadataRegistryBreakdown({ report }) {
  const tasks = useMemo(() => computeMetadataEngineeringTasks(report), [report]);
  const breakdown = useMemo(() => buildRegistryBreakdown(report, tasks), [report, tasks]);

  const totalGain = breakdown.reduce((s, r) => s + r.scoreGain, 0);
  const totalHours = breakdown.reduce((s, r) => s + r.estHours, 0);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Layers size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Registry Breakdown™ — Prioritized Engineering Roadmap</h3>
        <span className="text-xs text-white/40">{breakdown.length} registries</span>
        <div className="ml-auto flex items-center gap-4 text-[10px]">
          <span className="text-emerald-400 font-medium">Total Gain: +{Math.round(totalGain * 100) / 100}%</span>
          <span className="text-blue-400 font-medium">Total Effort: {totalHours < 1 ? `${Math.round(totalHours * 60)}m` : `${Math.round(totalHours * 10) / 10}h`}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 px-2 font-medium">Registry</th>
              <th className="text-left py-2 px-2 font-medium">Coverage</th>
              <th className="text-center py-2 px-2 font-medium">Complete</th>
              <th className="text-center py-2 px-2 font-medium">Missing</th>
              <th className="text-right py-2 px-2 font-medium text-emerald-400/60">Score Gain if Completed</th>
              <th className="text-right py-2 px-2 font-medium text-blue-400/60">Est. Hours</th>
              <th className="text-center py-2 px-2 font-medium text-amber-400/60">ROI</th>
              <th className="text-center py-2 px-2 font-medium">Priority</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((r, idx) => {
              const colors = COLOR_MAP[r.color] || COLOR_MAP.indigo;
              const ringColor = r.coverage === 100 ? "#10b981" : r.coverage >= 75 ? "#f59e0b" : r.coverage >= 50 ? "#f59e0b" : "#ef4444";
              return (
                <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors group">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-white/30 font-mono w-4">{idx + 1}</span>
                      <r.icon size={12} className={colors.text} />
                      <span className="text-white/70 font-medium group-hover:text-indigo-300 transition-colors">{r.label}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${r.coverage}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${ringColor === "#10b981" ? "text-emerald-400" : ringColor === "#f59e0b" ? "text-amber-400" : "text-red-400"}`}>{r.coverage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center text-white/50 font-mono">{r.complete}/{r.total}</td>
                  <td className="py-2.5 px-2 text-center">
                    {r.missing > 0 ? <span className="text-red-400 font-mono font-bold">{r.missing}</span> : <span className="text-emerald-400 font-mono">0</span>}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    {r.scoreGain > 0 ? <span className="text-emerald-400 font-bold font-mono">+{r.scoreGain}%</span> : <span className="text-white/20">—</span>}
                  </td>
                  <td className="py-2.5 px-2 text-right text-white/50 whitespace-nowrap">{r.estLabel}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${r.roiLabel === "High ROI" ? "bg-emerald-500/10 text-emerald-400" : r.roiLabel === "Medium ROI" ? "bg-amber-500/10 text-amber-400" : r.roiLabel === "Low ROI" ? "bg-white/5 text-white/40" : "text-white/20"}`}>{r.roiLabel}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {idx === 0 && r.scoreGain > 0 ? <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-mono"><Zap size={8} /> P0</span>
                      : idx < 3 && r.scoreGain > 0 ? <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono">P1</span>
                      : r.scoreGain > 0 ? <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono">P2</span>
                      : <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono inline-flex items-center gap-0.5"><ChevronRight size={8} /> Done</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-2 flex items-center gap-2">
        <Zap size={12} className="text-emerald-400 shrink-0" />
        <span className="text-xs text-emerald-300/80">
          Completing all registries raises Metadata Coverage from {report.overallCoverage}% to {Math.min(100, report.overallCoverage + totalGain)}% — {totalHours < 1 ? `${Math.round(totalHours * 60)}m` : `${Math.round(totalHours * 10) / 10}h`} of total effort.
        </span>
      </div>
    </div>
  );
}