import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2, XCircle, AlertTriangle, FileText, ChevronDown,
  ShieldCheck, Award, Gauge, TrendingUp, Brain, Lock, Eye, Server,
} from "lucide-react";
import {
  computeProductionReadinessCertification, computeExecQA,
  computePerformanceScore, computeScalabilityScore, computeReliabilityScore,
  computeAIResilienceScore, computeSecurityScore, computeObservabilityScore,
  computeDisasterRecoveryScore, computeEnterpriseResilienceScore,
} from "@/lib/productionReadinessEngine";
import ScoreDiagnosticsPanel from "./ScoreDiagnosticsPanel";
import LaunchReadinessChecklist from "./LaunchReadinessChecklist";

const SCORE_CARD_ICONS = {
  performance: Gauge, scalability: TrendingUp, reliability: ShieldCheck,
  ai_resilience: Brain, security: Lock, observability: Eye, dr: Server, ers: Award,
};

export default function ProductionReadinessCertification() {
  const [expandedId, setExpandedId] = useState(null);
  const cert = useMemo(() => computeProductionReadinessCertification(), []);
  const execQA = useMemo(() => computeExecQA(), []);
  const isGo = cert.recommendation === "GO";

  const scoreCards = useMemo(() => {
    const ers = computeEnterpriseResilienceScore();
    return [
      ers.subScores.perf,
      ers.subScores.scal,
      ers.subScores.rel,
      ers.subScores.aiRes,
      ers.subScores.sec,
      ers.subScores.obs,
      ers.subScores.dr,
      ers,
    ];
  }, []);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="space-y-4">
      {/* Certification Header */}
      <div className={`rounded-xl border p-6 ${isGo ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
        <div className="flex items-center gap-4">
          {isGo ? <CheckCircle2 size={48} className="text-emerald-400" /> : <XCircle size={48} className="text-red-400" />}
          <div className="flex-1">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">EXECLEAD.AI</div>
            <h2 className="text-xl font-bold text-white">Production Readiness Certification™</h2>
            <div className={`text-3xl font-bold mt-1 ${isGo ? "text-emerald-400" : "text-red-400"}`}>{cert.recommendation}</div>
            {!isGo && cert.conditionalGo && (
              <p className="text-[11px] text-amber-400 mt-1">Conditional — {cert.blockers.length} blockers, all addressable</p>
            )}
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Generated</div>
            <div className="text-[10px] text-white/50">{new Date(cert.computedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Foundation Certification */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Foundation Certification™</h3>
          <span className={`text-[10px] px-2 py-1 rounded border ml-auto ${cert.foundation.certified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {cert.foundation.certified ? "Certified" : "Not Certified"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Stat label="Current Score" value={`${cert.foundation.score}/95`} />
          <Stat label="Checks Completed" value={`${cert.foundation.completedChecks}/${cert.foundation.requiredChecks}`} />
          <Stat label="Remaining Blockers" value={cert.foundation.totalBlockers} accent={cert.foundation.totalBlockers > 0 ? "red" : "emerald"} />
        </div>
        {cert.foundation.blockers.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[9px] text-white/30 uppercase tracking-wider">Blocking Domains (click to resolve)</div>
            {cert.foundation.blockers.map((b, i) => (
              <Link key={i} to={b.deepLink} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-colors group">
                <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
                <span className="text-xs text-white/70 flex-1">{b.area}</span>
                <span className="text-[10px] text-white/40">{b.count} blockers</span>
                {b.critical > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{b.critical} critical</span>}
                <ChevronDown size={12} className="text-white/20 group-hover:text-amber-400 -rotate-90 transition-transform" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Clickable Score Cards with Diagnostics */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Gauge size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Evidence-Based Score Cards</h3>
          <span className="text-[10px] text-white/30 ml-auto">Click any card to view diagnostics</span>
        </div>

        <div className="space-y-2">
          {scoreCards.map((card) => {
            const Icon = SCORE_CARD_ICONS[card.id] || Gauge;
            const isExpanded = expandedId === card.id;
            const color = card.score >= 80 ? "#10b981" : card.score >= 60 ? "#f59e0b" : "#ef4444";
            return (
              <div key={card.id} className={`rounded-lg border transition-all ${isExpanded ? "bg-white/[0.03] border-indigo-500/20" : "bg-white/[0.02] border-white/5"}`}>
                <button
                  onClick={() => toggleExpand(card.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <Icon size={16} className="text-white/40 flex-shrink-0" />
                  <span className="text-sm font-medium text-white/80 flex-1">{card.label}</span>

                  {/* Score Ring */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${card.score}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-sm font-bold text-white w-12 text-right">{card.score}</span>
                    <span className="text-[10px] text-white/30">/ {card.target}</span>
                  </div>

                  {/* Gap */}
                  {card.gap > 0 && (
                    <span className="text-[10px] text-amber-400/70 flex-shrink-0 w-16 text-right">-{card.gap} gap</span>
                  )}
                  {card.gap === 0 && (
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  )}

                  <ChevronDown size={14} className={`text-white/30 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && <ScoreDiagnosticsPanel data={card} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Launch Readiness Checklist */}
      <LaunchReadinessChecklist />

      {/* EXEC™ Q&A */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={14} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">EXEC™ Integration — Generated from Live Metrics</h3>
        </div>
        <div className="space-y-2">
          {execQA.map((qa, i) => (
            <details key={i} className="group rounded-lg bg-white/[0.02] border border-white/5">
              <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer list-none">
                <span className="text-[10px] text-indigo-400 font-bold w-6 flex-shrink-0">Q{i + 1}</span>
                <span className="text-xs font-medium text-white/80 flex-1">{qa.question}</span>
                <ChevronDown size={12} className="text-white/30 group-open:rotate-180 transition-transform flex-shrink-0" />
              </summary>
              <div className="px-4 pb-3 pl-12">
                <p className="text-[11px] text-white/60 leading-relaxed mb-2">{qa.answer}</p>
                <p className="text-[10px] text-indigo-400/70 italic">Evidence: {qa.evidence}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  const color = accent === "red" ? "text-red-400" : accent === "emerald" ? "text-emerald-400" : "text-white";
  return (
    <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="text-[9px] text-white/30 uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}