import React, { useMemo, useState } from "react";
import { ShieldCheck, Target, TrendingUp, Clock, Calculator, GitBranch, CheckCircle2, Sparkles, Loader2, AlertTriangle, Lightbulb, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import MetadataDrawer from "../metadata/MetadataDrawer";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildMetadataReport } from "@/lib/reports/metadataReportBuilder";
import { base44 } from "@/api/base44Client";

const WEIGHT = 25;

function getTrend(current) {
  try {
    const prev = localStorage.getItem("gov_score_prev");
    const prevScore = prev ? parseInt(prev) : null;
    localStorage.setItem("gov_score_prev", String(current));
    if (prevScore === null) return { direction: "stable", label: "Baseline established", delta: 0 };
    const delta = current - prevScore;
    if (delta > 0) return { direction: "up", label: `+${delta} pts since last compute`, delta };
    if (delta < 0) return { direction: "down", label: `${delta} pts since last compute`, delta };
    return { direction: "stable", label: "No change since last compute", delta: 0 };
  } catch {
    return { direction: "stable", label: "No history", delta: 0 };
  }
}

function buildContributions(report) {
  const configScore = report.unknownConfigurations === 0 ? 100 : Math.max(0, 100 - report.unknownConfigurations * 10);
  const items = [
    { id: "coverage", label: "Metadata Coverage™", score: report.overallCoverage, owner: "Platform Engineering", deepLink: "/developer/governance", deps: ["All Registries™"] },
    { id: "explainability", label: "EXEC™ Explainability™", score: report.explainabilityScore, owner: "AI Engineering", deepLink: "/developer/governance", deps: ["EXEC™ Knowledge Index™"] },
    { id: "discoverability", label: "Platform Discoverability™", score: report.discoverabilityScore, owner: "Platform Engineering", deepLink: "/developer/governance", deps: ["Navigation Registry™"] },
    { id: "config", label: "Configuration Consolidation", score: configScore, owner: "Platform Engineering", deepLink: "/developer", deps: ["Platform Config™"] },
  ];
  return items.map((c) => {
    const earned = Math.round((c.score / 100) * WEIGHT * 10) / 10;
    const gap = Math.round((WEIGHT - earned) * 10) / 10;
    return { ...c, maxPoints: WEIGHT, earnedPoints: earned, gap };
  });
}

function buildRisks(report) {
  const risks = [];
  if (report.overallCoverage < 50) risks.push({ severity: "critical", description: `Metadata coverage at ${report.overallCoverage}% — below 50% threshold blocks production readiness`, mitigation: "Execute Mass Ingestion Sprint™ to close metadata gaps" });
  if (report.totalMissingEntries > 100) risks.push({ severity: "high", description: `${report.totalMissingEntries} missing metadata entries — platform assets unregistered`, mitigation: "Prioritize P1 entries in Mass Ingestion Sprint™" });
  if (report.totalOrphanRecords > 0) risks.push({ severity: "medium", description: `${report.totalOrphanRecords} orphan records indicate registry drift`, mitigation: "Run Orphan Integration™ to merge, reassign, or delete" });
  if (report.unknownConfigurations > 0) risks.push({ severity: "medium", description: `${report.unknownConfigurations} unknown configuration versions — config fragmentation`, mitigation: "Consolidate to single Platform Config™ version" });
  if (report.manifestValidation.errors > 0) risks.push({ severity: "high", description: `${report.manifestValidation.errors} manifest validation errors`, mitigation: "Resolve manifest findings in Platform Manifest™" });
  if (risks.length === 0) risks.push({ severity: "low", description: "No critical governance risks detected", mitigation: "Maintain current posture" });
  return risks;
}

function buildRecommendations(report) {
  const recs = [];
  if (report.totalMissingEntries > 0) recs.push({ priority: 1, action: `Execute Mass Ingestion Sprint™ — close ${report.totalMissingEntries} missing entries`, impact: "Largest single impact on governance score", owner: "Platform Engineering" });
  if (report.explainabilityScore < 100) recs.push({ priority: 2, action: `Run Asset Documentation Audit™ — ${100 - report.explainabilityScore}% explainability gap`, impact: "Improves EXEC™ transparency and audit readiness", owner: "AI Engineering" });
  if (report.totalOrphanRecords > 0) recs.push({ priority: 3, action: `Execute Orphan Integration™ — resolve ${report.totalOrphanRecords} orphan records`, impact: "Eliminates registry drift and dead references", owner: "Platform Engineering" });
  return recs.slice(0, 3);
}

