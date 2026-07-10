import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import ReputationScoreCard from "@/components/legacy/ReputationScoreCard";
import { Loader2, History, Shield } from "lucide-react";

export default function ReputationPanel({ userId }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) return;
    loadHistory();
  }, [targetUserId]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "get_history", user_id: targetUserId });
      const d = res.data || res;
      setHistory(d.history || []);
    } catch (e) {}
    setLoadingHistory(false);
  };

  const sourceLabels = {
    ai_assessment: 'AI Assessment',
    moderator_action: 'Moderator Action',
    community_recognition: 'Community Recognition',
    recalculation: 'Recalculation',
    penalty: 'Penalty',
    badge_earned: 'Badge Earned',
    badge_revoked: 'Badge Revoked',
  };

  const sourceColors = {
    ai_assessment: 'text-indigo-400',
    moderator_action: 'text-amber-400',
    community_recognition: 'text-purple-400',
    recalculation: 'text-blue-400',
    penalty: 'text-red-400',
    badge_earned: 'text-emerald-400',
    badge_revoked: 'text-red-400',
  };

  return (
    <div className="space-y-6">
      <ReputationScoreCard userId={targetUserId} />

      {/* Audit History */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <History size={14} className="text-indigo-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Reputation History</h3>
        </div>

        {loadingHistory ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
        ) : history.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No reputation changes recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => {
              const change = entry.change_amount || 0;
              const isPositive = change > 0;
              const isNeutral = change === 0;
              return (
                <div key={entry.id} className="flex items-start gap-3 p-2.5 bg-white/[0.02] rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : isNeutral ? 'bg-white/5 text-white/40' : 'bg-red-500/10 text-red-400'}`}>
                    {isPositive ? '+' : isNeutral ? '=' : '−'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-medium ${sourceColors[entry.source] || 'text-white/40'}`}>
                        {sourceLabels[entry.source] || entry.source}
                      </span>
                      {!isNeutral && (
                        <span className={`text-[10px] ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{change} pts
                        </span>
                      )}
                      <span className="text-white/20 text-[10px]">
                        {entry.previous_score} → {entry.new_score}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs mt-0.5 truncate">{entry.reason}</p>
                    <p className="text-white/20 text-[10px] mt-0.5">
                      {new Date(entry.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
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