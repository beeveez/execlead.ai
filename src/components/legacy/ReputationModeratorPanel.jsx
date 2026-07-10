import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SPECIAL_BADGES, ANTI_GAMING_FLAGS, parseJSON } from "@/lib/reputationSystem";
import { Loader2, Shield, AlertTriangle, Scale, Plus, Minus, Ban, CheckCircle, Star, Award } from "lucide-react";

export default function ReputationModeratorPanel({ userId, reputation, history = [], onDataChanged }) {
  const { toast } = useToast();
  const [acting, setActing] = useState(null);
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [badgeReason, setBadgeReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");

  if (!reputation) return null;

  const gamingFlags = parseJSON(reputation.gaming_flags_json, []);
  const gamingRisk = reputation.gaming_risk_score || 0;
  const isSuspended = reputation.reputation_suspended;

  const handleAction = async (moderatorAction, extra = {}) => {
    setActing(moderatorAction);
    try {
      const res = await base44.functions.invoke("manageReputation", {
        action: "admin_moderator_action",
        user_id: userId,
        moderator_action: moderatorAction,
        reason: extra.reason || "",
        ...extra,
      });
      const d = res.data || res;
      if (d.success) {
        toast({ title: `Action completed: ${moderatorAction.replace(/_/g, " ")}` });
        if (onDataChanged) onDataChanged();
      } else {
        toast({ title: d.error || "Action failed", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Action failed", variant: "destructive" });
    }
    setActing(null);
  };

  const handleAdjust = () => {
    if (!adjustReason.trim()) { toast({ title: "Reason required", variant: "destructive" }); return; }
    handleAction("adjust_score", { score_adjustment: parseInt(adjustAmount), reason: adjustReason });
    setShowAdjust(false);
    setAdjustAmount(0);
    setAdjustReason("");
  };

  const handleBadgeAction = (action) => {
    if (!selectedBadge) { toast({ title: "Select a badge", variant: "destructive" }); return; }
    if (!badgeReason.trim()) { toast({ title: "Reason required", variant: "destructive" }); return; }
    handleAction(action, { badge_id: selectedBadge, reason: badgeReason });
    setSelectedBadge("");
    setBadgeReason("");
  };

  const handleSuspend = () => {
    if (!suspendReason.trim()) { toast({ title: "Reason required", variant: "destructive" }); return; }
    handleAction("suspend", { reason: suspendReason });
    setSuspendReason("");
  };

  const riskColor = gamingRisk >= 50 ? 'text-red-400' : gamingRisk >= 30 ? 'text-amber-400' : 'text-emerald-400';
  const riskBg = gamingRisk >= 50 ? 'bg-red-500/10 border-red-500/20' : gamingRisk >= 30 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20';

  return (
    <div className="space-y-6">
      {/* Suspension banner */}
      {isSuspended && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <Ban size={18} className="text-red-400" />
          <div className="flex-1">
            <div className="text-red-400 text-sm font-medium">Reputation Suspended</div>
            <div className="text-white/40 text-xs mt-0.5">Reason: {reputation.suspension_reason || 'Not specified'} · By {reputation.suspended_by_name || 'Admin'}</div>
          </div>
          <button onClick={() => handleAction("restore", { reason: "Reputation restored by moderator" })} disabled={acting === "restore"} className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">
            {acting === "restore" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Restore
          </button>
        </div>
      )}

      {/* Moderator Actions */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={14} className="text-indigo-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Moderator Tools</h3>
        </div>

        {/* Score adjustment */}
        {!showAdjust ? (
          <button onClick={() => setShowAdjust(true)} disabled={isSuspended} className="w-full flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-xs px-3 py-2 rounded-lg disabled:opacity-50">
            <Plus size={12} /> Adjust Reputation Score
          </button>
        ) : (
          <div className="bg-white/[0.02] rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setAdjustAmount(parseInt(adjustAmount) - 10)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center"><Minus size={12} /></button>
              <input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 h-8 text-sm text-white/90 text-center" placeholder="0" />
              <button onClick={() => setAdjustAmount(parseInt(adjustAmount) + 10)} className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><Plus size={12} /></button>
            </div>
            <input type="text" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Reason (required)" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-8 text-xs text-white/90 placeholder:text-white/20" />
            <div className="flex gap-2">
              <button onClick={() => setShowAdjust(false)} className="flex-1 text-xs text-white/40 hover:text-white/60 px-3 py-1.5 rounded-lg">Cancel</button>
              <button onClick={handleAdjust} disabled={acting === "adjust_score"} className="flex-1 flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">
                {acting === "adjust_score" ? <Loader2 size={12} className="animate-spin" /> : null} Apply
              </button>
            </div>
          </div>
        )}

        {/* Badge management */}
        <div className="mt-3 bg-white/[0.02] rounded-xl p-3 space-y-2">
          <div className="text-white/40 text-[10px] font-medium">Badge Management</div>
          <select value={selectedBadge} onChange={(e) => setSelectedBadge(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-8 text-xs text-white/90">
            <option value="">Select badge...</option>
            {SPECIAL_BADGES.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
          </select>
          <input type="text" value={badgeReason} onChange={(e) => setBadgeReason(e.target.value)} placeholder="Reason (required)" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-8 text-xs text-white/90 placeholder:text-white/20" />
          <div className="flex gap-2">
            <button onClick={() => handleBadgeAction("award_badge")} disabled={acting === "award_badge"} className="flex-1 flex items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">
              {acting === "award_badge" ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Award
            </button>
            <button onClick={() => handleBadgeAction("remove_badge")} disabled={acting === "remove_badge"} className="flex-1 flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">
              {acting === "remove_badge" ? <Loader2 size={12} className="animate-spin" /> : <Minus size={12} />} Remove
            </button>
          </div>
        </div>

        {/* Feature + Suspend */}
        <div className="mt-3 flex gap-2">
          <button onClick={() => handleAction("feature_member", { reason: "Featured by moderator" })} disabled={acting === "feature_member"} className="flex-1 flex items-center justify-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs px-3 py-2 rounded-lg disabled:opacity-50">
            {acting === "feature_member" ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} />} Feature
          </button>
          {!isSuspended ? (
            <button onClick={handleSuspend} disabled={acting === "suspend"} className="flex-1 flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg disabled:opacity-50">
              {acting === "suspend" ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />} Suspend
            </button>
          ) : null}
        </div>
        {!isSuspended && (
          <input type="text" value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Suspension reason (required)" className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 h-8 text-xs text-white/90 placeholder:text-white/20" />
        )}
      </div>

      {/* Anti-Gaming */}
      <div className={`border rounded-2xl p-5 ${riskBg}`}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className={riskColor} />
          <h3 className={`text-xs font-semibold uppercase tracking-wider ${riskColor}`}>Anti-Gaming Analysis</h3>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/40 text-xs">Gaming Risk Score</span>
          <span className={`text-xl font-bold ${riskColor}`}>{gamingRisk}/100</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
          <div className={`h-full ${gamingRisk >= 50 ? 'bg-red-500' : gamingRisk >= 30 ? 'bg-amber-500' : 'bg-emerald-500'} transition-all duration-500`} style={{ width: `${gamingRisk}%` }} />
        </div>
        {gamingFlags.length > 0 ? (
          <div className="space-y-1.5">
            <div className="text-white/40 text-[10px] font-medium">Detected Patterns:</div>
            {gamingFlags.map((flag) => {
              const config = ANTI_GAMING_FLAGS[flag];
              return (
                <div key={flag} className="flex items-start gap-2">
                  <AlertTriangle size={10} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white/60 text-xs">{config?.label || flag}</div>
                    <div className="text-white/30 text-[10px]">{config?.description || ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-white/40 text-xs">No suspicious activity detected. All engagement appears organic.</p>
        )}
      </div>

      {/* Audit History */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Scale size={14} className="text-indigo-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Audit History</h3>
        </div>
        {history.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No audit entries.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.map((entry) => {
              const change = entry.change_amount || 0;
              return (
                <div key={entry.id} className="flex items-start gap-3 p-2.5 bg-white/[0.02] rounded-lg">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${change > 0 ? 'bg-emerald-500/10 text-emerald-400' : change < 0 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/40'}`}>
                    {change > 0 ? '+' : change < 0 ? '−' : '='}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white/40 text-[10px]">{entry.action_type || entry.source}</span>
                      {change !== 0 && <span className={`text-[10px] ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{change > 0 ? '+' : ''}{change} pts</span>}
                      <span className="text-white/20 text-[10px]">{entry.previous_score} → {entry.new_score}</span>
                    </div>
                    <p className="text-white/50 text-xs mt-0.5 truncate">{entry.reason}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/20">
                      <span>{new Date(entry.timestamp).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      {entry.reviewer_name && <span>· {entry.reviewer_name}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}