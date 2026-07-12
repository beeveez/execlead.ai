import React from "react";
import { ChevronRight, FileText, Link2 } from "lucide-react";
import { EXEC_TRUST_QA_ENHANCED } from "@/lib/trustCenterExtendedData";

export default function ExecTrustQA() {
  return (
    <div className="space-y-3">
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
        <p className="text-xs text-white/50 leading-relaxed">
          EXEC™ answers trust questions truthfully, distinguishing between <strong className="text-white/70">Implemented</strong>,
          <strong className="text-white/70"> Compliant</strong>, <strong className="text-white/70">Certified</strong>, and
          <strong className="text-white/70"> Planned</strong>. Every response references live platform metadata and the Trust Center.
        </p>
      </div>
      {EXEC_TRUST_QA_ENHANCED.map((qa, i) => (
        <details key={i} className="group rounded-xl bg-white/[0.02] border border-white/5">
          <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer list-none">
            <span className="text-[10px] text-indigo-400 font-bold w-6 flex-shrink-0">Q{i + 1}</span>
            <span className="text-xs font-medium text-white/80 flex-1">{qa.question}</span>
            <ChevronRight size={14} className="text-white/30 group-open:rotate-90 transition-transform flex-shrink-0" />
          </summary>
          <div className="px-4 pb-4 pl-12">
            <p className="text-[11px] text-white/60 leading-relaxed mb-2">{qa.answer}</p>
            <p className="text-[10px] text-indigo-400/70 italic mb-2">{qa.distinction}</p>
            {qa.references && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-white/5">
                <Link2 size={11} className="text-white/30" />
                <span className="text-[9px] text-white/30 uppercase tracking-wider">References:</span>
                {qa.references.map((ref) => (
                  <span key={ref} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400/80 flex items-center gap-1">
                    <FileText size={8} /> {ref}
                  </span>
                ))}
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}