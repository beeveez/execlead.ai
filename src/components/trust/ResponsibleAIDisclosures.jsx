import React from "react";
import { Brain, AlertTriangle, CheckCircle2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { RESPONSIBLE_AI_DISCLOSURES } from "@/lib/trustCenterExtendedData";

export default function ResponsibleAIDisclosures() {
  return (
    <div className="space-y-3">
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 flex items-start gap-3">
        <Brain size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          EXECLEAD.AI is committed to responsible AI. Our AI systems — EXEC™, Leadership DNA™, Executive Readiness —
          are designed with transparency, fairness, and human oversight. These disclosures are expanded below.
        </p>
      </div>
      {RESPONSIBLE_AI_DISCLOSURES.map((item) => (
        <div key={item.topic} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-bold text-white">{item.topic}</span>
            <StatusBadge status={item.status} size="md" />
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">{item.detail}</p>
        </div>
      ))}
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-400/80 leading-relaxed">
          AI assessments are advisory only. They do not guarantee career outcomes. Always exercise human judgment for critical decisions.
        </p>
      </div>
    </div>
  );
}