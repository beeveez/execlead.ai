import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { FEEDBACK_TYPES, FEEDBACK_STATUSES, safeParse, getTypeMeta, getStatusMeta, getSeverityMeta } from "@/lib/feedbackConfig";
import { ThumbsUp, MessageSquare, Loader2, Filter, ChevronRight } from "lucide-react";

export default function FeedbackList({ mode = "all", onSelect }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [voting, setVoting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let results;
      if (mode === "mine") {
        results = await base44.entities.Feedback.filter({ created_by_id: user?.id }, "-created_date", 100);
      } else {
        results = await base44.entities.Feedback.filter({ is_public: true }, "-votes", 100);
      }
      setItems(results || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [mode, user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleVote = async (item, e) => {
    e.stopPropagation();
    if (!user?.id || voting === item.id) return;
    setVoting(item.id);
    try {
      const voters = safeParse(item.voters_json, []);
      const hasVoted = voters.includes(user.id);
      const newVoters = hasVoted ? voters.filter(v => v !== user.id) : [...voters, user.id];
      await base44.entities.Feedback.update(item.id, {
        votes: (item.votes || 0) + (hasVoted ? -1 : 1),
        voters_json: JSON.stringify(newVoters),
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, votes: (i.votes || 0) + (hasVoted ? -1 : 1), voters_json: JSON.stringify(newVoters) } : i));
    } catch (e) {
      toast({ title: "Vote Failed", variant: "destructive" });
    } finally {
      setVoting(null);
    }
  };

  const filtered = items.filter(i =>
    (filterType === "all" || i.type === filterType) &&
    (filterStatus === "all" || i.status === filterStatus)
  );

  const selectCls = "bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/60 focus:outline-none focus:border-indigo-500/50";

  if (loading) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-white/30">
        <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">{mode === "mine" ? "You haven't submitted any feedback yet." : "No public feedback yet."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-white/30"><Filter size={12} /> Filter:</span>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={selectCls}>
          <option value="all" className="bg-[#0d0d14]">All Types</option>
          {FEEDBACK_TYPES.map(t => <option key={t.id} value={t.id} className="bg-[#0d0d14]">{t.icon} {t.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
          <option value="all" className="bg-[#0d0d14]">All Statuses</option>
          {FEEDBACK_STATUSES.map(s => <option key={s.id} value={s.id} className="bg-[#0d0d14]">{s.label}</option>)}
        </select>
        <span className="text-xs text-white/30 ml-auto">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(item => {
          const tMeta = getTypeMeta(item.type);
          const sMeta = getStatusMeta(item.status);
          const sevMeta = getSeverityMeta(item.severity);
          const voters = safeParse(item.voters_json, []);
          const hasVoted = voters.includes(user?.id);
          const comments = safeParse(item.comments_json, []);

          return (
            <div key={item.id} onClick={() => onSelect(item.id)}
              className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 cursor-pointer transition-colors group">
              <span className="text-2xl flex-shrink-0 mt-0.5">{tMeta.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{item.title}</h3>
                  {item.is_enterprise_priority && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">PRIORITY</span>
                  )}
                </div>
                <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{item.description}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-medium border" style={{ color: sMeta.color, background: `${sMeta.color}15`, borderColor: `${sMeta.color}30` }}>{sMeta.label}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-white/5 text-white/40 border border-white/10">{item.category}</span>
                  <span className="flex items-center gap-0.5 text-[9px] text-white/30">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: sevMeta.color }} /> {sevMeta.label}
                  </span>
                  <span className="text-[9px] text-white/20">{item.feedback_id}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={(e) => handleVote(item, e)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${hasVoted ? "text-indigo-400" : "text-white/30 hover:text-white/60"}`}>
                  <ThumbsUp size={14} className={voting === item.id ? "animate-pulse" : ""} />
                  <span className="text-[10px] font-medium">{item.votes || 0}</span>
                </button>
                <div className="flex items-center gap-1 text-white/30 text-[10px]">
                  <MessageSquare size={12} /> {comments.length}
                </div>
                <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}