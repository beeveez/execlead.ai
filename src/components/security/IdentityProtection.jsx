import React, { useState, useEffect } from "react";
import { ShieldCheck, Mail, Phone, Crown, Smartphone, Fingerprint, Key, Loader2, CheckCircle2, XCircle, Link as LinkIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { calculateTrustLevel, calculateTrustScore, TRUST_LEVELS } from "@/lib/trustEngine";
import { MFA_METHODS } from "@/lib/zeroTrustEngine";

function IdentityRow({ icon: Icon, label, verified, date, link }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-lg">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${verified ? "bg-emerald-500/10" : "bg-white/5"}`}>
        <Icon size={14} className={verified ? "text-emerald-400" : "text-white/30"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white/70 font-medium">{label}</div>
        {verified && date && <div className="text-[11px] text-white/30">Verified: {new Date(date).toLocaleDateString()}</div>}
      </div>
      {verified ? (
        <CheckCircle2 size={16} className="text-emerald-400" />
      ) : link ? (
        <a href={link} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          Verify <LinkIcon size={11} />
        </a>
      ) : (
        <XCircle size={16} className="text-white/20" />
      )}
    </div>
  );
}

export default function IdentityProtection() {
  const { user } = useAuth();
  const { membership } = useSubscription();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setLoading(false); return; }
      try {
        const records = await base44.entities.IdentityVerification.filter({ user_id: user.id });
        setVerification(records[0] || null);
      } catch {}
      setLoading(false);
    };
    load();
  }, [user?.id]);

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

  const trustLevel = calculateTrustLevel(verification);
  const trustScore = calculateTrustScore(verification);
  const levelMeta = TRUST_LEVELS.find(l => l.level === trustLevel);

  return (
    <div className="space-y-4">
      {/* Trust Level Banner */}
      <div className="bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-2">
          <ShieldCheck size={14} /> Executive Identity Status
        </div>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-white">{levelMeta ? levelMeta.display : "Unverified"}</div>
          <div className="text-sm text-white/40">Trust Score: {trustScore}/100 · Level {trustLevel}/5</div>
        </div>
        <p className="text-white/40 text-xs mt-2">
          Identity verification feeds the Executive Trust Score, Risk Engine, Security Dashboard, and Fraud Detection systems automatically.
        </p>
      </div>

      {/* Identity Layers */}
      <div className="grid md:grid-cols-2 gap-3">
        <IdentityRow icon={Mail} label="Email Verification" verified={verification?.email_verified ?? true} date={verification?.email_verified_date} />
        <IdentityRow icon={Phone} label="Phone Verification" verified={verification?.phone_verified ?? false} date={verification?.phone_verified_date} link="/identity-verification" />
        <IdentityRow icon={ShieldCheck} label="Government ID Verification" verified={verification?.identity_verified ?? false} date={verification?.identity_verified_date} link="/identity-verification" />
        <IdentityRow icon={Crown} label="Executive Verification" verified={verification?.verified_executive ?? false} date={verification?.verified_executive_date} link="/identity-verification" />
        <IdentityRow icon={CheckCircle2} label="Enterprise Verification" verified={verification?.professional_verified ?? false} date={verification?.professional_verified_date} />
        <IdentityRow icon={Crown} label="Founder Verification" verified={verification?.founding_member ?? false} date={verification?.founding_member_since} link="/founder" />
      </div>

      {/* Device Registration */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-3">
          <Smartphone size={14} /> Device Registration & Trusted Devices
        </div>
        <p className="text-white/40 text-xs mb-3">Devices must be registered and approved before they are trusted for session authentication.</p>
        <div className="flex items-center gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
          <Fingerprint size={16} className="text-indigo-400" />
          <span className="text-sm text-white/60 flex-1">This device</span>
          <span className="text-xs text-emerald-400">✓ Trusted</span>
        </div>
        <a href="/security" className="block mt-2 text-center text-xs text-indigo-400 hover:text-indigo-300">Manage trusted devices in Sessions →</a>
      </div>

      {/* MFA Methods */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-3">
          <Key size={14} /> Multi-Factor Authentication
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {MFA_METHODS.map((m) => (
            <div key={m.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5">
              <div>
                <div className="text-sm text-white/80">{m.label}</div>
                <div className="text-[10px] text-white/30">{m.description}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${m.status === "live" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}>
                {m.status === "live" ? "Available" : "Future"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}