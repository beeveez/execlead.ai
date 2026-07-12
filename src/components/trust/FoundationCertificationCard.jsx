import React from "react";
import { Award, Info, CheckCircle2 } from "lucide-react";
import { FOUNDATION_CERTIFICATION_CLARIFICATION } from "@/lib/trustCenterExtendedData";

export default function FoundationCertificationCard() {
  const cert = FOUNDATION_CERTIFICATION_CLARIFICATION;
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Award size={18} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">{cert.name}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-400 font-medium">{cert.status}</span>
          </div>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">{cert.description}</p>
      </div>
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
        <Info size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-400/80 leading-relaxed font-medium">{cert.distinction}</p>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-3">7 Threshold Metrics</div>
        <div className="space-y-2">
          {cert.thresholds.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-white/60">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}