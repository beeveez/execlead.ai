import React from "react";
import { Link } from "react-router-dom";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import { Users, MessageSquare, UserPlus, Crown, ArrowRight, Loader2, Check } from "lucide-react";

export default function FounderCommunity() {
  const { member, loading } = useFoundingMember();

  if (loading || !member) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  const stats = [
    { icon: MessageSquare, label: "Posts", value: member.community_posts || 0 },
    { icon: MessageSquare, label: "Comments", value: member.community_comments || 0 },
    { icon: UserPlus, label: "Connections", value: member.community_connections || 0 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Founder Community</h1>
        <p className="text-white/40 text-sm">Private community access for founding members.</p>
      </div>

      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/15 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Check size={16} className="text-emerald-400" />
          <span className="text-white/80 text-sm font-medium">Community Access Unlocked</span>
        </div>
        <p className="text-white/40 text-xs">You have permanent access to the Founding Member Community and Founder Lounge.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
            <s.icon size={18} className="mx-auto text-amber-400 mb-2" />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      <Link to="/network/founding-lounge" className="flex items-center justify-between p-5 bg-white/[0.03] border border-amber-500/15 hover:border-amber-500/25 rounded-xl transition-all group">
        <div className="flex items-center gap-3">
          <Crown size={20} className="text-amber-400" />
          <div>
            <div className="text-white/80 text-sm font-medium">Founder Lounge</div>
            <div className="text-white/40 text-xs">Exclusive founding member discussions, AMAs, and roadmap previews</div>
          </div>
        </div>
        <ArrowRight size={16} className="text-white/20 group-hover:text-amber-400" />
      </Link>
    </div>
  );
}