import React, { useState } from "react";
import { Share2 } from "lucide-react";
import ShareModal from "@/components/social/ShareModal";

export default function ExecutiveTimeline({ profile, milestones }) {
  const [shareItem, setShareItem] = useState(null);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Executive Timeline</h3>
      <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
        {milestones.length === 0 ? (
          <p className="text-white/30 text-sm py-8 text-center">No milestones yet. Start your executive journey to see milestones here.</p>
        ) : (
          milestones.map((m, i) => (
            <div key={i} className="relative group">
              <div className="absolute -left-[18px] top-3 w-3 h-3 rounded-full border-2 border-[#0a0a0f]" style={{ background: m.color || "#6366f1" }} />
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m.badge || "📋"}</span>
                    <div>
                      <div className="text-sm font-medium text-white/80">{m.title}</div>
                      {m.date && <div className="text-[10px] text-white/30">{m.date}</div>}
                    </div>
                  </div>
                  <button onClick={() => setShareItem(m)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/5">
                    <Share2 size={12} className="text-white/30 hover:text-indigo-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {shareItem && (
        <ShareModal
          open={!!shareItem}
          onClose={() => setShareItem(null)}
          achievement={shareItem.type || "career_milestone"}
          achievementTitle={shareItem.title}
          userName={profile?.full_name}
        />
      )}
    </div>
  );
}