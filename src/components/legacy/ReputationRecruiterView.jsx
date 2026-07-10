import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ShieldCheck, Briefcase, GraduationCap, TrendingUp, AlertCircle } from "lucide-react";

export default function ReputationRecruiterView({ userId }) {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    base44.functions.invoke("manageReputation", { action: "get_recruiter_view", user_id: userId })
      .then((res) => { const d = res.data || res; setData(d); })
      .catch(() => { toast({ title: "Failed to load recruiter view", variant: "destructive" }); })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>;
  if (!data) return null;

  const { executive, reputation, leadership_strengths, thought_leadership, mentorship, community_standing, professional_verification, ai_insights, disclaimer } = data;

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex items-start gap-2">
        <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-400/70 text-[11px] leading-relaxed">{disclaimer}</p>
      </div>

      {/* Executive header */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          {executive.photo ? (
            <img src={executive.photo} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-medium text-lg">{executive.name?.charAt(0)}</div>
          )}
          <div>
            <div className="text-white/90 font-medium">{executive.name}</div>
            <div className="text-white/40 text-xs">{executive.headline}</div>
            <div className="text-white/30 text-[10px] mt-0.5">{[executive.organization, executive.industry, executive.country].filter(Boolean).join(' · ')}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <RecruiterStat label="Reputation" value={`${reputation.score}/1000`} color="text-indigo-400" />
          <RecruiterStat label="Overall Rating" value={reputation.overall_rating} color="text-amber-400" />
          <RecruiterStat label="Community Trust" value={`${reputation.community_trust}/100`} color="text-emerald-400" />
          <RecruiterStat label="Leadership Influence" value={`${reputation.leadership_influence}%`} color="text-blue-400" />
          <RecruiterStat label="Executive Credibility" value={`${reputation.executive_credibility}/100`} color="text-cyan-400" />
          <RecruiterStat label="Tier" value={reputation.tier.replace(/_/g, ' ')} color="text-purple-400" />
        </div>
      </div>

      {/* Leadership Strengths */}
      {leadership_strengths?.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-indigo-400" />
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Leadership Strengths</h3>
          </div>
          <div className="space-y-2">
            {leadership_strengths.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-white/60 text-xs">{s.pillar}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${s.score}%` }} />
                  </div>
                  <span className="text-white/40 text-[10px] w-8 text-right">{s.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thought Leadership + Mentorship */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={14} className="text-cyan-400" />
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Thought Leadership</h3>
          </div>
          <div className="space-y-2">
            <RecruiterRow label="Letters Published" value={thought_leadership.letters_published} />
            <RecruiterRow label="Leadership Index" value={`${thought_leadership.thought_leadership_index}/100`} />
            <RecruiterRow label="Total Views" value={thought_leadership.total_views} />
            <RecruiterRow label="Featured Articles" value={thought_leadership.featured_articles} />
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={14} className="text-purple-400" />
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Mentorship Activity</h3>
          </div>
          <div className="space-y-2">
            <RecruiterRow label="Mentorship Score" value={`${mentorship.score}/100`} />
            <RecruiterRow label="Sessions" value={mentorship.sessions} />
            <RecruiterRow label="Mentoring Hours" value={mentorship.hours} />
          </div>
        </div>
      </div>

      {/* Community Standing */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={14} className="text-emerald-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Community Standing</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <RecruiterStat label="Contributions" value={community_standing.contributions} color="text-indigo-400" />
          <RecruiterStat label="Helpful Responses" value={community_standing.helpful_responses} color="text-emerald-400" />
          <RecruiterStat label="Awards" value={community_standing.awards} color="text-amber-400" />
          <RecruiterStat label="Conduct" value={`${community_standing.professional_conduct}/100`} color="text-blue-400" />
        </div>
      </div>

      {/* AI Insights (if available) */}
      {ai_insights?.insights?.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">AI Assessment</h3>
          <div className="flex flex-wrap gap-1.5">
            {ai_insights.insights.map((ins, i) => <span key={i} className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-300 text-xs">{ins}</span>)}
          </div>
        </div>
      )}

      {/* Verification */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={14} className="text-indigo-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Professional Verification</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            {professional_verification.verified ? <ShieldCheck size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-white/30" />}
            <span className="text-xs text-white/60">Executive Verified</span>
          </div>
          <div className="flex items-center gap-2">
            {professional_verification.identity_verified ? <ShieldCheck size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-white/30" />}
            <span className="text-xs text-white/60">Identity Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecruiterStat({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
      <div className={`text-sm font-bold ${color}`}>{value}</div>
      <div className="text-white/30 text-[9px] mt-0.5">{label}</div>
    </div>
  );
}

function RecruiterRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40 text-xs">{label}</span>
      <span className="text-white/70 text-xs font-medium">{value}</span>
    </div>
  );
}