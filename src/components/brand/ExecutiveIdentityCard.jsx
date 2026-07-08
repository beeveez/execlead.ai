import React, { useRef, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BadgeCheck, Download, FileText, Copy, Check, ExternalLink, Crown, Target } from "lucide-react";
import { getQrUrl, getPublicProfileUrl, getExecutiveSlug, computeExecutiveScore, getLeadershipLevel } from "@/lib/socialShare";
import { useSubscription } from "@/lib/SubscriptionContext";
import { toast } from "@/components/ui/use-toast";
import ExecutivePrintPreview from "@/components/brand/ExecutivePrintPreview";

function generateUsername(profile) {
  const name = profile?.full_name || profile?.display_name || profile?.first_name || "executive";
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "executive";
  const suffix = Math.random().toString(36).substring(2, 5);
  return `${base}-${suffix}`.slice(0, 30);
}

export default function ExecutiveIdentityCard({ profile, onRefresh }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [ensuring, setEnsuring] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  // Founder status from the centralized Entitlement Service only.
  const { membership } = useSubscription();
  const isFoundingMember = membership?.type === "founding_member";

  // Auto-create draft: persist public_username if not yet set
  useEffect(() => {
    if (!profile?.id || profile.public_username) return;
    setEnsuring(true);
    const slug = generateUsername(profile);
    base44.entities.UserProfile.update(profile.id, { public_username: slug })
      .then(() => onRefresh?.())
      .catch(() => {})
      .finally(() => setEnsuring(false));
  }, [profile?.id, profile?.public_username]);

  const slug = profile?.public_username || getExecutiveSlug(profile);
  const publicUrl = getPublicProfileUrl(slug);
  const execScore = computeExecutiveScore(profile);
  const level = getLeadershipLevel(execScore);

  const metrics = [
    { label: "Promotion Readiness", value: profile?.promotion_readiness || 0, suffix: "%", color: "#06b6d4" },
    { label: "Leadership DNA", value: profile?.leadership_maturity || 0, suffix: "%", color: "#a855f7" },
    { label: "Executive Score", value: execScore, suffix: "/100", color: "#6366f1" },
    { label: "Leadership Level", value: level, color: "#f59e0b" },
  ];

  const copyLink = () => {
    try { navigator.clipboard.writeText(publicUrl); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPng = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0d0d14", useCORS: true, scale: 2 });
      const link = document.createElement("a");
      link.download = `execlead-identity-${slug || "profile"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {}
    setDownloading(false);
  };

  const openPrintPreview = () => setShowPreview(true);

  if (!profile) return null;

  return (
    <div className="space-y-4">
      <div ref={cardRef} className="relative bg-gradient-to-br from-[#11111a] to-[#0d0d14] border border-white/10 rounded-2xl p-6 overflow-hidden" style={{ minHeight: 520 }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between mb-6">
          <div>
            <div className="text-lg font-bold text-white tracking-tight">EXECLEAD<span className="text-indigo-400">.AI</span></div>
            <div className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Executive Leadership OS</div>
          </div>
          {profile?.verified_executive && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <BadgeCheck size={12} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">Verified Executive</span>
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-4 mb-6">
          <div className="relative">
            {profile?.profile_photo ? (
              <img src={profile.profile_photo} alt={profile.full_name} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/30" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/10 flex items-center justify-center text-2xl font-bold text-white border-2 border-indigo-500/30">
                {(profile?.full_name || "?").charAt(0)}
              </div>
            )}
            {isFoundingMember && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0d0d14] flex items-center justify-center border-2 border-amber-500/40" title="Founding Member">
                <Crown size={12} className="text-amber-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{profile?.full_name || "Executive Leader"}</h2>
            <p className="text-sm text-white/50 truncate">{profile?.current_role || profile?.professional_headline || "Executive"}</p>
            {profile?.current_company && <p className="text-xs text-white/30 truncate">{profile.current_company}</p>}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{level}</span>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3 mb-6">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
              <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">{m.label}</div>
              {typeof m.value === "number" ? (
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold" style={{ color: m.color }}>{m.value}</span>
                  <span className="text-xs text-white/30">{m.suffix}</span>
                </div>
              ) : (
                <div className="text-sm font-semibold" style={{ color: m.color }}>{m.value}</div>
              )}
            </div>
          ))}
        </div>

        <div className="relative flex items-center gap-2 mb-6 p-3 bg-white/[0.02] rounded-xl border border-white/5">
          <Target size={14} className="text-indigo-400 shrink-0" />
          <div className="text-xs text-white/50">
            Target: <span className="text-white/70 font-medium">{profile?.target_role || "—"}</span>
            {profile?.target_company && <span> at <span className="text-white/70 font-medium">{profile.target_company}</span></span>}
          </div>
        </div>

        <div className="relative flex items-center gap-4 pt-4 border-t border-white/5">
          <img src={getQrUrl(`${publicUrl}?source=qr`)} alt="QR" crossOrigin="anonymous" className="w-16 h-16 rounded-lg" />
          <div>
            <div className="text-xs font-semibold text-white/70">EXECLEAD.AI</div>
            <div className="text-[10px] text-white/30">The Executive Leadership Operating System</div>
            <div className="text-[10px] text-white/40 mt-1">Scan to view executive profile</div>
            <div className="flex items-center gap-1 mt-1">
              <BadgeCheck size={10} className="text-emerald-400" />
              <span className="text-[9px] text-emerald-400">Verified Executive</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={downloadPng} disabled={downloading} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors disabled:opacity-40">
          {downloading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={13} />}
          PNG
        </button>
        <button onClick={openPrintPreview} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">
          <FileText size={13} /> PDF
        </button>
        <button onClick={copyLink} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy Link"}
        </button>
        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">
          <ExternalLink size={13} /> Open
        </a>
      </div>

      {showPreview && (
        <ExecutivePrintPreview profile={profile} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}