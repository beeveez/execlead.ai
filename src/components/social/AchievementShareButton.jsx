import React, { useState } from "react";
import { Share2 } from "lucide-react";
import ShareModal from "./ShareModal";

export default function AchievementShareButton({ achievement, achievementTitle, userName, executiveScore, leadershipLevel, referralCode, label, className, iconSize }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 text-xs font-medium transition-colors ${className || ""}`}
      >
        <Share2 size={iconSize || 14} />
        {label || "Share"}
      </button>
      <ShareModal
        open={open}
        onClose={() => setOpen(false)}
        achievement={achievement}
        achievementTitle={achievementTitle}
        userName={userName}
        executiveScore={executiveScore}
        leadershipLevel={leadershipLevel}
        referralCode={referralCode}
      />
    </>
  );
}