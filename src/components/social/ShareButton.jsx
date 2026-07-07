import React, { useState, useEffect } from "react";
import { Share2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getUserReferralCode } from "@/lib/socialShare";
import ShareModal from "./ShareModal";

/**
 * Persistent, reusable share button. Drop into any page.
 * Self-fetches the current user for referral code + name.
 * Works without auth (no referral code when not signed in).
 */
export default function ShareButton({ shareType = "landing", title, score, level, label, className, iconSize, variant = "default" }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    base44.auth.isAuthenticated().then(ok => {
      if (ok && mounted) base44.auth.me().then(u => mounted && setUser(u)).catch(() => {});
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const referralCode = user ? getUserReferralCode(user.id) : null;
  const userName = user?.full_name;

  const variantCls = variant === "icon"
    ? "p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70"
    : "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 text-xs font-medium";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`${variantCls} transition-colors ${className || ""}`}
        title="Share"
      >
        <Share2 size={iconSize || 14} />
        {variant !== "icon" && (label || "Share")}
      </button>
      <ShareModal
        open={open}
        onClose={() => setOpen(false)}
        shareType={shareType}
        title={title}
        userName={userName}
        score={score}
        level={level}
        referralCode={referralCode}
        userId={user?.id}
      />
    </>
  );
}