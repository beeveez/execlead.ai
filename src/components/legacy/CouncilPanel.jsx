import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { APPEAL_TYPES, COUNCIL_ROLES, YEARLY_HONORS, SPECIAL_BADGES, EXECUTIVE_ACHIEVEMENTS, parseJSON } from "@/lib/reputationSystem";
import { Loader2, Scale, Shield, Gavel, Eye } from "lucide-react";

export default function CouncilPanel({ userId, reputation }) {
  const { toast } = useToast();
  const [tab, setTab] = useState('appeals');
  const [appeals, setAppeals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [showCouncilForm, setShowCouncilForm] = useState(false);
  const [councilType, setCouncilType] = useState('abuse_investigation');
  const [councilReason, setCouncilReason] = useState('');
  const [councilPriority, setCouncilPriority] = useState('medium');
  const [showHonorForm, setShowHonorForm] = useState(false);
  const [honorType, setHonorType] = useState('executive_of_year');
  const [honorTitle, setHonorTitle] = useState('');

  useEffect(() => { loadAll(); }, [tab]);

  const loadAll = async () => {
    setLoading(true);
    try {
      if (tab === 'appeals') {
        const res = await base44.functions.invoke("manageReputation", { action: "admin_appeals", status: "pending" });
        const d = res.data || res;
        setAppeals(d.appeals || []);
      } else if (tab === 'council') {
        const res = await base44.functions.invoke("manageReputation", { action: "admin_council_reviews", status: "open" });
        const d = res.data || res;
        setReviews(d.reviews || []);
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleReviewAppeal = async (appealId, decision) => {
    setActing(`appeal_${appealId}_${decision}`);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "review_appeal", appeal_id: appealId, decision, review_decision: '', escalate: false });
      const d = res.data || res;
      if (d.success) { toast({ title: `Appeal ${decision}` }); loadAll(); }
    } catch (e) { toast({ title: "Failed", variant: "destructive" }); }
    setActing(null);
  };

  const handleCreateReview = async () => {
    if (!councilReason.trim()) { toast({ title: "Reason required", variant: "destructive" }); return; }
    setActing('create_review');
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "create_council_review", user_id: userId, review_type: councilType, reason: councilReason, priority: councilPriority });
      const d = res.data || res;
      if (d.success) { toast({ title: "Council review opened" }); setShowCouncilForm(false); setCouncilReason(''); loadAll(); }
    } catch (e) { toast({ title: "Failed", variant: "destructive" }); }
    setActing(null);
  };

  const handleAwardHonor = async () => {
    setActing('award_honor');
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "admin_moderator_action", user_id: userId, moderator_action: 'award_honor', honor_type: honorType, award_title: honorTitle || honorType, reason: 'Yearly honor awarded by council' });
      const d = res.data || res;
      if (d.success) { toast({ title: "Honor awarded" }); setShowHonorForm(false); }
      else toast({ title: d.error || "Failed", variant: "destructive" });
    } catch (e) { toast({ title: "Failed", variant: "destructive" }); }
    setActing(null);
  };

  const TABS = [
    { id: 'appeals', label: 'Appeals', icon: Scale },
    { id: 'council', label: 'Council Reviews', icon: Gavel },
    { id: 'actions', label: 'Council Actions', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Council governance intro */}
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-indigo-400" />
          <h3 className="text-white/70 text-sm font-medium">Executive Reputation Council™</h3>
        </div>
        <p className="text-white/40 text-xs leading-relaxed">The independent governing framework that monitors reputation integrity, reviews appeals, approves special recognitions, investigates abuse, and protects fairness. Every decision is logged and audited.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {COUNCIL_ROLES.map(r => <span key={r.id} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/5 rounded text-white/40">{r.icon} {r.name}</span>)}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          return <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.id ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'bg-white/5 text-white/40 border border-transparent'}`}>
            <Icon size={13} /> {t.label}
          </button>;
        })}
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div> : (
        <>
          {/* Appeals tab */}
          {tab === 'appeals' && (
            appeals.length === 0 ? <p className="text-white/30 text-sm text-center py-8">No pending appeals.</p> : (
              <div className="space-y-3">
                {appeals.map((a) => {
                  const typeConfig = APPEAL_TYPES.find(t => t.id === a.appeal_type);
                  return (
                    <div key={a.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{typeConfig?.icon}</span>
                            <span className="text-white/70 text-xs font-medium">{typeConfig?.name || a.appeal_type}</span>
                            <span className="text-white/30 text-[10px]">· {a.user_name}</span>
                          </div>
                          <p className="text-white/50 text-xs mt-1.5 bg-white/[0.02] rounded p-2">{a.appeal_reason}</p>
                          <div className="text-white/20 text-[9px] mt-1">{new Date(a.submitted_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => handleReviewAppeal(a.id, 'approve')} disabled={acting === `appeal_${a.id}_approve`} className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-50">Approve</button>
                          <button onClick={() => handleReviewAppeal(a.id, 'deny')} disabled={acting === `appeal_${a.id}_deny`} className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-50">Deny</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Council reviews tab */}
          {tab === 'council' && (
            <>
              {!showCouncilForm && (
                <button onClick={() => setShowCouncilForm(true)} className="w-full flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-xs px-3 py-2 rounded-lg">
                  <Gavel size={12} /> Open Council Review
                </button>
              )}
              {showCouncilForm && (
                <div className="bg-white/[0.02] rounded-xl p-3 space-y-2 mb-4">
                  <select value={councilType} onChange={(e) => setCouncilType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-9 text-xs text-white/90">
                    <option value="abuse_investigation">Abuse Investigation</option>
                    <option value="appeal_review">Appeal Review</option>
                    <option value="special_recognition">Special Recognition</option>
                    <option value="policy_improvement">Policy Improvement</option>
                    <option value="gaming_investigation">Gaming Investigation</option>
                    <option value="badge_escalation">Badge Escalation</option>
                  </select>
                  <select value={councilPriority} onChange={(e) => setCouncilPriority(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-9 text-xs text-white/90">
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Priority</option>
                  </select>
                  <textarea value={councilReason} onChange={(e) => setCouncilReason(e.target.value)} placeholder="Reason for council review..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/90 placeholder:text-white/20" />
                  <div className="flex gap-2">
                    <button onClick={() => setShowCouncilForm(false)} className="flex-1 text-xs text-white/40 hover:text-white/60 px-3 py-1.5 rounded-lg">Cancel</button>
                    <button onClick={handleCreateReview} disabled={acting === 'create_review'} className="flex-1 flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">
                      {acting === 'create_review' ? <Loader2 size={12} className="animate-spin" /> : null} Open Review
                    </button>
                  </div>
                </div>
              )}
              {reviews.length === 0 ? <p className="text-white/30 text-sm text-center py-8">No open council reviews.</p> : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${r.priority === 'critical' ? 'bg-red-500/10 text-red-400' : r.priority === 'high' ? 'bg-orange-500/10 text-orange-400' : r.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-white/40'}`}>{r.priority}</span>
                        <span className="text-white/40 text-[10px]">{r.review_type.replace(/_/g, ' ')}</span>
                        <span className="text-white/30 text-[10px]">· {r.user_name}</span>
                      </div>
                      <p className="text-white/50 text-xs mt-1.5">{r.reason}</p>
                      <div className="text-white/20 text-[9px] mt-1">Opened: {new Date(r.opened_at).toLocaleDateString('en-US', { dateStyle: 'medium' })} by {r.initiated_by_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Council actions tab */}
          {tab === 'actions' && reputation && (
            <div className="space-y-4">
              {/* Yearly honors */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-yellow-400" />
                    <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Award Yearly Honor</h3>
                  </div>
                  {!showHonorForm && <button onClick={() => setShowHonorForm(true)} className="text-xs text-indigo-400 hover:underline">Award</button>}
                </div>
                {showHonorForm && (
                  <div className="bg-white/[0.02] rounded-xl p-3 space-y-2">
                    <select value={honorType} onChange={(e) => setHonorType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-9 text-xs text-white/90">
                      {YEARLY_HONORS.map(h => <option key={h.id} value={h.id}>{h.icon} {h.name}</option>)}
                    </select>
                    <input type="text" value={honorTitle} onChange={(e) => setHonorTitle(e.target.value)} placeholder="Custom title (optional)" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-9 text-xs text-white/90 placeholder:text-white/20" />
                    <div className="flex gap-2">
                      <button onClick={() => setShowHonorForm(false)} className="flex-1 text-xs text-white/40 hover:text-white/60 px-3 py-1.5 rounded-lg">Cancel</button>
                      <button onClick={handleAwardHonor} disabled={acting === 'award_honor'} className="flex-1 flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50">
                        {acting === 'award_honor' ? <Loader2 size={12} className="animate-spin" /> : null} Award Honor
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}