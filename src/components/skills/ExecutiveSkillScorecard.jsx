import React, { useMemo } from "react";
import { Code, Crown, Target, Settings, Shield, DollarSign, MessageSquare, Users, RefreshCw, Lightbulb, AlertTriangle, Heart } from "lucide-react";
import { aggregateDomainCoverage, EXECUTIVE_DOMAINS } from "@/lib/skillsIntelligenceEngine";

const ICON_MAP = { Code, Crown, Target, Settings, Shield, DollarSign, MessageSquare, Users, RefreshCw, Lightbulb, AlertTriangle, Heart };

const COLOR_CLASSES = {
  indigo: "text-indigo-400 bg-indigo-500/10",
  amber: "text-amber-400 bg-amber-500/10",
  purple: "text-purple-400 bg-purple-500/10",
  blue: "text-blue-400 bg-blue-500/10",
  emerald: "text-emerald-400 bg-emerald-500/10",
  green: "text-green-400 bg-green-500/10",
  cyan: "text-cyan-400 bg-cyan-500/10",
  rose: "text-rose-400 bg-rose-500/10",
  orange: "text-orange-400 bg-orange-500/10",
  yellow: "text-yellow-400 bg-yellow-500/10",
  red: "text-red-400 bg-red-500/10",
  pink: "text-pink-400 bg-pink-500/10",
};

export default function ExecutiveSkillScorecard({ skills }) {
  const domains = useMemo(() => aggregateDomainCoverage(skills), [skills]);
  const domainList = EXECUTIVE_DOMAINS.map(d => domains[d.id]);
  const overall = domainList.length > 0
    ? Math.round(domainList.reduce((s, d) => s + d.coverage, 0) / domainList.length)
    : 0;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white/80">Executive Skill Scorecard™</h3>
          <p className="text-white/30 text-xs mt-0.5">Capability domain coverage across your skill portfolio</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{overall}<span className="text-sm text-white/30">%</span></div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Overall Coverage</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {domainList.map(domain => {
          const Icon = ICON_MAP[domain.icon] || Code;
          const colorClass = COLOR_CLASSES[domain.color] || COLOR_CLASSES.indigo;
          return (
            <div key={domain.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <Icon size={14} />
                </div>
                <span className="text-xs font-medium text-white/70 truncate">{domain.label}</span>
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-lg font-bold text-white">{domain.coverage}<span className="text-xs text-white/30">%</span></span>
                <span className="text-[10px] text-white/30 mb-0.5">{domain.skills.length} skill{domain.skills.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-current ${colorClass.split(" ")[0]}`} style={{ width: `${domain.coverage}%`, opacity: 0.6 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}