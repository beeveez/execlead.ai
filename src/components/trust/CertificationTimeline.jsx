import React from "react";
import { ArrowDown } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { CERTIFICATION_TIMELINE } from "@/lib/trustCenterData";

export default function CertificationTimeline() {
  return (
    <div className="space-y-2">
      {CERTIFICATION_TIMELINE.map((item, i) => (
        <React.Fragment key={item.name}>
          <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-indigo-400">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-bold text-white">{item.name}</span>
                <StatusBadge status={item.status} />
                <span className="text-[9px] text-white/30 uppercase tracking-wider ml-auto">{item.phase}</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">{item.detail}</p>
            </div>
          </div>
          {i < CERTIFICATION_TIMELINE.length - 1 && (
            <div className="flex justify-center py-0.5">
              <ArrowDown size={14} className="text-white/15" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}