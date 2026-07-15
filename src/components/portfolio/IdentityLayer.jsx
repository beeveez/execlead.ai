import React from 'react';
import { ShieldCheck, BadgeCheck, TrendingUp, Lock } from 'lucide-react';
import { computeIdentityStatus } from '@/lib/portfolioEngineV2';

export default function IdentityLayer({ data, completeness }) {
  const identity = computeIdentityStatus(data, completeness);
  const metrics = [
    { label: 'Identity Confidence', value: `${identity.identityConfidence}%`, color: '#6366f1' },
    { label: 'Verification Level', value: identity.verificationLevel, color: identity.verified ? '#10b981' : '#f59e0b' },
    { label: 'Trust Level', value: identity.trustLevel, color: '#3b82f6' },
    { label: 'Profile Completeness', value: `${identity.profileCompleteness}%`, color: '#10b981' },
    { label: 'Evidence Coverage', value: `${identity.evidenceCoverage}%`, color: '#8b5cf6' },
    { label: 'Leadership Maturity', value: identity.leadershipMaturity, color: '#ec4899' },
    { label: 'Career Maturity', value: identity.careerMaturity, color: '#f59e0b' },
    { label: 'AI Confidence', value: identity.aiConfidence, color: '#06b6d4' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 pt-4">
      <div className={`rounded-2xl border p-4 ${identity.verified ? 'bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border-blue-500/20' : 'bg-gradient-to-r from-amber-500/10 via-white/[0.02] to-transparent border-amber-500/20'}`}>
        <div className="flex items-center gap-2 mb-3">
          {identity.verified ? <BadgeCheck size={16} className="text-blue-400" /> : <Lock size={16} className="text-amber-400" />}
          <span className="text-sm font-bold text-white">Verified Leadership Identity™</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${identity.verified ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {identity.verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white/[0.03] rounded-lg p-2.5">
              <div className="text-[8px] text-white/30 uppercase tracking-wider">{m.label}</div>
              <div className="text-sm font-bold" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}