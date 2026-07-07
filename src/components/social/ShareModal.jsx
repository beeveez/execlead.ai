import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Copy, Check, QrCode, BadgeCheck, AlertTriangle,
  Award, Link2, Shield, BarChart3, Share2, Eye,
  Briefcase, MessageSquare, ThumbsUp, AtSign, Phone, Send, Mail, Cloud, MessageCircle, Newspaper,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  SHARE_PLATFORMS, PLATFORM_ORDER, PRIVACY_OPTIONS, HIDE_OPTIONS,
  buildShareMessage, getShareUrl, getQrUrl, resolveShareConfig, trackShareEvent,
  canNativeShare, nativeShare, SHARE_CTA,
} from "@/lib/socialShare";
import ShareCard from "./ShareCard";
import ModalShell from "@/components/ui/ModalShell";

const ICONS = { Briefcase, MessageSquare, ThumbsUp, AtSign, Phone, Send, Mail, Copy, Cloud, MessageCircle, Newspaper, Share2 };

const PLATFORM_GLYPH = {
  linkedin: "💼", twitter: "𝕏", facebook: "👍", threads: "@", bluesky: "☁",
  whatsapp: "📱", telegram: "✈", messenger: "💬", reddit: "🟠", email: "✉", copy: "🔗", native: "📲",
};

