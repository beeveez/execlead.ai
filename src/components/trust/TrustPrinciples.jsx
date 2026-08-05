import React from "react";
import { Heart, CheckCircle2 } from "lucide-react";
import { TRUST_PRINCIPLES } from "@/lib/trustCenterData";

// Trust Principles — the platform philosophy behind every assurance statement.
export default function TrustPrinciples() {
  return (
    <div className="space-y-3">
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 flex items-start gap-3">
        <Heart size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          EXECLEAD.AI earns trust through evidence, transparency, and responsible governance —
          not by exposing internal implementation. These principles guide every public assurance statement.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TRUST_PRINCIPLES.map((p) => (
          <div key={p.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-white/90">{p.name}</h3>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">{p.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}