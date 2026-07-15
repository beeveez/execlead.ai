import React from 'react';
import { TrendingUp, TrendingDown, Minus, Crown, ShieldCheck, Mail, Phone, Briefcase, Building2, GraduationCap, Award, FolderCheck, Ban, Clock, BadgeCheck } from 'lucide-react';
import { buildTrustTimeline } from '@/lib/verificationWorkflowEngine';

const ACTION_META = {
  email_verified: { label: 'Email Verified', Icon: Mail, color: '#6366f1' },
  phone_verified: { label: 'Phone Verified', Icon: Phone, color: '#06b6d4' },
  identity_approved: { label: 'Identity Approved', Icon: ShieldCheck, color: '#10b981' },
  professional_verified: { label: 'Employment Verified', Icon: Briefcase, color: '#f59e0b' },
  organization_approved: { label: 'Organization Approved', Icon: Building2, color: '#06b6d4' },
  education_verified: { label: 'Education Verified', Icon: GraduationCap, color: '#8b5cf6' },
  executive_credentials_verified: { label: 'Executive Credentials Verified', Icon: Award, color: '#f59e0b' },
  executive_portfolio_verified: { label: 'Executive Portfolio Verified', Icon: FolderCheck, color: '#a855f7' },
  executive_role_verified: { label: 'Executive Role Verified', Icon: Crown, color: '#a855f7' },
  internal_credentials_verified: { label: 'Internal Credentials Verified', Icon: BadgeCheck, color: '#10b981' },
  verified_executive_granted: { label: 'Verified Executive Granted', Icon: Crown, color: '#a855f7' },
  verification_revoked: { label: 'Verification Revoked', Icon: Ban, color: '#ef4444' },
  trust_score_updated: { label: 'Trust Score Updated', Icon: TrendingUp, color: '#a855f7' },
};



export default function TrustTimeline({ logs, verification }) {
  const timeline = buildTrustTimeline(logs, verification);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-violet-400" />
        <span className="text-sm font-bold text-white">Trust Timeline™</span>
        <span className="text-[10px] text-white/30 ml-auto">{timeline.length} event{timeline.length !== 1 ? 's' : ''}</span>
      </div>

      {timeline.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <TrendingUp size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">No trust score changes recorded yet.</p>
          <p className="text-[10px] text-white/20 mt-1">Trust changes will appear here as verifications are completed.</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 max-h-[500px] overflow-y-auto">
          <div className="relative space-y-4">
            {timeline.map((event, idx) => {
              const meta = ACTION_META[event.action] || { label: event.action, Icon: Clock, color: '#64748b' };
              const Icon = meta.Icon;
              const isPositive = event.delta > 0;
              const isNegative = event.delta < 0;
              const DeltaIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
              const deltaColor = isPositive ? '#10b981' : isNegative ? '#ef4444' : '#64748b';

              return (
                <div key={event.id || idx} className="flex gap-3">
                  {/* Timeline dot + connector */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.color + '15' }}>
                      <Icon size={14} style={{ color: meta.color }} />
                    </div>
                    {idx < timeline.length - 1 && <div className="w-px flex-1 bg-white/5 mt-1" />}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-white">{meta.label}</span>
                      {event.category && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{event.category}</span>
                      )}
                      {event.decision && event.decision !== 'pending' && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${event.decision === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {event.decision}
                        </span>
                      )}
                    </div>

                    {/* Score change */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1.5 bg-white/[0.03] rounded-lg px-2 py-1">
                        <span className="text-[10px] text-white/30">Score:</span>
                        <span className="text-xs font-bold text-white/60">{event.scoreBefore}</span>
                        <DeltaIcon size={11} style={{ color: deltaColor }} />
                        <span className="text-xs font-bold" style={{ color: deltaColor }}>
                          {isPositive ? '+' : ''}{event.delta}
                        </span>
                        <span className="text-[10px] text-white/30">→</span>
                        <span className="text-xs font-bold text-white">{event.scoreAfter}</span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="text-[10px] text-white/30 mt-1">
                      {event.date ? new Date(event.date).toLocaleString() : '—'}
                      {event.reviewer && <span> · by {event.reviewer}</span>}
                      {event.reason && <span> · {event.reason}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}