const TABS = [
  { id: "achievement", label: "Achievement", icon: Award },
  { id: "social", label: "Social", icon: Share2 },
  { id: "referral", label: "Referral", icon: Link2 },
  { id: "qr", label: "QR Code", icon: QrCode },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function ShareModal({
  open, onClose,
  achievement, shareType,
  achievementTitle, title,
  userName, executiveScore, score, leadershipLevel,
  referralCode, userId,
}) {
  const [activeTab, setActiveTab] = useState("achievement");
  const [message, setMessage] = useState("");
  const [baseMessage, setBaseMessage] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [settings, setSettings] = useState({ hide_name: false, hide_score: false, hide_company: false, hide_resume: false, hide_personal_info: false });
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const cardRef = useRef(null);

  const config = resolveShareConfig(shareType, achievement);
  const resolvedTitle = title || achievementTitle || config.label;
  const resolvedScore = score ?? executiveScore;
  const shareUrl = getShareUrl(referralCode);
  const dirty = message !== baseMessage && !!baseMessage;

  // Reset + seed message whenever the modal opens
  useEffect(() => {
    if (!open) return;
    const gen = buildShareMessage({ shareType, achievementType: achievement, title: resolvedTitle, userName, score: resolvedScore, level: leadershipLevel });
    setMessage(gen);
    setBaseMessage(gen);
    setActiveTab("achievement");
    setShowPreview(false);
    setConfirmDiscard(false);
  }, [open]);

  // Lazy-load analytics when the tab is opened
  useEffect(() => {
    if (activeTab !== "analytics" || !userId || analytics !== null) return;
    base44.entities.ShareEvent.filter({ referrer_user_id: userId }, "-created_date", 50)
      .then(setAnalytics)
      .catch(() => setAnalytics([]));
  }, [activeTab, userId, analytics]);

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
      if (!ok) { setActiveTab("qr"); return; }
    } else if (platform.shareUrl) {
      window.open(platform.shareUrl(shareUrl, text), "_blank", "noopener,noreferrer");
    }

    trackShareEvent({ shareType, achievementType: achievement, title: resolvedTitle, platform: platformKey, privacy, settings, score: resolvedScore, level: leadershipLevel, referralCode, userId });
  };

  const handleShareNow = () => {
    const text = message || buildShareMessage({ shareType, achievementType: achievement, title: resolvedTitle, userName, score: resolvedScore, level: leadershipLevel });
    if (canNativeShare()) {
      navigator.share({ title: resolvedTitle, text, url: shareUrl }).catch(() => {});
      trackShareEvent({ shareType, achievementType: achievement, title: resolvedTitle, platform: "native", privacy, settings, score: resolvedScore, level: leadershipLevel, referralCode, userId });
      return;
    }
    // Synchronous window.open preserves the user gesture so the popup isn't blocked
    const platform = SHARE_PLATFORMS.linkedin;
    const win = window.open(platform.shareUrl(shareUrl, text), "_blank", "noopener,noreferrer");
    trackShareEvent({ shareType, achievementType: achievement, title: resolvedTitle, platform: "linkedin", privacy, settings, score: resolvedScore, level: leadershipLevel, referralCode, userId });
    if (!win) setActiveTab("social"); // popup blocked — guide user to pick a platform
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

  // Discard-changes aware close
  const attemptClose = () => {
    if (confirmDiscard) return;
    if (dirty) { setConfirmDiscard(true); return; }
    onClose?.();
  };
  const doClose = () => { setConfirmDiscard(false); onClose?.(); };

  const handlePreviewAction = () => {
    setActiveTab("achievement");
    setShowPreview(true);
  };

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <button onClick={attemptClose} className="px-4 py-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/5 text-sm font-medium transition-colors">
        Cancel
      </button>
      <div className="flex gap-2">
        <button onClick={handlePreviewAction} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors">
          <Eye size={14} /> Preview
        </button>
        <button onClick={handleShareNow} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Share2 size={14} /> Share Now
        </button>
      </div>
    </div>
  );

  // Analytics derivation
  const platformCounts = {};
  (analytics || []).forEach(e => { platformCounts[e.platform] = (platformCounts[e.platform] || 0) + 1; });
  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      <ModalShell
        open={open}
        onClose={attemptClose}
        title="Share EXECLEAD.AI"
        subtitle={config.label}
        footer={footer}
      >
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-4 border-b border-white/5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === t.id ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* Achievement */}
        {activeTab === "achievement" && (
          <div className="flex flex-col items-center">
            <div className="text-xs text-white/30 mb-3">{config.label}</div>
            <div style={{ transform: "scale(0.8)", transformOrigin: "top center", marginBottom: -90 }}>
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
            <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors disabled:opacity-40">
              {downloading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /> : <Download size={14} />}
              Download Card
            </button>
            {showPreview && (
              <div className="w-full mt-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1"><Eye size={11} /> Preview · Share Message</div>
                <pre className="text-xs text-white/60 whitespace-pre-wrap font-sans leading-relaxed">{message}</pre>
                <div className="text-[10px] text-white/30 mt-3 pt-3 border-t border-white/5">Includes: {SHARE_CTA}</div>
              </div>
            )}
          </div>
        )}

        {/* Social */}
        {activeTab === "social" && (
          <div className="space-y-5">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Share to</label>
              <div className="grid grid-cols-4 gap-2">
                {PLATFORM_ORDER.map(key => {
                  const platform = SHARE_PLATFORMS[key];
                  const Icon = ICONS[platform.icon];
                  if (key === "native" && !canNativeShare()) return null;
                  return (
                    <button key={key} onClick={() => handleShare(key)} className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${platform.color}20` }}>
                        {key === "copy" && copied ? <Check size={16} className="text-emerald-400" /> : <Icon size={16} style={{ color: platform.color }} />}
                      </div>
                      <span className="text-[10px] text-white/40 group-hover:text-white/60">{platform.label}</span>
                    </button>
                  );
                })}
                <button onClick={() => setActiveTab("qr")} className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/20">
                    <QrCode size={16} className="text-violet-400" />
                  </div>
                  <span className="text-[10px] text-white/40 group-hover:text-white/60">QR Code</span>
                </button>
              </div>
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Your Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none scroll-smooth" />
              <p className="text-white/20 text-[10px] mt-1">Edit before sharing. Includes CTA: "{SHARE_CTA}"</p>
            </div>
          </div>
        )}

        {/* Referral */}
        {activeTab === "referral" && (
          referralCode ? (
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Referral Link</label>
                <div className="flex gap-2">
                  <input readOnly value={shareUrl} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white/60 focus:outline-none truncate" />
                  <button onClick={() => { try { navigator.clipboard.writeText(shareUrl); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors whitespace-nowrap">
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Referral Code</label>
                <div className="font-mono text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 inline-block">{referralCode}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <Link2 size={24} className="mx-auto text-white/20 mb-2" />
              <p className="text-white/40 text-sm">Sign in to get your personal referral link and start earning rewards.</p>
            </div>
          )
        )}

        {/* QR Code */}
        {activeTab === "qr" && (
          <div className="flex flex-col items-center py-4">
            <img src={getQrUrl(shareUrl)} alt="QR Code" crossOrigin="anonymous" className="w-48 h-48 rounded-xl" />
            <div className="text-center mt-5">
              <div className="text-base font-bold text-white">EXECLEAD.AI</div>
              <div className="text-xs text-white/40 mt-0.5">The Executive Leadership Operating System</div>
              <div className="text-xs text-white/30 mt-2">Scan to view executive profile</div>
              <div className="flex items-center gap-1 justify-center mt-3 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <BadgeCheck size={12} className="text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-medium">Verified Executive</span>
              </div>
            </div>
          </div>
        )}

        {/* Privacy */}
        {activeTab === "privacy" && (
          <div className="space-y-5">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Privacy Level</label>
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
                {HIDE_OPTIONS.map(item => (
                  <button key={item.key} onClick={() => toggleHide(item.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${settings[item.key] ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-white/5 text-white/40 border border-white/5"}`}>
                    {settings[item.key] ? "Hidden" : "Show"} {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            {analytics === null ? (
              <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>
            ) : analytics.length === 0 ? (
              <div className="text-center py-10">
                <BarChart3 size={24} className="mx-auto text-white/20 mb-2" />
                <p className="text-white/40 text-sm">No shares tracked yet. Share your first achievement to see analytics here.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{analytics.length}</div>
                    <div className="text-white/30 text-xs">Total Shares</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{topPlatform ? `${PLATFORM_GLYPH[topPlatform[0]] || "📤"} ${topPlatform[1]}` : "—"}</div>
                    <div className="text-white/30 text-xs">Top Channel</div>
                  </div>
                </div>
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Recent Shares</div>
                  <div className="space-y-2">
                    {analytics.slice(0, 5).map((e, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                        <span className="text-sm text-white/60 flex items-center gap-2">
                          <span>{PLATFORM_GLYPH[e.platform] || "📤"}</span>
                          {SHARE_PLATFORMS[e.platform]?.label || e.platform}
                        </span>
                        <span className="text-xs text-white/30">{e.achievement_title || e.achievement_type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </ModalShell>

      {/* Discard changes confirmation */}
      <AnimatePresence>
        {confirmDiscard && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setConfirmDiscard(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={22} className="text-amber-400" />
              </div>
              <h3 className="text-white font-semibold">Discard changes?</h3>
              <p className="text-white/40 text-sm mt-1">You have unsaved edits to your share message.</p>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setConfirmDiscard(false)} className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors">
                  Keep Editing
                </button>
                <button onClick={doClose} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                  Discard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}