import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Plus, TrendingUp, BrainCircuit, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import SkillVerificationBadge from "./SkillVerificationBadge";
import MarketIntelligenceBadge from "./MarketIntelligencePanel";
import { EXECUTIVE_DOMAINS } from "@/lib/skillsIntelligenceEngine";

const DOMAIN_LABELS = Object.fromEntries(EXECUTIVE_DOMAINS.map(d => [d.id, d.label]));

export default function SkillRecommendations({ skills, targetRole, onAddSkill }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const existingNames = skills.map(s => s.skill_name.toLowerCase());
      const prompt = `You are an executive skills intelligence analyst. Analyze this executive's current skills and recommend what they should develop next.

Target Role: ${targetRole}
Current Skills (${skills.length}): ${existingNames.join(", ") || "None"}

Provide recommendations in this exact JSON structure:
{
  "recommended_skills": [
    {
      "skill_name": "string",
      "capability_domain": "one of: technology, leadership, strategy, operations, governance, finance, communication, people_leadership, transformation, innovation, risk, customer_success",
      "reason": "WHY this skill matters for the target role — be specific about what executives in this role commonly demonstrate",
      "market_demand": "one of: high_demand, growing, emerging, stable, legacy",
      "estimated_readiness_increase": number (0-15, how much this skill could improve Executive Readiness™),
      "related_skills": ["array of skill names that connect to this in the Executive Skill Graph™"],
      "commonly_demonstrated": ["array of specific capabilities executives in this role show with this skill"]
    }
  ],
  "skill_gaps": ["array of skill names commonly expected for ${targetRole} but missing from the user's profile"],
  "market_insights": [
    {
      "skill_name": "string",
      "demand_level": "one of: high_demand, growing, emerging, stable, legacy",
      "insight": "brief explanation of market trend"
    }
  ]
}

Rules:
- Recommend 3-5 skills that would have the highest impact on executive readiness for ${targetRole}
- Each recommendation must include a specific, explainable reason
- Include market intelligence for each recommended skill
- Do NOT recommend skills the user already has
- Focus on skills that bridge the gap between current capabilities and target role expectations`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_skills: { type: "array", items: { type: "object", properties: {
              skill_name: { type: "string" },
              capability_domain: { type: "string" },
              reason: { type: "string" },
              market_demand: { type: "string" },
              estimated_readiness_increase: { type: "number" },
              related_skills: { type: "array", items: { type: "string" } },
              commonly_demonstrated: { type: "array", items: { type: "string" } },
            }}},
            skill_gaps: { type: "array", items: { type: "string" } },
            market_insights: { type: "array", items: { type: "object", properties: {
              skill_name: { type: "string" },
              demand_level: { type: "string" },
              insight: { type: "string" },
            }}},
          },
        },
      });

      setResults(res);
    } catch (err) {
      toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (rec) => {
    await onAddSkill({
      skill_name: rec.skill_name,
      capability_domain: rec.capability_domain,
      proficiency: "intermediate",
      source: "ai_suggested",
      verification_state: "ai_detected",
      market_demand: rec.market_demand,
      recommendation_reason: rec.reason,
      related_skills_json: JSON.stringify(rec.related_skills || []),
    });
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white/80 flex items-center gap-1.5">
            <BrainCircuit size={14} className="text-indigo-400" />
            AI Skill Recommendations™
          </h3>
          <p className="text-white/30 text-xs mt-0.5">Explainable recommendations for your target role: <span className="text-white/50">{targetRole}</span></p>
        </div>
        <Button onClick={handleAnalyze} disabled={loading} size="sm" variant="outline" className="border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10">
          {loading ? <><Loader2 size={12} className="mr-1 animate-spin" /> Analyzing...</> : <><Sparkles size={12} className="mr-1" /> Get Recommendations</>}
        </Button>
      </div>

      {results && (
        <div className="space-y-4">
          {/* Recommended Skills */}
          {results.recommended_skills?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Recommended Skills</div>
              <div className="space-y-2">
                {results.recommended_skills.map((rec, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:border-indigo-500/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-white/90">{rec.skill_name}</span>
                          <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{DOMAIN_LABELS[rec.capability_domain] || rec.capability_domain}</span>
                          <MarketIntelligenceBadge level={rec.market_demand} size="xs" />
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">{rec.reason}</p>
                        {rec.commonly_demonstrated?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {rec.commonly_demonstrated.map((cap, i) => (
                              <span key={i} className="text-[10px] text-white/40 bg-white/[0.02] border border-white/5 rounded px-1.5 py-0.5">{cap}</span>
                            ))}
                          </div>
                        )}
                        {rec.estimated_readiness_increase > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-400">
                            <TrendingUp size={10} /> +{rec.estimated_readiness_increase}% estimated Executive Readiness™ impact
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" className="text-indigo-400 hover:bg-indigo-500/10 shrink-0" onClick={() => handleAdd(rec)}>
                        <Plus size={12} className="mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gaps */}
          {results.skill_gaps?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Identified Gaps for {targetRole}</div>
              <div className="flex flex-wrap gap-1.5">
                {results.skill_gaps.map((gap, idx) => (
                  <span key={idx} className="text-[11px] text-amber-400 bg-amber-500/5 border border-amber-500/15 rounded-md px-2 py-1">{gap}</span>
                ))}
              </div>
            </div>
          )}

          {/* Market Insights */}
          {results.market_insights?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Market Intelligence™</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {results.market_insights.map((mi, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
                    <MarketIntelligenceBadge level={mi.demand_level} size="xs" />
                    <span className="text-xs text-white/60 font-medium">{mi.skill_name}</span>
                    <span className="text-[10px] text-white/30 truncate">{mi.insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div className="text-center py-6">
          <BrainCircuit size={24} className="text-white/10 mx-auto mb-2" />
          <p className="text-white/40 text-xs mb-1">No recommendations yet.</p>
          <p className="text-white/20 text-[10px]">Click "Get Recommendations" to receive AI-powered, explainable skill suggestions for your target role.</p>
        </div>
      )}
    </div>
  );
}