import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { APPEAL_TYPES, YEARLY_HONORS, parseJSON } from "@/lib/reputationSystem";
import { Loader2, Scale, Trophy, Clock, CheckCircle, XCircle } from "lucide-react";

export default function ReputationAppeals({ userId, reputation }) {
  const { toast } = useToast();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [appealType, setAppealType] = useState('badge_removal');
  const [appealReason, setAppealReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const honors = reputation ? parseJSON(reputation.yearly_honors_json, []) : [];

  useEffect(() => { loadAppeals(); }, [userId]);

  const loadAppeals = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "get_my_appeals" });
      const d = res.data || res;
      setAppeals(d.appeals || []);
    } catch (e) {}
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!appealReason.trim()) { toast({ title: "Please provide a reason", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "submit_appeal", appeal_type: appealType, appeal_reason: appealReason });
      const d = res.data || res;
      if (d.success) { toast({ title: "Appeal submitted" }); setShowForm(false); setAppealReason(''); loadAppeals(); }
      else toast({ title: d.error || "Failed", variant: "destructive" });
    } catch (e) { toast({ title: "Failed to submit appeal", variant: "destructive" }); }
    setSubmitting(false);
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    under_review: { icon: Scale, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    approved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    denied: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    escalated: { icon: Scale, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* Yearly Honors */}
      {honors.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={14} className="text-yellow-400" />
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Yearly Executive Honors ({honors.length})</h3>
          </div>
          <div className="space-y-2">
            {honors.map((h, i) => {
              const honor = YEARLY_HONORS.find(yh => yh.id === h.award);
              return (
                <div key={i} className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3">
                  <span className="text-xl">{honor?.icon || '🏆'}</span>
                  <div className="flex-1">
                    <div className="text-white/70 text-xs font-medium">{h.title || honor?.name}</div>
                    <div className="text-white/30 text-[10px]">{h.year}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appeals */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale size={14} className="text-indigo-400" />
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Reputation Appeals</h3>
          </div>
          {!showForm && appeals.filter(a => a.status === 'pending').length === 0 && (
            <button onClick={() => setShowForm(true)} className="text-xs text-indigo-400 hover:underline">Submit Appeal</button>
          )}
        </div>

        {showForm && (
          <div className="bg-white/[0.02] rounded-xl p-3 space-y-2 mb-4">
            <select value={appealType} onChange={(e) => setAppealType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-9 text-xs text-white/90">
              {APPEAL_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
            </select>
            <textarea value={appealReason} onChange={(e) => setAppealReason(e.target.value)} placeholder="Explain why this decision should be reversed..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/90 placeholder:text-white/20" />
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 text-xs text-white/40 hover:text-white/60 px-3 py-1.5 rounded-lg">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">
                {submitting ? <Loader2 size={12} className="animate-spin" /> : null} Submit
              </button>
            </div>
          </div>
        )}

        {loading ? <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div> : appeals.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No appeals submitted.</p>
        ) : (
          <div className="space-y-2">
            {appeals.map((a) => {
              const config = statusConfig[a.status] || statusConfig.pending;
              const Icon = config.icon;
              const typeConfig = APPEAL_TYPES.find(t => t.id === a.appeal_type);
              return (
                <div key={a.id} className="bg-white/[0.02] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">{typeConfig?.icon}</span>
                    <span className="text-white/70 text-xs font-medium">{typeConfig?.name || a.appeal_type}</span>
                    <span className={`ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-medium ${config.bg} ${config.color}`}>
                      <Icon size={9} /> {a.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs mb-1">{a.appeal_reason}</p>
                  {a.review_decision && <p className="text-white/40 text-[10px] mt-1.5 pt-1.5 border-t border-white/5">Decision: {a.review_decision}</p>}
                  <div className="text-white/20 text-[9px] mt-1">Submitted: {new Date(a.submitted_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}