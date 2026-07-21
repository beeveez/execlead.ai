import React from 'react';
import { ShieldCheck, Award, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function SecurityBaselineHero({ snapshot }) {
  const { overallScore, grade, certification, stats } = snapshot;
  const scoreColor = overallScore >= 90 ? '#10b981' : overallScore >= 70 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Score Ring */}
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{overallScore}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Score</span>
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: scoreColor }}>
            {grade}
          </div>
        </div>

        {/* Status & Certification */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <ShieldCheck size={12} style={{ color: scoreColor }} /> Platform Security Baseline™ · v1.0
          </div>
          <h2 className="text-xl font-bold text-white">Security Health Score™</h2>
          <p className="text-white/40 text-sm mt-1">
            {stats.passedDomains}/{stats.totalDomains} domains passing · {stats.passedControls}/{stats.totalControls} controls verified · {stats.totalFindings} findings
          </p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center lg:justify-start">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${certification.certified ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
              {certification.certified ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {certification.certified ? 'Production Certified' : 'Certification Blocked'}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400">
              <Award size={12} /> {certification.passedCount}/{certification.totalCount} gates passed
            </div>
            {stats.criticalFindings > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400">
                <AlertTriangle size={12} /> {stats.criticalFindings} critical findings
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <StatBox label="Domains" value={`${stats.passedDomains}/${stats.totalDomains}`} color="#10b981" />
          <StatBox label="Controls" value={`${stats.passedControls}/${stats.totalControls}`} color="#6366f1" />
          <StatBox label="Findings" value={stats.totalFindings} color={stats.criticalFindings > 0 ? '#ef4444' : '#f59e0b'} />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center min-w-[80px]">
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}