import React from 'react';
import { Clock, Eye, CheckCircle2, XCircle, Gauge, ShieldAlert, BarChart3, TrendingUp } from 'lucide-react';
import { calculateVerificationAnalytics } from '@/lib/verificationWorkflowEngine';

export default function VerificationAnalytics({ logs, verification }) {
  const analytics = calculateVerificationAnalytics(logs, verification);

  const metrics = [
    { icon: Clock, label: 'Avg Verification Time', value: analytics.avgTimeLabel, sub: `${analytics.avgTimeHours}h total`, color: '#3b82f6' },
    { icon: Eye, label: 'Pending Reviews', value: String(analytics.pendingReviews), sub: analytics.pendingReviews > 0 ? 'Action needed' : 'All clear', color: analytics.pendingReviews > 0 ? '#f59e0b' : '#10b981' },
    { icon: CheckCircle2, label: 'Approval Rate', value: `${analytics.approvalRate}%`, sub: 'of decisions', color: '#10b981' },
    { icon: XCircle, label: 'Rejection Rate', value: `${analytics.rejectionRate}%`, sub: 'of decisions', color: '#ef4444' },
    { icon: Gauge, label: 'Verification Quality', value: String(analytics.verificationQuality), sub: 'confidence score', color: '#06b6d4' },
    { icon: ShieldAlert, label: 'Risk Events', value: String(analytics.riskEvents), sub: analytics.riskEvents > 0 ? 'Attention needed' : 'No risk events', color: analytics.riskEvents > 0 ? '#ef4444' : '#10b981' },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={14} className="text-indigo-400" />
        <span className="text-sm font-bold text-white">Verification Analytics™</span>
        <span className="text-[10px] text-white/30 ml-auto">{analytics.totalEvents} total event{analytics.totalEvents !== 1 ? 's' : ''}</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={12} style={{ color: m.color }} />
                <span className="text-[10px] uppercase tracking-wider text-white/30">{m.label}</span>
              </div>
              <div className="text-xl font-bold" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{m.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Trust Distribution */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={12} className="text-violet-400" />
          <span className="text-xs font-medium text-white">Trust Distribution</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] text-white/30">Current Trust Score</span>
              <span className="text-lg font-bold text-violet-400">{analytics.trustDistribution.current}</span>
              <span className="text-[10px] text-white/30">/ 100</span>
            </div>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${analytics.trustDistribution.current}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
              />
            </div>
          </div>
        </div>

        {/* Trend sparkline */}
        {analytics.trustDistribution.trend && analytics.trustDistribution.trend.length > 1 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-[10px] text-white/30 mb-2">Trust Score Trend ({analytics.trustDistribution.trend.length} data points)</div>
            <div className="flex items-end gap-1 h-12">
              {analytics.trustDistribution.trend.slice(-12).map((point, idx) => {
                const score = point.trust_score_after || 0;
                const height = Math.max(4, (score / 100) * 100);
                return (
                  <div
                    key={idx}
                    className="flex-1 rounded-t transition-all"
                    style={{ height: `${height}%`, backgroundColor: '#a855f7', opacity: 0.3 + (idx / 12) * 0.7 }}
                    title={`Score: ${score}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}