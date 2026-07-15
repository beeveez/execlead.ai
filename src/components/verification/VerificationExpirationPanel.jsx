import React from 'react';
import { Calendar, Clock, AlertTriangle, RefreshCw, CalendarClock } from 'lucide-react';
import { VERIFICATION_CATEGORIES, EXPIRATION_TYPES, parseExpirationConfig, getExpirationStatus, getUpcomingRenewals, getDaysUntilExpiration } from '@/lib/verificationWorkflowEngine';

const ICON_MAP = {
  Mail: null, Phone: null, ShieldCheck: null, Briefcase: null, Building2: null,
  GraduationCap: null, Award: null, FolderCheck: null, Crown: null, BadgeCheck: null,
};

export default function VerificationExpirationPanel({ verification }) {
  const config = parseExpirationConfig(verification);
  const renewals = getUpcomingRenewals(verification);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} className="text-amber-400" />
        <span className="text-sm font-bold text-white">Verification Expiration™</span>
        <span className="text-[10px] text-white/30 ml-auto">{renewals.length} upcoming renewal{renewals.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Upcoming Renewals */}
      {renewals.length > 0 && (
        <div className="bg-amber-500/[0.04] border border-amber-500/15 rounded-xl p-4 mb-3">
          <div className="flex items-center gap-1.5 mb-3">
            <AlertTriangle size={12} className="text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Upcoming Renewals</span>
          </div>
          <div className="space-y-2">
            {renewals.map((r) => (
              <div key={r.category.key} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: r.category.color + '15' }}>
                  <RefreshCw size={12} style={{ color: r.category.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/70 font-medium">{r.category.label}</div>
                  <div className="text-[10px] text-white/30">Expires: {new Date(r.expirationDate).toLocaleDateString()}</div>
                </div>
                <span className="text-[11px] font-medium" style={{ color: r.color }}>
                  {r.days === 0 ? 'Today' : r.days < 0 ? `${Math.abs(r.days)}d ago` : `${r.days}d left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiration Configuration Matrix */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Expiration Configuration</div>
        <div className="space-y-1.5">
          {VERIFICATION_CATEGORIES.map((cat) => {
            const verified = verification?.[cat.verifiedField];
            const cfg = config[cat.key] || { type: cat.expirationDefault };
            const expType = EXPIRATION_TYPES.find(t => t.id === cfg.type) || EXPIRATION_TYPES[0];
            const expDate = verified && cfg.type !== 'never' ? (cfg.expiration_date || null) : null;
            const status = expDate ? getExpirationStatus(expDate) : null;

            return (
              <div key={cat.key} className="flex items-center gap-3 py-1.5 border-b border-white/[0.03] last:border-b-0">
                <div className="w-28 flex-shrink-0">
                  <span className="text-[11px] text-white/60">{cat.label}</span>
                </div>
                <div className="w-24 flex-shrink-0">
                  <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: expType.color }}>
                    {expType.id === 'never' ? <CalendarClock size={10} /> : <Clock size={10} />}
                    {expType.label}
                  </span>
                </div>
                <div className="flex-1">
                  {verified ? (
                    status ? (
                      <span className="text-[10px]" style={{ color: status.color }}>
                        {status.label}{status.days != null && status.days >= 0 ? ` · ${status.days}d` : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400">Active</span>
                    )
                  ) : (
                    <span className="text-[10px] text-white/20">Not verified</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expiration Type Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {EXPIRATION_TYPES.map(t => (
          <div key={t.id} className="flex items-center gap-1.5 text-[10px] text-white/30">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
}