import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Wrench, Zap, FileText, ArrowRight, Activity, Brain, Target } from "lucide-react";

const COMPLEXITY_STYLE = { Low: "text-emerald-400", Medium: "text-amber-400", High: "text-red-400" };
const RISK_STYLE = { Low: "text-emerald-400", Medium: "text-amber-400", High: "text-red-400" };

export default function FixTab({ bundle, onClose, onFixApplied }) {
  const [appliedFixes, setAppliedFixes] = useState(new Set());
  const [applying, setApplying] = useState(null);

  const applyAutoFix = (fix) => {
    setApplying(fix.id);
    setTimeout(() => {
      setAppliedFixes((prev) => new Set(prev).add(fix.id));
      setApplying(null);
      onFixApplied?.(fix);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Root Cause */}
      <div>
        <div className="flex items-center gap-2 mb-3"><Activity size={14} className="text-amber-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Root Cause Analysis</h3></div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <p className="text-white/70 text-xs mb-2">{bundle.label} is at <span className="text-amber-400 font-medium">{bundle.summary.overallScore}</span> — reduced from target <span className="text-white font-medium">{bundle.summary.target}</span> by <span className="text-red-400 font-medium">{bundle.summary.target - bundle.summary.overallScore}</span> point(s).</p>
          <p className="text-white/50 text-xs mb-2">The score is reduced because:</p>
          <ul className="space-y-1.5">
            {bundle.issues.map((iss, i) => (
              <li key={iss.id} className="flex items-start gap-2 text-xs text-white/60">
                <span className="text-amber-400 mt-0.5">{i + 1}.</span>
                <span><span className="text-white/80">{iss.title}</span> — {iss.estimatedImprovement} ({iss.component})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Explanation */}
      <div>
        <div className="flex items-center gap-2 mb-3"><Brain size={14} className="text-indigo-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">AI Explanation</h3></div>
        <div className="space-y-2">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3"><p className="text-white/30 text-[10px] uppercase mb-1">Simple</p><p className="text-white/70 text-xs">{bundle.aiExplanation.simple}</p></div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3"><p className="text-white/30 text-[10px] uppercase mb-1">Technical</p><p className="text-white/60 text-xs">{bundle.aiExplanation.technical}</p></div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3"><p className="text-white/30 text-[10px] uppercase mb-1">Executive Summary</p><p className="text-white/70 text-xs">{bundle.aiExplanation.executiveSummary}</p></div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3"><p className="text-white/30 text-[10px] uppercase mb-1">Business Value</p><p className="text-white/60 text-xs">{bundle.aiExplanation.businessValue}</p></div>
        </div>
      </div>

      {/* Recommended Fixes */}
      <div>
        <div className="flex items-center gap-2 mb-3"><Sparkles size={14} className="text-amber-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Recommended Fixes</h3></div>
        <div className="space-y-3">
          {bundle.fixes.map((fix) => {
            const applied = appliedFixes.has(fix.id);
            const isApplying = applying === fix.id;
            return (
              <div key={fix.id} className={`bg-white/[0.02] border rounded-lg p-4 ${applied ? "border-emerald-500/30" : "border-white/5"}`}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-bold shrink-0">{fix.priority}</span>
                  <span className="text-white/80 text-sm font-medium flex-1">{fix.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${fix.fixType === "auto" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>{fix.fixType === "auto" ? "Auto Fix" : "Manual"}</span>
                </div>
                <p className="text-white/50 text-xs mb-3">{fix.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px] mb-3">
                  <span><span className="text-white/30">Expected:</span> <span className="text-emerald-400">{fix.expectedImprovement}</span></span>
                  <span><span className="text-white/30">Time:</span> <span className="text-white/60">{fix.estimatedTime}</span></span>
                  <span><span className="text-white/30">Complexity:</span> <span className={COMPLEXITY_STYLE[fix.complexity]}>{fix.complexity}</span></span>
                  <span><span className="text-white/30">Risk:</span> <span className={RISK_STYLE[fix.risk]}>{fix.risk}</span></span>
                  <span><span className="text-white/30">Dependencies:</span> <span className="text-white/60">{fix.dependencies}</span></span>
                  <span><span className="text-white/30">Owner:</span> <span className="text-white/60">{fix.owner}</span></span>
                </div>
                {fix.fixType === "auto" ? (
                  <button onClick={() => applyAutoFix(fix)} disabled={applied || isApplying} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-medium transition-colors disabled:opacity-50">
                    <Zap size={12} className={isApplying ? "animate-pulse" : ""} /> {applied ? "Applied ✓" : isApplying ? "Running remediation…" : "Auto Fix"}
                  </button>
                ) : (
                  <div className="space-y-1">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider">Manual Steps</p>
                    {fix.steps.map((st, i) => <p key={i} className="text-white/60 text-xs">Step {i + 1}: {st}</p>)}
                    <Link to={fix.to} onClick={onClose} className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-300 text-xs font-medium transition-colors">
                      <Wrench size={12} /> Open Module <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Impact Analysis */}
      <div>
        <div className="flex items-center gap-2 mb-3"><Target size={14} className="text-emerald-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Impact Analysis</h3></div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><p className="text-white/30 text-[10px] uppercase">Current</p><p className="text-white font-bold">{bundle.impactAnalysis.currentScore}</p></div>
          <div><p className="text-white/30 text-[10px] uppercase">Target</p><p className="text-white font-bold">{bundle.impactAnalysis.targetScore}</p></div>
          <div><p className="text-white/30 text-[10px] uppercase">Improvement</p><p className="text-emerald-400 font-bold">+{bundle.impactAnalysis.improvement}</p></div>
          <div><p className="text-white/30 text-[10px] uppercase">Business Value</p><p className="text-white/60 text-xs">{bundle.impactAnalysis.businessValue}</p></div>
          <div><p className="text-white/30 text-[10px] uppercase">Risk Reduction</p><p className="text-white/60 text-xs">{bundle.impactAnalysis.riskReduction}</p></div>
          <div><p className="text-white/30 text-[10px] uppercase">Governance</p><p className="text-white/60 text-xs">{bundle.impactAnalysis.governanceImprovement}</p></div>
        </div>
      </div>
    </div>
  );
}