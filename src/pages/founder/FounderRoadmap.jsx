import React, { useState } from "react";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Vote, Lightbulb, Check, Loader2, TrendingUp } from "lucide-react";

const ROADMAP_FEATURES = [
  { id: "ai_agents", title: "AI Leadership Agents", description: "Autonomous AI agents that help executives manage daily leadership tasks.", votes: 142 },
  { id: "board_sim", title: "Board Meeting Simulator", description: "Practice board-level presentations and high-stakes decisions with AI.", votes: 98 },
  { id: "leadership_dna", title: "Leadership DNA™ Analytics", description: "Deep personality and leadership style analysis with actionable insights.", votes: 87 },
  { id: "exec_analytics", title: "Executive Analytics Dashboard", description: "Comprehensive analytics for tracking leadership growth over time.", votes: 65 },
  { id: "peer_matching", title: "AI Peer Matching", description: "Intelligent matching with complementary executives for collaboration.", votes: 54 },
  { id: "voice_coach", title: "Voice-Activated Executive Coach", description: "Real-time coaching during practice sessions via voice interaction.", votes: 41 },
];

export default function FounderRoadmap() {
  const { member, loading, reload } = useFoundingMember();
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState({});

  if (loading || !member) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  const handleVote = async (featureId) => {
    if (voted[featureId]) return;
    setVoting(true);
    try {
      await base44.entities.FoundingMember.update(member.id, {
        votes_cast: (member.votes_cast || 0) + 1,
      });
      await base44.entities.FoundingMemberAuditLog.create({
        founding_member_id: member.id,
        founding_member_number: member.founding_member_number,
        user_id: member.user_id,
        member_name: member.full_name,
        action: "vote_submitted",
        description: `Voted on roadmap feature: ${ROADMAP_FEATURES.find(f => f.id === featureId)?.title}`,
        performed_by: member.user_id,
        performed_by_name: member.full_name,
      });
      setVoted({ ...voted, [featureId]: true });
      await reload();
      toast({ title: "Vote submitted", description: "Thank you for shaping the EXECLEAD.AI roadmap." });
    } catch (e) {
      toast({ title: "Vote failed", variant: "destructive" });
    }
    setVoting(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Roadmap Voting</h1>
        <p className="text-white/40 text-sm">Vote on upcoming features and influence the EXECLEAD.AI product roadmap.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
          <Vote size={18} className="mx-auto text-amber-400 mb-2" />
          <div className="text-2xl font-bold text-white">{member.votes_cast || 0}</div>
          <div className="text-white/30 text-xs">Votes Cast</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
          <Check size={18} className="mx-auto text-emerald-400 mb-2" />
          <div className="text-2xl font-bold text-white">{member.accepted_suggestions || 0}</div>
          <div className="text-white/30 text-xs">Accepted</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
          <TrendingUp size={18} className="mx-auto text-violet-400 mb-2" />
          <div className="text-2xl font-bold text-white">{member.implemented_ideas || 0}</div>
          <div className="text-white/30 text-xs">Implemented</div>
        </div>
      </div>

      <div className="space-y-3">
        {ROADMAP_FEATURES.map((feature) => (
          <div key={feature.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb size={14} className="text-amber-400 shrink-0" />
                  <h3 className="text-white text-sm font-medium">{feature.title}</h3>
                </div>
                <p className="text-white/40 text-xs leading-relaxed">{feature.description}</p>
                <div className="text-white/30 text-[10px] mt-2">{feature.votes} community votes</div>
              </div>
              <button
                onClick={() => handleVote(feature.id)}
                disabled={voted[feature.id] || voting}
                className={`px-3 py-2 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  voted[feature.id]
                    ? "bg-emerald-500/10 text-emerald-400 cursor-default"
                    : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                }`}
              >
                {voted[feature.id] ? <Check size={14} /> : <Vote size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}