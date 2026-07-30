import React, { useState } from "react";
import { HelpCircle, Award, ShieldCheck, Brain, AlertTriangle, Download, ChevronDown, ChevronRight } from "lucide-react";
import { explainMyScore, exportAuditLedger, getActiveScoringModel } from "@/lib/readinessEvidenceProvenance";

/**
 * ExplainMyScorePanel — Readiness Explainability™.
 * Answers "Why does this score exist?" with Evidence Used, Source,
 * Contribution, Confidence, Validation Method, Scoring Model, Timestamp.
 */
export default function ExplainMyScorePanel() {
  const [open, setOpen] = useState(true);
  const [explanation] = useState(() => explainMyScore());

  if (!explanation) return null;
  const activeModel = getActiveScoringModel();
  const e = explanation;

  function downloadExport(fmt) {
    const data = exportAuditLedger(fmt);
    const blob = new Blob([data], { type: fmt === "csv" ? "text/csv" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `executive-readiness-evidence-audit.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full text-left">
        {open ? <ChevronDown size={16} className="text-indigo-400" /> : <ChevronRight size={16} className="text-indigo-400" />}
        <HelpCircle size={16} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Explain My Score</h3>
        <span className="text-[10px] text-white/30 ml-auto">Readiness Explainability™ · Evidence Provenance Standard™</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Scoring model */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Award size={13} className="text-amber-400" />
              <span className="text-[11px] text-white/70 font-medium">Scoring Model</span>
              <span className="text-[10px] text-white/30 ml-auto">never recalculates history</span>
            </div>
            <div className="text-sm text-white font-medium">{activeModel.id}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{e.scoringModel.description}</div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {Object.entries(e.scoringModel.weights).map(([k, w]) => (
                <span key={k} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/5">{k}: {Math.round(w * 100)}%</span>
              ))}
            </div>
          </div>

          {/* Evidence used */}
          <div className="grid grid-cols-4 gap-2">
            <Stat label="Exposure" value={e.evidenceByLevel.exposure} color="#64748b" />
            <Stat label="Participation" value={e.evidenceByLevel.participation} color="#0ea5e9" />
            <Stat label="Demonstrated" value={e.evidenceByLevel.demonstrated} color="#6366f1" />
            <Stat label="Mastery" value={e.evidenceByLevel.mastery} color="#f59e0b" />
          </div>

          {/* Top competency */}
          {e.topCompetency && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span className="text-[11px] text-white/70 font-medium">Strongest evidence</span>
              </div>
              <div className="text-sm text-white">{e.topCompetency.competency}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{e.topCompetency.evidenceCount} evidence items · +{e.topCompetency.contribution} readiness contribution</div>
            </div>
          )}

          {/* AI transparency */}
          {e.aiEvidenceCount > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Brain size={13} className="text-violet-400" />
                <span className="text-[11px] text-white/70 font-medium">AI Transparency</span>
                <span className="text-[10px] text-white/30 ml-auto">{e.aiEvidenceCount} AI-evaluated items</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {e.aiModels.map((m) => (
                  <span key={m} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">{m}</span>
                ))}
                <span className="text-[10px] text-white/40">AI is never an anonymous authority</span>
              </div>
            </div>
          )}

          {/* Low confidence */}
          {e.lowConfidenceEvidence.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle size={13} className="text-rose-400" />
                <span className="text-[11px] text-white/70 font-medium">Low-confidence evidence</span>
              </div>
              <div className="space-y-1">
                {e.lowConfidenceEvidence.slice(0, 3).map((ev) => (
                  <div key={ev.evidenceId} className="flex items-center justify-between text-[10px]">
                    <span className="text-white/60">{ev.module} · {ev.competency}</span>
                    <span className="text-rose-400/70">{Math.round((ev.confidence || 0) * 100)}% · {ev.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competency explanations (collapsible list) */}
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Evidence by competency</div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {e.competencyExplanations.map((c) => (
                <div key={c.competency} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] text-white/70">{c.competency}</span>
                  <span className="text-[10px] text-white/40">{c.evidenceCount} items · +{Math.round(c.readinessContribution * 10) / 10}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise audit export */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/5">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Enterprise Audit Export</span>
            <div className="flex gap-1.5 ml-auto">
              <button onClick={() => downloadExport("json")} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 text-[10px] border border-white/10 transition-colors">
                <Download size={11} /> JSON
              </button>
              <button onClick={() => downloadExport("csv")} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 text-[10px] border border-white/10 transition-colors">
                <Download size={11} /> CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center">
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}