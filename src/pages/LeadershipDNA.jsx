import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { Fingerprint, Loader2, RefreshCw, TrendingUp, Award, Target, Zap, Dna } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import CompetencyRadar from "@/components/leadership-dna/CompetencyRadar";
import LeadershipJourneyPath from "@/components/brand/LeadershipJourneyPath";

export default function LeadershipDNA() {
  const [profile, setProfile] = useState(null);
  const [dna, setDna] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [profiles, challenges, simulations, lessons, journals, dnaRecords] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.entities.ChallengeResult.list("-created_date", 50),
        base44.entities.SimulationSession.list("-created_date", 20),
        base44.entities.LessonProgress.list("-created_date", 100),
        base44.entities.JournalEntry.list("-entry_date", 50),
        base44.entities.LeadershipDNA.list("-created_date", 1),
      ]);

      const p = profiles[0];
      if (!p) {
        setLoading(false);
        return;
      }

      const avgScores = challenges.length > 0
        ? challenges.reduce(
            (acc, r) => ({
              strategic: (acc.strategic || 0) + (r.strategic_thinking_score || 0),
              decision: (acc.decision || 0) + (r.decision_quality_score || 0),
              exec_presence: (acc.exec_presence || 0) + (r.executive_presence_score || 0),
              communication: (acc.communication || 0) + (r.communication_score || 0),
            }),
            {}
          )
        : {};
      const n = challenges.length || 1;

      const compData = [
        { competency: "Leadership", score: p.leadership_maturity || 0 },
        { competency: "Commercial", score: p.commercial_maturity || 0 },
        { competency: "Communication", score: p.communication_growth || 0 },
        { competency: "Presence", score: p.executive_presence || 0 },
        { competency: "Strategic", score: Math.round((avgScores.strategic || 0) / n) || p.leadership_maturity || 0 },
        { competency: "Decision", score: Math.round((avgScores.decision || 0) / n) || 0 },
        { competency: "Confidence", score: p.confidence || 0 },
        { competency: "Interview", score: p.interview_readiness || 0 },
      ];

      setProfile(p);
      setCompetencies(compData);
      setStats({
        challenges: challenges.length,
        simulations: simulations.length,
        lessonsCompleted: lessons.filter((l) => l.completed).length,
        journalEntries: journals.length,
        xp: p.xp_points || 0,
        streak: p.streak_days || 0,
      });
      if (dnaRecords.length > 0) setDna(dnaRecords[0]);
    } catch (e) {}
    setLoading(false);
  };

  const generateProfile = async () => {
    if (!profile) return;
    setGenerating(true);
    try {
      const res = await callAI("metrics", {
        prompt: `You are an Executive Assessment AI. Generate a "Leadership DNA" profile for this executive.

EXECUTIVE PROFILE:
- Target: ${profile.target_role} at ${profile.target_company}
- Industry: ${profile.industry || "Technology"}
- Years of Experience: ${profile.years_experience || "N/A"}
- XP: ${profile.xp_points || 0}
- Streak: ${profile.streak_days || 0} days
- Challenges Completed: ${stats.challenges}
- Simulations: ${stats.simulations}
- Lessons Completed: ${stats.lessonsCompleted}
- Journal Entries: ${stats.journalEntries}

COMPETENCY SCORES:
${competencies.map((c) => `- ${c.competency}: ${c.score}/100`).join("\n")}

CURRENT SKILLS: ${profile.skills?.join(", ") || "N/A"}
STRONG AREAS: ${profile.strong_areas?.join(", ") || "N/A"}
WEAK AREAS: ${profile.weak_areas?.join(", ") || "N/A"}

Generate a comprehensive Leadership DNA profile. Identify their leadership archetype, strengths, growth areas, career trajectory, and actionable recommendations. This is a living profile that evolves with the executive's journey.`,
        response_json_schema: {
          type: "object",
          properties: {
            leadership_archetype: { type: "string" },
            executive_readiness_score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            growth_summary: { type: "string" },
            career_trajectory: { type: "string" },
            recommendations: { type: "string" },
          },
        },
      });

      const record = await base44.entities.LeadershipDNA.create({
        competency_scores_json: JSON.stringify(competencies),
        strengths_json: JSON.stringify(res.strengths || []),
        weaknesses_json: JSON.stringify(res.weaknesses || []),
        growth_summary: res.growth_summary || "",
        career_trajectory: res.career_trajectory || "",
        recommendations: res.recommendations || "",
        leadership_archetype: res.leadership_archetype || "",
        executive_readiness_score: res.executive_readiness_score || 0,
        data_sources_json: JSON.stringify({ ...stats, profile: { target_role: profile.target_role, target_company: profile.target_company } }),
      });
      setDna(record);
    } catch (e) {}
    setGenerating(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (!profile) {
    return <div className="text-center py-20 text-white/30 text-sm">Complete your profile to generate your Leadership DNA.</div>;
  }

  const strengths = dna ? safeParse(dna.strengths_json, []) : [];
  const weaknesses = dna ? safeParse(dna.weaknesses_json, []) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Fingerprint size={12} className="text-indigo-400" />
          Leadership DNA™
        </div>
        <h1 className="text-2xl font-bold text-white">Your Executive Journey</h1>
        <p className="text-white/40 text-sm mt-1">Leadership is a lifelong journey. See where you are and what's next.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "XP", value: stats.xp, icon: Zap, color: "text-yellow-400" },
          { label: "Streak", value: stats.streak, icon: TrendingUp, color: "text-orange-400" },
          { label: "Challenges", value: stats.challenges, icon: Target, color: "text-indigo-400" },
          { label: "Simulations", value: stats.simulations, icon: Award, color: "text-cyan-400" },
          { label: "Lessons", value: stats.lessonsCompleted, icon: Award, color: "text-emerald-400" },
          { label: "Journal", value: stats.journalEntries, icon: Award, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
            <s.icon size={14} className={`mx-auto mb-1 ${s.color}`} />
            <div className="text-lg font-bold text-white">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Executive Journey Path */}
      <LeadershipJourneyPath xp={profile.xp_points || 0} />

      {/* Radar Chart */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Competency Profile</h2>
        <CompetencyRadar data={competencies} />
      </div>

      {/* DNA Profile or Generate CTA */}
      {dna ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-white/30 uppercase tracking-wider">Leadership Archetype</div>
                <div className="text-xl font-bold text-white">{dna.leadership_archetype || "Analyzing..."}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/30 uppercase tracking-wider">Executive Readiness</div>
                <div className="text-3xl font-bold text-indigo-400">{dna.executive_readiness_score || 0}<span className="text-sm text-white/30">/100</span></div>
              </div>
            </div>

            {strengths.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1.5">Strengths</div>
                <div className="flex flex-wrap gap-1.5">
                  {strengths.map((s, i) => <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400">{s}</span>)}
                </div>
              </div>
            )}
            {weaknesses.length > 0 && (
              <div>
                <div className="text-xs text-amber-400/70 uppercase tracking-wider mb-1.5">Growth Areas</div>
                <div className="flex flex-wrap gap-1.5">
                  {weaknesses.map((w, i) => <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400">{w}</span>)}
                </div>
              </div>
            )}
          </div>

          {dna.growth_summary && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
              <h3 className="text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-2">Growth Summary</h3>
              <div className="text-white/60 text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{dna.growth_summary}</ReactMarkdown></div>
            </div>
          )}
          {dna.career_trajectory && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
              <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-2">Career Trajectory</h3>
              <div className="text-white/60 text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{dna.career_trajectory}</ReactMarkdown></div>
            </div>
          )}
          {dna.recommendations && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-2">Recommendations</h3>
              <div className="text-white/60 text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{dna.recommendations}</ReactMarkdown></div>
            </div>
          )}

          <button onClick={generateProfile} disabled={generating} className="w-full bg-white/5 hover:bg-white/10 text-white/60 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-30">
            {generating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Regenerate Profile
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-12 text-center">
          <Dna size={40} className="mx-auto text-white/10 mb-4" />
          <h2 className="text-white font-medium mb-2">Generate Your Leadership DNA</h2>
          <p className="text-white/30 text-sm mb-6 max-w-md mx-auto">Our AI will analyze your challenges, simulations, learning progress, and resume to create a living executive growth profile.</p>
          <button onClick={generateProfile} disabled={generating} className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium px-6 py-3 rounded-xl transition-colors">
            {generating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Dna size={16} /> Generate Leadership DNA</>}
          </button>
        </div>
      )}
    </div>
  );
}

function safeParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}