import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Send, Rss } from "lucide-react";
import PostCard from "@/components/network/PostCard";
import PullToRefresh from "@/components/PullToRefresh";

export default function NetworkFeed() {
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("insight");
  const [tags, setTags] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    try {
      setPosts(await base44.entities.NetworkPost.list("-created_date", 50));
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const newPost = await base44.entities.NetworkPost.create({
        author_name: profile?.full_name || user?.email || "Member",
        author_id: user?.id,
        author_role: profile?.current_role,
        author_company: profile?.current_company,
        author_photo: profile?.profile_photo,
        author_founding_member: profile?.founding_member || false,
        content: content.trim(),
        post_type: postType,
        tags: tagArr,
        likes_count: 0,
        liked_by_json: "[]",
        comments_json: "[]",
        saved_by_json: "[]",
      });
      setPosts((prev) => [newPost, ...prev]);
      setContent("");
      setTags("");
      setPostType("insight");
    } catch (e) {}
    setPosting(false);
  };

  return (
    <PullToRefresh onRefresh={load}>
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Rss size={12} className="text-indigo-400" /> Home Feed
        </div>
        <h1 className="text-xl font-bold text-white">Executive Network Feed</h1>
        <p className="text-white/40 text-sm mt-1">
          Executive-only content — insights, milestones, and leadership discussions.
        </p>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an executive insight, career milestone, or leadership thought..."
          rows={3}
          className="w-full bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none resize-none"
        />
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          <select
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="insight">Insight</option>
            <option value="milestone">Milestone</option>
            <option value="promotion">Promotion</option>
            <option value="certification">Certification</option>
            <option value="article">Article</option>
            <option value="announcement">Announcement</option>
          </select>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tags (comma separated)"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none"
          />
          <button
            onClick={handlePost}
            disabled={posting || !content.trim()}
            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">
          No posts yet. Be the first to share an executive insight!
        </div>
      ) : (
        posts.map((p) => (
          <PostCard key={p.id} post={p} currentUserId={user?.id} authorName={profile?.full_name} />
        ))
      )}
    </div>
    </PullToRefresh>
  );
}