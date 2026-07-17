import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import {
  Loader2, Lightbulb, ThumbsUp, MessageSquare, TrendingUp,
  Users, ChevronRight, X, CheckCircle2, ArrowRight, Sparkles,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const STATUSES = [
  { value: "backlog", label: "Received", color: "bg-gray-500/10 text-gray-400" },
  { value: "research", label: "Under Review", color: "bg-blue-500/10 text-blue-400" },
  { value: "planned", label: "Planned", color: "bg-indigo-500/10 text-indigo-400" },
  { value: "in_development", label: "Building", color: "bg-amber-500/10 text-amber-400" },
  { value: "released", label: "Released", color: "bg-emerald-500/10 text-emerald-400" },
  { value: "archived", label: "Declined", color: "bg-red-500/10 text-red-400" },
];

function getStatus(stage) {
  return STATUSES.find((s) => s.value === stage) || STATUSES[0];
}

function generateIdeaId() {
  return `IDEA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
}

export default function FounderFeedbackCenter() {
  const { user } = useAuth();
  const { profile } = useSubscription();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [votingId, setVotingId] = useState(null);
  const [commentingId, setCommentingId] = useState(null);

  const loadIdeas = useCallback(async () => {
    try {
      const data = await base44.entities.Feedback.filter({ type: "idea" }, "-votes", 200);
      setIdeas(data);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const handleVote = async (idea) => {
    setVotingId(idea.id);
    try {
      let voters = [];
      try { voters = JSON.parse(idea.voters_json || "[]"); } catch { voters = []; }
      const hasVoted = voters.includes(user?.id);

      const newVoters = hasVoted ? voters.filter((v) => v !== user.id) : [...voters, user.id];
      const newVotes = hasVoted ? (idea.votes || 0) - 1 : (idea.votes || 0) + 1;

      await base44.entities.Feedback.update(idea.id, {
        votes: newVotes,
        voters_json: JSON.stringify(newVoters),
      });

      setIdeas((prev) => prev.map((i) => i.id === idea.id ? { ...i, votes: newVotes, voters_json: JSON.stringify(newVoters) } : i));
    } catch (e) {
      toast({ title: "Failed to vote", variant: "destructive" });
    }
    setVotingId(null);
  };

  const hasVoted = (idea) => {
    try {
      const voters = JSON.parse(idea.voters_json || "[]");
      return Array.isArray(voters) && voters.includes(user?.id);
    } catch { return false; }
  };

  const filteredIdeas = activeTab === "all"
    ? ideas
    : activeTab === "top"
    ? [...ideas].sort((a, b) => (b.votes || 0) - (a.votes || 0))
    : ideas.filter((i) => i.roadmap_stage === activeTab);

  // Analytics
  const topContributors = Object.entries(
    ideas.reduce((acc, i) => {
      const name = i.customer_name || i.customer_email || "Anonymous";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

  const releasedCount = ideas.filter((i) => i.roadmap_stage === "released").length;
  const totalVotes = ideas.reduce((s, i) => s + (i.votes || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Lightbulb size={12} className="text-amber-400" /> Founder Feedback Center
          </div>
          <h1 className="text-2xl font-bold text-white">Product Feedback Center</h1>
          <p className="text-white/40 text-sm mt-1">Submit ideas, vote on features, and track their journey to release.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Sparkles size={16} /> Submit Idea
        </button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Lightbulb} label="Ideas Submitted" value={ideas.length} color="amber" />
        <StatCard icon={CheckCircle2} label="Ideas Released" value={releasedCount} color="emerald" />
        <StatCard icon={TrendingUp} label="Total Votes" value={totalVotes} color="indigo" />
        <StatCard icon={Users} label="Contributors" value={topContributors.length} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} label="All" count={ideas.length} />
        <TabButton active={activeTab === "top"} onClick={() => setActiveTab("top")} label="🔥 Top Voted" />
        {STATUSES.map((s) => {
          const count = ideas.filter((i) => i.roadmap_stage === s.value).length;
          return <TabButton key={s.value} active={activeTab === s.value} onClick={() => setActiveTab(s.value)} label={s.label} count={count} />;
        })}
      </div>

      {/* Ideas List */}
      <div className="space-y-3">
        {filteredIdeas.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
            <Lightbulb size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm mb-2">No ideas yet{activeTab !== "all" ? ` in "${getStatus(activeTab).label}"` : ""}.</p>
            <button onClick={() => setShowForm(true)} className="text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors">
              Be the first to submit an idea →
            </button>
          </div>
        ) : (
          filteredIdeas.map((idea) => {
            const status = getStatus(idea.roadmap_stage);
            const voted = hasVoted(idea);
            let comments = [];
            try { comments = JSON.parse(idea.comments_json || "[]"); } catch { comments = []; }
            return (
              <IdeaCard
                key={idea.id}
                idea={idea}
                status={status}
                voted={voted}
                votingId={votingId}
                onVote={handleVote}
                commenting={commentingId === idea.id}
                setCommenting={(val) => setCommentingId(val ? idea.id : null)}
                comments={comments}
                onCommentAdded={(newComments) => {
                  setIdeas((prev) => prev.map((i) => i.id === idea.id ? { ...i, comments_json: JSON.stringify(newComments) } : i));
                }}
                userId={user?.id}
                userName={user?.full_name || user?.email || "Anonymous"}
              />
            );
          })
        )}
      </div>

      {/* Top Contributors */}
      {topContributors.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
            <Users size={14} className="text-amber-400" /> Top Contributors
          </h3>
          <div className="space-y-2">
            {topContributors.map((c, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium flex items-center justify-center">{i + 1}</span>
                <span className="text-white/70 flex-1">{c.name}</span>
                <span className="text-white/30 text-xs">{c.count} {c.count === 1 ? "idea" : "ideas"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Form Modal */}
      {showForm && (
        <SubmitIdeaModal
          onClose={() => setShowForm(false)}
          onSubmitted={() => {
            setShowForm(false);
            loadIdeas();
            toast({ title: "Idea submitted!", description: "Your idea has been added to the feedback center." });
          }}
          user={user}
        />
      )}
    </div>
  );
}

function IdeaCard({ idea, status, voted, votingId, onVote, commenting, setCommenting, comments, onCommentAdded, userId, userName }) {
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const newComment = {
        id: Date.now().toString(),
        user_id: userId,
        user_name: userName,
        text: commentText.trim(),
        timestamp: new Date().toISOString(),
      };
      const newComments = [...comments, newComment];
      await base44.entities.Feedback.update(idea.id, {
        comments_json: JSON.stringify(newComments),
      });
      onCommentAdded(newComments);
      setCommentText("");
    } catch (e) {}
    setSubmitting(false);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start gap-4">
        {/* Vote button */}
        <button
          onClick={() => onVote(idea)}
          disabled={votingId === idea.id}
          className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg border transition-all shrink-0 ${
            voted
              ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
          }`}
        >
          {votingId === idea.id ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
          <span className="text-sm font-bold mt-0.5">{idea.votes || 0}</span>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-medium text-sm">{idea.title}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-white/40 text-sm leading-relaxed mb-2">{idea.description}</p>
          <div className="flex items-center gap-3 text-xs text-white/30">
            <span>by {idea.customer_name || idea.customer_email || "Anonymous"}</span>
            {idea.created_date && (
              <span>· {new Date(idea.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            )}
            <button
              onClick={() => setCommenting(!commenting)}
              className="flex items-center gap-1 hover:text-white/60 transition-colors"
            >
              <MessageSquare size={12} /> {comments.length}
            </button>
          </div>

          {/* Comments */}
          {commenting && (
            <div className="mt-3 space-y-2">
              {comments.length > 0 && (
                <div className="space-y-2">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-white/[0.02] rounded-lg p-2.5 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white/60 font-medium">{c.user_name}</span>
                        <span className="text-white/20">{new Date(c.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                      <p className="text-white/50">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
                <button
                  onClick={handleAddComment}
                  disabled={submitting || !commentText.trim()}
                  className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors disabled:opacity-30"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmitIdeaModal({ onClose, onSubmitted, user }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("feature");
  const [submitting, setSubmitting] = useState(false);
  const ideaId = generateIdeaId();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.Feedback.create({
        feedback_id: ideaId,
        type: "idea",
        title: title.trim(),
        description: description.trim(),
        category,
        status: "new",
        roadmap_stage: "backlog",
        votes: 0,
        voters_json: "[]",
        comments_json: "[]",
        is_public: true,
        customer_name: user?.full_name || "",
        customer_email: user?.email || "",
        tags_json: JSON.stringify(["founder_feedback"]),
      });
      onSubmitted();
    } catch (e) {
      toast({ title: "Failed to submit", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-medium text-sm">Submit an Idea</h2>
            <p className="text-white/30 text-xs mt-0.5">Help shape the future of EXECLEAD.AI</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5">Idea ID</label>
            <div className="text-white/30 text-xs font-mono">{ideaId}</div>
          </div>
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g., Add dark mode to Executive Coach" />
          </div>
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass} placeholder="Describe your idea in detail. What problem does it solve? How would it help you?" />
          </div>
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              <option value="feature">New Feature</option>
              <option value="improvement">Improvement</option>
              <option value="idea">General Idea</option>
              <option value="question">Question</option>
            </select>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {submitting && <Loader2 size={14} className="animate-spin" />} Submit Idea
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    amber: "text-amber-400 bg-amber-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    indigo: "text-indigo-400 bg-indigo-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-white/30 text-xs mt-0.5">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
        active ? "bg-amber-500/15 text-amber-400" : "text-white/40 hover:text-white/70 hover:bg-white/5"
      }`}
    >
      {label} {count !== undefined && count > 0 && <span className="opacity-50">({count})</span>}
    </button>
  );
}