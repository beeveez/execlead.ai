import React, { useState } from 'react';
import { Briefcase, Building2, Crown, BadgeCheck, CheckCircle2, Clock, Shield, UserCheck } from 'lucide-react';

const ENTERPRISE_CATEGORIES = [
  { key: 'employment', label: 'Employment', verifiedField: 'professional_verified', dateField: 'professional_verified_date', byField: 'professional_verified_by', icon: Briefcase, color: '#f59e0b', action: 'employment_approved', methodField: 'professional_verified_method' },
  { key: 'organization', label: 'Organization', verifiedField: 'organization_verified', dateField: 'organization_verified_date', byField: 'organization_verified_by', icon: Building2, color: '#06b6d4', action: 'organization_approved', methodField: 'organization_verified_method' },
  { key: 'executive_role', label: 'Executive Role', verifiedField: 'executive_role_verified', dateField: 'executive_role_verified_date', byField: 'executive_role_verified_by', icon: Crown, color: '#a855f7', action: 'executive_role_verified', methodField: 'executive_role_verified_method' },
  { key: 'internal_credentials', label: 'Internal Credentials', verifiedField: 'internal_credentials_verified', dateField: 'internal_credentials_verified_date', byField: 'internal_credentials_verified_by', icon: BadgeCheck, color: '#10b981', action: 'internal_credentials_verified', methodField: null },
];

export default function EnterpriseVerificationPanel({ verification, user, onVerify }) {
  const [processing, setProcessing] = useState(null);
  const isEnterpriseAdmin = user?.role === 'enterprise_admin' || user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'platform_admin';

  const handleVerify = async (cat) => {
    setProcessing(cat.key);
    try {
      await onVerify(cat);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Shield size={14} className="text-cyan-400" />
        <span className="text-sm font-bold text-white">Enterprise Verification™</span>
        <span className="text-[10px] text-white/30 ml-auto">
          {isEnterpriseAdmin ? 'Admin access' : 'View only'}
        </span>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <p className="text-[11px] text-white/40 mb-4">
          Enterprise Administrators can verify Employment, Organization, Executive Role, and Internal Credentials.
          Each verification updates Executive Trust™ and writes to the immutable Audit Ledger™.
        </p>

        <div className="space-y-2">
          {ENTERPRISE_CATEGORIES.map((cat) => {
            const verified = verification?.[cat.verifiedField];
            const date = verification?.[cat.dateField];
            const verifiedBy = verification?.[cat.byField];
            const method = cat.methodField ? verification?.[cat.methodField] : null;
            const CatIcon = cat.icon;

            return (
              <div key={cat.key} className={`flex items-center gap-3 rounded-lg p-3 border transition-colors ${verified ? 'border-emerald-500/15 bg-emerald-500/[0.02]' : 'border-white/5 bg-white/[0.01]'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${verified ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
                  <CatIcon size={16} className={verified ? 'text-emerald-400' : 'text-white/30'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{cat.label}</span>
                    {verified ? (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-400"><CheckCircle2 size={10} /> Verified</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[10px] text-white/30"><Clock size={10} /> Pending</span>
                    )}
                  </div>
                  {verified ? (
                    <div className="text-[10px] text-white/40 mt-0.5">
                      {verifiedBy && <span>By {verifiedBy}</span>}
                      {date && <span> · {new Date(date).toLocaleDateString()}</span>}
                      {method && <span> · {method}</span>}
                    </div>
                  ) : (
                    <div className="text-[10px] text-white/20 mt-0.5">Awaiting enterprise admin verification</div>
                  )}
                </div>
                {isEnterpriseAdmin && !verified && (
                  <button
                    onClick={() => handleVerify(cat)}
                    disabled={processing === cat.key}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-[11px] font-medium text-cyan-400 transition-colors disabled:opacity-40"
                  >
                    {processing === cat.key ? (
                      <><div className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /> Verifying</>
                    ) : (
                      <><UserCheck size={12} /> Verify</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {!isEnterpriseAdmin && (
          <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-white/20 text-center">
            Only Enterprise Administrators can perform enterprise verifications.
          </div>
        )}
      </div>
    </div>
  );
}