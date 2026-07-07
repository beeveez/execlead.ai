import React, { useState } from "react";
import { Share2, Copy, Check, Sparkles } from "lucide-react";
import { EXECUTIVE_ACHIEVEMENT_GALLERY, buildLinkedInOptimizedPost, getUserReferralCode } from "@/lib/socialShare";
import ShareModal from "@/components/social/ShareModal";

export default function AchievementGallery({ profile, user }) {
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const referralCode = user ? getUserReferralCode(user.id) : null;

  const linkedinPost = buildLinkedInOptimizedPost({
    userName: profile?.full_name,
    score: profile?.promotion_readiness,
    level: "Leadership DNA Assessment Completed",
    achievements: ["Executive Resume Optimized"],
  });

  const copyPost = () => {
    try { navigator.clipboard.writeText(linkedinPost); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Sparkles size={14} className="text-indigo-400" /> Achievement Gallery
        </h3>
        <p className="text-white/30 text-xs mb-4">Click any achievement to generate a branded share card.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {EXECUTIVE_ACHIEVEMENT_GALLERY.map(item => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background: `${item.color}15` }}>
                {item.badge}
              </div>
              <div className="text-sm font-semibold text-white/80 group-hover:text-white">{item.label}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{item.desc}</div>
              <Share2 size={12} className="absolute top-3 right-3 text-white/20 group-hover:text-indigo-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0A66C2]/10 to-transparent border border-[#0A66C2]/20 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
            <span className="text-base">💼</span> LinkedIn Optimized Post
          </h3>
          <button onClick={copyPost} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy Post"}
          </button>
        </div>
        <pre className="text-xs text-white/50 whitespace-pre-wrap font-sans leading-relaxed">{linkedinPost}</pre>
      </div>

      {selected && (
        <ShareModal
          open={!!selected}
          onClose={() => setSelected(null)}
          achievement={selected}
          userName={profile?.full_name}
          executiveScore={profile?.promotion_readiness}
          referralCode={referralCode}
        />
      )}
    </div>
  );
}