import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { callAI } from "@/lib/ai";
import { getFlatSkills } from "@/lib/resume";

export default function Career() {
  const [profile, setProfile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) setProfile(profiles[0]);
      const resumes = await base44.entities.ResumeVersion.list("-created_date", 1);
      if (resumes.length > 0) {
        try { setResumeData(JSON.parse(resumes[0].extracted_data)); } catch (e) {}
      }
    };
    load();
  }, []);

  const generateAdvice = async () => {
    setLoading(true);
    try {
      const results = await base44.entities.ChallengeResult.list("-created_date", 10);
      const avgScores = results.length > 0 ? {
        executive: Math.round(results.reduce((a, r) => a + (r.executive_score || 0), 0) / results.length),
        leadership: Math.round(results.reduce((a, r) => a + (r.leadership_score || 0), 0) / results.length),
        commercial: Math.round(results.reduce((a, r) => a + (r.commercial_score || 0), 0) / results.length),
        communication: Math.round(results.reduce((a, r) => a + (r.communication_score || 0), 0) / results.length),
      } : null;

      const res = await callAI("career", {
        prompt: `You are a world-class executive career advisor. Create a personalized career development plan.

TARGET ROLE: ${profile?.target_role || "Senior Manager"}
TARGET COMPANY: ${profile?.target_company || "IT Services Company"}
${resumeData ? `
CANDIDATE'S ACTUAL EXPERIENCE:
- Current Role: ${resumeData.career_history?.[0]?.job_title || "N/A"} at ${resumeData.career_history?.[0]?.employer || "N/A"}
- Skills: ${getFlatSkills(resumeData).slice(0, 10).join(", ")}
- Certifications: ${(resumeData.certifications || []).map(c => typeof c === "string" ? c : c.name).join(", ") || "None"}
- Executive Readiness: ${resumeData.executive_readiness_score || 0}/100
- Skill Gaps: ${(resumeData.skill_gaps || []).map(g => typeof g === "string" ? g : g.gap).join(", ") || "None identified"}
Tailor ALL recommendations to their actual experience.` : ""}
${avgScores ? `RECENT PERFORMANCE SCORES (avg from last ${results.length} challenges):
- Executive: ${avgScores.executive}/100
- Leadership: ${avgScores.leadership}/100
- Commercial: ${avgScores.commercial}/100
- Communication: ${avgScores.communication}/100` : "No challenge data yet."}

Provide:

## 🎓 Recommended Certifications
3-5 specific certifications that would strengthen this profile. Include why each matters.

## 📚 Essential Reading
5 books every aspiring ${profile?.target_role || "executive"} should read. Brief reason for each.

## 🎯 Leadership Skills to Develop
Top 5 skills to focus on in the next 6 months.

## 🚀 Stretch Assignments
3 types of projects to volunteer for to build executive credibility.

## 💡 Executive Habits
5 daily/weekly habits of successful ${profile?.target_role || "executive"}s.

## 🌐 Networking Strategy
Specific networking actions for someone targeting ${profile?.target_company || "the IT industry"}.

## 💰 Salary Expectations
Realistic salary ranges and negotiation tips for ${profile?.target_role || "this level"}.

## ✅ Promotion Readiness Checklist
8-10 items to check off before pursuing the promotion.

Be specific to ${profile?.target_company || "the IT services industry"}. Practical, actionable, and honest.`,
        add_context_from_internet: true,
        model: "gemini_3_flash"
      });
      setAdvice(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) generateAdvice();
  }, [profile]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <BookOpen size={12} className="text-blue-400" />
            Career Advisor
          </div>
          <h1 className="text-2xl font-bold text-white">Your Executive Development Plan</h1>
          {profile && (
            <p className="text-white/40 text-sm mt-1">
              Personalized for <span className="text-blue-400">{profile.target_role}</span> at <span className="text-white/70">{profile.target_company}</span>
            </p>
          )}
        </div>
        {advice && (
          <button
            onClick={generateAdvice}
            disabled={loading}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white/60 transition-colors"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        )}
      </div>

      {loading && !advice ? (
        <div className="flex items-center justify-center py-20 gap-3 text-white/40">
          <Loader2 size={20} className="animate-spin" />
          Building your personalized career plan...
        </div>
      ) : advice ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
            <div className="text-white/80 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{advice}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}