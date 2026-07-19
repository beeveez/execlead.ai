import React from 'react';
import { motion } from 'framer-motion';
import { HardHat, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { RELEASE_READINESS } from '@/lib/platformHardeningEngine';

export default function HardeningHero({ assessment }) {
  const readiness = RELEASE_READINESS[assessment.releaseReadiness];
  const ReadyIcon = assessment.releaseReadiness === 'ready' ? ShieldCheck : assessment.releaseReadiness === 'conditionally_ready' ? Clock : AlertTriangle;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
        {/* Overall Score Ring */}
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle
                cx="60" cy="60" r="52" fill="none" stroke="url(#hardeningGrad)" strokeWidth="8" strokeLinecap="round"
                initial={{ strokeDasharray: "0 327" }}
                animate={{ strokeDasharray: `${(assessment.overallScore / 100) * 327} 327` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="hardeningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{assessment.overallScore}</span>
              <span className="text-white/30 text-[10px] uppercase tracking-wider">Hardening</span>
            </div>
          </div>
        </div>

        {/* Title + Readiness */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <HardHat size={16} className="text-indigo-400" />
            <span className="text-white/40 text-xs uppercase tracking-widest">Platform Hardening Program™</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Platform Hardening Dashboard</h1>
          <p className="text-white/50 text-sm max-w-xl leading-relaxed">
            Comprehensive hardening assessment across UX, Performance, Security, Testing, and Stability.
            The platform cannot progress to RC2 until all quality gates pass.
          </p>

          {/* Readiness Badge */}
          <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl border ${readiness.bgColor} ${readiness.borderColor}`}>
            <ReadyIcon size={16} className={readiness.textColor} />
            <span className={`font-semibold text-sm ${readiness.textColor}`}>{readiness.label}</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/50 text-xs">{readiness.description}</span>
          </div>
        </div>

        {/* Gate Summary */}
        <div className="flex-sh-0 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 min-w-[80px]">
            <div className="text-2xl font-bold text-emerald-400">{assessment.passedGates}</div>
            <div className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">Passed</div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 min-w-[80px]">
            <div className="text-2xl font-bold text-amber-400">{assessment.pendingGates}</div>
            <div className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">Pending</div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 min-w-[80px]">
            <div className="text-2xl font-bold text-red-400">{assessment.failedGates}</div>
            <div className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}