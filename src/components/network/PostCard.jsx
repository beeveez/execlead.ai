import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Heart, MessageCircle, Bookmark, Sparkles, Loader2, Send,
} from "lucide-react";
import FoundingMemberBadge from "@/components/founding/FoundingMemberBadge";
import ShareButton from "@/components/social/ShareButton";

const safeParse = (json, fallback) => {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
};

const POST_TYPE_LABELS = {
  insight: "Insight", milestone: "Milestone", promotion: "Promotion",
  certification: "Certification", article: "Article",
  announcement: "Announcement", marketplace_release: "Release",
};

export default function PostCard({ post, currentUserId, authorName }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const likedBy = safeParse(post.liked_by_json, []);
    const savedBy = safeParse(post.saved_by_json, []);
    setLiked(likedBy.includes(currentUserId));
    setSaved(savedBy.includes(currentUserId));
    setLikeCount(post.likes_count || likedBy.length);
    setComments(safeParse(post.comments_json, []));
    setAiSummary(post.ai_summary || null);
  }, [post.id]);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    const likedBy = safeParse(post.liked_by_json, []);
    const newLikedBy = newLiked
      ? [...likedBy, currentUserId]
      : likedBy.filter((id) => id !== currentUserId);
    try {
      await base44.entities.NetworkPost.update(post.id, {
        liked_by_json: JSON.stringify(newLikedBy),
        likes_count: newLikedBy.length,
      });
    } catch (e) {}
  };

  const handleSave = async () => {
    const newSaved = !saved;
    setSaved(newSaved);
    const savedBy = safeParse(post.saved_by_json, []);
    const newSavedBy = newSaved
      ? [...savedBy, currentUserId]
      : savedBy.filter((id) => id !== currentUserId);
    try {
      await base44.entities.NetworkPost.update(post.id, {
        saved_by_json: JSON.stringify(newSavedBy),
      });
    } catch (e) {}
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now().toString(),
      author_name: authorName || "Member",
      author_id: currentUserId,
      content: newComment.trim(),
      created_date: new Date().toISOString(),
    };
    const newComments = [...comments, comment];
    setComments(newComments);
    setNewComment("");
    try {
      await base44.entities.NetworkPost.update(post.id, {
        comments_json: JSON.stringify(newComments),
      });
    } catch (e) {}
  };

  const handleAISummary = async () => {
    if (aiSummary) return;
    setLoadingAI(true);
    try {
      const commentText = comments.map((c) => `${c.author_name}: ${c.content}`).join("\n");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this executive network post and its discussion in 2-3 concise sentences:\n\nPost: ${post.content}\n\nComments:\n${commentText || "No comments yet."}`,
      });
      const summary = typeof res === "string" ? res : res?.output || res?.response || "Summary unavailable.";
      setAiSummary(summary);
      await base44.entities.NetworkPost.update(post.id, { ai_summary: summary });
    } catch (e) {}
    setLoadingAI(false);
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-sm font-bold text-indigo-400 overflow-hidden shrink-0">
          {post.author_photo ? (
            <img src={post.author_photo} alt="" className="w-full h-full object-cover" />
          ) : (
            (post.author_name || "?").charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm truncate">{post.author_name}</span>
            {post.author_founding_member && <FoundingMemberBadge size={11} />}
          </div>
          <div className="text-white/30 text-xs truncate">
            {post.author_role}
            {post.author_company ? ` · ${post.author_company}` : ""}
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/40 shrink-0">
          {POST_TYPE_LABELS[post.post_type] || "Post"}
        </span>
      </div>

      <p className="text-white/70 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 rounded text-xs bg-indigo-500/10 text-indigo-300">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {aiSummary && (
        <div className="bg-violet-500/[0.05] border border-violet-500/15 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-1.5 text-violet-400 text-xs font-medium mb-1">
            <Sparkles size={11} /> AI Summary
          </div>
          <p className="text-white/60 text-xs leading-relaxed">{aiSummary}</p>
        </div>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-white/5">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-red-400" : "text-white/40 hover:text-white/70"}`}
        >
          <Heart size={14} className={liked ? "fill-current" : ""} /> {likeCount}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <MessageCircle size={14} /> {comments.length}
        </button>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 text-xs transition-colors ${saved ? "text-amber-400" : "text-white/40 hover:text-white/70"}`}
        >
          <Bookmark size={14} className={saved ? "fill-current" : ""} />
        </button>
        <ShareButton variant="icon" shareType="network_post" title={post.content?.slice(0, 100)} iconSize={14} />
        <button
          onClick={handleAISummary}
          disabled={loadingAI || !!aiSummary}
          className="flex items-center gap-1.5 text-xs text-violet-400/60 hover:text-violet-400 transition-colors disabled:opacity-30 ml-auto"
        >
          {loadingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 shrink-0">
                {(c.author_name || "?").charAt(0)}
              </div>
              <div className="bg-white/[0.03] rounded-lg px-3 py-2 flex-1">
                <div className="text-white/60 text-xs font-medium mb-0.5">{c.author_name}</div>
                <p className="text-white/50 text-xs">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Add a comment..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim()}
              className="px-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}