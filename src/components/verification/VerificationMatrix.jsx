import React, { useState } from 'react';
import { Mail, Phone, ShieldCheck, Briefcase, Building2, GraduationCap, Award, FolderCheck, Crown, BadgeCheck, ChevronDown, ChevronRight, CheckCircle2, Clock, XCircle, Calendar, Eye, Grid3x3 } from 'lucide-react';
import { VERIFICATION_CATEGORIES, getCurrentStage, getWorkflowProgress, parseExpirationConfig, getExpirationStatus, parseWorkflowStages } from '@/lib/verificationWorkflowEngine';
import { Link } from 'react-router-dom';

const ICON_MAP = { Mail, Phone, ShieldCheck, Briefcase, Building2, GraduationCap, Award, FolderCheck, Crown, BadgeCheck };

export default function VerificationMatrix({ verification, logs }) {
  const [expanded, setExpanded] = useState(null);

  const stages = parseWorkflowStages(verification);
  const expConfig = parseExpirationConfig(verification);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Grid3x3 size={14} className="text-indigo-400" />
        <span className="text-sm font-bold text-white">Verification Matrix™</span>
        <span className="text-[10px] text-white/30 ml-auto">{VERIFICATION_CATEGORIES.length} categories</span>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30 font-semibold">
          <div className="col-span-3">Category</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Workflow Stage</div>
          <div className="col-span-2">Expiration</div>
          <div className="col-span-2">Trust Impact</div>
        </div>

        {VERIFICATION_CATEGORIES.map((cat) => {
          const verified = verification?.[cat.verifiedField];
          const date = verification?.[cat.dateField];
          const method = cat.methodField ? verification?.[cat.methodField] : null;
          const verifiedBy = cat.verifiedByField ? verification?.[cat.verifiedByField] : null;
          const stage = getCurrentStage(verification, cat.key);
          const progress = getWorkflowProgress(verification, cat.key);
          const cfg = expConfig[cat.key];
          const expStatus = verified && cfg && cfg.type !== 'never'
            ? getExpirationStatus(cfg.expiration_date)
            : { status: verified ? 'never' : 'pending', label: verified ? 'No Expiration' : '—', color: '#64748b', days: null };
          const Icon = ICON_MAP[cat.icon] || ShieldCheck;
          const isExpanded = expanded === cat.key;

          return (
            <div key={cat.key} className="border-b border-white/5 last:border-b-0">
              <div
                className="grid grid-cols-12 gap-2 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors md:grid"
                onClick={() => setExpanded(isExpanded ? null : cat.key)}
              >
                {/* Category */}
                <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                  {isExpanded ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '15' }}>
                    <Icon size={13} style={{ color: cat.color }} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">{cat.label}</div>
                    {cat.enterpriseVerifiable && (
                      <span className="text-[9px] text-cyan-400/60">Enterprise Verifiable</span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-4 md:col-span-2 flex items-center">
                  {verified ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium"><CheckCircle2 size={11} /> Verified</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-white/30 font-medium"><Clock size={11} /> Pending</span>
                  )}
                </div>

                {/* Workflow Stage */}
                <div className="col-span-4 md:col-span-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: stage.color }} />
                  </div>
                  <span className="text-[10px] text-white/40 whitespace-nowrap">{stage.label}</span>
                </div>

                {/* Expiration */}
                <div className="col-span-4 md:col-span-2 flex items-center">
                  <span className="text-[11px] font-medium" style={{ color: expStatus.color }}>
                    {expStatus.label}
                    {expStatus.days != null && expStatus.days >= 0 && <span className="text-white/30 ml-1">({expStatus.days}d)</span>}
                  </span>
                </div>

                {/* Trust Impact */}
                <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-start gap-2">
                  <span className={`text-[11px] font-medium ${verified ? 'text-indigo-400' : 'text-white/20'}`}>+{cat.trustWeight} pts</span>
                  {!verified && (
                    <Link to="/identity-verification" className="text-[10px] text-indigo-400 hover:text-indigo-300">Start →</Link>
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-3 bg-white/[0.01]">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                    <div>
                      <div className="text-white/30 mb-0.5">Verified Date</div>
                      <div className="text-white/60">{date ? new Date(date).toLocaleDateString() : '—'}</div>
                    </div>
                    <div>
                      <div className="text-white/30 mb-0.5">Method</div>
                      <div className="text-white/60">{method || '—'}</div>
                    </div>
                    <div>
                      <div className="text-white/30 mb-0.5">Verified By</div>
                      <div className="text-white/60">{verifiedBy || '—'}</div>
                    </div>
                    <div>
                      <div className="text-white/30 mb-0.5">Workflow Progress</div>
                      <div className="text-white/60">{progress}% (Stage {stage.order}/9)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}