import React, { useEffect, useMemo, useState, useCallback } from "react";
import { X, Target, TrendingUp, AlertTriangle, Wrench, Link2, CheckCircle2, Clock, GitBranch, Activity, ChevronRight, ShieldCheck, Zap, RefreshCw, FileText, Printer, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { computeStreamIntelligence, persistStreamSnapshot } from "@/lib/streamIntelligenceEngine";
import { buildStreamIntelligenceReport } from "@/lib/reports/streamIntelligenceReport";
import ReportToolbar from "@/components/reports/ReportToolbar";
import StreamBlockerDetail from "./StreamBlockerDetail";
import StreamCopilot from "./StreamCopilot";
import { useRepairWorkflow } from "@/components/developer/repair/RepairWorkflowProvider";
import { useUniversalRouter } from "@/lib/universalRouter";

const TREND_COLOR = { up: "#10b981", down: "#ef4444", stable: "#3b82f6" };

function StatCard({ icon: Icon, label, value, sublabel, accent }) {
  const colors = { green: "#10b981", amber: "#f59e0b", red: "#ef4444", blue: "#3b82f6", indigo: "#8b5cf6" };
  const color = colors[accent] || "#94a3b8";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={13} style={{ color }} />
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sublabel && <div className="text-[10px] text-white/40 mt-0.5">{sublabel}</div>}
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-indigo-400" />
      <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">{children}</h3>
    </div>
  );
}

function ImpactCard({ label, value }) {
  const colors = { High: "#ef4444", Critical: "#ef4444", Blocked: "#ef4444", Medium: "#f59e0b", "At Risk": "#f59e0b", Elevated: "#f59e0b", Low: "#10b981", "On Track": "#10b981" };
  const c = colors[value] || "#94a3b8";
  return (
    <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm font-bold" style={{ color: c }}>{value}</div>
    </div>
  );
}

function RiskBadge({ severity }) {
  const colors = { Critical: "#ef4444", High: "#f59e0b", Medium: "#3b82f6", Low: "#64748b" };
  const c = colors[severity] || colors.Medium;
  return (
    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: c, backgroundColor: `${c}1a` }}>{severity}</span>
  );
}

