import React from 'react';
import { AlertTriangle, Shield, Zap, TrendingUp, Award, Users, GitBranch, Gauge } from 'lucide-react';

const IMPACT_CONFIG = {
  security: { icon: Shield, label: 'Security Impact' },
  performance: { icon: Zap, label: 'Performance Impact' },
  commercial: { icon: TrendingUp, label: 'Commercial Impact' },
  executive: { icon: Award, label: 'Executive Impact' },
  certification: { icon: Shield, label: 'Certification Impact' },
  userExperience: { icon: Users, label: 'User Experience Impact' },
  dependency: { icon: GitBranch, label: 'Dependency Impact' },
};

export default function ImpactAnalysisPanel({ impact, blocker }) {
  if (!impact) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
        <AlertTriangle className="mx-auto text-white/20 mb-3" size={32} />
        <p className="text-white/40 text-sm">Generate a patch to view the Impact Analysis™.</p>
      </div>
    );
  }

  const levels = { critical: 4, high: 3, medium: 2, low: 1 };
  const overallScore = levels[impact.overallRisk] || 1;

  return (
    <div className="space-y-4">
      {/* Overall Risk */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-white/40" />
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Overall Risk</h4>
          </div>
          <RiskBadge level={impact.overallRisk} />
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((lvl) => (
            <div key={lvl} className={`h-2 rounded-full ${lvl <= overallScore ? riskBarColor(impact.overallRisk) : 'bg-white/5'}`} />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-white/30 mt-1">
          <span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
        </div>
      </div>

      {/* Individual Impacts */}
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(IMPACT_CONFIG).map(([key, cfg]) => {
          const data = impact[key];
          if (!data) return null;
          return <ImpactRow key={key} icon={cfg.icon} label={cfg.label} level={data.level} description={data.description} />;
        })}
      </div>
    </div>
  );
}

function ImpactRow({ icon: Icon, label, level, description }) {
  const colors = {
    critical: { text: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/10', bar: 'bg-red-500' },
    high: { text: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/10', bar: 'bg-amber-500' },
    medium: { text: 'text-yellow-400', bg: 'bg-yellow-500/5', border: 'border-yellow-500/10', bar: 'bg-yellow-500' },
    low: { text: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10', bar: 'bg-emerald-500' },
  };
  const c = colors[level] || colors.low;
  const levelNum = { critical: 4, high: 3, medium: 2, low: 1 }[level] || 1;

  return (
    <div className={`rounded-xl p-3 border ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon size={12} className={c.text} />
          <span className="text-xs font-medium text-white/70">{label}</span>
        </div>
        <span className={`text-[10px] font-bold uppercase ${c.text}`}>{level}</span>
      </div>
      <p className="text-xs text-white/50 mb-2">{description}</p>
      <div className="grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((l) => (
          <div key={l} className={`h-1 rounded-full ${l <= levelNum ? c.bar : 'bg-white/5'}`} />
        ))}
      </div>
    </div>
  );
}

function RiskBadge({ level }) {
  const colors = { critical: 'text-red-400 bg-red-500/10 border-red-500/20', high: 'text-amber-400 bg-amber-500/10 border-amber-500/20', medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  return <span className={`text-sm font-bold px-4 py-1.5 rounded-full border uppercase ${colors[level] || colors.medium}`}>{level} Risk</span>;
}

function riskBarColor(level) {
  const map = { critical: 'bg-red-500', high: 'bg-amber-500', medium: 'bg-yellow-500', low: 'bg-emerald-500' };
  return map[level] || 'bg-yellow-500';
}