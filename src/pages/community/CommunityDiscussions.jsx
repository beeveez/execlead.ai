import React, { useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import PostCard from "@/components/network/PostCard";
import { Loader2, Send, MessageSquare } from "lucide-react";

const POST_TYPES = [
  { value: "insight", label: "Insight" },
  { value: "milestone", label: "Milestone" },
  { value: "announcement", label: "Announcement" },
  { value: "article", label: "Article" },
  { value: "resource", label: "Resource" },
];

export default function CommunityDiscussions() {
  const { community, membership, canModerate } = useOutletContext();
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("insight");
  const [tags, setTags] = useState("");
  const [posting, setPosting] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const showCreateForm = searchParams.get("create") === "1";
  const searchQuery = searchParams.get("q") || "";

  const load = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.NetworkPost.filter(
        { community_id: community.id }, "-created_date", 50
      );
      setPosts(all);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [community.id]);

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
        community_id: community.id,
        community_name: community.name,
        tags: tagArr,
        likes_count: 0,
        liked_by_json: "[]",
        comments_json: "[]",
        saved_by_json: "[]",
        pinned: false,
      });
      setPosts((prev) => [newPost, ...prev]);
      setContent("");
      setTags("");
      setPostType("insight");
      if (showCreateForm) setSearchParams({});
      // Update membership posts_count
      try {
        await base44.entities.CommunityMembership.update(membership.id, {
          posts_count: (membership.posts_count || 0) + 1,
          reputation: (membership.reputation || 0) + 5,
          last_active: new Date().toISOString(),
        });
      } catch {}
    } catch {}
    setPosting(false);
  };

  const filteredPosts = posts.filter((p) => {
    if (filterType !== "all" && p.post_type !== filterType) return false;
    if (searchQuery && !p.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pinnedPosts = filteredPosts.filter((p) => p.pinned);
  const regularPosts = filteredPosts.filter((p) => !p.pinned);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Create Post Form */}
      {(showCreateForm || !searchQuery) && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={14} className="text-indigo-400" />
            <span className="text-sm font-medium text-white">Share in {community.name}</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an insight, ask a question, or start a discussion..."
            rows={3}
            className="w-full bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none resize-none"
          />
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
            >
              {POST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
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
      )}

      {/* Search result indicator */}
      {searchQuery && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/40">
            Results for "<span className="text-white/70">{searchQuery}</span>"
          </p>
          <button
            onClick={() => setSearchParams({})}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            filterType === "all" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"
          }`}
        >
          All
        </button>
        {POST_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilterType(t.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === t.value ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">
          {searchQuery ? "No posts match your search." : "No discussions yet. Start the conversation!"}
        </div>
      ) : (
        <>
          {pinnedPosts.map((p) => (
            <div key={p.id} className="relative">
              <div className="absolute -top-2 left-3 z-10 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-medium">
                📌 Pinned
              </div>
              <PostCard post={p} currentUserId={user?.id} authorName={profile?.full_name} />
            </div>
          ))}
          {regularPosts.map((p) => (
            <PostCard key={p.id} post={p} currentUserId={user?.id} authorName={profile?.full_name} />
          ))}
        </>
      )}
    </div>
  );
}