import React from "react";
import { Link } from "react-router-dom";
import { Fingerprint, ArrowRight } from "lucide-react";

const DNA_DIMENSIONS = [
  { id: "style", label: "Leadership Style", description: "How you lead and inspire others" },
  { id: "decision", label: "Decision Style", description: "How you analyze and decide" },
  { id: "communication", label: "Communication Style", description: "How you convey vision and direction" },
  { id: "presence", label: "Executive Presence", description: "How you command rooms and trust" },
  { id: "strategic", label: "Strategic Thinking", description: "How you envision the future" },
  { id: "acumen", label: "Business Acumen", description: "How you drive commercial outcomes" },
];

const DOMAIN_DNA_MAP = {
  lead_yourself: ["style", "presence"],
  lead_people: ["style", "communication"],
  lead_business: ["strategic", "acumen"],
  lead_technology: ["strategic", "decision"],
  lead_change: ["decision", "communication"],
  lead_legacy: ["presence", "strategic"],
};

export default function LeadershipDNARelationship({ domainSummary }) {
  return (
    <section id="section-dna" className="scroll-mt-20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fingerprint size={16} className="text-indigo-400" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Leadership DNA™ Relationship</h2>
        </div>
        <Link to="/leadership-dna" className="flex items-center gap-1 text-xs text-indigo-400 hover:gap-2 transition-all">
          Take DNA Assessment <ArrowRight size={12} />
        </Link>
      </div>
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 overflow-x-auto">
        <p className="text-white/40 text-xs mb-4">How each competency domain influences your Leadership DNA™ dimensions.</p>
        <div className="min-w-[500px]">
          {/* Header row */}
          <div className="grid grid-cols-[160px_repeat(6,1fr)] gap-1 mb-1">
            <div></div>
            {DNA_DIMENSIONS.map((d) => (
              <div key={d.id} className="text-center text-[10px] text-white/40 font-medium px-1 py-2 leading-tight">
                {d.label}
              </div>
            ))}
          </div>
          {/* Domain rows */}
          {domainSummary.map((domain) => (
            <div key={domain.id} className="grid grid-cols-[160px_repeat(6,1fr)] gap-1 mb-1 items-center">
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: domain.color }} />
                <span className="text-xs text-white/70 truncate">{domain.label}</span>
              </div>
              {DNA_DIMENSIONS.map((dim) => {
                const influences = DOMAIN_DNA_MAP[domain.id]?.includes(dim.id);
                const intensity = influences ? Math.max(0.3, domain.score / 100) : 0;
                return (
                  <div key={dim.id} className="flex items-center justify-center py-1.5">
                    <div className="w-full h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all"
                      style={{
                        background: influences ? `${domain.color}${Math.round(intensity * 60).toString(16).padStart(2, "0")}` : "rgba(255,255,255,0.02)",
                        color: influences ? "#fff" : "rgba(255,255,255,0.15)",
                      }}>
                      {influences ? domain.score : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-[10px] text-white/30">
          <span>Cell values = domain score where the domain influences that DNA dimension</span>
          <span>Higher scores = stronger influence</span>
        </div>
      </div>
    </section>
  );
}