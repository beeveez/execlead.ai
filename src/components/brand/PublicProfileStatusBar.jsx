import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { safeParse } from "@/components/profile/FormFields";
import { calculateCompleteness } from "@/lib/resumeSync";
import { getPublicProfileUrl } from "@/lib/socialShare";
import { toast } from "@/components/ui/use-toast";
import {
  Globe, Lock, Eye, Copy, Check, Share2, Loader2, FileEdit,
  Archive, AlertCircle, Calendar,
} from "lucide-react";

function getProfileStatus(profile) {
  if (profile.public_profile_archived) return "archived";
  if (profile.public_profile_enabled && (profile.public_visibility || "private") === "public") return "published";
  if (profile.public_profile_enabled) return "private";
  return "draft";
}

const STATUS_CONFIG = {
  draft: { label: "Draft", icon: FileEdit, color: "amber", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  published: { label: "Published", icon: Globe, color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  private: { label: "Private", icon: Lock, color: "white", bg: "bg-white/5", text: "text-white/40", border: "border-white/10" },
  archived: { label: "Archived", icon: Archive, color: "red", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

function validateForPublish(profile) {
  const errors = [];
  if (!profile.public_username) errors.push("Username");
  if (!profile.profile_photo) errors.push("Profile photo");
  if (!profile.bio && !profile.professional_headline) errors.push("Executive summary");
  const experience = safeParse(profile.experience_json, []);
  if (!experience.length) errors.push("Experience");
  if (!profile.skills?.length) errors.push("Skills");
  const form = {
    ...profile,
    experience: safeParse(profile.experience_json, []),
    education: safeParse(profile.education_json, []),
    certifications: safeParse(profile.certifications_json, []),
    skills: profile.skills || [],
  };
  const { overall } = calculateCompleteness(form);
  if (overall < 60) errors.push(`Profile completion (${overall}%, min 60%)`);
  return { valid: errors.length === 0, errors, completion: overall };
}

export default function PublicProfileStatusBar({ profile, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const status = getProfileStatus(profile);
  const config = STATUS_CONFIG[status];
  const username = profile.public_username || "";
  const publicUrl = getPublicProfileUrl(username);
  const validation = validateForPublish(profile);

  const handlePreview = () => {
    if (!username) {
      toast({ title: "No Username", description: "Generating your username...", variant: "destructive" });
      return;
    }
    window.open(`/u/${username}`, "_blank");
  };

  const handlePublish = async () => {
    if (!validation.valid) {
      setShowErrors(true);
      toast({ title: "Validation Failed", description: "Complete the required fields before publishing.", variant: "destructive" });
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
      await base44.entities.UserProfile.update(profile.id, {
        public_profile_enabled: false,
      });
      await onRefresh?.();
      toast({ title: "Profile Unpublished", description: "Your profile is now private." });
    } catch (e) {
      toast({ title: "Action Failed", description: "Could not unpublish your profile.", variant: "destructive" });
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

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try { return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
    catch { return null; }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
      {/* Status + URL + Date */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
            <config.icon size={11} /> {config.label}
          </span>
          {username && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Globe size={11} className="text-white/20" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{publicUrl}</span>
            </div>
          )}
          {status === "published" && profile.public_published_at && (
            <div className="flex items-center gap-1 text-xs text-white/30">
              <Calendar size={11} /> {formatDate(profile.public_published_at)}
            </div>
          )}
        </div>
        {validation.completion > 0 && (
          <span className={`text-xs font-medium ${validation.valid ? "text-emerald-400" : "text-amber-400"}`}>
            {validation.completion}% complete
          </span>
        )}
      </div>

      {/* Action Buttons */}
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

      {/* Validation Errors */}
      {showErrors && !validation.valid && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="text-amber-400 font-medium mb-1">Complete before publishing:</div>
            <div className="flex flex-wrap gap-1.5">
              {validation.errors.map((err, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80 text-[10px]">{err}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}