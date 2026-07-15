import React, { useMemo } from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, ShieldAlert, Activity } from 'lucide-react';
import { RISK_LEVELS, RISK_TRIGGERS, assessRisk } from '@/lib/riskAssessment';

export default function RiskAssessmentPanel({ verification, devices }) {
  const assessment = useMemo(() => {
    const knownDevices = (devices || []).filter(d => d.status === 'trusted').map(d => d.device_fingerprint);
    const knownCountries = (devices || []).filter(d => d.status === 'trusted').map(d => d.country).filter(Boolean);
    const failedOtp = verification?.phone_otp_attempts || 0;
    return assessRisk({
      knownDevices,
      knownCountries,
      failedOtpCount: failedOtp,
      sessionCount: 1,
    });
  }, [verification, devices]);

  const levelMeta = RISK_LEVELS[assessment.level] || RISK_LEVELS.low;
  const RiskIcon = levelMeta.icon === 'ShieldCheck' ? ShieldCheck : levelMeta.icon === 'AlertTriangle' ? AlertTriangle : levelMeta.icon === 'AlertCircle' ? AlertCircle : ShieldAlert;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={14} className="text-amber-400" />
        <span className="text-sm font-bold text-white">Risk-Based Verification™</span>
        <div className="ml-auto flex items-center gap-2">
          <RiskIcon size={16} style={{ color: levelMeta.color }} />
          <span className="text-sm font-medium" style={{ color: levelMeta.color }}>{levelMeta.label}</span>
        </div>
      </div>

      <p className="text-xs text-white/40 mb-4">{levelMeta.description}</p>

      {assessment.requiresStepUp && (
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldAlert size={12} className="text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Step-Up Verification Required</span>
          </div>
          <p className="text-[11px] text-amber-300/70">
            Recommended: {assessment.recommendedVerification} verification needed before proceeding.
          </p>
        </div>
      )}

      <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Risk Triggers</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {RISK_TRIGGERS.map((trigger) => {
          const active = assessment.triggers.some(t => t.id === trigger.id);
          const triggerColor = trigger.severity === 'critical' ? '#dc2626' : trigger.severity === 'high' ? '#ef4444' : trigger.severity === 'medium' ? '#f59e0b' : '#64748b';
          return (
            <div key={trigger.id} className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${active ? 'bg-white/5' : 'bg-transparent opacity-40'}`}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: active ? triggerColor : '#334155' }} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-white/70">{trigger.label}</div>
                <div className="text-[10px] text-white/30 truncate">{trigger.description}</div>
              </div>
              {active && <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: triggerColor + '20', color: triggerColor }}>{trigger.severity}</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30">
        <span>Last assessed: {verification?.last_risk_assessment ? new Date(verification.last_risk_assessment).toLocaleString() : '—'}</span>
        <span>{assessment.triggers.length} active trigger{assessment.triggers.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}