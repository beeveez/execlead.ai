import React from 'react';
import { Mail, Phone, ShieldCheck, Briefcase, Building2, GraduationCap, Award, FolderCheck, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { TRUST_SCORE_WEIGHTS, VERIFICATION_METHODS, PROFESSIONAL_METHODS, ORGANIZATION_METHODS, EDUCATION_METHODS } from '@/lib/trustEngine';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { key: 'email_verified', label: 'Email', Icon: Mail, dateField: 'email_verified_date', methodLabel: 'Email confirmation', verifiedByField: null, weight: TRUST_SCORE_WEIGHTS.email_verified, link: '/settings' },
  { key: 'phone_verified', label: 'Phone', Icon: Phone, dateField: 'phone_verified_date', methodLabel: 'OTP verification', verifiedByField: null, weight: TRUST_SCORE_WEIGHTS.phone_verified, link: '/identity-verification' },
  { key: 'identity_verified', label: 'Identity', Icon: ShieldCheck, dateField: 'identity_verified_date', methodField: 'identity_verified_method', methodLabel: 'Identity verification', verifiedByField: 'identity_verified_by', weight: TRUST_SCORE_WEIGHTS.identity_verified, link: '/identity-verification' },
  { key: 'professional_verified', label: 'Employment', Icon: Briefcase, dateField: 'professional_verified_date', methodField: 'professional_verified_method', methodLabel: 'Employment verification', verifiedByField: 'professional_verified_by', weight: TRUST_SCORE_WEIGHTS.professional_verified, link: '/profile' },
  { key: 'organization_verified', label: 'Organization', Icon: Building2, dateField: 'organization_verified_date', methodField: 'organization_verified_method', methodLabel: 'Organization verification', verifiedByField: 'organization_verified_by', weight: TRUST_SCORE_WEIGHTS.organization_verified, link: '/enterprise/identity' },
  { key: 'education_verified', label: 'Education', Icon: GraduationCap, dateField: 'education_verified_date', methodField: 'education_verified_method', methodLabel: 'Education verification', verifiedByField: 'education_verified_by', weight: TRUST_SCORE_WEIGHTS.education_verified, link: '/profile' },
  { key: 'executive_credentials_verified', label: 'Executive Credentials', Icon: Award, dateField: 'executive_credentials_verified_date', methodLabel: 'Credential verification', verifiedByField: null, weight: TRUST_SCORE_WEIGHTS.executive_credentials_verified, link: '/executive-credentials' },
  { key: 'executive_portfolio_verified', label: 'Executive Portfolio', Icon: FolderCheck, dateField: 'executive_portfolio_verified_date', methodLabel: 'Portfolio verification', verifiedByField: null, weight: TRUST_SCORE_WEIGHTS.executive_portfolio_verified, link: '/executive-portfolio' },
];

export default function VerificationStatusGrid({ verification }) {
  const getMethod = (cat) => {
    if (!cat.methodField || !verification) return cat.methodLabel;
    const val = verification[cat.methodField];
    if (!val) return cat.methodLabel;
    const maps = { ...VERIFICATION_METHODS, ...PROFESSIONAL_METHODS, ...ORGANIZATION_METHODS, ...EDUCATION_METHODS };
    return maps[val] || cat.methodLabel;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={14} className="text-emerald-400" />
        <span className="text-sm font-bold text-white">Verification Status</span>
        <span className="text-xs text-white/30 ml-auto">8 categories</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
          const verified = verification?.[cat.key];
          const date = verification?.[cat.dateField];
          const verifiedBy = cat.verifiedByField ? verification?.[cat.verifiedByField] : null;
          const Icon = cat.Icon;
          return (
            <div key={cat.key} className={`bg-white/[0.02] border rounded-xl p-4 transition-colors ${verified ? 'border-emerald-500/15' : 'border-white/5'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${verified ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
                  <Icon size={16} className={verified ? 'text-emerald-400' : 'text-white/30'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{cat.label}</span>
                    {verified ? (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-medium"><CheckCircle2 size={10} /> Verified</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[10px] text-white/30 font-medium"><Clock size={10} /> Pending</span>
                    )}
                  </div>
                  <div className="mt-1.5 space-y-0.5 text-[11px] text-white/40">
                    <div className="flex justify-between"><span>Date:</span><span className="text-white/60">{date ? new Date(date).toLocaleDateString() : '—'}</span></div>
                    <div className="flex justify-between"><span>Method:</span><span className="text-white/60 truncate ml-2">{getMethod(cat)}</span></div>
                    <div className="flex justify-between"><span>Verified By:</span><span className="text-white/60 truncate ml-2">{verifiedBy || '—'}</span></div>
                    <div className="flex justify-between"><span>Trust Impact:</span><span className="text-indigo-400 font-medium">+{cat.weight} pts</span></div>
                  </div>
                  {!verified && (
                    <Link to={cat.link} className="inline-flex items-center gap-1 mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium">
                      Start verification <ArrowRight size={10} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}