import React, { useState } from "react";
import { GitBranch, FilePlus, ShieldCheck, Gauge, Brain, Layers } from "lucide-react";
import { getProvenanceTimeline } from "@/lib/readinessEvidenceProvenance";

const STEP_ICON = {
  "Evidence Created": FilePlus,
  "Validation Completed": ShieldCheck,
  "Readiness Updated": Gauge,
  "Confidence Updated": Gauge,
  "Competency Updated": Layers,
  "AI Evaluation": Brain,
};

/**
 * EvidenceProvenanceTimeline™ — inspect every step from evidence creation
 * to readiness update to AI evaluation. Users can trace exactly why a
 * score changed and through which validation.
 */
export default function EvidenceProvenanceTimeline({ limit = 60 }) {
  const [steps] = useState(() => getProvenanceTimeline(limit));

  if (!steps || steps.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
        <GitBranch size={28} className="mx-auto text-white/10 mb-3" />
        <p className="text-white/40 text-sm">No provenance events yet.</p>
        <p className="text-white/30 text-xs mt-1">Evidence provenance will appear here as evidence is created and validated.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <GitBranch size={16} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Evidence Provenance Timeline™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{steps.length} events · fully traceable</span>
      </div>
      <p className="text-white/40 text-[11px] mb-4">Every step from creation to recommendation — inspectable, auditable, reproducible.</p>

      <div className="relative max-h-[420px] overflow-y-auto pr-1">
        <div className="absolute left-[14px] top-0 bottom-0 w-px bg-white/5" />
        <div className="space-y-2.5">
          {steps.map((s) => {
            const Icon = STEP_ICON[s.step] || FilePlus;
            return (
              <div key={s.id} className="relative flex items-start gap-3 pl-1">
                <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-[#0a0a0f] border border-white/10">
                  <Icon size={11} className="text-indigo-300" />
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-white/80 font-medium">{s.step}</span>
                    <span className="text-[9px] font-mono text-indigo-400/60">{s.evidenceId}</span>
                  </div>
                  <div className="text-[10px] text-white/50 mt-0.5">{s.detail}</div>
                  <div className="text-[9px] text-white/30 mt-0.5">{new Date(s.timestamp).toLocaleString()} · {s.module}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}