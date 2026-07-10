import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { LEADERBOARD_CATEGORIES, getTierById } from "@/lib/reputationSystem";
import { Trophy, Loader2 } from "lucide-react";

export default function ReputationLeaderboard({ highlightUserId }) {
  const { toast } = useToast();
  const [category, setCategory] = useState('leadership_quality');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLeaderboard(); }, [category]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "get_leaderboard", category });
      const d = res.data || res;
      setLeaderboard(d.leaderboard || []);
    } catch (e) { toast({ title: "Failed to load leaderboard", variant: "destructive" }); }
    setLoading(false);
  };

  const rankColors = ['text-yellow-400', 'text-slate-300', 'text-orange-400'];
  const rankBg = ['bg-yellow-500/10 border-yellow-500/20', 'bg-slate-400/10 border-slate-400/20', 'bg-orange-500/10 border-orange-500/20'];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={14} className="text-amber-400" />
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Executive Leaderboard</h3>
      </div>

      {/* Category selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
        {LEADERBOARD_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCategory(c.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c.id ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'bg-white/5 text-white/40 border border-transparent'}`}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div> : leaderboard.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-8">No executives ranked yet.</p>
      ) : (
        <div className="space-y-1.5">
          {leaderboard.slice(0, 20).map((entry) => {
            const tierConfig = getTierById(entry.tier);
            const isHighlighted = highlightUserId && entry.user_id === highlightUserId;
            return (
              <div key={entry.user_id} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${isHighlighted ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/[0.02] border-transparent'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${entry.rank <= 3 ? `${rankBg[entry.rank - 1]} border ${rankColors[entry.rank - 1]}` : 'bg-white/5 text-white/40'}`}>
                  {entry.rank}
                </div>
                {entry.photo ? <img src={entry.photo} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" /> : <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-medium flex-shrink-0">{entry.name?.charAt(0)}</div>}
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-xs font-medium truncate">{entry.name}</div>
                  <div className="text-white/30 text-[10px] truncate">{entry.headline}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-bold ${tierConfig.color}`}>{entry.score}</div>
                  <div className="text-white/30 text-[9px]">{tierConfig.icon} {tierConfig.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-white/20 text-[9px] text-center mt-3">Rankings based on quality, not popularity</p>
    </div>
  );
}