import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useExecVerified } from "@/hooks/useExecVerified";
import { VERIFICATION_STATUSES, SUB_STATUSES, SUB_STATUS_FIELDS } from "@/lib/execVerifiedCatalog";
import { ShieldCheck, ArrowLeft, Fingerprint, Briefcase, Award, Users, Building2, Clock } from "lucide-react";

const SUB_ICONS = { identity_status: Fingerprint, employment_status: Briefcase, certification_status: Award, executive_status: Users, enterprise_status: Building2 };

export default function VerificationStatus() {
  const { enabled, loading: flagLoading } = useExecVerified();
  const { user } = useAuth();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !user?.id) { setLoading(false); return; }
    base44.entities.ExecVerification.filter({ user_id: user.id })
      .then((records) => setVerification(records?.[0] || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enabled, user?.id]);

  if (!flagLoading && !enabled) return <Navigate to="/security" replace />;
  if (loading || flagLoading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /></div>;

  if (!verification) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <ShieldCheck size={32} className="text-white/30 mx-auto mb-3" />
        <p className="text-white/50 text-sm mb-4">No verification application found.</p>
        <Link to="/verification/apply" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-colors">
          Apply for Verification
        </Link>
      </div>
    );
  }

  const status = verification.verification_status || "not_available";
  const statusMeta = VERIFICATION_STATUSES[status] || VERIFICATION_STATUSES.not_available;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/verification" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 mb-2">
          <ArrowLeft size={12} /> Verification Center
        </Link>
        <h1 className="text-2xl font-bold text-white">Verification Status</h1>
      </div>

      {/* Overall Status */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Overall Status</div>
            <div className="text-lg font-bold text-white">{statusMeta.label}</div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            status === "verified" ? "bg-emerald-500/10" :
            status === "pending" || status === "under_review" ? "bg-amber-500/10" :
            status === "rejected" || status === "suspended" ? "bg-red-500/10" : "bg-white/5"
          }`}>
            <ShieldCheck size={20} className={status === "verified" ? "text-emerald-400" : status === "pending" ? "text-amber-400" : "text-white/40"} />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
          <DateField label="Applied" value={verification.application_date} />
          <DateField label="Verified" value={verification.verification_date} />
          <DateField label="Expires" value={verification.expiration_date} />
          <DateField label="Renewal" value={verification.renewal_date} />
        </div>
      </div>

      {/* Sub-Statuses */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <h2 className="text-white font-semibold text-sm mb-4">Verification Areas</h2>
        <div className="space-y-2">
          {SUB_STATUS_FIELDS.map(({ field, label, desc }) => {
            const subStatus = verification[field] || "not_started";
            const subMeta = SUB_STATUSES[subStatus] || SUB_STATUSES.not_started;
            const Icon = SUB_ICONS[field] || ShieldCheck;
            return (
              <div key={field} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.01] border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 font-medium">{label}</div>
                  <div className="text-[11px] text-white/30">{desc}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  subStatus === "verified" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                  subStatus === "pending" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                  subStatus === "rejected" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                  "text-white/40 bg-white/5 border-white/10"
                }`}>
                  {subMeta.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence Confidence */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <h2 className="text-white font-semibold text-sm mb-4">Evidence Confidence™</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="#6366f1" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 - (verification.evidence_confidence || 0) / 100 * 2 * Math.PI * 28}
                className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{verification.evidence_confidence || 0}</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-white/70 font-medium">{verification.evidence_count || 0} evidence items</div>
            <div className="text-xs text-white/40 mt-0.5">Evidence Confidence™ is calculated from the quality and quantity of submitted evidence.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DateField({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-sm text-white/70 font-medium mt-0.5">{value ? new Date(value).toLocaleDateString() : "—"}</div>
    </div>
  );
}