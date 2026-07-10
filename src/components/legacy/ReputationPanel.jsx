import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import ReputationScoreCard from "@/components/legacy/ReputationScoreCard";
import ReputationDimensions from "@/components/legacy/ReputationDimensions";
import ReputationScorecard from "@/components/legacy/ReputationScorecard";
import ReputationTimeline from "@/components/legacy/ReputationTimeline";
import ReputationModeratorPanel from "@/components/legacy/ReputationModeratorPanel";
import ReputationRecruiterView from "@/components/legacy/ReputationRecruiterView";
import { Loader2, BarChart3, Target, Clock, Shield, Eye } from "lucide-react";

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'scorecard', label: 'Scorecard', icon: Target },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'recruiter', label: 'Recruiter View', icon: Eye },
];

const ADMIN_TABS = [
  { id: 'moderator', label: 'Moderator', icon: Shield },
];

export default function ReputationPanel({ userId }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [tab, setTab] = useState('overview');

  const targetUserId = userId || user?.id;
  const isAdmin = user?.role === 'admin';
  const allTabs = isAdmin ? [...TABS, ...ADMIN_TABS] : TABS;

  useEffect(() => {
    if (!targetUserId) return;
    loadStatus();
  }, [targetUserId]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "get_status", user_id: targetUserId });
      const d = res.data || res;
      setData(d);
    } catch (e) {}
    setLoading(false);
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "recalculate", user_id: targetUserId });
      const d = res.data || res;
      if (d.success) {
        setData(prev => ({ ...prev, reputation: d.reputation }));
        if (d.new_badges?.length > 0) {
          toast({ title: `🎉 New badge${d.new_badges.length > 1 ? 's' : ''} earned!`, description: d.new_badges.join(', ') });
        } else {
          toast({ title: "Reputation recalculated" });
        }
      }
    } catch (e) {
      toast({ title: "Failed to recalculate", variant: "destructive" });
    }
    setRecalculating(false);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  const reputation = data?.reputation;
  const history = data?.history || [];
  const isSelf = data?.is_self ?? (targetUserId === user?.id);

  return (
    <div className="space-y-6">
      {/* Score card always visible */}
      <ReputationScoreCard
        reputation={reputation}
        isSelf={isSelf}
        onRecalculate={handleRecalculate}
        recalculating={recalculating}
      />

      {/* Tab navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {allTabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.id ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'}`}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <ReputationDimensions reputation={reputation} />}
      {tab === 'scorecard' && <ReputationScorecard reputation={reputation} userId={targetUserId} />}
      {tab === 'timeline' && <ReputationTimeline reputation={reputation} history={history} />}
      {tab === 'recruiter' && <ReputationRecruiterView userId={targetUserId} />}
      {tab === 'moderator' && isAdmin && (
        <ReputationModeratorPanel userId={targetUserId} reputation={reputation} history={history} onDataChanged={loadStatus} />
      )}
    </div>
  );
}