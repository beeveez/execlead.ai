import React from 'react';
import { ShieldCheck, TrendingUp, AlertCircle, Type, ArrowLeftRight, Languages } from 'lucide-react';

function HealthFactor({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
      <Icon size={14} style={{ color }} className="mx-auto" />
      <div className="text-lg font-bold text-white mt-1">{value}%</div>
      <div className="text-[10px] text-white/40">{label}</div>
    </div>
  );
}

export default function LocalizationHealthSection({ health }) {
  const grade = health.healthScore >= 95 ? 'A+' : health.healthScore >= 85 ? 'A' : health.healthScore >= 75 ? 'B' : health.healthScore >= 60 ? 'C' : 'D';
  const gradeColor = health.healthScore >= 85 ? '#10b981' : health.healthScore >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-white">Localization Health Score™</h3>
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <div className="text-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={gradeColor} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${(health.healthScore / 100) * 264} 264`} className="transition-all duration-700" />
            </svg>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{health.healthScore}</div>
              <div className="text-[10px] text-white/30">/ 100</div>
            </div>
          </div>
          <div className="mt-2 text-lg font-bold" style={{ color: gradeColor }}>Grade {grade}</div>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 min-w-[280px]">
          <HealthFactor icon={TrendingUp} label="Translation Coverage" value={health.breakdown.coverage} color="#10b981" />
          <HealthFactor icon={AlertCircle} label="Critical Keys" value={health.breakdown.criticalKeys} color="#f59e0b" />
          <HealthFactor icon={ArrowLeftRight} label="RTL Ready" value={health.breakdown.rtl} color="#8b5cf6" />
          <HealthFactor icon={Type} label="Font Support" value={health.breakdown.fonts} color="#06b6d4" />
          <HealthFactor icon={ShieldCheck} label="Fallback Integrity" value={health.breakdown.fallback} color="#6366f1" />
          <HealthFactor icon={Languages} label="Total Languages" value={health.totalLanguages} color="#a78bfa" />
          <HealthFactor icon={TrendingUp} label="Avg Coverage" value={health.avgCoverage} color="#34d399" />
          <HealthFactor icon={AlertCircle} label="Critical Missing" value={health.criticalMissing} color="#f87171" />
        </div>
      </div>
    </div>
  );
}