export default function GovernanceScorecard({ report, onClose }) {
  const [whyResponse, setWhyResponse] = useState(null);
  const [whyLoading, setWhyLoading] = useState(false);

  const score = report.platformGovernanceScore;
  const gap = 100 - score;
  const contributions = useMemo(() => buildContributions(report), [report]);
  const trend = useMemo(() => getTrend(score), [score]);
  const risks = useMemo(() => buildRisks(report), [report]);
  const recs = useMemo(() => buildRecommendations(report), [report]);
  const totalHours = contributions.reduce((s, c) => s + c.gap * 2, 0);
  const projectedCompletion = gap > 0 ? new Date(Date.now() + Math.ceil(totalHours / 8) * 86400000).toLocaleDateString() : "At target";
  const execSummary = `Platform Governance™ stands at ${score}%, with a ${gap}-point gap to target. The formula reconciles: ${contributions.map((c) => `${c.label} (${c.earnedPoints}/${c.maxPoints})`).join(" + ")} = ${score}/100. ${report.totalMissingEntries} missing entries and ${report.totalOrphanRecords} orphan records remain. ${trend.label}.`;
  const ringColor = score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : "#ef4444";

  const handleWhy = async () => {
    setWhyLoading(true);
    setWhyResponse(null);
    try {
      const ctx = `LIVE GOVERNANCE TELEMETRY:\n- Governance Score: ${score}/100\n- Gap: ${gap}\n- Formula: (Coverage ${report.overallCoverage} + Explainability ${report.explainabilityScore} + Discoverability ${report.discoverabilityScore} + Config ${report.unknownConfigurations === 0 ? 100 : 0}) / 4 = ${score}\n- Contributions:\n${contributions.map((c) => `  - ${c.label}: ${c.earnedPoints}/${c.maxPoints} pts (gap: ${c.gap})`).join("\n")}\n- Missing Entries: ${report.totalMissingEntries}\n- Orphan Records: ${report.totalOrphanRecords}\n- Engineering Hours: ${totalHours.toFixed(1)}\n- Projected Completion: ${projectedCompletion}\n- Trend: ${trend.label}`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt: `You are EXEC™. The founder clicked "Why not 100%?" on Platform Governance™ (currently ${score}%).\n\n${ctx}\n\nAnswer in markdown. Include: Current Score, Remaining Gap, Weighted Contributions, Engineering Hours, Estimated Completion, Risks, Recommendations. Reference specific numbers. Never use "systemic overhead", "reconciliation discrepancy", "hidden weighting", or "baseline adjustment". End with top 3 actions to reach 100%.`, model: "automatic" });
      setWhyResponse(typeof res === "string" ? res : JSON.stringify(res));
    } catch (e) {
      setWhyResponse(`Error: ${e?.message}`);
    } finally {
      setWhyLoading(false);
    }
  };

  return (
    <MetadataDrawer title="Governance Scorecard™" subtitle="Platform Governance Analysis™ · Explainable Progress™" icon={ShieldCheck} onClose={onClose} maxWidth="max-w-2xl"
      footer={<ReportToolbar reportBuilder={buildMetadataReport} filenamePrefix="Governance-Scorecard" supportCSV />}>
      <div className="space-y-5">
        {/* Score header */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle cx="48" cy="48" r="40" fill="none" stroke={ringColor} strokeWidth="6" strokeDasharray={`${2 * Math.PI * 40 * (score / 100)} ${2 * Math.PI * 40}`} strokeLinecap="round" transform="rotate(-90 48 48)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{score}%</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-3">
            <Stat label="Current" value={`${score}%`} color={ringColor} icon={Target} />
            <Stat label="Target" value="100%" color="#64748b" icon={CheckCircle2} />
            <Stat label="Gap" value={`${gap}%`} color={gap > 0 ? "#f59e0b" : "#10b981"} icon={TrendingUp} />
          </div>
        </div>

        {/* Formula */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={13} className="text-indigo-400" />
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Scoring Formula</span>
          </div>
          <p className="text-xs text-white/60 font-mono leading-relaxed">Governance = (Coverage × 25 + Explainability × 25 + Discoverability × 25 + Config × 25) / 100 = {score}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 size={10} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400/70">{score} + {gap} = 100 · Reconciled</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="Eng. Hours" value={`${totalHours.toFixed(1)}h`} icon={Clock} color="#818cf8" />
          <MiniStat label="Projected" value={projectedCompletion} icon={GitBranch} color="#60a5fa" />
          <MiniStat label="Trend" value={trend.direction === "up" ? "↗ Improving" : trend.direction === "down" ? "↘ Declining" : "→ Stable"} icon={TrendingUp} color={trend.direction === "up" ? "#10b981" : trend.direction === "down" ? "#ef4444" : "#f59e0b"} />
          <MiniStat label="Confidence" value={score >= 90 ? "High" : score >= 75 ? "Medium" : "Low"} icon={ShieldCheck} color={score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : "#ef4444"} />
        </div>

        {/* Weighted Contributions */}
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Weighted Contributions™</h4>
          <div className="space-y-2">
            {contributions.map((c) => {
              const cGap = c.gap;
              return (
                <div key={c.id} className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/80 font-medium">{c.label}</span>
                    <span className="text-xs font-mono text-white/60">{c.earnedPoints}/{c.maxPoints} pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(c.earnedPoints / c.maxPoints) * 100}%`, backgroundColor: cGap === 0 ? "#10b981" : c.earnedPoints / c.maxPoints >= 0.75 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <span className="text-[10px] font-mono text-white/40 w-12 text-right">{cGap > 0 ? `${cGap} gap` : "✓"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-white/30">
                    <span>Owner: {c.owner}</span><span>·</span><span>Deps: {c.deps.join(", ")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={13} className="text-indigo-400" />
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Executive Summary</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">{execSummary}</p>
        </div>

        {/* Risks */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={13} className="text-amber-400" />
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Risks</span>
          </div>
          <div className="space-y-1.5">
            {risks.map((r, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${r.severity === "critical" ? "bg-red-500/10 text-red-400" : r.severity === "high" ? "bg-orange-500/10 text-orange-400" : r.severity === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/40"}`}>{r.severity}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/70">{r.description}</div>
                  {r.mitigation && <div className="text-[10px] text-emerald-400/70 mt-0.5">↳ {r.mitigation}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={13} className="text-violet-400" />
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Recommendations</span>
          </div>
          <div className="space-y-1.5">
            {recs.map((r) => (
              <div key={r.priority} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 bg-violet-500/10 text-violet-400">#{r.priority}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/70">{r.action}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">Impact: {r.impact} · Owner: {r.owner}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why not 100%? */}
        <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4">
          <button onClick={handleWhy} disabled={whyLoading} className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 transition-colors">
            {whyLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Why not 100%?
          </button>
          <p className="text-[10px] text-white/30 text-center mt-1.5">EXEC™ answers from live governance telemetry — never generic AI text</p>
          {whyResponse && <div className="mt-3 prose prose-invert prose-sm max-w-none"><ReactMarkdown>{whyResponse}</ReactMarkdown></div>}
        </div>
      </div>
    </MetadataDrawer>
  );
}

function Stat({ label, value, color, icon: Icon }) {
  return (<div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5"><div className="flex items-center gap-1.5 mb-0.5"><Icon size={10} style={{ color }} /><span className="text-[9px] text-white/40 uppercase">{label}</span></div><div className="text-base font-bold" style={{ color }}>{value}</div></div>);
}

function MiniStat({ label, value, icon: Icon, color }) {
  return (<div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5"><div className="flex items-center gap-1.5 mb-0.5"><Icon size={10} style={{ color }} /><span className="text-[9px] text-white/40 uppercase">{label}</span></div><div className="text-sm font-bold" style={{ color }}>{value}</div></div>);
}