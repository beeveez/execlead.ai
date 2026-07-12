import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { runSelfHealingCycle, getHistory, getRecurringIssues, markApplied, dismissFinding, resetFinding, downloadAuditJSON } from "@/lib/platformSelfHealingEngine";
import { scoreTier, FINDING_TYPE_LABELS } from "@/lib/platformExperienceAudit";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, ArrowLeft, AlertOctagon, AlertTriangle, Info, CheckCircle2,
  ExternalLink, ChevronDown, ChevronRight, ShieldCheck, Wrench, Clock,
  History, Download, Copy, Check, RotateCcw, X, TrendingDown, Zap, FileCode,
} from "lucide-react";

const SEVERITY_META = {
  critical: { label: "Critical", icon: AlertOctagon, color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { label: "High", icon: AlertTriangle, color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  medium: { label: "Medium", icon: Info, color: "#eab308", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { label: "Low", icon: Info, color: "#6366f1", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
};

const STAGES = [
  { id: "analyze", label: "Analyzing platform" },
  { id: "classify", label: "Classifying issues" },
  { id: "patch", label: "Generating repair patches" },
  { id: "verify", label: "Verifying repairs" },
  { id: "complete", label: "Completed" },
];

const LIFECYCLE_BADGE = {
  open: { label: "Open", color: "#f59e0b" },
  applied: { label: "Applied", color: "#6366f1" },
  verified: { label: "Verified", color: "#10b981" },
  failed: { label: "Failed", color: "#ef4444" },
  dismissed: { label: "Dismissed", color: "#6b7280" },
};

export default function PlatformExperienceAudit() {
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedPatch, setExpandedPatch] = useState(null);
  const [copied, setCopied] = useState(null);
  const [history, setHistory] = useState([]);
  const [recurring, setRecurring] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
    setRecurring(getRecurringIssues());
    // Auto-run once on mount if no history
    if (getHistory().length === 0) handleAnalyze();
  }, []);

  const handleAnalyze = useCallback(async () => {
    setRunning(true);
    setStage(0);
    // Simulate stage progression for UX (computation is synchronous)
    for (let i = 0; i < STAGES.length - 1; i++) {
      setStage(i);
      await new Promise((r) => setTimeout(r, 350));
    }
    const cycle = runSelfHealingCycle();
    setStage(STAGES.length - 1);
    await new Promise((r) => setTimeout(r, 200));
    setResult(cycle);
    setHistory(getHistory());
    setRecurring(getRecurringIssues());
    setRunning(false);
  }, []);

  const handleCopyPatch = (findingId, patch) => {
    const text = `// ${patch.description}\n// File: ${patch.file}\n// Location: ${patch.location}\n// BEFORE:\n${patch.before}\n// AFTER:\n${patch.after}`;
    navigator.clipboard?.writeText(text);
    setCopied(findingId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleMarkApplied = (signature) => {
    markApplied(signature);
    if (result) {
      setResult({
        ...result,
        findings: result.findings.map((f) => f.signature === signature ? { ...f, lifecycle: "applied" } : f),
      });
    }
  };

  const handleDismiss = (signature) => {
    dismissFinding(signature, "Dismissed by developer");
    if (result) {
      setResult({
        ...result,
        findings: result.findings.map((f) => f.signature === signature ? { ...f, lifecycle: "dismissed" } : f),
      });
    }
  };

  const handleReset = (signature) => {
    resetFinding(signature);
    if (result) {
      setResult({
        ...result,
        findings: result.findings.map((f) => f.signature === signature ? { ...f, lifecycle: "open" } : f),
      });
    }
  };

  const score = result?.score ?? 0;
  const tier = result?.tier ?? scoreTier(0);
  const findings = result?.findings ?? [];
  const summary = result?.summary;
  const dimensions = result?.dimensions ?? [];
  const verification = result?.verification;
  const expectedAfter = summary?.expectedScoreAfterRepair ?? score;

  const ordered = ["critical", "high", "medium", "low"];
  const grouped = ordered.map((sev) => ({ sev, items: findings.filter((f) => f.severity === sev) })).filter((g) => g.items.length);

  const prevScore = history.length >= 2 ? history[history.length - 2].score : null;
  const trend = prevScore !== null ? (score > prevScore ? "up" : score < prevScore ? "down" : "stable") : null;

  return (
    <div className="space-y-6">
      {/* Header + Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link to="/developer" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 mb-2 transition-colors">
            <ArrowLeft size={12} /> Developer Console
          </Link>
          <h1 className="text-xl font-bold text-white">Platform Experience Audit™</h1>
          <p className="text-white/40 text-sm mt-0.5">Self-healing engine — discover, classify, repair, verify.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowHistory((v) => !v)} className="bg-white/5 border-white/10 text-white/70 hover:text-white">
            <History size={14} className="mr-1.5" /> History
          </Button>
          <Button variant="outline" size="sm" disabled={!result} onClick={() => result && downloadAuditJSON(result)} className="bg-white/5 border-white/10 text-white/70 hover:text-white">
            <Download size={14} className="mr-1.5" /> Export
          </Button>
          <Button size="sm" onClick={handleAnalyze} disabled={running} className="bg-indigo-600 hover:bg-indigo-500 text-white">
            {running ? <RefreshCw size={14} className="mr-1.5 animate-spin" /> : <Zap size={14} className="mr-1.5" />}
            {running ? "Analyzing…" : "Analyze Platform™"}
          </Button>
        </div>
      </div>

      {/* Live Progress */}
      {running && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="space-y-2.5">
            {STAGES.map((s, i) => {
              const state = i < stage ? "done" : i === stage ? "active" : "waiting";
              return (
                <div key={s.id} className={`flex items-center gap-3 text-sm transition-all ${state === "done" ? "text-white/70" : state === "active" ? "text-white" : "text-white/20"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${state === "done" ? "bg-emerald-500/20 text-emerald-400" : state === "active" ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5"}`}>
                    {state === "done" ? <Check size={11} /> : state === "active" ? <RefreshCw size={11} className="animate-spin" /> : i + 1}
                  </div>
                  {s.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verification Banner */}
      {verification && (verification.verifiedCount > 0 || verification.failedCount > 0) && !running && (
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${verification.failedCount > 0 ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
          {verification.failedCount > 0 ? <AlertTriangle className="text-red-400" size={18} /> : <CheckCircle2 className="text-emerald-400" size={18} />}
          <div className="text-sm">
            <span className="text-white font-medium">Verification: </span>
            <span className="text-emerald-400">{verification.verifiedCount} verified</span>
            {verification.failedCount > 0 && <span className="text-red-400"> · {verification.failedCount} failed (queued for review)</span>}
          </div>
        </div>
      )}

      {/* Score Hero */}
      {result && !running && (
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-lg font-semibold text-white">Experience Health Score™</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: tier.color, backgroundColor: `${tier.color}1a` }}>{tier.label}</span>
              {trend === "up" && <span className="text-emerald-400 text-xs">▲ {score - prevScore}</span>}
              {trend === "down" && <span className="text-red-400 text-xs">▼ {prevScore - score}</span>}
              {trend === "stable" && <span className="text-white/30 text-xs">— stable</span>}
              {trend === null && <span className="text-white/30 text-xs">baseline</span>}
            </div>
            <p className="text-white/50 text-sm">
              {findings.length} findings · {summary.autoRepairable} auto-repairable · {summary.requiresReview} require review
            </p>
            {summary.autoRepairable > 0 && (
              <p className="text-indigo-400 text-xs mt-1 flex items-center gap-1">
                <Zap size={11} /> Applying all safe repairs would raise the score to <strong className="ml-0.5">{expectedAfter}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Dimensions */}
      {result && !running && dimensions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dimensions.map((d) => (
            <div key={d.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-xs">{d.name}</span>
                {d.count > 0 && <span className="text-white/30 text-xs">{d.count} issue{d.count !== 1 ? "s" : ""}</span>}
              </div>
              <div className="text-2xl font-bold" style={{ color: d.score >= 90 ? "#10b981" : d.score >= 60 ? "#eab308" : "#f59e0b" }}>{d.score}</div>
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${d.score}%`, backgroundColor: d.score >= 90 ? "#10b981" : d.score >= 60 ? "#eab308" : "#f59e0b" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Learning Engine: Recurring Issues */}
      {recurring.length > 0 && !running && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="text-amber-400" size={16} />
            <h3 className="text-sm font-medium text-amber-400">Learning Engine™ — Recurring Issues</h3>
          </div>
          <p className="text-white/40 text-xs mb-3">These findings have persisted across multiple audit runs. Consider a structural fix.</p>
          <div className="space-y-1.5">
            {recurring.slice(0, 5).map((r) => (
              <div key={r.signature} className="flex items-center justify-between text-xs">
                <span className="text-white/60 font-mono">{r.signature}</span>
                <span className="text-amber-400">{r.occurrences} runs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && !running && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <History size={14} className="text-white/40" />
            <span className="text-sm font-medium text-white/70">Self-Heal History™</span>
            <span className="text-white/30 text-xs">· {history.length} run{history.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
            {history.length === 0 ? (
              <div className="px-4 py-6 text-center text-white/30 text-sm">No history yet. Run an analysis to start tracking.</div>
            ) : history.slice().reverse().map((h) => (
              <div key={h.id} className="px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-white/70 font-medium">{h.score}</span>
                  <span className="text-white/40">{h.tier}</span>
                  <span className="text-white/30">{h.totalFindings} findings</span>
                  {h.verifiedCount > 0 && <span className="text-emerald-400">{h.verifiedCount} verified</span>}
                  {h.failedCount > 0 && <span className="text-red-400">{h.failedCount} failed</span>}
                </div>
                <span className="text-white/30">{new Date(h.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Findings */}
      {result && !running && (
        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Findings</h2>
          {grouped.length === 0 ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 text-center">
              <CheckCircle2 className="text-emerald-400 mx-auto mb-2" size={28} />
              <p className="text-white font-medium">No issues detected.</p>
              <p className="text-white/40 text-sm mt-1">Every route is reachable, every nav link resolves, and the platform is consistent.</p>
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
                        <FindingRow key={f.id} finding={f}
                          expanded={expandedPatch === f.id}
                          onTogglePatch={() => setExpandedPatch(expandedPatch === f.id ? null : f.id)}
                          copied={copied === f.id}
                          onCopyPatch={() => handleCopyPatch(f.id, f.repair_patch)}
                          onMarkApplied={() => handleMarkApplied(f.signature)}
                          onDismiss={() => handleDismiss(f.signature)}
                          onReset={() => handleReset(f.signature)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Route Table */}
      {result && !running && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <button onClick={() => setShowRoutes((v) => !v)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <span className="text-sm font-medium text-white/70 flex items-center gap-2">
              <ShieldCheck size={14} className="text-white/30" /> Full Route Registry ({result.routeTable.length})
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
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.routeTable.map((r) => (
                    <tr key={r.url} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-2 text-white/70 font-mono">{r.url}</td>
                      <td className="px-4 py-2 text-white/50">{r.component || "—"}</td>
                      <td className="px-4 py-2"><span className={r.deprecated ? "text-red-400" : "text-emerald-400"}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty state — before first run */}
      {!result && !running && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Wrench className="text-white/30 mx-auto mb-3" size={32} />
          <p className="text-white/60 font-medium">Run an analysis to discover platform issues.</p>
          <p className="text-white/30 text-sm mt-1">The engine will scan routes, navigation, metadata, and consistency — then generate repair patches for safe fixes.</p>
        </div>
      )}
    </div>
  );
}

// ─── Finding Row (extracted for clarity) ───
function FindingRow({ finding, expanded, onTogglePatch, copied, onCopyPatch, onMarkApplied, onDismiss, onReset }) {
  const lcBadge = LIFECYCLE_BADGE[finding.lifecycle] || LIFECYCLE_BADGE.open;
  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm text-white font-medium">{finding.title}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: lcBadge.color, backgroundColor: `${lcBadge.color}1a` }}>{lcBadge.label}</span>
            {finding.auto_repairable ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-0.5"><Wrench size={9} /> Auto-repairable</span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 flex items-center gap-0.5"><Clock size={9} /> Review required</span>
            )}
            <span className="text-[10px] text-white/30">{finding.confidence}% confidence</span>
          </div>
          <p className="text-white/50 text-xs">{finding.detail}</p>
          <p className="text-white/40 text-xs mt-1.5"><span className="text-white/30">Fix:</span> {finding.recommendation}</p>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-white/30">
            <span>Impact: {finding.impact}</span>
            <span>·</span>
            <span>Est. {finding.estimated_fix_time}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {finding.routeExists && (
            <Link to={finding.route} className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
              Open <ExternalLink size={11} />
            </Link>
          )}
          {finding.lifecycle === "failed" && (
            <span className="text-[10px] text-red-400 flex items-center gap-0.5"><AlertTriangle size={9} /> Verification failed</span>
          )}
        </div>
      </div>

      {/* Repair Patch */}
      {finding.repair_patch && finding.lifecycle !== "dismissed" && finding.lifecycle !== "verified" && (
        <div className="mt-2.5">
          <button onClick={onTogglePatch} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <FileCode size={12} /> Repair Patch
          </button>
          {expanded && (
            <div className="mt-2 bg-[#0a0a0f] border border-white/5 rounded-lg p-3 font-mono text-xs">
              <div className="text-white/40 mb-2">// {finding.repair_patch.description}</div>
              <div className="text-white/30 mb-1">File: <span className="text-white/60">{finding.repair_patch.file}</span></div>
              <div className="text-white/30 mb-2">Location: <span className="text-white/60">{finding.repair_patch.location}</span></div>
              <div className="space-y-2">
                <div>
                  <span className="text-red-400">BEFORE:</span>
                  <pre className="text-white/50 mt-0.5 whitespace-pre-wrap">{finding.repair_patch.before}</pre>
                </div>
                <div>
                  <span className="text-emerald-400">AFTER:</span>
                  <pre className="text-white/70 mt-0.5 whitespace-pre-wrap">{finding.repair_patch.after}</pre>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={onCopyPatch} className="h-7 text-xs bg-white/5 border-white/10 text-white/70 hover:text-white">
                  {copied ? <Check size={12} className="mr-1 text-emerald-400" /> : <Copy size={12} className="mr-1" />}
                  {copied ? "Copied" : "Copy Patch"}
                </Button>
                {finding.lifecycle === "open" && (
                  <Button size="sm" variant="outline" onClick={onMarkApplied} className="h-7 text-xs bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20">
                    <Check size={12} className="mr-1" /> Mark Applied
                  </Button>
                )}
                {finding.lifecycle === "applied" && (
                  <Button size="sm" variant="outline" onClick={onReset} className="h-7 text-xs bg-white/5 border-white/10 text-white/50 hover:text-white">
                    <RotateCcw size={12} className="mr-1" /> Reset
                  </Button>
                )}
                {finding.lifecycle === "failed" && (
                  <Button size="sm" variant="outline" onClick={onReset} className="h-7 text-xs bg-white/5 border-white/10 text-white/50 hover:text-white">
                    <RotateCcw size={12} className="mr-1" /> Retry
                  </Button>
                )}
                {finding.lifecycle !== "dismissed" && (
                  <Button size="sm" variant="ghost" onClick={onDismiss} className="h-7 text-xs text-white/30 hover:text-red-400">
                    <X size={12} className="mr-1" /> Dismiss
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dismissed indicator */}
      {finding.lifecycle === "dismissed" && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-white/30">Dismissed</span>
          <Button size="sm" variant="ghost" onClick={onReset} className="h-6 text-xs text-white/30 hover:text-white px-2">
            <RotateCcw size={11} className="mr-1" /> Restore
          </Button>
        </div>
      )}
    </div>
  );
}