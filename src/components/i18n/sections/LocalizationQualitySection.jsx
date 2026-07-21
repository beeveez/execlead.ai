import React from 'react';
import { Gauge, AlertTriangle, Zap, ArrowLeftRight, Type, Globe2, Code2 } from 'lucide-react';

function QualityMetric({ icon: Icon, label, value, color = '#6366f1', sub }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <Icon size={12} style={{ color }} />
        <span className="text-[10px] text-white/40">{label}</span>
      </div>
      <div className="text-lg font-bold text-white mt-1">{value}</div>
      {sub && <div className="text-[9px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function LocalizationQualitySection({ quality }) {
  const trendColor = quality.healthTrend === 'improving' ? '#10b981' : quality.healthTrend === 'declining' ? '#ef4444' : '#f59e0b';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Gauge size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Localization Quality Dashboard™</h3>
        <span className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: trendColor }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: trendColor }} />
          {quality.healthTrend}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <QualityMetric icon={Gauge} label="Coverage" value={`${quality.coveragePercent}%`} color="#10b981" />
        <QualityMetric icon={AlertTriangle} label="Missing Strings" value={quality.missingStrings} color="#f59e0b" />
        <QualityMetric icon={Zap} label="Fallback Usage" value={`${quality.fallbackUsage}%`} color="#8b5cf6" />
        <QualityMetric icon={AlertTriangle} label="Translation Errors" value={quality.translationErrors} color="#ef4444" />
        <QualityMetric icon={AlertTriangle} label="Validation Errors" value={quality.validationErrors} color="#f59e0b" />
        <QualityMetric icon={Zap} label="Runtime Issues" value={quality.runtimeIssues} color="#ef4444" />
        <QualityMetric icon={Globe2} label="Locale Issues" value={quality.localeIssues} color="#06b6d4" />
        <QualityMetric icon={ArrowLeftRight} label="RTL Issues" value={quality.rtlIssues} color="#8b5cf6" />
        <QualityMetric icon={Type} label="Unicode Issues" value={quality.unicodeIssues} color="#10b981" />
        <QualityMetric icon={Code2} label="Hardcoded Violations" value={quality.hardcodedViolations} color="#f87171" />
      </div>
    </div>
  );
}