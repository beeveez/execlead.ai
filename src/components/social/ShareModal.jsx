import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Download, Copy, Check, Briefcase, MessageSquare, ThumbsUp, AtSign, Phone, Send, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { ACHIEVEMENT_TYPES, SHARE_PLATFORMS, PRIVACY_OPTIONS, buildLinkedInPost, getShareUrl } from "@/lib/socialShare";
import ShareCard from "./ShareCard";

const ICONS = { Briefcase, MessageSquare, ThumbsUp, AtSign, Phone, Send, Mail, Copy };

export default function ShareModal({ open, onClose, achievement: achievementType, achievementTitle, userName, executiveScore, leadershipLevel, referralCode }) {
  const [message, setMessage] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [hideName, setHideName] = useState(false);
  const [hideScore, setHideScore] = useState(false);
  const [hideCompany, setHideCompany] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const achievement = ACHIEVEMENT_TYPES[achievementType] || ACHIEVEMENT_TYPES.career_milestone;
  const title = achievementTitle || achievement.label;
  const shareUrl = getShareUrl(referralCode);

  useEffect(() => {
    if (open) {
      setMessage(buildLinkedInPost({ achievementType, achievementTitle: title, userName, executiveScore, leadershipLevel }));
    }
  }, [open]);

  if (!open) return null;

  const handleShare = async (platformKey) => {
    const platform = SHARE_PLATFORMS[platformKey];
    const text = message || buildLinkedInPost({ achievementType, achievementTitle: title, userName, executiveScore, leadershipLevel });
    if (platformKey === "copy") {
      try { await navigator.clipboard.writeText(`${text}\n\n${shareUrl}`); } catch (e) {}
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (platform.shareUrl) {
      window.open(platform.shareUrl(shareUrl, text), "_blank", "noopener,noreferrer");
    }
    try {
      await base44.entities.ShareEvent.create({
        achievement_type: achievementType, achievement_title: title, platform: platformKey,
        privacy_level: privacy, hide_name: hideName, hide_score: hideScore, hide_company: hideCompany,
        executive_score: executiveScore, leadership_level: leadershipLevel, referral_code: referralCode,
      });
    } catch (e) {}
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0d0d14", useCORS: true, scale: 2 });
      const link = document.createElement("a");
      link.download = `execlead-${achievementType}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {}
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <h2 className="text-lg font-bold text-white">Share Your Achievement</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1"><X size={20} /></button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-5">
          {/* Card Preview */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div style={{ transform: "scale(0.82)", transformOrigin: "top center", marginBottom: -80 }}>
                <ShareCard
                  ref={cardRef}
                  achievement={achievement}
                  title={title}
                  userName={userName}
                  executiveScore={executiveScore}
                  leadershipLevel={leadershipLevel}
                  hideName={hideName}
                  hideScore={hideScore}
                  referralCode={referralCode}
                />
              </div>
            </div>
            <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors disabled:opacity-40">
              {downloading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /> : <Download size={14} />}
              Download Card
            </button>
          </div>

          {/* Controls */}
          <div className="space-y-5">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Share to</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(SHARE_PLATFORMS).map(([key, platform]) => {
                  const Icon = ICONS[platform.icon];
                  return (
                    <button key={key} onClick={() => handleShare(key)} className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${platform.color}20` }}>
                        {key === "copy" && copied ? <Check size={16} className="text-emerald-400" /> : <Icon size={16} style={{ color: platform.color }} />}
                      </div>
                      <span className="text-[10px] text-white/40 group-hover:text-white/60">{platform.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Your Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
              <p className="text-white/20 text-[10px] mt-1">Edit before sharing. Hashtags included for LinkedIn.</p>
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Privacy</label>
              <div className="space-y-1.5">
                {PRIVACY_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setPrivacy(opt.value)} className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${privacy === opt.value ? "bg-indigo-500/10 border border-indigo-500/30" : "bg-white/5 border border-white/5"}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${privacy === opt.value ? "border-indigo-400 bg-indigo-400" : "border-white/20"}`} />
                    <div>
                      <div className={`text-xs font-medium ${privacy === opt.value ? "text-indigo-400" : "text-white/60"}`}>{opt.label}</div>
                      <div className="text-[10px] text-white/30">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Hide Details</label>
              <div className="flex flex-wrap gap-2">
                {[{ label: "Name", val: hideName, set: setHideName }, { label: "Score", val: hideScore, set: setHideScore }, { label: "Company", val: hideCompany, set: setHideCompany }].map(item => (
                  <button key={item.label} onClick={() => item.set(!item.val)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${item.val ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-white/5 text-white/40 border border-white/5"}`}>
                    {item.val ? "Hidden" : "Show"} {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}