export default function StreamIntelligenceDrawer({ streamId, snapshot, user, onClose }) {
  const [trendRange, setTrendRange] = useState("30");
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { openRepairWorkflow } = useRepairWorkflow();
  const { navigateTo } = useUniversalRouter();
  const intel = useMemo(() => computeStreamIntelligence(streamId, snapshot), [streamId, snapshot, refreshKey]);

  useEffect(() => {
    if (intel) persistStreamSnapshot(streamId, intel.currentScore);
  }, [streamId, intel]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setRefreshing(false);
    }, 500);
  }, []);

  const handleRepaired = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setRefreshing(false);
    }, 500);
  }, []);

  const handleVerified = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setRefreshing(false);
    }, 500);
  }, []);

  if (!intel) return null;

  const trendData = (trendRange === "30" ? intel.trend.days30 : intel.trend.days90).map((h) => ({
    date: new Date(h.t).toLocaleDateString(),
    score: h.s,
  }));
  const hasTrend = trendData.length > 0;
  const trendColor = TREND_COLOR[intel.trend.direction];

  const reportBuilder = (reportType) => buildStreamIntelligenceReport(streamId, snapshot, reportType, user);

  const handleReport = async (type) => {
    try {
      const report = await reportBuilder(type);
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${intel.streamName}-${type}-Report.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[#0a0a0f] border-l border-white/10 flex flex-col animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${trendColor}15` }}>
              <GitBranch size={22} style={{ color: trendColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-white font-semibold text-lg">{intel.streamName}</h2>
                <span className="text-[10px] text-white/30 font-mono">{intel.module}</span>
              </div>
              <p className="text-white/40 text-xs mt-0.5">Executive Stream Intelligence™ — operational control center</p>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Score summary bar */}
          <div className="flex items-center gap-4 mt-3">
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Current</div>
              <div className="text-xl font-bold" style={{ color: trendColor }}>{intel.currentScore}%</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Target</div>
              <div className="text-xl font-bold text-white/70">{intel.targetScore}%</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Gap</div>
              <div className="text-xl font-bold" style={{ color: intel.gap <= 0 ? "#10b981" : "#f59e0b" }}>{intel.gap > 0 ? `${intel.gap}` : "✓"}</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Trend</div>
              <div className="text-xl font-bold" style={{ color: trendColor }}>{intel.trend.delta >= 0 ? "+" : ""}{intel.trend.delta}</div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} /> Refresh Score
              </button>
              <ReportToolbar reportBuilder={reportBuilder} filenamePrefix={`${intel.streamName}-Intelligence`} supportCSV={false} />
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Executive Summary */}
          <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4">
            <SectionLabel icon={Activity}>Executive Summary</SectionLabel>
            <p className="text-sm text-white/70 leading-relaxed">{intel.executiveSummary}</p>
          </div>

          {/* Explainable Executive Intelligence™ */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <SectionLabel icon={ShieldCheck}>Explainable Executive Intelligence™</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white/[0.02] rounded-lg p-2.5">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Confidence Level</div>
                <div className="text-lg font-bold" style={{ color: (intel.confidenceLevel || 60) >= 70 ? "#10b981" : (intel.confidenceLevel || 60) >= 40 ? "#f59e0b" : "#ef4444" }}>{intel.confidenceLevel || 60}%</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2.5">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Est. Completion</div>
                <div className="text-sm font-bold text-white/70">{intel.estimatedCompletion || "—"}</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2.5">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Engineering Hours</div>
                <div className="text-lg font-bold text-white/70">{intel.technicalDebt.hours}h</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2.5">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Blocking Issues</div>
                <div className="text-lg font-bold" style={{ color: intel.blockers.length > 0 ? "#f59e0b" : "#10b981" }}>{intel.blockers.length}</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2.5">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Remaining Gap</div>
                <div className="text-lg font-bold" style={{ color: intel.gap <= 0 ? "#10b981" : "#f59e0b" }}>{intel.gap <= 0 ? "✓" : `${intel.gap} pts`}</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2.5">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Trend</div>
                <div className="text-lg font-bold" style={{ color: trendColor }}>{intel.trend.delta >= 0 ? "+" : ""}{intel.trend.delta}</div>
              </div>
            </div>
          </div>

          {/* Executive Impact */}
          {intel.executiveImpact && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <SectionLabel icon={Zap}>Executive Impact</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ImpactCard label="Business Impact" value={intel.executiveImpact.businessImpact} />
                <ImpactCard label="Customer Impact" value={intel.executiveImpact.customerImpact} />
                <ImpactCard label="Release Impact" value={intel.executiveImpact.releaseImpact} />
                <ImpactCard label="Production Risk" value={intel.executiveImpact.productionRisk} />
              </div>
            </div>
          )}

          {/* Score cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Activity} label="Current Score" value={`${intel.currentScore}%`} accent={intel.currentScore >= intel.targetScore ? "green" : "amber"} />
            <StatCard icon={Target} label="Target Score" value={`${intel.targetScore}%`} accent="blue" />
            <StatCard icon={AlertTriangle} label="Gap" value={`${intel.gap} pts`} accent={intel.gap <= 0 ? "green" : "amber"} sublabel={intel.gap <= 0 ? "On target" : "Below target"} />
            <StatCard icon={Clock} label="Est. Effort" value={intel.estimatedEffort.split(" ")[0]} accent="indigo" sublabel={intel.estimatedEffort} />
          </div>

          {/* Gap Analysis */}
          <div>
            <SectionLabel icon={Target}>Gap Analysis</SectionLabel>
            <p className="text-sm text-white/60 leading-relaxed bg-white/[0.02] border border-white/5 rounded-lg p-3">{intel.gapAnalysis}</p>
          </div>

          {/* Trend chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel icon={TrendingUp}>Trend Analytics</SectionLabel>
              <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-lg p-0.5">
                {["30", "90"].map((r) => (
                  <button key={r} onClick={() => setTrendRange(r)}
                    className={`text-[10px] px-2 py-0.5 rounded ${trendRange === r ? "bg-indigo-500/20 text-indigo-300" : "text-white/40"}`}>
                    {r}d
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 h-48">
              {hasTrend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} stroke="rgba(255,255,255,0.1)" />
                    <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} stroke="rgba(255,255,255,0.1)" />
                    <Tooltip contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} labelStyle={{ color: "rgba(255,255,255,0.5)" }} />
                    <Line type="monotone" dataKey="score" stroke={trendColor} strokeWidth={2} dot={{ r: 2, fill: trendColor }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <TrendingUp size={20} className="text-white/20 mb-2" />
                  <p className="text-white/30 text-xs">Baseline established — trend chart populates as snapshots are recorded.</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Milestones */}
          {intel.completedMilestones.length > 0 && (
            <div>
              <SectionLabel icon={CheckCircle2}>Completed Milestones</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {intel.completedMilestones.map((m, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 size={9} /> {m.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Remaining Blockers */}
          <div>
            <SectionLabel icon={AlertTriangle}>Remaining Blockers</SectionLabel>
            {intel.blockers.length === 0 ? (
              <div className="text-center py-6 bg-white/[0.02] border border-white/5 rounded-lg">
                <CheckCircle2 size={20} className="text-emerald-400/40 mx-auto mb-2" />
                <p className="text-white/40 text-xs">No blockers — stream is clear. Click a blocker to expand its full detail.</p>
              </div>
            ) : (
              <>
                <p className="text-[10px] text-white/30 mb-3">Click any blocker to view owner, priority, evidence, recommended fix, and estimated effort.</p>
                <div className="space-y-3">
                  {intel.blockers.map((b) => (
                    <StreamBlockerDetail key={b.id} blocker={b} onRepaired={handleRepaired} onVerified={handleVerified} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Risks */}
          {intel.risks.length > 0 && (
            <div>
              <SectionLabel icon={AlertTriangle}>Risks</SectionLabel>
              <div className="space-y-1.5">
                {intel.risks.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                    <RiskBadge severity={r.severity} />
                    <span className="text-xs text-white/70 flex-1">{r.description}</span>
                    <span className="text-[9px] text-white/30 font-mono">{r.likelihood}/{r.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Debt */}
          <div>
            <SectionLabel icon={Wrench}>Technical Debt</SectionLabel>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <StatCard icon={Wrench} label="Items" value={intel.technicalDebt.count} accent={intel.technicalDebt.count > 0 ? "amber" : "green"} />
              <StatCard icon={Clock} label="Effort" value={`${intel.technicalDebt.hours}h`} accent="blue" />
              <StatCard icon={AlertTriangle} label="P0 Items" value={intel.blockers.filter((b) => b.priority === "P0").length} accent={intel.blockers.filter((b) => b.priority === "P0").length > 0 ? "red" : "green"} />
            </div>
          </div>

          {/* Engineering Recommendations — Actionable */}
          <div>
            <SectionLabel icon={Activity}>Engineering Recommendations — Actionable</SectionLabel>
            <div className="space-y-2">
              {(intel.actionableRecommendations || intel.engineeringRecommendations.map((r, i) => ({ id: `R${i}`, text: r, steps: ["Repair", "Execute Repair", "Verification", "Refresh Intelligence Score"], priority: "P2", blockerId: null }))).map((rec) => (
                <div key={rec.id} className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5">
                  <div className="flex items-start gap-2 mb-2">
                    <ChevronRight size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-white/70 flex-1">{rec.text}</span>
                    {rec.priority && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{
                        color: rec.priority === "P0" ? "#ef4444" : rec.priority === "P1" ? "#f59e0b" : "#3b82f6",
                        backgroundColor: rec.priority === "P0" ? "#ef44441a" : rec.priority === "P1" ? "#f59e0b1a" : "#3b82f61a",
                      }}>{rec.priority}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-5 flex-wrap">
                    {rec.steps.map((step, si) => {
                      const isRepairStep = si <= 1;
                      const isVerifyStep = si === 2;
                      const isRefreshStep = si === rec.steps.length - 1;
                      const linkedBlocker = rec.blockerId ? intel.blockers.find((b) => b.id === rec.blockerId) : null;
                      const handleClick = () => {
                        if (isRepairStep) {
                          const finding = linkedBlocker || {
                            id: rec.id,
                            title: rec.text,
                            issue: rec.text,
                            recommendedFix: rec.text,
                            estimatedEffort: intel.estimatedEffort,
                            priority: rec.priority,
                            owner: intel.owner,
                            source: intel.streamName,
                          };
                          openRepairWorkflow(finding, { source: intel.streamName });
                          handleRepaired();
                        } else if (isVerifyStep) {
                          handleVerified();
                        } else if (isRefreshStep) {
                          handleRefresh();
                        }
                      };
                      return (
                        <React.Fragment key={si}>
                          <button
                            onClick={handleClick}
                            disabled={refreshing}
                            className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                              isRefreshStep
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
                                : isRepairStep
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                            }`}
                          >
                            {isRefreshStep && refreshing && <RefreshCw size={9} className="animate-spin" />}
                            {step}
                          </button>
                          {si < rec.steps.length - 1 && <span className="text-white/20 text-[9px]">→</span>}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dependencies */}
          <div>
            <SectionLabel icon={GitBranch}>Dependencies</SectionLabel>
            <div className="grid sm:grid-cols-2 gap-2">
              {intel.dependencies.map((d, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                  <GitBranch size={12} className="text-white/40" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/70 truncate">{d.name}</div>
                    <div className="text-[9px] text-white/30">{d.type}</div>
                  </div>
                  <span className="text-[9px] text-emerald-400">{d.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Links */}
          <div>
            <SectionLabel icon={Link2}>Affected Modules — Deep Links</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {intel.deepLinks.map((l, i) => (
                <button key={i} onClick={() => { onClose(); navigateTo(l.route); }} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                  <Link2 size={11} className="text-indigo-400" /> {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Executive Report Generation */}
          <div>
            <SectionLabel icon={FileText}>Executive Report</SectionLabel>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Printer size={12} /> Print
              </button>
              <button onClick={() => handleReport("full")} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Download size={12} /> Export PDF
              </button>
              <button onClick={() => handleReport("board")} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <FileText size={12} /> Board Summary
              </button>
              <button onClick={() => handleReport("executive_summary")} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <FileText size={12} /> Technical Summary
              </button>
              <button onClick={() => handleReport("full_engineering")} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <FileText size={12} /> Engineering Report
              </button>
            </div>
          </div>

          {/* Stream Copilot */}
          <StreamCopilot
            streamId={streamId}
            streamName={intel.streamName}
            currentScore={intel.currentScore}
            targetScore={intel.targetScore}
            snapshot={snapshot}
          />
        </div>
      </div>
    </div>
  );
}