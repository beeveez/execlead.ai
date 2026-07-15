import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, ShieldCheck, Clock, Sparkles, FileSearch, CheckCircle2, Award } from 'lucide-react';
import { getEnterpriseEvidenceStats } from '@/lib/evidenceIntelligenceEngine';
import { EVIDENCE_TYPES, getEvidenceTypeMeta, resolveEvidenceType } from '@/lib/evidenceVaultEngine';

export default function EnterpriseEvidenceDashboard({ evidenceItems }) {
  const stats = useMemo(() => getEnterpriseEvidenceStats(evidenceItems), [evidenceItems]);

  const kpiCards = [
    { icon: BarChart3, label: 'Total Evidence', value: stats.total, color: '#6366f1' },
    { icon: ShieldCheck, label: 'Verification Rate', value: `${stats.verificationRate}%`, color: '#10b981' },
    { icon: TrendingUp, label: 'Avg Quality', value: stats.avgQuality, color: '#a855f7' },
    { icon: Sparkles, label: 'AI Review Rate', value: `${stats.aiReviewRate}%`, color: '#3b82f6' },
    { icon: Clock, label: 'Pending Reviews', value: stats.pendingReviews, color: '#f59e0b' },
    { icon: CheckCircle2, label: 'Coverage', value: `${stats.coverage}%`, color: '#06b6d4' },
    { icon: FileSearch, label: 'Expiring', value: stats.expiringCount, color: '#f97316' },
    { icon: Award, label: 'Trust Contribution', value: stats.trustContribution, color: '#10b981' },
  ];

  const maxTypeCount = Math.max(...Object.values(stats.byType), 1);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={14} className="text-indigo-400" />
        <span className="text-sm font-bold text-white">Enterprise Evidence Dashboard™</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {kpiCards.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={11} style={{ color: kpi.color }} />
                <span className="text-[9px] uppercase tracking-wider text-white/30">{kpi.label}</span>
              </div>
              <div className="text-lg font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Evidence by Type */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Evidence by Type</div>
          <div className="space-y-1.5">
            {EVIDENCE_TYPES.map(type => {
              const count = stats.byType[type.key] || 0;
              const pct = (count / maxTypeCount) * 100;
              return (
                <div key={type.key} className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-28 truncate flex-shrink-0">{type.label}</span>
                  <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: type.color }} />
                  </div>
                  <span className="text-[10px] text-white/40 w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expiration Forecast */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Expiration Forecast (6 months)</div>
          <div className="flex items-end gap-2 h-32">
            {stats.expirationForecast.map((f, idx) => {
              const maxCount = Math.max(...stats.expirationForecast.map(x => x.count), 1);
              const height = (f.count / maxCount) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-white/40">{f.count || ''}</span>
                  <div className="w-full flex items-end" style={{ height: '70px' }}>
                    <div className="w-full rounded-t transition-all" style={{ height: `${height}%`, backgroundColor: f.count > 0 ? '#f59e0b' : 'rgba(255,255,255,0.05)', minHeight: '2px' }} />
                  </div>
                  <span className="text-[8px] text-white/30">{f.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Dimensions */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Quality Breakdown</div>
          <div className="space-y-2">
            {[
              { label: 'Authenticity', value: stats.avgAuthenticity, color: '#10b981' },
              { label: 'Freshness', value: stats.avgFreshness, color: '#f59e0b' },
              { label: 'Quality', value: stats.avgQuality, color: '#a855f7' },
              { label: 'Trust Contribution', value: stats.trustContribution, color: '#06b6d4' },
            ].map(d => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 w-28 flex-shrink-0">{d.label}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                </div>
                <span className="text-[10px] font-bold w-8 text-right" style={{ color: d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Summary */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Verification & Review Status</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{stats.verificationRate}%</div>
              <div className="text-[9px] text-white/30 mt-0.5">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.aiReviewRate}%</div>
              <div className="text-[9px] text-white/30 mt-0.5">AI Reviewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{stats.pendingReviews}</div>
              <div className="text-[9px] text-white/30 mt-0.5">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.expiredCount}</div>
              <div className="text-[9px] text-white/30 mt-0.5">Expired</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}