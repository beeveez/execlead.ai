import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Download, Copy, Check, QrCode, Briefcase, MessageSquare, ThumbsUp, AtSign, Phone, Send, Mail, Cloud, MessageCircle, Newspaper, Share2 } from "lucide-react";
import {
  SHARE_PLATFORMS, PLATFORM_ORDER, PRIVACY_OPTIONS, HIDE_OPTIONS,
  buildShareMessage, getShareUrl, getQrUrl, resolveShareConfig, trackShareEvent,
  canNativeShare, nativeShare, SHARE_CTA,
} from "@/lib/socialShare";
import ShareCard from "./ShareCard";

const ICONS = { Briefcase, MessageSquare, ThumbsUp, AtSign, Phone, Send, Mail, Copy, Cloud, MessageCircle, Newspaper, Share2, QrCode };

/**
 * Unified share modal. Supports both legacy `achievement` prop and new `shareType` prop.
 * Backward compatible with CertificateView / PromotionCelebration / AchievementShareButton.
 */
export default function ShareModal({
  open, onClose,
  achievement, shareType,
  achievementTitle, title,
  userName, executiveScore, score, leadershipLevel,
  referralCode, userId,
}) {
  const [message, setMessage] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [settings, setSettings] = useState({ hide_name: false, hide_score: false, hide_company: false, hide_resume: false, hide_personal_info: false });
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const config = resolveShareConfig(shareType, achievement);
  const resolvedTitle = title || achievementTitle || config.label;
  const resolvedScore = score ?? executiveScore;
  const shareUrl = getShareUrl(referralCode);

  useEffect(() => {
    if (open) {
      setMessage(buildShareMessage({ shareType, achievementType: achievement, title: resolvedTitle, userName, score: resolvedScore, level: leadershipLevel }));
      setShowQr(false);
    }
  }, [open]);

  if (!open) return null;

  const toggleHide = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const handleShare = async (platformKey) => {
    const platform = SHARE_PLATFORMS[platformKey];
    const text = message || buildShareMessage({ shareType, achievementType: achievement, title: resolvedTitle, userName, score: resolvedScore, level: leadershipLevel });

    if (platformKey === "copy") {
      try { await navigator.clipboard.writeText(`${text}\n\n${shareUrl}`); } catch (e) {}
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (platformKey === "native") {
      const ok = await nativeShare({ title: resolvedTitle, text, url: shareUrl });
      if (!ok) { setShowQr(true); return; }
    } else if (platform.shareUrl) {
      window.open(platform.shareUrl(shareUrl, text), "_blank", "noopener,noreferrer");
    }

    trackShareEvent({ shareType, achievementType: achievement, title: resolvedTitle, platform: platformKey, privacy, settings, score: resolvedScore, level: leadershipLevel, referralCode, userId });
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0d0d14", useCORS: true, scale: 2 });
      const link = document.createElement("a");
      link.download = `execlead-${shareType || achievement || "share"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {}
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <div>
            <h2 className="text-lg font-bold text-white">Share</h2>
            <p className="text-white/30 text-xs">{config.label}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1"><X size={20} /></button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-5">
          {/* Card Preview */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div style={{ transform: "scale(0.78)", transformOrigin: "top center", marginBottom: -100 }}>
                <ShareCard
                  ref={cardRef}
                  type={config}
                  title={resolvedTitle}
                  userName={settings.hide_name ? null : userName}
                  executiveScore={settings.hide_score ? null : resolvedScore}
                  leadershipLevel={settings.hide_score ? null : leadershipLevel}
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
            {/* Platforms */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Share to</label>
              <div className="grid grid-cols-4 gap-2">
                {PLATFORM_ORDER.map(key => {
                  const platform = SHARE_PLATFORMS[key];
                  const Icon = ICONS[platform.icon];
                  const isNative = key === "native";
                  if (isNative && !canNativeShare()) return null;
                  return (
                    <button key={key} onClick={() => handleShare(key)} className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${platform.color}20` }}>
                        {key === "copy" && copied ? <Check size={16} className="text-emerald-400" /> : <Icon size={16} style={{ color: platform.color }} />}
                      </div>
                      <span className="text-[10px] text-white/40 group-hover:text-white/60">{platform.label}</span>
                    </button>
                  );
                })}
                <button onClick={() => setShowQr(!showQr)} className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/20">
                    <QrCode size={16} className="text-violet-400" />
                  </div>
                  <span className="text-[10px] text-white/40 group-hover:text-white/60">QR Code</span>
                </button>
              </div>
            </div>

            {/* QR Code Panel */}
            {showQr && (
              <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <img src={getQrUrl(shareUrl)} alt="QR Code" className="w-24 h-24 rounded-lg" />
                <div>
                  <div className="text-sm text-white/70 font-medium">Scan to open</div>
                  <div className="text-xs text-white/40 mt-1 break-all">{shareUrl}</div>
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Your Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
              <p className="text-white/20 text-[10px] mt-1">Includes CTA: "{SHARE_CTA}"</p>
            </div>

            {/* Privacy */}
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

            {/* Hide Details */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Hide Details</label>
              <div className="flex flex-wrap gap-2">
                {HIDE_OPTIONS.map(item => (
                  <button key={item.key} onClick={() => toggleHide(item.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${settings[item.key] ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-white/5 text-white/40 border border-white/5"}`}>
                    {settings[item.key] ? "Hidden" : "Show"} {item.label}
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