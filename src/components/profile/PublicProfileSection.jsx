import React, { useState } from "react";
import { SectionCard, ToggleField, safeParse } from "./FormFields";
import { calculateCompleteness } from "@/lib/resumeSync";
import { getPublicProfileUrl } from "@/lib/socialShare";
import { toast } from "@/components/ui/use-toast";
import {
  Globe, Lock, Copy, ExternalLink, RefreshCw, Eye, Search,
  Check, AlertCircle, Share2, Users, Building2,
} from "lucide-react";

const PUBLISH_THRESHOLD = 80;

const CONTENT_SECTIONS = [
  { key: "executive_summary", label: "Executive Summary", desc: "Your bio and headline" },
  { key: "experience", label: "Experience", desc: "Career timeline" },
  { key: "education", label: "Education", desc: "Academic background" },
  { key: "certifications", label: "Certifications" },
  { key: "skills", label: "Skills" },
  { key: "leadership_dna", label: "Leadership DNA", desc: "Assessment results" },
  { key: "promotion_readiness", label: "Promotion Readiness", desc: "Readiness score" },
  { key: "resume", label: "Resume Download" },
  { key: "learning_paths", label: "Learning Paths" },
  { key: "portfolio", label: "Portfolio" },
  { key: "contact_form", label: "Contact Form" },
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", desc: "Visible to everyone", icon: Globe },
  { value: "connections", label: "Connections", desc: "Your network only", icon: Users },
  { value: "organization", label: "Organization", desc: "Your org members", icon: Building2 },
  { value: "private", label: "Private", desc: "Only you", icon: Lock },
];

const HIDE_OPTIONS = [
  { key: "public_hide_email", label: "Email Address", desc: "Hide from public" },
  { key: "public_hide_phone", label: "Phone Number", desc: "Hide from public" },
  { key: "public_hide_address", label: "Address", desc: "Hide location" },
  { key: "public_hide_salary", label: "Salary", desc: "Hide salary expectations" },
  { key: "public_hide_notes", label: "Internal Notes", desc: "Hide private notes" },
];

function generateUsername(name) {
  const base = (name || "executive").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "executive";
  const suffix = Math.random().toString(36).substring(2, 5);
  return `${base}-${suffix}`.slice(0, 30);
}

function getContentSettings(json) {
  const parsed = safeParse(json, {});
  const defaults = {};
  CONTENT_SECTIONS.forEach(s => { defaults[s.key] = true; });
  return { ...defaults, ...parsed };
}

