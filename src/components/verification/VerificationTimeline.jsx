import React from 'react';
import { Clock, Mail, Phone, ShieldCheck, Briefcase, Building2, GraduationCap, Award, FolderCheck, CheckCircle2, XCircle, Send, Upload, Crown, Ban, Smartphone, ShieldAlert, Globe, FileText, AlertTriangle } from 'lucide-react';

const ACTION_META = {
  verification_requested: { label: 'Verification Requested', Icon: Clock, color: '#3b82f6' },
  identity_submitted: { label: 'Identity Submitted', Icon: Upload, color: '#3b82f6' },
  identity_approved: { label: 'Identity Approved', Icon: CheckCircle2, color: '#10b981' },
  identity_rejected: { label: 'Identity Rejected', Icon: XCircle, color: '#ef4444' },
  identity_updated: { label: 'Identity Updated', Icon: ShieldCheck, color: '#3b82f6' },
  email_verified: { label: 'Email Verified', Icon: Mail, color: '#10b981' },
  phone_verified: { label: 'Phone Verified', Icon: Phone, color: '#10b981' },
  otp_sent: { label: 'OTP Sent', Icon: Send, color: '#f59e0b' },
  otp_verified: { label: 'OTP Verified', Icon: CheckCircle2, color: '#10b981' },
  otp_failed: { label: 'OTP Verification Failed', Icon: XCircle, color: '#ef4444' },
  professional_verified: { label: 'Employment Verified', Icon: Briefcase, color: '#10b981' },
  employment_approved: { label: 'Employment Approved', Icon: CheckCircle2, color: '#10b981' },
  organization_approved: { label: 'Organization Approved', Icon: Building2, color: '#10b981' },
  education_verified: { label: 'Education Verified', Icon: GraduationCap, color: '#10b981' },
  executive_credentials_verified: { label: 'Executive Credentials Verified', Icon: Award, color: '#10b981' },
  executive_portfolio_verified: { label: 'Executive Portfolio Verified', Icon: FolderCheck, color: '#10b981' },
  profile_published: { label: 'Profile Published', Icon: Globe, color: '#10b981' },
  resume_verified: { label: 'Resume Verified', Icon: FileText, color: '#10b981' },
  leadership_dna_complete: { label: 'Leadership DNA Complete', Icon: CheckCircle2, color: '#10b981' },
  verified_executive_granted: { label: 'Verified Executive Granted', Icon: Crown, color: '#a855f7' },
  verification_revoked: { label: 'Verification Revoked', Icon: Ban, color: '#ef4444' },
  device_trusted: { label: 'Device Trusted', Icon: Smartphone, color: '#10b981' },
  device_revoked: { label: 'Device Revoked', Icon: Smartphone, color: '#ef4444' },
  risk_challenge_triggered: { label: 'Risk Challenge Triggered', Icon: ShieldAlert, color: '#f59e0b' },
  documents_requested: { label: 'Documents Requested', Icon: FileText, color: '#f59e0b' },
};

export default function VerificationTimeline({ logs }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-violet-400" />
        <span className="text-sm font-bold text-white">Verification Timeline™</span>
        <span className="text-[10px] text-white/30 ml-auto">Immutable · {logs?.length || 0} events</span>
      </div>
      {!logs || logs.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <Clock size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">No verification events recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 max-h-[500px] overflow-y-auto">
          <div className="relative space-y-3">
            {logs.map((log, idx) => {
              const meta = ACTION_META[log.action] || { label: log.action, Icon: AlertTriangle, color: '#64748b' };
              const Icon = meta.Icon;
              const date = log.reviewed_date || log.submitted_date || log.created_date;
              return (
                <div key={log.id || idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.color + '15' }}>
                      <Icon size={12} style={{ color: meta.color }} />
                    </div>
                    {idx < logs.length - 1 && <div className="w-px flex-1 bg-white/5 mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{meta.label}</span>
                      {log.decision && log.decision !== 'pending' && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${log.decision === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {log.decision}
                        </span>
                      )}
                      {log.risk_level && log.risk_level !== 'low' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">{log.risk_level}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-white/40 mt-0.5">
                      {date ? new Date(date).toLocaleString() : '—'}
                      {log.reviewer_name && <span> · by {log.reviewer_name}</span>}
                      {log.reason && <span> · {log.reason}</span>}
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