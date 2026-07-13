import React, { useMemo, useState } from "react";
import { Brain, Search, Gauge, TrendingUp, Target, Clock, GitBranch, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import MetadataDrawer from "./MetadataDrawer";
import { base44 } from "@/api/base44Client";

function getColor(v) {
  return v >= 90 ? "#10b981" : v >= 75 ? "#f59e0b" : "#ef4444";
}

function getContributions(scoreId, report) {
  if (scoreId === "explainability") {
    const explainableRoutes = report.routeCoverage.detailed.filter((r) => r.metadata.execSummary).length;
    const explainableModules = report.moduleCoverage.detailed.filter((m) => m.metadata.description).length;
    return [
      { id: "routes", label: "Explainable Routes", current: report.routeCoverage.total > 0 ? Math.round((explainableRoutes / report.routeCoverage.total) * 100) : 0, detail: `${explainableRoutes}/${report.routeCoverage.total} routes have EXEC™ summaries`, owner: "AI Engineering", deepLink: "/developer", dependencies: ["EXEC™ Knowledge Index™", "Route Registry™"] },
      { id: "modules", label: "Explainable Modules", current: report.moduleCoverage.total > 0 ? Math.round((explainableModules / report.moduleCoverage.total) * 100) : 0, detail: `${explainableModules}/${report.moduleCoverage.total} modules have descriptions`, owner: "Platform Engineering", deepLink: "/developer", dependencies: ["Module Registry™"] },
    ];
  }
  if (scoreId === "discoverability") {
    const discRoutes = report.routeCoverage.detailed.filter((r) => r.metadata.navigationGroup && r.metadata.searchKeywords).length;
    const discModules = report.moduleCoverage.detailed.filter((m) => m.metadata.navigationLocation).length;
    return [
      { id: "nav_routes", label: "Navigable Routes", current: report.routeCoverage.total > 0 ? Math.round((discRoutes / report.routeCoverage.total) * 100) : 0, detail: `${discRoutes}/${report.routeCoverage.total} routes have nav group + search keywords`, owner: "Platform Engineering", deepLink: "/developer", dependencies: ["Route Registry™", "Navigation Groups"] },
      { id: "nav_modules", label: "Discoverable Modules", current: report.moduleCoverage.total > 0 ? Math.round((discModules / report.moduleCoverage.total) * 100) : 0, detail: `${discModules}/${report.moduleCoverage.total} modules have navigation location`, owner: "Platform Engineering", deepLink: "/developer", dependencies: ["Module Registry™"] },
    ];
  }
  return [
    { id: "coverage", label: "Overall Metadata Coverage", current: report.overallCoverage, detail: `${report.overallCoverage}% of all registries complete`, owner: "Platform Engineering", deepLink: "/developer", dependencies: ["All Registries™"] },
    { id: "explainability", label: "EXEC™ Explainability", current: report.explainabilityScore, detail: `${report.explainabilityScore}% of assets explainable`, owner: "AI Engineering", deepLink: "/developer", dependencies: ["EXEC™ Knowledge Index™"] },
    { id: "discoverability", label: "Platform Discoverability", current: report.discoverabilityScore, detail: `${report.discoverabilityScore}% of assets discoverable`, owner: "Platform Engineering", deepLink: "/developer", dependencies: ["Navigation Registry™"] },
    { id: "config", label: "Configuration Consolidation", current: report.unknownConfigurations === 0 ? 100 : 0, detail: report.unknownConfigurations === 0 ? "Config consolidated" : `${report.unknownConfigurations} unknown configs`, owner: "Platform Engineering", deepLink: "/developer", dependencies: ["Platform Config™"] },
  ];
}

const SCORE_META = {
  explainability: { label: "EXEC™ Explainability Analysis™", icon: Brain },
  discoverability: { label: "Platform Discoverability Analysis™", icon: Search },
  governance: { label: "Platform Governance Analysis™", icon: Gauge },
};

export default function ScoreAnalysisDrawer({ scoreId, report, onClose }) {
  const meta = SCORE_META[scoreId];
  const [whyResponse, setWhyResponse] = useState(null);
  const [whyLoading, setWhyLoading] = useState(false);

  const value = scoreId === "explainability" ? report.explainabilityScore : scoreId === "discoverability" ? report.discoverabilityScore : report.platformGovernanceScore;
  const contributions = useMemo(() => getContributions(scoreId, report), [scoreId, report]);
  const gap = 100 - value;
  const totalHours = contributions.reduce((s, c) => s + (100 - c.current) * 0.5, 0);
  const color = getColor(value);
  const Icon = meta?.icon || Gauge;

  const handleWhy = async () => {
    setWhyLoading(true);
    setWhyResponse(null);
    try {
      const ctx = `LIVE METADATA TELEMETRY:\n- Score: ${meta.label}\n- Current: ${value}%\n- Target: 100%\n- Gap: ${gap}%\n- Contributions:\n${contributions.map((c) => `  - ${c.label}: ${c.current}% (${c.detail})`).join("\n")}\n- Missing Entries: ${report.totalMissingEntries}\n- Orphan Records: ${report.totalOrphanRecords}`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt: `You are EXEC™. Explain why ${meta.label} is ${value}% not 100%.\n\n${ctx}\n\nAnswer in markdown. Reference specific numbers. Never use "systemic overhead", "reconciliation discrepancy", "hidden weighting", or "baseline adjustment". End with top 3 actions to reach 100%.`, model: "automatic" });
      setWhyResponse(typeof res === "string" ? res : JSON.stringify(res));
    } catch (e) {
      setWhyResponse(`Error: ${e?.message}`);
    } finally {
      setWhyLoading(false);
    }
  };

  if (!meta) return null;

  return (
    <MetadataDrawer title={meta.label} subtitle="Explainable Progress™ — every point traceable" icon={Icon} onClose={onClose} maxWidth="max-w-2xl">
      <div className="space-y-5">
        <div className="grid grid-cols-4 gap-3">
          <Stat label="Current" value={`${value}%`} color={color} icon={Target} />
          <Stat label="Target" value="100%" color="#64748b" icon={CheckCircle2} />
          <Stat label="Gap" value={`${gap}%`} color={gap > 0 ? "#f59e0b" : "#10b981"} icon={TrendingUp} />
          <Stat label="Eng. Hours" value={`${totalHours.toFixed(1)}h`} color="#818cf8" icon={Clock} />
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
          <GitBranch size={13} className="text-indigo-400" />
          <span className="text-xs text-white/60">Formula:</span>
          <span className="text-xs font-mono text-white/80">{value} + {gap} = 100 · Reconciled</span>
          <CheckCircle2 size={11} className="text-emerald-400 ml-auto" />
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Contribution Breakdown™</h4>
          <div className="space-y-2">
            {contributions.map((c) => (
              <div key={c.id} className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/80 font-medium">{c.label}</span>
                  <span className="text-xs font-mono text-white/60">{c.current}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.current}%`, backgroundColor: getColor(c.current) }} />
                  </div>
                  <span className="text-[10px] font-mono text-white/40 w-10 text-right">{100 - c.current}% gap</span>
                </div>
                <p className="text-[10px] text-white/40 mt-1">{c.detail}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[9px] text-white/30">
                  <span>Owner: {c.owner}</span>
                  <span>·</span>
                  <span>Deps: {c.dependencies.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-3">
          <button onClick={handleWhy} disabled={whyLoading} className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 transition-colors">
            {whyLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Why not 100%?
          </button>
          <p className="text-[10px] text-white/30 text-center mt-1.5">EXEC™ answers from live metadata telemetry — never generic AI text</p>
          {whyResponse && <div className="mt-3 prose prose-invert prose-sm max-w-none"><ReactMarkdown>{whyResponse}</ReactMarkdown></div>}
        </div>
      </div>
    </MetadataDrawer>
  );
}

function Stat({ label, value, color, icon: Icon }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} style={{ color }} />
        <span className="text-[9px] text-white/40 uppercase">{label}</span>
      </div>
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
    </div>
  );
}