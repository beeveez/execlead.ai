import React, { useState } from "react";
import { Layers, ChevronRight, Award, TrendingUp, Shield, BookOpen } from "lucide-react";

export default function CapabilityDomains({ domainSummary }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <section id="section-domains" className="scroll-mt-20 space-y-4">
      <div className="flex items-center gap-2">
        <Layers size={16} className="text-indigo-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Six Executive Capability Domains</h2>
      </div>
      <div className="space-y-3">
        {domainSummary.map((domain) => {
          const targetScore = Math.min(domain.score + 20, 100);
          const isExpanded = expanded === domain.id;
          return (
            <div key={domain.id} className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
              <button onClick={() => setExpanded(isExpanded ? null : domain.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${domain.color}15`, border: `1px solid ${domain.color}30` }}>
                  <domain.icon size={18} style={{ color: domain.color }} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{domain.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{ color: domain.proficiencyColor, background: `${domain.proficiencyColor}15` }}>
                      {domain.proficiencyLabel}
                    </span>
                  </div>
                  <div className="text-white/30 text-xs">{domain.competencyCount} competencies · {domain.confidence}% confidence</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-white">{domain.score}</div>
                  <div className="text-[10px] text-white/30">target {targetScore}</div>
                </div>
                <ChevronRight size={14} className={`text-white/30 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
              </button>

              {/* Progress bar */}
              <div className="px-4 pb-2">
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden flex">
                  <div className="h-full rounded-full transition-all" style={{ width: `${domain.score}%`, background: domain.color }} />
                  <div className="h-full rounded-full transition-all opacity-30" style={{ width: `${targetScore - domain.score}%`, background: domain.color }} />
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-white/40 text-xs">{domain.description}</p>
                  {domain.competencies.length > 0 ? (
                    <div className="space-y-1.5">
                      {domain.competencies.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02]">
                          <Award size={11} className="text-white/30 flex-shrink-0" />
                          <span className="text-xs text-white/70 flex-1 truncate">{c.competency_name}</span>
                          {c.verified && <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Verified</span>}
                          {c.growth_trend === "up" && <TrendingUp size={11} className="text-emerald-400" />}
                          {c.evidence && <span className="text-[9px] text-white/30 truncate max-w-[100px]">{c.evidence}</span>}
                          <span className="text-xs font-semibold text-white/80 w-8 text-right">{c.competency_score || 0}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-xs text-center py-2">No competencies in this domain yet.</p>
                  )}
                  <div className="flex items-center gap-3 pt-1 text-[10px] text-white/30">
                    <span className="flex items-center gap-1"><Shield size={10} /> {domain.confidence}% confidence</span>
                    <span className="flex items-center gap-1"><BookOpen size={10} /> Evidence-based</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}