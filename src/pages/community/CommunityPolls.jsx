import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { canModerate } from "@/hooks/useCommunityMemberships";
import { Loader2, BarChart2, Plus, X } from "lucide-react";

const safeParse = (json, fallback) => {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
};

export default function CommunityPolls() {
  const { community, membership } = useOutletContext();
  const { user } = useAuth();
  const { profile } = useSubscription();
  const userCanModerate = canModerate(membership?.member_role);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.NetworkPost.filter(
          { community_id: community.id, post_type: "poll" }, "-created_date", 50
        );
        setPolls(all);
      } catch {}
      setLoading(false);
    };
    load();
  }, [community.id]);

  const handleCreate = async () => {
    if (!question.trim()) return;
    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) return;
    setCreating(true);
    try {
      const newPoll = await base44.entities.NetworkPost.create({
        author_name: profile?.full_name || user?.email || "Member",
        author_id: user?.id,
        author_role: profile?.current_role,
        author_company: profile?.current_company,
        author_photo: profile?.profile_photo,
        content: question.trim(),
        post_type: "poll",
        community_id: community.id,
        community_name: community.name,
        tags: validOptions,
        likes_count: 0,
        liked_by_json: "[]",
        comments_json: "[]",
        saved_by_json: "[]",
        pinned: false,
      });
      setPolls((prev) => [newPoll, ...prev]);
      setShowForm(false);
      setQuestion("");
      setOptions(["", ""]);
    } catch {}
    setCreating(false);
  };

  const handleVote = async (poll, option) => {
    const votes = safeParse(poll.saved_by_json, []);
    const existingVote = votes.find((v) => v.userId === user?.id);
    let newVotes;
    if (existingVote) {
      if (existingVote.option === option) return; // Can't vote twice for same option
      newVotes = votes.map((v) => v.userId === user?.id ? { ...v, option } : v);
    } else {
      newVotes = [...votes, { userId: user?.id, option }];
    }
    try {
      await base44.entities.NetworkPost.update(poll.id, {
        saved_by_json: JSON.stringify(newVotes),
        likes_count: newVotes.length,
      });
      setPolls((prev) => prev.map((p) => p.id === poll.id ? { ...p, saved_by_json: JSON.stringify(newVotes), likes_count: newVotes.length } : p));
    } catch {}
  };

  const renderPoll = (poll) => {
    const pollOptions = poll.tags || [];
    const votes = safeParse(poll.saved_by_json, []);
    const userVote = votes.find((v) => v.userId === user?.id);
    const totalVotes = votes.length;

    return (
      <div key={poll.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={14} className="text-violet-400" />
          <span className="text-[10px] font-medium text-violet-400 uppercase tracking-wide">Poll</span>
        </div>
        <h3 className="text-white font-medium text-sm mb-4">{poll.content}</h3>
        <div className="space-y-2">
          {pollOptions.map((option, i) => {
            const voteCount = votes.filter((v) => v.option === option).length;
            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            const isUserVote = userVote?.option === option;
            return (
              <button
                key={i}
                onClick={() => handleVote(poll, option)}
                className={`w-full text-left relative overflow-hidden rounded-lg border transition-all ${
                  isUserVote ? "border-violet-500/30 bg-violet-500/5" : "border-white/5 hover:border-white/10"
                }`}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-violet-500/10 transition-all"
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative flex items-center justify-between px-3 py-2.5">
                  <span className={`text-sm ${isUserVote ? "text-violet-300 font-medium" : "text-white/70"}`}>
                    {isUserVote && "✓ "}{option}
                  </span>
                  <span className="text-xs text-white/40">
                    {percentage}% {voteCount > 0 && `(${voteCount})`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <span className="text-xs text-white/30">
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"} · by {poll.author_name}
          </span>
          {userVote && <span className="text-xs text-violet-400">You voted</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 size={18} className="text-violet-400" /> Polls
          </h1>
          <p className="text-white/40 text-sm mt-1">Community polls and quick surveys.</p>
        </div>
        {userCanModerate && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "New Poll"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Poll question"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          />
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={(e) => setOptions(options.map((o, idx) => idx === i ? e.target.value : o))}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                    className="p-2 text-white/30 hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 5 && (
            <button
              onClick={() => setOptions([...options, ""])}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              + Add option
            </button>
          )}
          <button
            onClick={handleCreate}
            disabled={creating || !question.trim() || options.filter((o) => o.trim()).length < 2}
            className="w-full flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create Poll
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-violet-400" />
        </div>
      ) : polls.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-12 text-center">
          <BarChart2 size={28} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/30 text-sm">No polls yet. {userCanModerate ? "Create a poll to gather community input." : "Community admins can create polls."}</p>
        </div>
      ) : (
        <div className="space-y-3">{polls.map(renderPoll)}</div>
      )}
    </div>
  );
}