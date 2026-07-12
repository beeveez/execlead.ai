import React, { useMemo } from "react";
import { CheckCircle2, XCircle, AlertTriangle, FileText, ChevronRight } from "lucide-react";
import { computeProductionReadinessCertification, EXEC_PRODUCTION_QA } from "@/lib/performanceResilienceEngine";

export default function ProductionReadinessCertification() {
  const cert = useMemo(() => computeProductionReadinessCertification(), []);
  const isGo = cert.recommendation === "GO";

  const scoreRows = [
    { label: "Foundation Certification™", value: cert.foundationCertified ? "Certified" : "Not Certified", score: cert.foundationScore, threshold: 95, boolean: cert.foundationCertified },
    { label: "Platform Intelligence Quotient™", value: cert.piqMaturity, score: cert.piqScore, threshold: 96 },
    { label: "Performance Score", value: `${cert.performanceScore}/100`, score: cert.performanceScore, threshold: 70 },
    { label: "Scalability Score", value: `${cert.scalabilityScore}/100`, score: cert.scalabilityScore, threshold: 80 },
    { label: "Reliability Score", value: `${cert.reliabilityScore}/100`, score: cert.reliabilityScore, threshold: 80 },
    { label: "Security Score", value: `${cert.securityScore}/100`, score: cert.securityScore, threshold: 80 },
    { label: "AI Resilience Score", value: `${cert.aiResilienceScore}/100`, score: cert.aiResilienceScore, threshold: 80 },
    { label: "Enterprise Resilience Score™", value: `${cert.enterpriseResilienceScore}/100 (${cert.ersMaturity.short})`, score: cert.enterpriseResilienceScore, threshold: 80 },
    { label: "AI Capacity", value: cert.aiCapacity, score: null, threshold: null },
  ];

  return (
    <div className="space-y-4">
      {/* Certification Header */}
      <div className={`rounded-xl border p-6 ${isGo ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
        <div className="flex items-center gap-4">
          {isGo ? <CheckCircle2 size={48} className="text-emerald-400" /> : <XCircle size={48} className="text-red-400" />}
          <div className="flex-1">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">EXECLEAD.AI</div>
            <h2 className="text-xl font-bold text-white">Production Readiness Certification™</h2>
            <div className={`text-3xl font-bold mt-1 ${isGo ? "text-emerald-400" : "text-red-400"}`}>
              {cert.recommendation}
            </div>
            {!isGo && cert.conditionalGo && (
              <p className="text-[11px] text-amber-400 mt-1">Conditional — {cert.blockers.length} blockers, all addressable before launch</p>
            )}
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Generated</div>
            <div className="text-[10px] text-white/50">{new Date(cert.computedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Score Matrix */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Certification Score Matrix</h3>
        <div className="space-y-1">
          {scoreRows.map((row) => {
            const passed = row.boolean !== undefined ? row.boolean : row.score >= row.threshold;
            return (
              <div key={row.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02]">
                {passed ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" /> : <XCircle size={14} className="text-red-400 flex-shrink-0" />}
                <span className="text-xs text-white/70 flex-1">{row.label}</span>
                <span className="text-[11px] text-white/60">{row.value}</span>
                {row.score !== null && row.threshold !== null && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${passed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {row.score}/{row.threshold}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Blockers */}
      {cert.blockers.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">Blockers ({cert.blockers.length})</h3>
          </div>
          <div className="space-y-2">
            {cert.blockers.map((b, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-white/[0.02]">
                <span className="text-[10px] text-white/30 mt-0.5">{i + 1}.</span>
                <div>
                  <div className="text-xs font-medium text-white/80">{b.area}</div>
                  <div className="text-[11px] text-white/50">{b.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXEC™ Integration Q&A */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={14} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">EXEC™ Integration — Evidence-Backed Q&A</h3>
        </div>
        <div className="space-y-2">
          {EXEC_PRODUCTION_QA.map((qa, i) => (
            <details key={i} className="group rounded-lg bg-white/[0.02] border border-white/5">
              <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer list-none">
                <span className="text-[10px] text-indigo-400 font-bold w-6 flex-shrink-0">Q{i + 1}</span>
                <span className="text-xs font-medium text-white/80 flex-1">{qa.question}</span>
                <ChevronRight size={12} className="text-white/30 group-open:rotate-90 transition-transform flex-shrink-0" />
              </summary>
              <div className="px-4 pb-3 pl-12">
                <p className="text-[11px] text-white/60 leading-relaxed mb-2">{qa.answer}</p>
                <p className="text-[10px] text-white/30 italic">Evidence: {qa.evidence}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}