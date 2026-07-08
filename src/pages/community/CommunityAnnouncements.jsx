import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import PostCard from "@/components/network/PostCard";
import { Loader2, Megaphone, Plus } from "lucide-react";

export default function CommunityAnnouncements() {
  const { community } = useOutletContext();
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.NetworkPost.filter(
          { community_id: community.id, post_type: "announcement" }, "-created_date", 50
        );
        setPosts(all);
      } catch {}
      setLoading(false);
    };
    load();
  }, [community.id]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone size={18} className="text-amber-400" /> Announcements
          </h1>
          <p className="text-white/40 text-sm mt-1">Official updates from {community.name} leadership.</p>
        </div>
        <Link
          to={`/network/c/${community.id}/discussions?create=1`}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} /> New Announcement
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-amber-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-12 text-center">
          <Megaphone size={28} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/30 text-sm">No announcements yet. Community admins can create announcements in Discussions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="relative">
              <div className="absolute -top-2 left-3 z-10 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-medium">
                📢 Announcement
              </div>
              <PostCard post={p} currentUserId={user?.id} authorName={profile?.full_name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}