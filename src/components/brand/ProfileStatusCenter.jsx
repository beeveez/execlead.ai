import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { getProfileStatus, STATUS_CONFIG, validateForPublish, getOpenGraphStatus } from "@/lib/profileCompletion";
import { getPublicProfileUrl } from "@/lib/socialShare";
import { toast } from "@/components/ui/use-toast";
import {
  Globe, Lock, Eye, Copy, Check, Share2, Loader2, FileEdit,
  Archive, AlertCircle, Calendar, Link2, QrCode, Image, RefreshCw, Sparkles,
} from "lucide-react";

const ICON_MAP = { FileEdit, Globe, Lock, Archive };

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status];
  const Icon = ICON_MAP[config.icon] || FileEdit;
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function StatRow({ icon: Icon, label, value, status }) {
  const statusColor = status === "ready" ? "text-emerald-400" : status === "missing" ? "text-amber-400" : "text-white/70";
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-2 text-xs text-white/40">
        <Icon size={12} className="text-white/30" /> {label}
      </div>
      <div className={`text-xs font-medium ${statusColor} truncate max-w-[60%] text-right`}>{value}</div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return "—"; }
}

export default function ProfileStatusCenter({ profile, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const status = getProfileStatus(profile);
  const validation = validateForPublish(profile);
  const ogStatus = getOpenGraphStatus(profile);
  const username = profile?.public_username || "";
  const publicUrl = getPublicProfileUrl(username);

  const handlePreview = () => {
    if (!username) {
      toast({ title: "No Username", description: "Set a username first.", variant: "destructive" });
      return;
    }
    window.open(`/u/${username}`, "_blank");
  };

  const handlePublish = async () => {
    if (!validation.valid) {
      setShowErrors(true);
      toast({ title: "Missing Requirements", description: `${validation.missing.length} items need attention before publishing.`, variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await base44.entities.UserProfile.update(profile.id, {
        public_profile_enabled: true,
        public_visibility: "public",
        public_published_at: new Date().toISOString(),
        public_profile_archived: false,
      });
      await onRefresh?.();
      toast({ title: "Profile Published", description: "Your executive profile is now live." });
      setShowErrors(false);
    } catch (e) {
      toast({ title: "Publish Failed", description: "Could not publish your profile.", variant: "destructive" });
    }
    setBusy(false);
  };

  const handleUnpublish = async () => {
    setBusy(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { public_profile_enabled: false });
      await onRefresh?.();
      toast({ title: "Profile Unpublished", description: "Your profile is now private." });
    } catch (e) {
      toast({ title: "Action Failed", description: "Could not unpublish.", variant: "destructive" });
    }
    setBusy(false);
  };

  const handleCopy = () => {
    if (!username) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "URL Copied", description: "Share your profile anywhere." });
  };

  const handleShare = async () => {
    if (!username) return;
    const shareData = { title: `${profile.full_name} — Executive Profile`, text: profile.professional_headline || "", url: publicUrl };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Profile Status Center</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="p-5 space-y-1">
        <StatRow icon={Link2} label="Public URL" value={username ? publicUrl : "Not set"} status={username ? "ready" : "missing"} />
        <StatRow icon={FileEdit} label="Username" value={username || "Not set"} status={username ? "ready" : "missing"} />
        <StatRow icon={Calendar} label="Published Date" value={formatDate(profile?.public_published_at)} status={profile?.public_published_at ? "ready" : "neutral"} />
        <StatRow icon={RefreshCw} label="Last Updated" value={formatDate(profile?.updated_date)} />
        <StatRow icon={QrCode} label="QR Code" value={username ? "Generated" : "Pending username"} status={username ? "ready" : "missing"} />
        <StatRow icon={Image} label="Open Graph" value={ogStatus.ready ? "Ready" : `Missing: ${ogStatus.missing.join(", ")}`} status={ogStatus.ready ? "ready" : "missing"} />
        <StatRow icon={Globe} label="Profile Completion" value={`${validation.completion}%`} status={validation.completion >= 80 ? "ready" : "missing"} />
      </div>

      <div className="px-5 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handlePreview} disabled={!username} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors disabled:opacity-30">
            <Eye size={13} /> Preview
          </button>
          {status === "published" ? (
            <button onClick={handleUnpublish} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors disabled:opacity-40">
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />} Unpublish
            </button>
          ) : (
            <button onClick={handlePublish} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors disabled:opacity-40">
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />} Publish
            </button>
          )}
          <button onClick={handleCopy} disabled={!username} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors disabled:opacity-30">
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />} {copied ? "Copied" : "Copy URL"}
          </button>
          <button onClick={handleShare} disabled={!username} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors disabled:opacity-30">
            <Share2 size={13} /> Share
          </button>
        </div>

        {showErrors && !validation.valid && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="text-amber-400 font-medium mb-1">Complete before publishing ({validation.completion}% / {validation.minRequired}% required):</div>
              <div className="flex flex-wrap gap-1.5">
                {validation.missing.map((m, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80 text-[10px]">{m.label}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}