import React from 'react';
import { TrendingUp, CheckCircle2, Lock } from 'lucide-react';
import { TRUST_CONTRIBUTIONS, calculateTrustScore, calculateTrustLevel, TRUST_LEVELS } from '@/lib/trustEngine';

const ICON_MAP = {
  Mail: 'Mail', Phone: 'Phone', ShieldCheck: 'ShieldCheck', Briefcase: 'Briefcase',
  Building2: 'Building2', GraduationCap: 'GraduationCap', Award: 'Award',
  FolderCheck: 'FolderCheck', FileText: 'FileText', Dna: 'Dna', Globe: 'Globe',
};

export default function ExecutiveTrustBreakdown({ verification }) {
  const score = calculateTrustScore(verification);
  const level = calculateTrustLevel(verification);
  const levelMeta = TRUST_LEVELS.find(l => l.level === level);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-violet-400" />
        <span className="text-sm font-bold text-white">Executive Trust™ Breakdown</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-xs text-white/30">/ 100</span>
          {levelMeta && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: levelMeta.color + '15', color: levelMeta.color }}>
              Level {level} · {levelMeta.name}
            </span>
          )}
        </div>
      </div>

      {/* Score Bar */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-3">
        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, background: `linear-gradient(90deg, #6366f1, #a855f7)` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/30 mt-1.5">
          <span>Level 0</span>
          <span>Level 5 · Verified Executive</span>
        </div>
      </div>

      {/* Contribution Weights */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Contribution Weights</div>
        <div className="space-y-1.5">
          {TRUST_CONTRIBUTIONS.map((contrib) => {
            const verified = verification?.[contrib.key];
            const pct = (contrib.weight / 100) * 100;
            return (
              <div key={contrib.key} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-48 flex-shrink-0">
                  {verified ? <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" /> : <Lock size={12} className="text-white/20 flex-shrink-0" />}
                  <span className={`text-xs ${verified ? 'text-white/80' : 'text-white/40'}`}>{contrib.label}</span>
                </div>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${verified ? '' : 'opacity-30'}`}
                    style={{ width: `${pct}%`, backgroundColor: verified ? '#10b981' : '#3b82f6' }}
                  />
                </div>
                <span className={`text-[11px] font-medium flex-shrink-0 w-10 text-right ${verified ? 'text-emerald-400' : 'text-white/30'}`}>
                  +{contrib.weight}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}