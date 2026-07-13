import React, { useMemo } from "react";
import { X, AlertTriangle, Wrench, GitBranch, Clock, User, Link2, FileText, CheckCircle2, CalendarClock, TrendingUp } from "lucide-react";
import { computeContributionDetail } from "@/lib/scoreExplainableEngine";
import { buildPlatformValidationReport } from "@/lib/reports/platformValidationReport";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { useRepairWorkflow } from "@/components/developer/repair/RepairWorkflowProvider";

export default function ContributionDiagnostics({ scoreId, contributionId, snapshot, user, onClose }) {
  const detail = useMemo(() => computeContributionDetail(scoreId, contributionId, snapshot), [scoreId, contributionId, snapshot]);
  const { openRepairWorkflow } = useRepairWorkflow();

  if (!detail) return null;

  const handleRepair = (issue, i) => {
    const currentVal = detail.current ?? detail.score ?? null;
    const targetVal = detail.target ?? 100;
    openRepairWorkflow(
      {
        ...issue,
        id: `${scoreId}-${contributionId}-B${i}`,
        owner: detail.owner,
        estimatedEffort: detail.estimatedEffort,
        gap: detail.gap,
        deepLink: detail.deepLink,
        dependencies: detail.dependencies,
        engineeringTasks: detail.engineeringTasks,
        module: detail.module,
        currentState: currentVal != null ? `${currentVal}/${targetVal} (${detail.pointsBased ? `${detail.earnedPoints}/${detail.maxPoints} pts` : `${currentVal}%`})` : issue.description,
        targetState: `${targetVal}${detail.pointsBased ? " pts" : "%"}`,
      },
      { source: detail.label }
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#0d0d14] border-l border-white/10 flex flex-col animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{detail.scoreLabel} → {detail.scoreId === "enterprise" ? "Enterprise Capability" : "Contribution"} Diagnostics</div>
              <h2 className="text-white font-semibold text-lg">{detail.label}</h2>
              <p className="text-white/40 text-xs mt-0.5">{detail.module}</p>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <X size={18} />
            </button>
          </div>
          {detail.penaltyBased ? (
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">Current</div>
                <div className="text-xl font-bold text-white">{detail.current}%</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">Target</div>
                <div className="text-xl font-bold text-white/70">{detail.target}%</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">Raw Gap</div>
                <div className="text-xl font-bold text-amber-400">{detail.rawGap}</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">Mitigation</div>
                <div className="text-xl font-bold text-cyan-400">{detail.mitigation}%</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">Effective Penalty</div>
                <div className="text-xl font-bold" style={{ color: detail.effectivePenalty > 0 ? "#f59e0b" : "#10b981" }}>{detail.effectivePenalty > 0 ? `${detail.effectivePenalty} pts` : "✓"}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6 mt-3">
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">Current</div>
                <div className="text-xl font-bold text-white">{detail.pointsBased ? `${detail.earnedPoints}/${detail.maxPoints}` : `${detail.score}%`}</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">Target</div>
                <div className="text-xl font-bold text-white/70">{detail.pointsBased ? `${detail.maxPoints} pts` : "100%"}</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">Gap</div>
                <div className="text-xl font-bold" style={{ color: detail.gap > 0 ? "#f59e0b" : "#10b981" }}>{detail.gap > 0 ? `${detail.gap} pts` : "✓"}</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Blocking Issues */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={13} className="text-amber-400" />
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Blocking Issues</span>
            </div>
            {detail.blockingIssues.length === 0 ? (
              <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs text-white/60">No blocking issues — contribution is at or near target</span>
              </div>
            ) : (
              <div className="space-y-2">
                {detail.blockingIssues.map((issue, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: issue.priority === "P0" ? "#ef4444" : "#f59e0b", backgroundColor: `${issue.priority === "P0" ? "#ef4444" : "#f59e0b"}1a` }}>{issue.priority}</span>
                      <span className="text-xs text-white/70 font-medium">{issue.title}</span>
                      <span className="text-[9px] text-white/30 ml-auto">{issue.status}</span>
                    </div>
                    <p className="text-[11px] text-white/50">{issue.description}</p>
                    {issue.evidence.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {issue.evidence.map((e, j) => (
                          <li key={j} className="text-[10px] text-white/30 font-mono">• {e}</li>
                        ))}
                      </ul>
                    )}
                    <button
                      onClick={() => handleRepair(issue, i)}
                      className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors mt-2"
                    >
                      <Wrench size={10} /> Repair
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Engineering Tasks */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={13} className="text-blue-400" />
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Engineering Tasks</span>
            </div>
            <ul className="space-y-1.5">
              {detail.engineeringTasks.map((task, i) => (
                <li key={i} className="text-xs text-white/60 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">→</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Owner & Effort */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <User size={11} className="text-white/40" />
                <span className="text-[10px] text-white/30 uppercase">Owner</span>
              </div>
              <div className="text-xs text-white/70">{detail.owner}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={11} className="text-white/40" />
                <span className="text-[10px] text-white/30 uppercase">Est. Effort</span>
              </div>
              <div className="text-xs text-white/70">{detail.estimatedEffort}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={11} className="text-white/40" />
                <span className="text-[10px] text-white/30 uppercase">Remaining Pts</span>
              </div>
              <div className="text-xs text-white/70">{detail.gap > 0 ? `${detail.gap} pts` : "✓ At target"}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CalendarClock size={11} className="text-white/40" />
                <span className="text-[10px] text-white/30 uppercase">Projected</span>
              </div>
              <div className="text-xs text-white/70">{detail.projectedCompletion}</div>
            </div>
          </div>

          {/* Trend + Source Evidence (points-based only) */}
          {detail.pointsBased && (detail.trend || detail.sourceEvidence) && (
            <div className="grid grid-cols-1 gap-3">
              {detail.trend && (
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp size={11} className="text-white/40" />
                    <span className="text-[10px] text-white/30 uppercase">Trend</span>
                  </div>
                  <div className="text-xs text-white/70">{detail.trend}</div>
                </div>
              )}
              {detail.sourceEvidence && (
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText size={11} className="text-white/40" />
                    <span className="text-[10px] text-white/30 uppercase">Source Evidence</span>
                  </div>
                  <div className="text-xs text-white/60 leading-relaxed">{detail.sourceEvidence}</div>
                </div>
              )}
            </div>
          )}

          {/* Risks */}
          {detail.risks && detail.risks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={13} className="text-amber-400" />
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Risks</span>
              </div>
              <div className="space-y-1.5">
                {detail.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                      r.severity === "high" ? "bg-red-500/10 text-red-400" :
                      r.severity === "medium" ? "bg-amber-500/10 text-amber-400" :
                      "bg-white/5 text-white/40"
                    }`}>{r.severity}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white/70">{r.description}</div>
                      {r.mitigation && <div className="text-[10px] text-emerald-400/70 mt-0.5">↳ {r.mitigation}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {detail.timeline && detail.timeline.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarClock size={13} className="text-blue-400" />
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Timeline</span>
              </div>
              <div className="space-y-1">
                {detail.timeline.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      t.status === "complete" ? "bg-emerald-400" :
                      t.status === "in_progress" ? "bg-amber-400" :
                      "bg-white/20"
                    }`} />
                    <span className="text-xs text-white/70 flex-1">{t.milestone}</span>
                    <span className="text-[10px] text-white/40">{t.target}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Capability Breakdown */}
          {detail.subCapabilities && detail.subCapabilities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GitBranch size={13} className="text-indigo-400" />
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Sub-Capability Breakdown</span>
              </div>
              <div className="space-y-1.5">
                {detail.subCapabilities.map((sc, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                      sc.status === "complete" || sc.status === "active" ? "bg-emerald-500/10 text-emerald-400" :
                      sc.status === "in_progress" ? "bg-amber-500/10 text-amber-400" :
                      "bg-white/5 text-white/40"
                    }`}>{sc.status}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white/70">{sc.label}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{sc.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GitBranch size={13} className="text-white/40" />
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Dependencies</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {detail.dependencies.map((d, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5">{d}</span>
              ))}
            </div>
          </div>

          {/* Evidence */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={13} className="text-white/40" />
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Evidence</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1">
              {detail.evidence.map((e, i) => (
                <div key={i} className="text-[11px] text-white/50 font-mono">{e}</div>
              ))}
            </div>
          </div>

          {/* Deep Link */}
          <a href={detail.deepLink} className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
            <Link2 size={12} /> Open {detail.scoreId === "enterprise" ? "Enterprise Capability" : "module"}: {detail.module}
          </a>

          {/* Report Export */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={13} className="text-white/40" />
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Report Export</span>
            </div>
            <ReportToolbar
              reportBuilder={(type) => buildPlatformValidationReport(type, user)}
              filenamePrefix={`${detail.label}-Diagnostics`}
              supportCSV
            />
          </div>
        </div>
      </div>
    </div>
  );
}