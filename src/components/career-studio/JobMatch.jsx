import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { ATS_SCHEMA, JOB_MATCH_SCHEMA, buildATSPrompt, buildJobMatchPrompt } from "@/lib/careerStudio";
import { Sparkles, Loader2, Target, ShieldAlert, CheckCircle, TrendingUp } from "lucide-react";

export default function JobMatch({ profile, resumeContent }) {
  const [tab, setTab] = useState("ats");
  const [jobDescription, setJobDescription] = useState("");
  const [atsResult, setAtsResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runATS = async () => {
    setLoading(true);
    try {
      const res = await callAI("resume", { prompt: buildATSPrompt(resumeContent), response_json_schema: ATS_SCHEMA });
      setAtsResult(res);
    } catch (e) {}
    setLoading(false);
  };

  const runMatch = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    try {
      const res = await callAI("resume", { prompt: buildJobMatchPrompt(resumeContent, jobDescription), response_json_schema: JOB_MATCH_SCHEMA });
      setMatchResult(res);
    } catch (e) {}
    setLoading(false);
  };

  const scores = atsResult ? [
    { label: "ATS Score", value: atsResult.ats_score, color: "#6366f1" },
    { label: "Keyword Match", value: atsResult.keyword_match, color: "#10b981" },
    { label: "Formatting", value: atsResult.formatting_score, color: "#06b6d4" },
    { label: "Readability", value: atsResult.readability, color: "#f59e0b" },
    { label: "Executive Impact", value: atsResult.executive_impact, color: "#a855f7" },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        <button onClick={() => setTab("ats")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "ats" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>ATS Analyzer</button>
        <button onClick={() => setTab("match")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "match" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>Job Match</button>
      </div>

      {tab === "ats" && (
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2"><ShieldAlert size={14} className="text-indigo-400" /> ATS Analysis</h3>
              <p className="text-white/30 text-xs mt-1">Analyze your resume for Applicant Tracking System compatibility</p>
            </div>
            <button onClick={runATS} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-lg text-sm font-medium transition-colors">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Analyze
            </button>
          </div>

          {atsResult && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {scores.map(s => (
                  <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value || 0}</div>
                    <div className="text-white/30 text-xs mt-1">{s.label}</div>
                    <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.value || 0}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
              {atsResult.summary && <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4"><p className="text-white/60 text-sm">{atsResult.summary}</p></div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {atsResult.missing_skills?.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                    <h4 className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">Missing Skills</h4>
                    <div className="flex flex-wrap gap-1.5">{atsResult.missing_skills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-red-500/10 text-red-400">{s}</span>)}</div>
                  </div>
                )}
                {atsResult.keyword_recommendations?.length > 0 && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                    <h4 className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">Recommended Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">{atsResult.keyword_recommendations.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400">{s}</span>)}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "match" && (
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2 mb-3"><Target size={14} className="text-emerald-400" /> Paste Job Description</h3>
            <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job description here..." rows={6} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none" />
            <button onClick={runMatch} disabled={loading || !jobDescription.trim()} className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14} /> Compare Resume to Job</>}
            </button>
          </div>

          {matchResult && (
            <>
              <div className="bg-gradient-to-br from-emerald-500/10 to-white/[0.02] border border-emerald-500/10 rounded-xl p-6 text-center">
                <div className={`text-5xl font-bold mb-1 ${(matchResult.overall_match || 0) >= 70 ? "text-emerald-400" : (matchResult.overall_match || 0) >= 40 ? "text-amber-400" : "text-red-400"}`}>{matchResult.overall_match}%</div>
                <p className="text-white/30 text-sm">Overall Match Score</p>
              </div>
              {matchResult.summary && <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4"><p className="text-white/60 text-sm">{matchResult.summary}</p></div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                  <h4 className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1"><CheckCircle size={12} /> Strengths</h4>
                  <ul className="space-y-1">{matchResult.strengths?.map((s, i) => <li key={i} className="text-white/60 text-sm flex items-start gap-2"><span className="text-emerald-400">•</span> {s}</li>)}</ul>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                  <h4 className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1"><ShieldAlert size={12} /> Weaknesses</h4>
                  <ul className="space-y-1">{matchResult.weaknesses?.map((s, i) => <li key={i} className="text-white/60 text-sm flex items-start gap-2"><span className="text-red-400">•</span> {s}</li>)}</ul>
                </div>
                {matchResult.missing_skills?.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                    <h4 className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">Missing Skills</h4>
                    <div className="flex flex-wrap gap-1.5">{matchResult.missing_skills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400">{s}</span>)}</div>
                  </div>
                )}
                {matchResult.missing_keywords?.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">{matchResult.missing_keywords.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/50">{s}</span>)}</div>
                  </div>
                )}
              </div>
              {matchResult.recommended_improvements?.length > 0 && (
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
                  <h4 className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1"><TrendingUp size={12} /> Recommended Improvements</h4>
                  <ul className="space-y-1">{matchResult.recommended_improvements.map((s, i) => <li key={i} className="text-white/60 text-sm flex items-start gap-2"><span className="text-indigo-400">{i + 1}.</span> {s}</li>)}</ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}