import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { runPlatformExperienceAudit, scoreTier, FINDING_TYPE_LABELS } from "@/lib/platformExperienceAudit";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, ArrowLeft, AlertOctagon, AlertTriangle, Info, CheckCircle2,
  ExternalLink, ChevronDown, ChevronRight, ShieldCheck,
} from "lucide-react";

const SEVERITY_META = {
  critical: { label: "Critical", icon: AlertOctagon, color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { label: "High", icon: AlertTriangle, color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  medium: { label: "Medium", icon: Info, color: "#eab308", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { label: "Low", icon: Info, color: "#6366f1", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
};

const TREND_KEY = "exec_experience_score_history";

export default function PlatformExperienceAudit() {
  const [tick, setTick] = useState(0);
  const [showRoutes, setShowRoutes] = useState(false);

  const result = useMemo(() => runPlatformExperienceAudit(), [tick]);
  const { score, tier, findings, summary, routeTable } = result;

  const [trend, setTrend] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TREND_KEY);
      const history = raw ? JSON.parse(raw) : [];
      const prev = history[history.length - 1];
      if (prev && prev.score !== score) {
        setTrend(score > prev.score ? "up" : "down");
      } else {
        setTrend(null);
      }
      const next = [...history.filter((h) => h.score !== score), { score, at: result.generatedAt }].slice(-12);
      localStorage.setItem(TREND_KEY, JSON.stringify(next));
    } catch { setTrend(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const ordered = ["critical", "high", "medium", "low"];
  const grouped = ordered.map((sev) => ({ sev, items: findings.filter((f) => f.severity === sev) })).filter((g) => g.items.length);

  const statCards = [
    { label: "Registered Routes", value: summary.totalRoutes, color: "#6366f1" },
    { label: "Sidebar Items", value: summary.totalNavItems, color: "#06b6d4" },
    { label: "Orphan Routes", value: summary.orphanRoutes, color: "#f59e0b" },
    { label: "Broken Nav Links", value: summary.brokenNav, color: "#ef4444" },
    { label: "Active-State Gaps", value: summary.activeStateGaps, color: "#8b5cf6" },
    { label: "Flows In Nav", value: summary.flowInNav, color: "#eab308" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link to="/developer" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 mb-2 transition-colors">
            <ArrowLeft size={12} /> Developer Console
          </Link>
          <h1 className="text-xl font-bold text-white">Platform Experience Audit™</h1>
          <p className="text-white/40 text-sm mt-0.5">Navigation consistency, broken links, orphan pages & route health.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setTick((t) => t + 1)} className="bg-white/5 border-white/10 text-white/70 hover:text-white">
          <RefreshCw size={14} className="mr-1.5" /> Re-run Audit
        </Button>
      </div>

      {/* Score Hero */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-white/[0.02] border border-indigo-500/10 rounded-2xl p-6 flex items-center gap-6 flex-wrap">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={tier.color} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 264} 264`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{score}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">/ 100</span>
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-white">Executive Experience Score™</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: tier.color, backgroundColor: `${tier.color}1a` }}>{tier.label}</span>
            {trend === "up" && <span className="text-emerald-400 text-xs flex items-center gap-0.5">▲ improving</span>}
            {trend === "down" && <span className="text-red-400 text-xs flex items-center gap-0.5">▼ declined</span>}
            {trend === null && <span className="text-white/30 text-xs">baseline</span>}
          </div>
          <p className="text-white/50 text-sm">{findings.length} finding{findings.length !== 1 ? "s" : ""} across {summary.totalRoutes} routes and {summary.totalNavItems} sidebar items.</p>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-red-400">{summary.criticalCount} critical</span>
            <span className="text-amber-400">{summary.highCount} high</span>
            <span className="text-yellow-400">{summary.mediumCount} medium</span>
            <span className="text-indigo-400">{summary.lowCount} low</span>
          </div>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-white/30 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Findings */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Findings</h2>
        {grouped.length === 0 ? (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 text-center">
            <CheckCircle2 className="text-emerald-400 mx-auto mb-2" size={28} />
            <p className="text-white font-medium">No navigation issues detected.</p>
            <p className="text-white/40 text-sm mt-1">Every route is reachable, every nav link resolves, and active state is consistent.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(({ sev, items }) => {
              const meta = SEVERITY_META[sev];
              const Icon = meta.icon;
              return (
                <div key={sev} className={`rounded-xl border ${meta.border} ${meta.bg} overflow-hidden`}>
                  <div className="px-4 py-2.5 flex items-center gap-2 border-b border-white/5">
                    <Icon size={14} style={{ color: meta.color }} />
                    <span className="text-sm font-medium text-white">{meta.label}</span>
                    <span className="text-white/30 text-xs">· {items.length}</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {items.map((f) => (
                      <div key={f.id} className="px-4 py-3 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{f.title}</p>
                          <p className="text-white/50 text-xs mt-0.5">{f.detail}</p>
                          <p className="text-white/40 text-xs mt-1.5"><span className="text-white/30">Fix:</span> {f.recommendation}</p>
                        </div>
                        {f.routeExists ? (
                          <Link to={f.route} className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1">
                            Open <ExternalLink size={11} />
                          </Link>
                        ) : (
                          <span className="flex-shrink-0 text-xs text-white/20 mt-1">unreachable</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Route Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <button onClick={() => setShowRoutes((v) => !v)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
          <span className="text-sm font-medium text-white/70 flex items-center gap-2">
            <ShieldCheck size={14} className="text-white/30" /> Full Route Registry ({routeTable.length})
          </span>
          {showRoutes ? <ChevronDown size={16} className="text-white/30" /> : <ChevronRight size={16} className="text-white/30" />}
        </button>
        {showRoutes && (
          <div className="overflow-x-auto border-t border-white/5">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.02]">
                <tr className="text-left text-white/40">
                  <th className="px-4 py-2 font-medium">Route</th>
                  <th className="px-4 py-2 font-medium">Component</th>
                  <th className="px-4 py-2 font-medium">Nav</th>
                  <th className="px-4 py-2 font-medium">Plan</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {routeTable.map((r) => (
                  <tr key={r.url} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2 text-white/70 font-mono">{r.url}</td>
                    <td className="px-4 py-2 text-white/50">{r.component || "—"}</td>
                    <td className="px-4 py-2 text-white/50">{r.navRefs.length ? r.navRefs.map((n) => n.label).join(", ") : <span className="text-amber-400/70">none</span>}</td>
                    <td className="px-4 py-2 text-white/50">{r.plan}</td>
                    <td className="px-4 py-2">
                      <span className={r.deprecated ? "text-red-400" : "text-emerald-400"}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}