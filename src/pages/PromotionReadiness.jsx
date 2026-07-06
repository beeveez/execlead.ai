import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { TrendingUp, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PromotionAssessment from "@/components/hr/PromotionAssessment";

export default function PromotionReadiness() {
  const [members, setMembers] = useState([]);
  const [results, setResults] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [assessing, setAssessing] = useState(false);
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, r, l] = await Promise.all([
          base44.entities.UserProfile.list(),
          base44.entities.ChallengeResult.list("-created_date", 200),
          base44.entities.LessonProgress.list("-created_date", 100),
        ]);
        setMembers(m);
        setResults(r);
        setLessons(l);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const memberStats = members.map((m) => {
    const memberResults = results.filter((r) => r.created_by_id === m.created_by_id);
    const avgScore = memberResults.length > 0
      ? Math.round(memberResults.reduce((a, r) => a + (r.overall_score || 0), 0) / memberResults.length)
      : 0;
    const memberLessons = lessons.filter((l) => l.created_by_id === m.created_by_id);
    const completedLessons = memberLessons.filter((l) => l.completed).length;
    return {
      ...m,
      challengeCount: memberResults.length,
      avgScore,
      completedLessons,
    };
  });

  const runAssessment = async (member) => {
    setSelected(member);
    setAssessing(true);
    setAssessment(null);
    try {
      const res = await callAI("metrics", {
        prompt: `You are an Executive Promotion Assessment AI. Evaluate this employee's readiness for promotion.

EMPLOYEE PROFILE:
- Name: ${member.full_name || "N/A"}
- Current Role: ${member.current_role || "N/A"}
- Target Role: ${member.target_role || "N/A"}
- Target Company: ${member.target_company || "N/A"}
- Industry: ${member.industry || "N/A"}
- Years of Experience: ${member.years_experience || "N/A"}

PERFORMANCE DATA:
- Challenges Completed: ${member.challengeCount}
- Average Challenge Score: ${member.avgScore}/100
- Lessons Completed: ${member.completedLessons}
- Current Promotion Readiness: ${member.promotion_readiness || 0}%
- XP Points: ${member.xp_points || 0}
- Leadership Maturity: ${member.leadership_maturity || 0}/100
- Commercial Maturity: ${member.commercial_maturity || 0}/100
- Communication Growth: ${member.communication_growth || 0}/100
- Executive Presence: ${member.executive_presence || 0}/100
- Confidence: ${member.confidence || 0}/100
- Interview Readiness: ${member.interview_readiness || 0}/100

SKILLS: ${member.skills?.join(", ") || "N/A"}
STRONG AREAS: ${member.strong_areas?.join(", ") || "N/A"}
WEAK AREAS: ${member.weak_areas?.join(", ") || "N/A"}

Provide a comprehensive promotion readiness assessment. Be honest and specific.`,
        response_json_schema: {
          type: "object",
          properties: {
            readiness_score: { type: "number" },
            recommendation: { type: "string" },
            timeline: { type: "string" },
            strengths: { type: "string" },
            development_areas: { type: "string" },
            development_plan: { type: "string" },
          },
        },
      });
      setAssessment(res);

      if (member.promotion_readiness !== res.readiness_score) {
        await base44.entities.UserProfile.update(member.id, { promotion_readiness: res.readiness_score });
      }
    } catch (e) {}
    setAssessing(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <TrendingUp size={12} className="text-emerald-400" />
          Promotion Readiness
        </div>
        <h1 className="text-2xl font-bold text-white">Talent Assessment</h1>
        <p className="text-white/40 text-sm mt-1">AI-powered promotion readiness assessment for your team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Member List */}
        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Team Members</h2>
          <div className="space-y-2">
            {memberStats.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-xl">
                <p className="text-white/30 text-sm">No team members found.</p>
              </div>
            ) : (
              memberStats.map((m) => (
                <button key={m.id} onClick={() => { setSelected(m); setAssessment(null); }}
                  className={`w-full flex items-center gap-3 bg-white/[0.02] border rounded-xl px-4 py-3 transition-all text-left ${selected?.id === m.id ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/5 hover:border-white/10"}`}>
                  <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-sm font-bold text-indigo-400">{(m.full_name || "U").charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/80 text-sm font-medium">{m.full_name || "Unknown"}</div>
                    <div className="text-white/30 text-xs truncate">{m.target_role || m.current_role || "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${(m.promotion_readiness || 0) >= 70 ? "text-emerald-400" : (m.promotion_readiness || 0) >= 50 ? "text-amber-400" : "text-red-400"}`}>{m.promotion_readiness || 0}%</div>
                    <div className="text-white/20 text-xs">{m.challengeCount} challenges</div>
                  </div>
                  <ChevronRight size={14} className="text-white/20" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Assessment Panel */}
        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Assessment</h2>
          {!selected ? (
            <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-xl">
              <TrendingUp size={32} className="mx-auto text-white/10 mb-3" />
              <p className="text-white/30 text-sm">Select a team member to assess their promotion readiness.</p>
            </div>
          ) : assessing ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/5 rounded-xl">
              <Loader2 size={28} className="animate-spin text-indigo-400 mb-3" />
              <p className="text-white/40 text-sm">Assessing {selected.full_name}...</p>
            </div>
          ) : assessment ? (
            <PromotionAssessment assessment={assessment} />
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-lg font-bold text-indigo-400">{(selected.full_name || "U").charAt(0)}</div>
                <div>
                  <div className="text-white font-semibold">{selected.full_name}</div>
                  <div className="text-white/30 text-xs">{selected.target_role || selected.current_role}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-bold">{selected.avgScore}</div>
                  <div className="text-white/30 text-xs">Avg Challenge Score</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-bold">{selected.completedLessons}</div>
                  <div className="text-white/30 text-xs">Lessons Completed</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-bold">{selected.challengeCount}</div>
                  <div className="text-white/30 text-xs">Challenges</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-bold">{selected.xp_points || 0}</div>
                  <div className="text-white/30 text-xs">XP Points</div>
                </div>
              </div>
              <button onClick={() => runAssessment(selected)}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Sparkles size={16} /> Run AI Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}