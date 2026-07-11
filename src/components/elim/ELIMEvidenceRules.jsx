import React from "react";
import { EVIDENCE_SOURCES, EVIDENCE_CATEGORIES, RESEARCH_FOUNDATION, getFrameworkById } from "@/lib/elimFrameworks";
import { FlaskConical, Scale } from "lucide-react";

export default function ELIMEvidenceRules() {
  return (
    <div className="space-y-6">
      {/* Evidence Engine */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-1">Evidence Engine</h3>
        <p className="text-white/30 text-xs mb-3">Every intelligence score is evidence-based. Confidence increases with evidence quality.</p>

        {/* By category */}
        {EVIDENCE_CATEGORIES.map((cat) => {
          const sources = EVIDENCE_SOURCES.filter((s) => s.category === cat.id);
          if (sources.length === 0) return null;
          return (
            <div key={cat.id} className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs font-medium text-white/60">{cat.label}</span>
                <span className="text-[9px] text-white/20">Confidence cap: {cat.confidenceCap}%</span>
              </div>
              <div className="flex flex-wrap gap-1.5 ml-4">
                {sources.map((s) => (
                  <span key={s.id} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] bg-white/[0.02] border border-white/5 text-white/50">
                    {s.label}
                    <span className="text-white/20">·</span>
                    <span className="text-white/30">w{s.weight}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Research Foundation */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical size={14} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Research Foundation</h3>
        </div>
        <p className="text-white/30 text-xs mb-3">The theoretical basis of every framework — supporting credibility and enterprise trust.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {RESEARCH_FOUNDATION.map((r) => (
            <div key={r.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-1">
                <Scale size={12} className="text-white/30" />
                <span className="text-white/70 text-sm font-medium">{r.label}</span>
              </div>
              <p className="text-white/30 text-xs mb-2">{r.description}</p>
              <div className="flex gap-1">
                {r.frameworks.map((fid) => {
                  const fw = getFrameworkById(fid);
                  return <span key={fid} className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${fw?.color}15`, color: fw?.color }}>{fw?.shortName}</span>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}