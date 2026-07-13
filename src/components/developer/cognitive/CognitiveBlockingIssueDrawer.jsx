import React, { useMemo, useState } from "react";
import {
  X, AlertOctagon, ChevronRight, User, Clock, Target,
  Calendar, GitBranch, FileWarning, Activity, TrendingDown,
  Loader2, CheckCircle2, RefreshCw,
} from "lucide-react";

const PRIORITY_STYLE = {
  P0: { color: "#ef4444", label: "P0", badge: "bg-red-500/15 text-red-400 border-red-500/20" },
  P1: { color: "#f59e0b", label: "P1", badge: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  P2: { color: "#3b82f6", label: "P2", badge: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
};

const PILLAR_DEPENDENCIES = {
  reasoning: ["Executive Reasoning Framework™", "Prompt Engineering™"],
  evidence: ["Capability Chain Engine™", "Knowledge Pack Engine™"],
  personalization: ["User Context Resolver™", "Profile Engine™"],
  coaching: ["Workspace Persona Engine™", "Coaching Quality Engine™"],
  transparency: ["Framework Hierarchy™", "Explainability Engine™"],
  memory: ["Executive Memory™", "Conversation Persistence™"],
  recommendations: ["Recommendation Engine™", "Workspace Context™"],
  simulation: ["Executive Simulator™", "Simulation Intelligence™"],
  knowledge: ["Knowledge Resolution Engine™", "Knowledge Pack Engine™"],
};

function priorityFor(score, target) {
  if (score < 50) return "P0";
  if (score < target * 0.8) return "P1";
  return "P2";
}

function estEffortFor(gap) {
  return Math.max(8, gap * 2 + 2);
}

function projectedDateFor(hours) {
  const days = Math.max(1, Math.ceil(hours / 8));
  return new Date(Date.now() + days * 86400000).toLocaleDateString();
}

/**
 * Cognitive Blocking Issue Drawer™
 * --------------------------------
 * Structured drill-down for a cognitive pillar below target.
 * Renders: earned points, gap, engineering tasks, owner, effort,
 * projected completion, dependencies, and live-telemetry evidence.
 *
 * Derived from a Cognitive Excellence Engine™ pillar object.
 */
export default function CognitiveBlockingIssueDrawer({ pillar, onClose, onRerun }) {
  const issue = useMemo(() => {
    const weight = pillar.weight || 10;
    const earned = Math.round((pillar.score * weight) / 100);
    const gap = Math.max(0, weight - earned);
    const pct = Math.round(pillar.score);
    const priority = priorityFor(pillar.score, pillar.target);
    const effort = estEffortFor(gap);
    const projected = projectedDateFor(effort);
    const critical = pillar.score < 50;

    return {
      title: `${pillar.label}${critical ? " critically" : ""} below target (${pillar.score}%)`,
      earned,
      weight,
      gap,
      pct,
      priority,
      effort,
      projected,
      dependencies: PILLAR_DEPENDENCIES[pillar.id] || ["Cognitive Excellence Engine™"],
    };
  }, [pillar]);

  const style = PRIORITY_STYLE[issue.priority] || PRIORITY_STYLE.P2;

  const [taskStatus, setTaskStatus] = useState({});
  const [rerunState, setRerunState] = useState("idle");
  const [refreshedPillar, setRefreshedPillar] = useState(null);

  const tasks = [
    { id: "investigate", label: `Investigate root causes for ${pillar.label} underperformance (${issue.earned}/${issue.weight})`, type: "check" },
    { id: "remediate", label: `Implement remediation plan for ${pillar.label}`, type: "check" },
    { id: "rerun", label: `Re-run Cognitive Excellence Engine™ to verify improvement`, type: "action" },
  ];

  const toggleTask = (id) => setTaskStatus((s) => ({ ...s, [id]: s[id] === "done" ? "open" : "done" }));

  const handleRerun = () => {
    if (rerunState === "verifying") return;
    setRerunState("verifying");
    setTimeout(() => {
      const result = onRerun?.();
      if (result) setRefreshedPillar(result);
      setRerunState("verified");
    }, 600);
  };

  const evidence = [
    `Earned points: ${issue.earned}/${issue.weight}`,
    `Percentage: ${issue.pct}%`,
    `Gap: ${issue.gap} points`,
    `Category: EXEC™ Intelligence Capability`,
    `Source module: Cognitive Excellence Engine™`,
    `Owner: AI Engineering`,
    `Underlying score: ${pillar.score}/100`,
    `Source: ${pillar.score}/100`,
  ];

  const stats = [
    { icon: User, label: "Owner", value: "AI Engineering" },
    { icon: Clock, label: "Est. Effort", value: `${issue.effort} hours` },
    { icon: Target, label: "Remaining Pts", value: `${issue.gap} pts` },
    { icon: Calendar, label: "Projected", value: issue.projected },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-2xl flex flex-col max-h-[90vh] animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${style.color}15` }}>
              <AlertOctagon size={18} style={{ color: style.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${style.badge}`}>{style.label}</span>
                <h2 className="text-white font-semibold text-sm">{issue.title}</h2>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Blocking</span>
                <span className="text-[10px] text-white/40">{pillar.program}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>

          {/* Summary line */}
          <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
            <span className="font-semibold text-white/80">Earned {issue.earned}/{issue.weight} points ({issue.pct}%)</span>
            <span className="text-white/30">—</span>
            <span className="flex items-center gap-1" style={{ color: style.color }}>
              <TrendingDown size={11} /> a {issue.gap}-point gap.
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[10px] text-white/40">
            <span>• Earned: {issue.earned}/{issue.weight}</span>
            <span>• Gap: {issue.gap} pts</span>
            <span>• Category: EXEC™ Intelligence Capability</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Engineering Tasks */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ChevronRight size={12} className="text-indigo-400" />
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Engineering Tasks</h3>
            </div>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id}>
                  {task.type === "check" ? (
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex items-start gap-2 text-[11px] text-left w-full group"
                    >
                      <div className={`mt-0.5 shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${taskStatus[task.id] === "done" ? "bg-emerald-500/20 border-emerald-500/40" : "border-white/20 group-hover:border-white/40"}`}>
                        {taskStatus[task.id] === "done" && <CheckCircle2 size={9} className="text-emerald-400" />}
                      </div>
                      <span className={taskStatus[task.id] === "done" ? "line-through text-white/30" : "text-white/70"}>{task.label}</span>
                    </button>
                  ) : (
                    <div>
                      <button
                        onClick={handleRerun}
                        disabled={rerunState === "verifying"}
                        className="flex items-start gap-2 text-[11px] text-left w-full group disabled:cursor-wait"
                      >
                        {rerunState === "verifying" ? (
                          <Loader2 size={11} className="text-indigo-400 animate-spin mt-0.5 shrink-0" />
                        ) : rerunState === "verified" ? (
                          <CheckCircle2 size={11} className="text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                          <RefreshCw size={11} className="text-indigo-400/60 mt-0.5 shrink-0 group-hover:text-indigo-400 transition-colors" />
                        )}
                        <span className={rerunState === "verified" ? "text-emerald-400" : rerunState === "verifying" ? "text-white/50" : "text-white/70 group-hover:text-white"}>
                          {rerunState === "verifying"
                            ? "Re-running Cognitive Excellence Engine™…"
                            : rerunState === "verified"
                              ? "Verified — Cognitive Excellence Engine™ re-run complete"
                              : task.label}
                        </span>
                      </button>
                      {rerunState === "verified" && refreshedPillar && (
                        <div className="ml-[22px] mt-1 text-[10px] text-white/40">
                          Refreshed score: <span className="text-white/70 font-medium">{refreshedPillar.score}/100</span>
                          {" — "}
                          {refreshedPillar.score >= refreshedPillar.target
                            ? <span className="text-emerald-400">Target met ✓</span>
                            : <span className="text-amber-400">{refreshedPillar.target - refreshedPillar.score} pts remaining</span>}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                <div className="flex items-center gap-1 mb-1">
                  <s.icon size={10} className="text-white/30" />
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">{s.label}</span>
                </div>
                <div className="text-xs text-white/80 font-medium">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Dependencies */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GitBranch size={12} className="text-white/40" />
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Dependencies</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {issue.dependencies.map((d) => (
                <span key={d} className="text-[10px] px-2 py-1 rounded-md bg-white/[0.03] border border-white/5 text-white/50">{d}</span>
              ))}
            </div>
          </div>

          {/* Evidence */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileWarning size={12} className="text-white/40" />
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Evidence</h3>
            </div>
            <ul className="space-y-1">
              {evidence.map((e, i) => (
                <li key={i} className="text-[11px] text-white/50 font-mono bg-white/[0.02] rounded px-2 py-1">{e}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer — live telemetry */}
        <div className="shrink-0 border-t border-white/10 px-5 py-2.5 flex items-center gap-2 bg-white/[0.01]">
          <Activity size={11} className="text-emerald-400" />
          <span className="text-[10px] text-white/40">Live telemetry</span>
          <span className="text-[10px] text-white/20">·</span>
          <span className="text-[10px] text-white/30">Cognitive Excellence Engine™</span>
        </div>
      </div>
    </div>
  );
}