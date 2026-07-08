import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Crown, Loader2, Phone, Briefcase, FileText, Dna, Globe, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import { recalculateTrust, IDENTITY_STATUSES, TRUST_LEVELS, calculateTrustLevel } from "@/lib/trustEngine";
import TrustScoreCard from "@/components/trust/TrustScoreCard";
import ExecutiveTrustPanel from "@/components/trust/ExecutiveTrustPanel";
import IdentityUpload from "@/components/trust/IdentityUpload";
import VerificationHistory from "@/components/trust/VerificationHistory";

export default function IdentityVerification() {
  const { user } = useAuth();
  const { profile, membership } = useSubscription();
  const { foundingMember } = useFoundingMember();
  const [verification, setVerification] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneModal, setPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const records = await base44.entities.IdentityVerification.filter({ user_id: user.id });
      let record = records[0];

      if (!record) {
        record = await base44.entities.IdentityVerification.create({
          user_id: user.id,
          user_name: user.full_name || user.email,
          user_email: user.email,
          email_verified: true,
          email_verified_date: new Date().toISOString(),
          identity_status: "pending_upload",
          verification_provider: "none",
        });
      }

      // Sync auto-detectable fields from profile/membership
      const updates = {};
      if (profile) {
        if (profile.public_profile_enabled && !record.profile_published) {
          updates.profile_published = true;
          updates.profile_published_date = profile.public_published_at || new Date().toISOString();
        }
        if (profile.founding_member && !record.founding_member) {
          updates.founding_member = true;
          updates.founding_member_since = profile.founding_member_since || new Date().toISOString().split("T")[0];
        }
        if (profile.organization_id && !record.organization_id) {
          updates.organization_id = profile.organization_id;
        }
      }
      if (foundingMember?.founding_member_number && !record.founding_member_number) {
        updates.founding_member_number = foundingMember.founding_member_number;
      }
      if (membership?.type === "founding_member" && !record.founding_member) {
        updates.founding_member = true;
        updates.founding_member_since = membership.since || new Date().toISOString().split("T")[0];
      }

      if (Object.keys(updates).length > 0) {
        const recalced = recalculateTrust({ ...record, ...updates });
        record = await base44.entities.IdentityVerification.update(record.id, { ...updates, trust_score: recalced.trust_score, trust_level: recalced.trust_level });
      } else {
        const recalced = recalculateTrust(record);
        if (recalced.trust_score !== record.trust_score || recalced.trust_level !== record.trust_level) {
          record = await base44.entities.IdentityVerification.update(record.id, { trust_score: recalced.trust_score, trust_level: recalced.trust_level });
        }
      }

      setVerification(record);

      try {
        const logRecords = await base44.entities.VerificationLog.filter({ verification_id: record.id }, "-created_date", 50);
        setLogs(logRecords);
      } catch {}
    } catch (e) {}
    setLoading(false);
  }, [user?.id, profile?.id, foundingMember?.id, membership?.type]);

  useEffect(() => { load(); }, [load]);

  const handlePhoneVerify = async () => {
    setPhoneError("");
    if (!otpSent) {
      if (!phoneNumber.trim()) { setPhoneError("Enter a valid phone number"); return; }
      setOtpSent(true);
    } else {
      if (!otpCode.trim()) { setPhoneError("Enter the OTP code"); return; }
      try {
        const updates = {
          phone_verified: true,
          phone_verified_date: new Date().toISOString(),
          phone_number: phoneNumber,
        };
        const recalced = recalculateTrust({ ...verification, ...updates });
        const updated = await base44.entities.IdentityVerification.update(verification.id, { ...updates, trust_score: recalced.trust_score, trust_level: recalced.trust_level });
        await base44.entities.VerificationLog.create({
          verification_id: verification.id,
          user_id: verification.user_id,
          user_name: verification.user_name,
          action: "phone_verified",
          decision: "approved",
          notes: `Phone verified: ${phoneNumber}`,
        });
        setVerification(updated);
        setPhoneModal(false);
        setOtpSent(false);
        setPhoneNumber("");
        setOtpCode("");
        load();
      } catch (e) {
        setPhoneError(e.message || "Verification failed");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  const level = calculateTrustLevel(verification);
  const levelMeta = TRUST_LEVELS.find(l => l.level === level);
  const status = verification?.identity_status || "pending_upload";
  const statusMeta = IDENTITY_STATUSES[status];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <ShieldCheck size={12} className="text-violet-400" /> Account · Identity Verification
        </div>
        <h1 className="text-2xl font-bold text-white">Executive Trust Framework</h1>
        <p className="text-white/40 text-sm mt-2 max-w-2xl leading-relaxed">
          Establish trust across the EXECLEAD.AI network. Verify your identity, professional status,
          and executive credentials to unlock the Verified Executive badge.
        </p>
      </div>

      {/* Trust Score + Identity Status */}
      <div className="grid md:grid-cols-2 gap-4">
        <TrustScoreCard verification={verification} />
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="text-white/30 text-xs uppercase tracking-widest mb-2">Identity Status</div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${statusMeta?.badgeClass || ""}`}>
              {statusMeta?.label || "Pending"}
            </span>
            {levelMeta && (
              <span className="text-xs text-white/40">Level {level} · {levelMeta.name}</span>
            )}
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40 flex items-center gap-1.5"><Mail size={12} /> Email</span>
              <span className={verification.email_verified ? "text-emerald-400" : "text-white/30"}>{verification.email_verified ? "✓ Verified" : "Pending"}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40 flex items-center gap-1.5"><Phone size={12} /> Phone</span>
              {verification.phone_verified ? (
                <span className="text-emerald-400">✓ Verified</span>
              ) : (
                <button onClick={() => setPhoneModal(true)} className="text-indigo-400 hover:text-indigo-300">Verify Now</button>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40 flex items-center gap-1.5"><ShieldCheck size={12} /> Identity</span>
              <span className={verification.identity_verified ? "text-emerald-400" : "text-white/30"}>{verification.identity_verified ? "✓ Verified" : "Pending"}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40 flex items-center gap-1.5"><Briefcase size={12} /> Professional</span>
              <span className={verification.professional_verified ? "text-emerald-400" : "text-white/30"}>{verification.professional_verified ? "✓ Verified" : "Pending"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Trust Panel */}
      <ExecutiveTrustPanel verification={verification} />

      {/* Identity Upload */}
      <IdentityUpload verification={verification} onUpdate={load} />

      {/* Founder Verification (separate from identity) */}
      {verification.founding_member && (
        <div className="bg-gradient-to-br from-amber-500/[0.06] to-transparent border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Crown size={20} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">🏆 Founding Member</h3>
              <p className="text-white/40 text-xs mt-0.5">Verified Founder — separate from Identity Verification</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div>
              <div className="text-white/30 text-[10px] uppercase tracking-wider">Founder Number</div>
              <div className="text-amber-400 text-sm font-medium mt-0.5">{verification.founding_member_number || "—"}</div>
            </div>
            <div>
              <div className="text-white/30 text-[10px] uppercase tracking-wider">Founder Since</div>
              <div className="text-white/70 text-sm mt-0.5">
                {verification.founding_member_since ? new Date(verification.founding_member_since).toLocaleDateString() : "—"}
              </div>
            </div>
            <div>
              <div className="text-white/30 text-[10px] uppercase tracking-wider">Status</div>
              <div className="text-amber-400 text-sm font-medium mt-0.5">Verified Founder</div>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Verification */}
      {verification.organization_id && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={16} className="text-cyan-400" />
            <h3 className="text-white font-semibold text-sm">Enterprise Verification</h3>
          </div>
          {verification.professional_verified && verification.professional_verified_by ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-sm">✓ Verified by {verification.professional_verified_by}</span>
            </div>
          ) : (
            <p className="text-white/40 text-xs">
              Your organization admin can approve your Professional Verification.
              {verification.organization_name && ` Organization: ${verification.organization_name}`}
            </p>
          )}
        </div>
      )}

      {/* Verification History */}
      <VerificationHistory logs={logs} />

      {/* Phone Verification Modal */}
      {phoneModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPhoneModal(false)}>
          <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-sm mb-4">Phone Verification</h3>
            {!otpSent ? (
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50"
              />
            ) : (
              <input
                type="text"
                placeholder="Enter OTP code"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 text-center tracking-widest"
              />
            )}
            {phoneError && <p className="text-xs text-red-400 mt-2">{phoneError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setPhoneModal(false); setOtpSent(false); setPhoneError(""); }} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium">Cancel</button>
              <button onClick={handlePhoneVerify} className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">
                {otpSent ? "Verify OTP" : "Send OTP"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}