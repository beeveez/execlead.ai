import React, { useMemo, useState } from "react";
import { Target, TrendingUp, Clock, GitBranch, CheckCircle2, Sparkles, Loader2, AlertTriangle, Lightbulb, FileText, ChevronRight, Link2, Wrench } from "lucide-react";
import ReactMarkdown from "react-markdown";
import MetadataDrawer from "../metadata/MetadataDrawer";
import SelfHealingActions from "../metadata/SelfHealingActions";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";
import { computeMetricDiagnostics } from "@/lib/foundationCertificationEngine";
import { base44 } from "@/api/base44Client";

export default function FoundationMetricDiagnostics({ cert, metricKey, onClose }) {
  const [whyResponse, setWhyResponse] = useState(null);
  const [whyLoading, setWhyLoading] = useState(false);
  const [activeIssue, setActiveIssue] = useState(null);

  const d = useMemo(() => computeMetricDiagnostics(cert, metricKey), [cert, metricKey]);

  if (!d) return null;

  const isScore = d.isScore || (!d.isCount && !d.isText);
  const ringColor = isScore ? (d.currentScore >= d.target ? "#10b981" : d.currentScore >= d.target * 0.85 ? "#f59e0b" : "#ef4444") : d.remainingGap > 0 ? "#ef4444" : "#10b981";

  const handleWhy = async () => {
    setWhyLoading(true);
    setWhyResponse(null);
    try {
      const ctx = `LIVE FOUNDATION CERTIFICATION TELEMETRY:
- Metric: ${d.label}
- Current: ${d.currentScore}${isScore ? "%" : ""}
- Target: ${d.target}${isScore ? "%" : ""}
- Remaining Gap: ${d.remainingGap}${isScore ? "%" : ""}
- Owner: ${d.owner}
- Estimated Hours: ${d.estimatedHours}
- Issues: ${d.issues?.length || 0}
- Dependencies: ${d.dependencies.join(", ")}
- Engineering Tasks: ${d.engineeringTasks.slice(0, 5).join("; ")}
- Trend: ${d.trend.label}
- Evidence: ${d.evidence.slice(0, 5).join("; ")}`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are EXEC™. The founder clicked "Why not 100%?" on ${d.label} (currently ${d.currentScore}${isScore ? "%" : ""}).\n\n${ctx}\n\nAnswer in markdown. Include: Current Score, Target, Remaining Gap, Contribution, Engineering Tasks, Dependencies, Evidence, Owner, Estimated Hours, Timeline, Risks, Trend. Reference specific numbers. Never use "systemic overhead", "reconciliation discrepancy", "hidden weighting", or "baseline adjustment". End with top 3 actions to reach target.`,
        model: "automatic",
      });
      setWhyResponse(typeof res === "string" ? res : JSON.stringify(res));
    } catch (e) {
      setWhyResponse(`Error: ${e?.message}`);
    } finally {
      setWhyLoading(false);
    }
  };

  return (
    <MetadataDrawer title={d.label} subtitle="Foundation Certification Diagnostics™ · Explainable Progress™" icon={Target} onClose={onClose} maxWidth="max-w-2xl"
      footer={<ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix={`${d.label}-Diagnostics`} supportCSV />}>
      <div className="space-y-5">
        {/* Score header */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle cx="48" cy="48" r="40" fill="none" stroke={ringColor} strokeWidth="6" strokeDasharray={`${2 * Math.PI * 40 * (isScore ? d.currentScore / 100 : d.remainingGap === 0 ? 100 : Math.max(0, 100 - d.remainingGap * 5))} ${2 * Math.PI * 40}`} strokeLinecap="round" transform="rotate(-90 48 48)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{d.currentScore}{isScore ? "%" : ""}</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-3">
            <Stat label="Current" value={`${d.currentScore}${isScore ? "%" : ""}`} color={ringColor} icon={Target} />
            <Stat label="Target" value={`${d.target}${isScore ? "%" : ""}`} color="#64748b" icon={CheckCircle2} />
            <Stat label="Gap" value={`${d.remainingGap}${isScore ? "%" : ""}`} color={d.remainingGap > 0 ? "#f59e0b" : "#10b981"} icon={TrendingUp} />
          </div>
        </div>

        {/* Contribution */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch size={13} className="text-indigo-400" />
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Contribution</span>
          </div>
          <p className="text-xs text-white/60 font-mono">{d.contribution.formula}</p>
          {isScore && (
            <div className="flex items-center gap-1.5 mt-2">
              <CheckCircle2 size={10} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400/70">{d.contribution.earnedPoints} + {d.contribution.gapPoints} = {d.contribution.maxPoints} · Reconciled</span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="Eng. Hours" value={`${d.estimatedHours}h`} icon={Clock} color="#818cf8" />
          <MiniStat label="Owner" value={d.owner} icon={GitBranch} color="#60a5fa" />
          <MiniStat label="Trend" value={d.trend.direction === "up" ? "↗" : d.trend.direction === "down" ? "↘" : "→"} icon={TrendingUp} color={d.trend.direction === "up" ? "#10b981" : d.trend.direction === "down" ? "#ef4444" : "#f59e0b"} />
          <MiniStat label="Issues" value={d.issues?.length || 0} icon={AlertTriangle} color={d.issues?.length > 0 ? "#f59e0b" : "#10b981"} />
        </div>

        {/* Contributions breakdown (for overall score) */}
        {d.contributions && (
          <div>
            <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Weighted Contributions™</h4>
            <div className="space-y-2">
              {d.contributions.map((c) => (
                <div key={c.id} className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/80 font-medium">{c.label}</span>
                    <span className="text-xs font-mono text-white/60">{c.earnedPoints}/{c.maxPoints} pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(c.earnedPoints / c.maxPoints) * 100}%`, backgroundColor: c.gapPoints === 0 ? "#10b981" : c.earnedPoints / c.maxPoints >= 0.75 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <span className="text-[10px] font-mono text-white/40 w-12 text-right">{c.gapPoints > 0 ? `${c.gapPoints} gap` : "✓"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engineering Tasks */}
        <div>
          <div className="flex items-center gap-2 mb-2"><Wrench size={13} className="text-blue-400" /><span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Engineering Tasks</span></div>
          <ul className="space-y-1.5">
            {d.engineeringTasks.slice(0, 15).map((task, i) => (
              <li key={i} className="text-xs text-white/60 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">→</span><span>{task}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dependencies */}
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Dependencies</h4>
          <div className="flex flex-wrap gap-1.5">{d.dependencies.map((dep) => <span key={dep} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5">{dep}</span>)}</div>
        </div>

        {/* Evidence */}
        <div>
          <div className="flex items-center gap-2 mb-2"><FileText size={13} className="text-white/40" /><span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Evidence</span></div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1">{d.evidence.slice(0, 10).map((e, i) => <div key={i} className="text-[11px] text-white/50 font-mono">{e}</div>)}</div>
        </div>

        {/* Timeline */}
        <div>
          <div className="flex items-center gap-2 mb-2"><Clock size={13} className="text-blue-400" /><span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Timeline</span></div>
          <div className="space-y-1">{d.timeline.map((t, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.status === "complete" ? "bg-emerald-400" : t.status === "in_progress" ? "bg-amber-400" : "bg-white/20"}`} />
              <span className="text-xs text-white/70 flex-1">{t.milestone}</span><span className="text-[10px] text-white/40">{t.target}</span>
            </div>
          ))}</div>
        </div>

        {/* Risks */}
        <div>
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={13} className="text-amber-400" /><span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Risks</span></div>
          <div className="space-y-1.5">{d.risks.map((r, i) => (
            <div key={i} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
              <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${r.severity === "critical" ? "bg-red-500/10 text-red-400" : r.severity === "high" ? "bg-orange-500/10 text-orange-400" : r.severity === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/40"}`}>{r.severity}</span>
              <div className="flex-1 min-w-0"><div className="text-xs text-white/70">{r.description}</div>{r.mitigation && <div className="text-[10px] text-emerald-400/70 mt-0.5">↳ {r.mitigation}</div>}</div>
            </div>
          ))}</div>
        </div>

        {/* Issues (clickable → BlockerDrillDown) */}
        {d.issues && d.issues.length > 0 && (
          <div>
            <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Issues ({d.issues.length}) — Click to drill down</h4>
            <div className="space-y-1">
              {d.issues.slice(0, 20).map((issue, i) => (
                <button key={i} onClick={() => setActiveIssue(issue)} className="w-full flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-left hover:bg-white/[0.04] transition-colors group">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${issue.severity === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20" : issue.severity === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : issue.severity === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>{issue.severity}</span>
                  <span className="text-xs text-white/70 flex-1 truncate">{issue.component}</span>
                  <ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Deep Links */}
        <div className="flex flex-wrap gap-2">
          {d.deepLinks.map((dl) => <a key={dl.url} href={dl.url} className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"><Link2 size={12} /> {dl.label}</a>)}
        </div>

        {/* Why not 100%? */}
        <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4">
          <button onClick={handleWhy} disabled={whyLoading} className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 transition-colors">
            {whyLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Why not 100%?
          </button>
          <p className="text-[10px] text-white/30 text-center mt-1.5">EXEC™ answers from live certification telemetry — never generic AI text</p>
          {whyResponse && <div className="mt-3 prose prose-invert prose-sm max-w-none"><ReactMarkdown>{whyResponse}</ReactMarkdown></div>}
        </div>
      </div>

      {/* Blocker Drill-Down */}
      {activeIssue && <BlockerInline issue={activeIssue} onClose={() => setActiveIssue(null)} />}
    </MetadataDrawer>
  );
}

function BlockerInline({ issue, onClose }) {
  return (
    <MetadataDrawer title={issue.component} subtitle={`${issue.severity} · ${issue.categoryLabel || "Blocker"}`} icon={AlertTriangle} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <DetailStat label="Capability" value={issue.component} />
          <DetailStat label="Severity" value={issue.severity} />
          <DetailStat label="Category" value={issue.categoryLabel || "—"} />
          <DetailStat label="Est. Repair" value={issue.estimatedRepairTime} />
          <DetailStat label="Auto Repair" value={issue.autoRepairAvailable ? "Available" : "Manual"} />
          <DetailStat label="Manual Review" value={issue.manualReviewRequired ? "Required" : "Not Required"} />
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Engineering Task</h4>
          <p className="text-xs text-white/70 bg-white/[0.02] border border-white/5 rounded-lg p-3">{issue.remediation}</p>
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Evidence</h4>
          <p className="text-xs text-white/60 bg-white/[0.02] border border-white/5 rounded-lg p-3">{issue.description}</p>
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Affected Components</h4>
          <div className="flex flex-wrap gap-1.5">{(issue.affectedComponents || [issue.component]).map((c) => <span key={c} className="text-[10px] bg-white/5 text-white/60 rounded px-2 py-0.5">{c}</span>)}</div>
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Fix & Verify</h4>
          <SelfHealingActions item={{ ...issue, field: issue.component, repairAction: issue.remediation, autoRepair: issue.autoRepairAvailable }} />
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Generate Report</h4>
          <ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix={`${issue.component}-Blocker`} supportCSV />
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
function DetailStat({ label, value }) {
  return (<div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5"><div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div><div className="text-xs text-white/70 mt-0.5 truncate">{value}</div></div>);
}