export default function PublicProfileSection({ form, setField, profile, onPublish }) {
  const [copied, setCopied] = useState(false);

  const isPublished = form.public_profile_enabled;
  const username = form.public_username || "";
  const publicUrl = getPublicProfileUrl(username);
  const contentSettings = getContentSettings(form.public_content_json);
  const { sections, overall } = calculateCompleteness(form);
  const canPublish = overall >= PUBLISH_THRESHOLD;

  const incompleteSections = Object.entries(sections || {})
    .filter(([, s]) => s.score < 80)
    .map(([, s]) => s.label);

  const handleCopy = () => {
    if (!username) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    if (!username) return;
    window.open(`/u/${username}`, "_blank");
  };

  const handleShare = async () => {
    if (!username) return;
    const shareData = { title: `${form.full_name} — Executive Profile`, text: form.professional_headline || "", url: publicUrl };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link Copied", description: "Share your profile anywhere." });
    }
  };

  const handleRegenerate = () => {
    const newName = generateUsername(form.full_name || form.first_name);
    setField("public_username", newName);
    toast({ title: "Username Generated", description: "Click Save Changes to apply." });
  };

  const handleContentToggle = (key, val) => {
    const updated = { ...contentSettings, [key]: val };
    setField("public_content_json", JSON.stringify(updated));
  };

  const handlePublishToggle = () => {
    if (!isPublished && !canPublish) {
      toast({ title: "Profile Incomplete", description: `Reach ${PUBLISH_THRESHOLD}% completion to publish.`, variant: "destructive" });
      return;
    }
    if (!isPublished && !username) {
      const newName = generateUsername(form.full_name || form.first_name);
      setField("public_username", newName);
      toast({ title: "Username Generated", description: "Click Save Changes first, then publish." });
      return;
    }
    onPublish(!isPublished);
  };

  return (
    <div className="space-y-4">
      {/* Status & Publish */}
      <SectionCard title="Profile Status" description="Manage your public executive profile visibility." icon={isPublished ? Globe : Lock}>
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPublished ? "bg-emerald-500/10" : "bg-white/5"}`}>
              {isPublished ? <Globe size={18} className="text-emerald-400" /> : <Lock size={18} className="text-white/30" />}
            </div>
            <div>
              <div className="text-white font-medium text-sm">{isPublished ? "Public" : "Private"}</div>
              <div className="text-white/40 text-xs">{isPublished ? "Your executive profile is live" : "Only you can see your profile"}</div>
            </div>
          </div>
          <button
            onClick={handlePublishToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isPublished
                ? "bg-white/5 hover:bg-white/10 text-white/60"
                : canPublish
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            {isPublished ? "Unpublish" : "Publish Profile"}
          </button>
        </div>

        {!canPublish && !isPublished && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="text-amber-400 font-medium">Profile {overall}% complete — needs {PUBLISH_THRESHOLD}% to publish</div>
              {incompleteSections.length > 0 && <div className="text-white/40 mt-1">Complete: {incompleteSections.join(", ")}</div>}
            </div>
          </div>
        )}
        {canPublish && !isPublished && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <Check size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-400 font-medium">Profile {overall}% complete — ready to publish!</div>
          </div>
        )}
      </SectionCard>

      {/* Public URL */}
      <SectionCard title="Public URL" description="Your shareable executive profile link." icon={ExternalLink}>
        {username ? (
          <>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <Globe size={14} className="text-white/30 flex-shrink-0" />
              <span className="text-sm text-white/60 truncate flex-1">{publicUrl}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              <button onClick={handleCopy} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={handleOpen} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
                <ExternalLink size={12} /> Open
              </button>
              <button onClick={handleOpen} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
                <Eye size={12} /> Preview
              </button>
              <button onClick={handleShare} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
                <Share2 size={12} /> Share
              </button>
              <button onClick={handleRegenerate} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
                <RefreshCw size={12} /> Username
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-white/40 text-sm mb-3">No username set. Generate one to get your public URL.</p>
            <button onClick={handleRegenerate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
              <RefreshCw size={14} /> Generate Username
            </button>
          </div>
        )}
      </SectionCard>

      {/* Visibility */}
      <SectionCard title="Visibility" description="Control who can view your public profile." icon={Eye}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {VISIBILITY_OPTIONS.map(v => (
            <button
              key={v.value}
              onClick={() => setField("public_visibility", v.value)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-all ${
                (form.public_visibility || "private") === v.value
                  ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                  : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              <v.icon size={18} />
              <span className="text-xs font-medium">{v.label}</span>
              <span className="text-[10px] text-white/20 text-center px-1">{v.desc}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Public Content */}
      <SectionCard title="Public Content" description="Choose what's visible on your public profile." icon={Globe}>
        {CONTENT_SECTIONS.map(s => (
          <ToggleField
            key={s.key}
            label={s.label}
            description={s.desc}
            value={contentSettings[s.key] !== false}
            onChange={v => handleContentToggle(s.key, v)}
          />
        ))}
      </SectionCard>

      {/* Hidden Information */}
      <SectionCard title="Hidden Information" description="Hide specific details from your public profile." icon={Lock}>
        {HIDE_OPTIONS.map(h => (
          <ToggleField
            key={h.key}
            label={h.label}
            description={h.desc}
            value={form[h.key] !== false}
            onChange={v => setField(h.key, v)}
          />
        ))}
      </SectionCard>

      {/* Search Engine */}
      <SectionCard title="Search Engine" description="Control how search engines index your profile." icon={Search}>
        <ToggleField
          label="Allow Google Indexing"
          description="Let search engines find and display your profile"
          value={form.allow_search_indexing || false}
          onChange={v => setField("allow_search_indexing", v)}
        />
        <p className="text-xs text-white/30 leading-relaxed">
          When enabled, an Open Graph preview is generated for social media sharing. When disabled, search engines are instructed not to index your profile.
        </p>
      </SectionCard>
    </div>
  );
}