import React, { useState } from "react";
import { Brain, Loader2, Target, Plus, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function SkillGapAnalysis({ skills, targetRole, onAddSkill }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const skillNames = skills.map(s => s.skill_name);
      const prompt = `You are an executive career intelligence analyst. Analyze the skill gap for an executive targeting the role: "${targetRole || 'Executive'}".

Current skills (${skillNames.length}): ${skillNames.join(", ") || "None listed"}

Provide a comprehensive skill gap analysis. Return JSON with:
- current_match: number 0-100 (how well current skills match the target role)
- missing_skills: array of { name, category (technical/leadership/business/ai_digital), importance (high/medium/low), why_it_matters }
- recommended_skills: array of { name, category, reason } (skills to develop next)
- emerging_skills: array of { name, category, trend } (trending skills in this domain)
- executive_readiness_contribution: number 0-100 (how much improving skills would boost executive readiness)
- summary: string (2-3 sentence executive summary)`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            current_match: { type: "number" },
            missing_skills: { type: "array", items: { type: "object", properties: {
              name: { type: "string" }, category: { type: "string" },
              importance: { type: "string" }, why_it_matters: { type: "string" }
            }}},
            recommended_skills: { type: "array", items: { type: "object", properties: {
              name: { type: "string" }, category: { type: "string" }, reason: { type: "string" }
            }}},
            emerging_skills: { type: "array", items: { type: "object", properties: {
              name: { type: "string" }, category: { type: "string" }, trend: { type: "string" }
            }}},
            executive_readiness_contribution: { type: "number" },
            summary: { type: "string" },
          },
        },
      });

      setAnalysis(res);
    } catch (err) {
      setError(err.message || "Failed to analyze skills");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-indigo-400" />
          <div>
            <h3 className="text-white/80 text-sm font-semibold">Skill Gap Analysis</h3>
            <p className="text-white/30 text-xs">AI-powered gap analysis for {targetRole || "your target role"}</p>
          </div>
        </div>
        <Button onClick={runAnalysis} disabled={loading} size="sm" className="bg-indigo-600 hover:bg-indigo-500">
          {loading ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Analyzing...</> : <><Brain size={14} className="mr-1.5" /> Run Analysis</>}
        </Button>
      </div>

      {error && (
        <div className="px-5 py-3 bg-red-500/[0.04] flex items-center gap-2">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-red-400/80 text-xs">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="p-5 space-y-4">
          {/* Match Score */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 34 * analysis.current_match / 100} ${2 * Math.PI * 34}`} className="text-indigo-400" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">{analysis.current_match}%</span>
            </div>
            <div>
              <div className="text-white/80 text-sm font-semibold">Current Match</div>
              <p className="text-white/40 text-xs mt-0.5 max-w-md">{analysis.summary}</p>
            </div>
          </div>

          {/* Missing Skills */}
          {analysis.missing_skills?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2"><AlertCircle size={12} className="text-amber-400" /><span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Missing Skills</span></div>
              <div className="space-y-1.5">
                {analysis.missing_skills.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-amber-500/[0.04] border border-amber-500/10 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white/80 text-sm font-medium">{s.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${s.importance === "high" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>{s.importance}</span>
                      </div>
                      <p className="text-white/30 text-xs mt-0.5">{s.why_it_matters}</p>
                    </div>
                    <button onClick={() => onAddSkill({ skill_name: s.name, category: s.category, source: "ai_suggested" })} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-indigo-400 transition-colors shrink-0"><Plus size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Skills */}
          {analysis.recommended_skills?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2"><Sparkles size={12} className="text-indigo-400" /><span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Recommended Skills</span></div>
              <div className="flex flex-wrap gap-2">
                {analysis.recommended_skills.map((s, i) => (
                  <button key={i} onClick={() => onAddSkill({ skill_name: s.name, category: s.category, source: "ai_suggested" })} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 hover:bg-indigo-500/15 transition-colors">
                    <Plus size={12} /> {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Emerging Skills */}
          {analysis.emerging_skills?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2"><TrendingUp size={12} className="text-emerald-400" /><span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Emerging Skills</span></div>
              <div className="flex flex-wrap gap-2">
                {analysis.emerging_skills.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300">
                    {s.name} <span className="text-emerald-400/50 ml-1">{s.trend}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!analysis && !loading && !error && (
        <div className="px-5 py-8 text-center">
          <Target size={24} className="text-white/10 mx-auto mb-2" />
          <p className="text-white/40 text-sm">Run an AI-powered analysis to identify skill gaps for your target role.</p>
        </div>
      )}
    </div>
  );
}