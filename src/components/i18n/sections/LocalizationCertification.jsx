import React from 'react';
import { Award, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function LocalizationCertification({ cert }) {
  const isCertified = cert.certificationStatus === 'Certified';
  const isBlocked = cert.certificationStatus === 'Blocked';
  const icon = isCertified ? Award : isBlocked ? XCircle : AlertTriangle;
  const Icon = icon;
  const color = isCertified ? '#10b981' : isBlocked ? '#ef4444' : '#f59e0b';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Certification™</h3>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center border-2" style={{ borderColor: color }}>
          <Icon size={24} style={{ color }} />
        </div>
        <div>
          <div className="text-lg font-bold text-white">{cert.certificationStatus}</div>
          <div className="text-xs text-white/40">Release Eligibility: <span style={{ color }}>{cert.releaseEligibility}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] rounded-lg p-3 text-center border border-white/5">
          <div className="text-lg font-bold text-white">{cert.coverageScore}%</div>
          <div className="text-[10px] text-white/40">Coverage Score</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 text-center border border-white/5">
          <div className="text-lg font-bold text-white">{cert.blockingIssues}</div>
          <div className="text-[10px] text-white/40">Blocking Issues</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 text-center border border-white/5">
          <div className="text-lg font-bold text-white">{cert.missingCriticalKeys}</div>
          <div className="text-[10px] text-white/40">Missing Critical Keys</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 text-center border border-white/5">
          <div className="text-lg font-bold" style={{ color }}>{cert.releaseEligibility === 'Eligible' ? '✓' : '✗'}</div>
          <div className="text-[10px] text-white/40">Release Eligible</div>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Certification Pipeline</div>
        {Object.entries(cert.pipeline).map(([stage, status]) => (
          <div key={stage} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.02] last:border-0">
            <span className="text-white/50 capitalize">{stage.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className={status === 'Passed' || status === 'Certified' || status === 'Ready' || status === 'Production Ready' ? 'text-emerald-400' : status === 'Failed' || status === 'Not Ready' || status === 'Blocked' ? 'text-rose-400' : 'text-amber-400'}>
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}