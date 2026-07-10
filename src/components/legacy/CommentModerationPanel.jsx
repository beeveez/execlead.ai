import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2, Check, EyeOff, Trash2, Star, AlertTriangle, Ban, Clock,
  Shield, MessageCircle, Flag, PenLine, Scale
} from "lucide-react";
import { scoreColor } from "@/lib/legacyLibrary";

const TABS = [
  { value: "pending_review", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "active", label: "Active" },
  { value: "hidden", label: "Hidden" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
  { value: "appeals", label: "Appeals" },
];

const safeParse = (str) => { try { return JSON.parse(str) || {}; } catch { return {}; } };

export default function CommentModerationPanel() {
  const { toast } = useToast();
  const [tab, setTab] = useState("pending_review");
  const [comments, setComments] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => { if (tab === "appeals") loadAppeals(); else loadComments(); }, [tab]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "admin_comments", status: tab });
      const d = res.data || res;
      setComments(d.comments || []);
    } catch (e) { toast({ title: "Failed to load comments", variant: "destructive" }); }
    setLoading(false);
  };

  const loadAppeals = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "admin_appeals", status: "pending" });
      const d = res.data || res;
      setAppeals(d.appeals || []);
    } catch (e) { toast({ title: "Failed to load appeals", variant: "destructive" }); }
    setLoading(false);
  };

  const handleAction = async (action, commentId) => {
    setActing(`${commentId}_${action}`);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "moderate_comment", comment_id: commentId, moderator_action: action });
      const d = res.data || res;
      if (d.success) { toast({ title: `Action: ${action.replace(/_/g, " ")}` }); loadComments(); }
      else toast({ title: d.error || "Action failed", variant: "destructive" });
    } catch (e) { toast({ title: "Action failed", variant: "destructive" }); }
    setActing(null);
  };

  const handleAppeal = async (appealId, decision) => {
    setActing(`appeal_${appealId}_${decision}`);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "review_appeal", appeal_id: appealId, decision, review_notes: "" });
      const d = res.data || res;
      if (d.success) { toast({ title: `Appeal ${decision}ed` }); loadAppeals(); }
      else toast({ title: d.error || "Failed", variant: "destructive" });
    } catch (e) { toast({ title: "Failed", variant: "destructive" }); }
    setActing(null);
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.value ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "bg-white/5 text-white/40 border border-transparent"}`}>{t.label}</button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div> : tab === "appeals" ? (
        appeals.length === 0 ? <div className="text-center py-16"><Scale size={32} className="text-white/10 mx-auto mb-3" /><p className="text-white/30 text-sm">No pending appeals.</p></div> : (
          <div className="space-y-3">
            {appeals.map((a) => (
              <div key={a.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-white/40 text-[10px]">on "{a.letter_title}"</span>
                      <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-[10px] font-medium">Appealing: {a.moderator_action?.replace(/_/g, " ")}</span>
                    </div>
                    <div className="text-white/80 text-sm font-medium mb-1">{a.user_name}</div>
                    <div className="bg-white/[0.02] rounded p-2 mb-2">
                      <div className="text-white/30 text-[10px] mb-1">Appeal reason:</div>
                      <p className="text-white/60 text-sm">{a.appeal_reason}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => handleAppeal(a.id, "approve")} disabled={acting === `appeal_${a.id}_approve`} className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-50">{acting === `appeal_${a.id}_approve` ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Approve</button>
                    <button onClick={() => handleAppeal(a.id, "deny")} disabled={acting === `appeal_${a.id}_deny`} className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-50">{acting === `appeal_${a.id}_deny` ? <Loader2 size={11} className="animate-spin" /> : <Ban size={11} />} Deny</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : comments.length === 0 ? <div className="text-center py-16"><MessageCircle size={32} className="text-white/10 mx-auto mb-3" /><p className="text-white/30 text-sm">No comments in this category.</p></div> : (
        <div className="space-y-3">{comments.map((c) => <ModerationCommentCard key={c.id} comment={c} acting={acting} onAction={handleAction} />)}</div>
      )}
    </div>
  );
}

function ModerationCommentCard({ comment, acting, onAction }) {
  const flags = safeParse(comment.ai_flags_json);
  const hasFlags = Object.values(flags).some((v) => v === true);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-white/40 text-[10px] truncate">on "{comment.letter_title || "Letter"}"</span>
            {comment.status === "pending_review" && <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-[10px] font-medium">Pending</span>}
            {comment.status === "flagged" && <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[10px] font-medium"><Flag size={8} className="inline" /> Flagged</span>}
            {comment.reported_count > 0 && <span className="px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-orange-400 text-[10px] font-medium">{comment.reported_count} reports</span>}
            {comment.pinned && <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-[10px] font-medium"><Star size={8} className="inline" fill="currentColor" /> Pinned</span>}
            {comment.edit_requested && <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-[10px] font-medium">Edit Requested</span>}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/80 text-sm font-medium">{comment.user_name}</span>
            {comment.author_verified && <span className="text-indigo-400 text-[10px]">✓</span>}
            {comment.author_is_founder && <span className="px-1 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] rounded">Founder</span>}
            <span className="text-white/30 text-[10px]">{comment.author_title}</span>
          </div>
          <p className="text-white/60 text-sm mb-2">{comment.content}</p>

          {comment.ai_reviewed_at && (
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <ScoreMini label="Pro" score={comment.ai_professional_score} />
              <ScoreMini label="Toxic" score={comment.ai_toxicity_score} inverted />
              <ScoreMini label="Spam" score={comment.ai_spam_score} inverted />
              <ScoreMini label="Value" score={comment.ai_leadership_value_score} />
            </div>
          )}

          {hasFlags && (
            <div className="flex items-center gap-1 flex-wrap mb-2">
              <span className="text-red-400 text-[10px] font-medium flex items-center gap-1"><AlertTriangle size={9} /> Flags:</span>
              {Object.entries(flags).filter(([, v]) => v).map(([k]) => <span key={k} className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[9px]">{k.replace(/_/g, " ")}</span>)}
            </div>
          )}

          {comment.moderator_action && <div className="text-white/30 text-[10px] mb-2">Last action: {comment.moderator_action.replace(/_/g, " ")} by {comment.moderator_name}</div>}
        </div>

        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {(comment.status === "pending_review" || comment.status === "flagged") && <ActBtn onClick={() => onAction("approve", comment.id)} color="emerald" icon={Check} loading={acting === `${comment.id}_approve`}>Approve</ActBtn>}
          {comment.status !== "hidden" && comment.status !== "deleted" && <ActBtn onClick={() => onAction("hide", comment.id)} color="subtle" icon={EyeOff} loading={acting === `${comment.id}_hide`}>Hide</ActBtn>}
          {comment.status === "hidden" && <ActBtn onClick={() => onAction("approve", comment.id)} color="subtle" icon={Check} loading={acting === `${comment.id}_approve`}>Unhide</ActBtn>}
          {!comment.pinned && <ActBtn onClick={() => onAction("feature", comment.id)} color="amber" icon={Star} loading={acting === `${comment.id}_feature`}>Feature</ActBtn>}
          <ActBtn onClick={() => onAction("request_edit", comment.id)} color="subtle" icon={PenLine} loading={acting === `${comment.id}_request_edit`}>Req. Edit</ActBtn>
          <ActBtn onClick={() => onAction("warn_user", comment.id)} color="subtle" icon={AlertTriangle} loading={acting === `${comment.id}_warn_user`}>Warn</ActBtn>
          <ActBtn onClick={() => onAction("mute", comment.id)} color="orange" icon={Clock} loading={acting === `${comment.id}_mute`}>Mute</ActBtn>
          <ActBtn onClick={() => onAction("suspend_user", comment.id)} color="orange" icon={Clock} loading={acting === `${comment.id}_suspend_user`}>Suspend</ActBtn>
          <ActBtn onClick={() => onAction("suspend_account", comment.id)} color="red" icon={Shield} loading={acting === `${comment.id}_suspend_account`}>Susp. Acct</ActBtn>
          <ActBtn onClick={() => onAction("ban_account", comment.id)} color="red" icon={Ban} loading={acting === `${comment.id}_ban_account`}>Ban Acct</ActBtn>
          <ActBtn onClick={() => onAction("delete", comment.id)} color="redSubtle" icon={Trash2} loading={acting === `${comment.id}_delete`}>Delete</ActBtn>
        </div>
      </div>
    </div>
  );
}

function ScoreMini({ label, score, inverted }) {
  const color = inverted ? (score >= 50 ? "text-red-400" : score >= 30 ? "text-amber-400" : "text-emerald-400") : scoreColor(score || 0);
  return (<div className="flex items-center gap-1"><span className="text-white/30 text-[10px]">{label}</span><span className={`text-xs font-semibold ${color}`}>{score || 0}</span></div>);
}

function ActBtn({ onClick, color, icon: Icon, children, loading }) {
  const colors = {
    emerald: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400",
    red: "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400",
    orange: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20 text-orange-400",
    amber: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400",
    subtle: "bg-white/5 hover:bg-white/10 border-white/10 text-white/50 hover:text-white/80",
    redSubtle: "bg-white/5 hover:bg-red-500/10 border-white/10 text-white/40 hover:text-red-400",
  };
  return (<button onClick={onClick} disabled={loading} className={`flex items-center gap-1 border text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${colors[color]}`}>{loading ? <Loader2 size={11} className="animate-spin" /> : <Icon size={11} />} {children}</button>);
}