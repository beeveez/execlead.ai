import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useAuth } from "@/lib/AuthContext";
import {
  Loader2, MessageCircle, ThumbsUp, CheckCircle2, Sparkles, Plus, Send, X,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const safeParse = (json, fallback) => {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
};

const CATEGORIES = ["Career", "Strategy", "Technology", "Leadership", "AI", "Cloud", "General"];

export default function NetworkDiscussions() {
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", tags: "", category: "Career" });
  const [posting, setPosting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [replies, setReplies] = useState({});
  const [aiLoading, setAiLoading] = useState({});

  const load = async () => {
    try {
      setDiscussions(await base44.entities.NetworkDiscussion.list("-created_date", 50));
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setPosting(true);
    try {
      const tagArr = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const newDisc = await base44.entities.NetworkDiscussion.create({
        author_name: profile?.full_name || user?.email || "Member",
        author_id: user?.id,
        author_role: profile?.current_role,
        title: form.title.trim(),
        body: form.body.trim(),
        tags: tagArr,
        category: form.category,
        replies_json: "[]",
        upvotes_count: 0,
        upvoted_by_json: "[]",
        bookmarks_json: "[]",
        views_count: 0,
      });
      setDiscussions((prev) => [newDisc, ...prev]);
      setForm({ title: "", body: "", tags: "", category: "Career" });
      setShowForm(false);
    } catch (e) {}
    setPosting(false);
  };

  const handleUpvote = async (disc) => {
    const upvotedBy = safeParse(disc.upvoted_by_json, []);
    const hasUpvoted = upvotedBy.includes(user?.id);
    const newUpvotedBy = hasUpvoted
      ? upvotedBy.filter((id) => id !== user?.id)
      : [...upvotedBy, user?.id];
    try {
      await base44.entities.NetworkDiscussion.update(disc.id, {
        upvoted_by_json: JSON.stringify(newUpvotedBy),
        upvotes_count: newUpvotedBy.length,
      });
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === disc.id
            ? { ...d, upvoted_by_json: JSON.stringify(newUpvotedBy), upvotes_count: newUpvotedBy.length }
            : d
        )
      );
    } catch (e) {}
  };

  const handleReply = async (disc) => {
    const text = replies[disc.id];
    if (!text?.trim()) return;
    const reply = {
      id: Date.now().toString(),
      author_name: profile?.full_name || "Member",
      author_id: user?.id,
      content: text.trim(),
      created_date: new Date().toISOString(),
      accepted: false,
    };
    const allReplies = [...safeParse(disc.replies_json, []), reply];
    try {
      await base44.entities.NetworkDiscussion.update(disc.id, {
        replies_json: JSON.stringify(allReplies),
      });
      setDiscussions((prev) =>
        prev.map((d) => (d.id === disc.id ? { ...d, replies_json: JSON.stringify(allReplies) } : d))
      );
      setReplies((prev) => ({ ...prev, [disc.id]: "" }));
    } catch (e) {}
  };

  const handleAccept = async (disc, replyId) => {
    const allReplies = safeParse(disc.replies_json, []).map((r) => ({
      ...r,
      accepted: r.id === replyId,
    }));
    try {
      await base44.entities.NetworkDiscussion.update(disc.id, {
        replies_json: JSON.stringify(allReplies),
        accepted_answer_id: replyId,
      });
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === disc.id
            ? { ...d, replies_json: JSON.stringify(allReplies), accepted_answer_id: replyId }
            : d
        )
      );
    } catch (e) {}
  };

  const handleAISummary = async (disc) => {
    setAiLoading((prev) => ({ ...prev, [disc.id]: true }));
    try {
      const replyText = safeParse(disc.replies_json, [])
        .map((r) => `${r.author_name}: ${r.content}`)
        .join("\n");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this executive Q&A discussion in 2-3 concise sentences:\n\nQuestion: ${disc.title}\n${disc.body}\n\nReplies:\n${replyText || "No replies yet."}`,
      });
      const summary = typeof res === "string" ? res : res?.output || "Summary unavailable.";
      await base44.entities.NetworkDiscussion.update(disc.id, { ai_summary: summary });
      setDiscussions((prev) => prev.map((d) => (d.id === disc.id ? { ...d, ai_summary: summary } : d)));
    } catch (e) {}
    setAiLoading((prev) => ({ ...prev, [disc.id]: false }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <MessageCircle size={12} className="text-indigo-400" /> Discussions
          </div>
          <h1 className="text-xl font-bold text-white">Executive Q&A</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Ask Question"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Question title..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Provide context and details..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
          />
          <div className="flex items-center gap-2">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="tags (comma separated)"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none"
            />
            <button
              onClick={handleCreate}
              disabled={posting || !form.title.trim() || !form.body.trim()}
              className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">No discussions yet. Ask the first question!</div>
      ) : (
        <div className="space-y-3">
          {discussions.map((disc) => {
            const allReplies = safeParse(disc.replies_json, []);
            const upvotedBy = safeParse(disc.upvoted_by_json, []);
            const hasUpvoted = upvotedBy.includes(user?.id);
            const isExpanded = expandedId === disc.id;
            return (
              <div key={disc.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <button
                    onClick={() => handleUpvote(disc)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                      hasUpvoted ? "text-indigo-400 bg-indigo-500/10" : "text-white/30 hover:text-white/60 hover:bg-white/5"
                    }`}
                  >
                    <ThumbsUp size={16} className={hasUpvoted ? "fill-current" : ""} />
                    <span className="text-xs font-bold">{disc.upvotes_count || 0}</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium text-sm">{disc.title}</h3>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/40">{disc.category}</span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed mb-2">{disc.body}</p>
                    <div className="flex items-center gap-3 text-xs text-white/30">
                      <span>{disc.author_name}</span>
                      {disc.tags?.length > 0 && (
                        <span>{disc.tags.map((t) => `#${t}`).join(" ")}</span>
                      )}
                    </div>
                  </div>
                </div>

                {disc.ai_summary && (
                  <div className="bg-violet-500/[0.05] border border-violet-500/15 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-1.5 text-violet-400 text-xs font-medium mb-1">
                      <Sparkles size={11} /> AI Summary
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed">{disc.ai_summary}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : disc.id)}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                  >
                    <MessageCircle size={14} /> {allReplies.length} Replies
                  </button>
                  <button
                    onClick={() => handleAISummary(disc)}
                    disabled={aiLoading[disc.id] || !!disc.ai_summary}
                    className="flex items-center gap-1.5 text-xs text-violet-400/60 hover:text-violet-400 transition-colors disabled:opacity-30"
                  >
                    {aiLoading[disc.id] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI Summary
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    {allReplies.map((r, i) => (
                      <div key={i} className={`flex gap-2 ${r.accepted ? "bg-emerald-500/[0.05] rounded-lg p-2 -mx-2" : ""}`}>
                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 shrink-0">
                          {(r.author_name || "?").charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white/60 text-xs font-medium">{r.author_name}</span>
                            {r.accepted && (
                              <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-medium">
                                <CheckCircle2 size={10} /> Accepted
                              </span>
                            )}
                          </div>
                          <p className="text-white/50 text-xs mt-0.5">{r.content}</p>
                        </div>
                        {disc.author_id === user?.id && !r.accepted && (
                          <button
                            onClick={() => handleAccept(disc, r.id)}
                            className="text-white/20 hover:text-emerald-400 transition-colors"
                            title="Accept answer"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        value={replies[disc.id] || ""}
                        onChange={(e) => setReplies({ ...replies, [disc.id]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleReply(disc)}
                        placeholder="Add a reply..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      />
                      <button
                        onClick={() => handleReply(disc)}
                        disabled={!replies[disc.id]?.trim()}
                        className="px-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white transition-colors"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}