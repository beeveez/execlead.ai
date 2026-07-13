import React, { useEffect, useMemo, useState } from "react";
import { X, Target, TrendingUp, AlertTriangle, Wrench, Link2, CheckCircle2, Clock, GitBranch, Activity, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { computeStreamIntelligence, persistStreamSnapshot } from "@/lib/streamIntelligenceEngine";
import { buildStreamIntelligenceReport } from "@/lib/reports/streamIntelligenceReport";
import ReportToolbar from "@/components/reports/ReportToolbar";
import StreamBlockerDetail from "./StreamBlockerDetail";
import StreamCopilot from "./StreamCopilot";

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

function RiskBadge({ severity }) {
  const colors = { Critical: "#ef4444", High: "#f59e0b", Medium: "#3b82f6", Low: "#64748b" };
  const c = colors[severity] || colors.Medium;
  return (
    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: c, backgroundColor: `${c}1a` }}>{severity}</span>
  );
}

export default function StreamIntelligenceDrawer({ streamId, snapshot, user, onClose }) {
  const [trendRange, setTrendRange] = useState("30");
  const intel = useMemo(() => computeStreamIntelligence(streamId, snapshot), [streamId, snapshot]);

  useEffect(() => {
    if (intel) persistStreamSnapshot(streamId, intel.currentScore);
  }, [streamId, intel]);

  if (!intel) return null;

  const trendData = (trendRange === "30" ? intel.trend.days30 : intel.trend.days90).map((h) => ({
    date: new Date(h.t).toLocaleDateString(),
    score: h.s,
  }));
  const hasTrend = trendData.length > 0;
  const trendColor = TREND_COLOR[intel.trend.direction];

  const reportBuilder = (reportType) => buildStreamIntelligenceReport(streamId, snapshot, reportType, user);

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
            <div className="ml-auto">
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
              <div className="space-y-2">
                <p className="text-[10px] text-white/30 mb-1">Click any blocker to view owner, priority, evidence, recommended fix, and estimated effort.</p>
                {intel.blockers.map((b) => (
                  <StreamBlockerDetail key={b.id} blocker={b} />
                ))}
              </div>
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

          {/* Engineering Recommendations */}
          <div>
            <SectionLabel icon={Activity}>Engineering Recommendations</SectionLabel>
            <ul className="space-y-1.5">
              {intel.engineeringRecommendations.map((r, i) => (
                <li key={i} className="text-xs text-white/70 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 flex items-start gap-2">
                  <ChevronRight size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
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
                <a key={i} href={l.route} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <Link2 size={11} className="text-indigo-400" /> {l.label}
                </a>
              ))}
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