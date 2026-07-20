import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useExecVerified } from "@/hooks/useExecVerified";
import { VERIFICATION_LEVELS, VERIFICATION_STATUSES, WORKFLOW_STAGES } from "@/lib/execVerifiedCatalog";
import { ShieldCheck, Fingerprint, Briefcase, Building2, Mail, ArrowRight, Clock, FileText, Award, ChevronRight } from "lucide-react";
import VerificationIntelligence from "@/components/verification/VerificationIntelligence";
import VerifiedBenefits from "@/components/verification/VerifiedBenefits";

const LEVEL_ICONS = { Mail, Fingerprint, Briefcase, ShieldCheck, Building2 };

export default function VerificationCenter() {
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

  const status = verification?.verification_status || "not_available";
  const statusMeta = VERIFICATION_STATUSES[status] || VERIFICATION_STATUSES.not_available;
  const currentLevel = verification?.verification_level_number || 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/10 rounded-xl p-6">
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <ShieldCheck size={12} className="text-indigo-400" /> EXEC™ Verified Framework™
        </div>
        <h1 className="text-2xl font-bold text-white">Verification Center</h1>
        <p className="text-white/50 text-sm mt-2 leading-relaxed max-w-3xl">
          EXEC™ Verified is a trust framework, not a paid badge. It represents verified executive identity,
          professional credibility, and evidence-backed leadership. Verification requires review and cannot be purchased.
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">Verification Status</h2>
          <span className={`text-xs px-3 py-1 rounded-full border ${
            status === "verified" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
            status === "pending" || status === "under_review" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
            status === "rejected" || status === "suspended" ? "text-red-400 bg-red-500/10 border-red-500/20" :
            "text-white/40 bg-white/5 border-white/10"
          }`}>
            {statusMeta.label}
          </span>
        </div>

        {!verification && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={24} className="text-white/30" />
            </div>
            <p className="text-white/50 text-sm mb-1">You have not applied for EXEC™ Verified.</p>
            <p className="text-white/30 text-xs mb-4 max-w-md mx-auto">
              Submit an application to begin the verification process. Verification is free and requires evidence-based review.
            </p>
            <Link to="/verification/apply" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-colors">
              Apply for Verification <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {verification && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatusField label="Applied" value={verification.application_date ? new Date(verification.application_date).toLocaleDateString() : "—"} />
              <StatusField label="Verified" value={verification.verification_date ? new Date(verification.verification_date).toLocaleDateString() : "—"} />
              <StatusField label="Expires" value={verification.expiration_date ? new Date(verification.expiration_date).toLocaleDateString() : "—"} />
              <StatusField label="Renewal" value={verification.renewal_date ? new Date(verification.renewal_date).toLocaleDateString() : "—"} />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <FileText size={14} className="text-white/40" />
              <span className="text-xs text-white/50">Evidence: {verification.evidence_count || 0} items</span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-white/50">Confidence: {verification.evidence_confidence || 0}%</span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-white/50">Stage: {WORKFLOW_STAGES[verification.workflow_stage]?.label || "—"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Verification Intelligence™ */}
      {verification && <VerificationIntelligence verification={verification} />}

      {/* Verified Benefits */}
      {verification && <VerifiedBenefits verificationLevel={verification.verification_level_number || 1} />}

      {/* Verification Level Progress */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <h2 className="text-white font-semibold text-sm mb-4">Verification Levels</h2>
        <div className="space-y-2">
          {VERIFICATION_LEVELS.map((level) => {
            const Icon = LEVEL_ICONS[level.icon] || ShieldCheck;
            const achieved = currentLevel >= level.level;
            return (
              <div key={level.level} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                achieved ? "bg-emerald-500/5 border-emerald-500/15" : "bg-white/[0.01] border-white/5"
              }`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  achieved ? "bg-emerald-500/10" : "bg-white/5"
                }`}>
                  <Icon size={16} className={achieved ? "text-emerald-400" : "text-white/30"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${achieved ? "text-white/80" : "text-white/50"}`}>Level {level.level}: {level.name}</span>
                  </div>
                  <p className="text-[11px] text-white/30 mt-0.5">{level.description}</p>
                </div>
                {achieved && <ShieldCheck size={14} className="text-emerald-400 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink to="/verification/status" icon={ShieldCheck} label="Status" desc="Detailed verification status" />
        <QuickLink to="/verification/history" icon={Clock} label="History" desc="Verification timeline" />
        <QuickLink to="/verification/evidence" icon={FileText} label="Evidence" desc="Manage evidence" />
        <QuickLink to="/verification/apply" icon={ArrowRight} label="Apply" desc="Submit application" />
      </div>
    </div>
  );
}

function StatusField({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-sm text-white/70 font-medium mt-0.5">{value}</div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, desc }) {
  return (
    <Link to={to} className="group flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/5 transition-colors">
      <Icon size={16} className="text-indigo-400" />
      <span className="text-xs font-medium text-white/70">{label}</span>
      <span className="text-[10px] text-white/30">{desc}</span>
    </Link>
  );
}