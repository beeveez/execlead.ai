import React from 'react';
import { Activity, Users, Globe, Zap, Clock, Package } from 'lucide-react';

function AnalyticsRow({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/[0.02] last:border-0">
      <Icon size={14} style={{ color }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white/60">{label}</div>
        {sub && <div className="text-[10px] text-white/30">{sub}</div>}
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export default function RuntimeLanguageAnalytics({ data }) {
  const topLang = data.mostUsedLanguages[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Language Usage */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Most Used Languages</h3>
          <span className="text-[10px] text-white/30 ml-auto">{data.activeLanguages} active</span>
        </div>
        <div className="space-y-2">
          {data.mostUsedLanguages.map((lang, i) => {
            const color = i === 0 ? '#10b981' : i < 3 ? '#6366f1' : i < 5 ? '#f59e0b' : '#6b7280';
            return (
              <div key={lang.code} className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 w-4">{i + 1}</span>
                <span className="text-xs text-white/60 w-32 truncate">{lang.name}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${lang.usagePercent}%`, backgroundColor: color }} />
                </div>
                <span className="text-xs text-white/60 w-10 text-right">{lang.usagePercent}%</span>
                <span className="text-[10px] text-white/30 w-16 text-right">{lang.sessions.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Runtime Metrics */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Runtime Metrics</h3>
        </div>
        <AnalyticsRow icon={Globe} label="Active Languages" value={data.activeLanguages} color="#06b6d4" />
        <AnalyticsRow icon={Users} label="Language Switching (Today)" value={data.languageSwitching.switchesToday} sub={`${data.languageSwitching.totalSwitches} total · ${data.languageSwitching.uniqueUsers} users`} color="#6366f1" />
        <AnalyticsRow icon={Zap} label="Fallback Events (Today)" value={data.fallbackEvents.today} sub={`${data.fallbackEvents.total} total → ${data.fallbackEvents.mostFallbackTo}`} color="#f59e0b" />
        <AnalyticsRow icon={Clock} label="Avg Translation Load" value={`${data.translationLoadTime.avgMs}ms`} sub={`p95: ${data.translationLoadTime.p95Ms}ms · cache: ${data.translationLoadTime.cacheHitRate}%`} color="#10b981" />
        <AnalyticsRow icon={Package} label="Language Pack Version" value={data.languagePackVersion} color="#8b5cf6" />
        <AnalyticsRow icon={Zap} label="Avg Translation Response" value={data.avgTranslationResponse} color="#34d399" />
      </div>
    </div>
  );
}