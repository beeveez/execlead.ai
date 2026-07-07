import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { getRecommendations } from "@/lib/executiveReputation";
import { toast } from "@/components/ui/use-toast";
import {
  Sparkles, Loader2, Wand2, Check, X, ArrowUpRight, Lightbulb, ChevronRight,
} from "lucide-react";

const SEVERITY_COLORS = {
  high: { bg: "bg-red-500/5", text: "text-red-400", border: "border-red-500/20" },
  medium: { bg: "bg-amber-500/5", text: "text-amber-400", border: "border-amber-500/20" },
  low: { bg: "bg-white/[0.02]", text: "text-white/40", border: "border-white/10" },
};

export default function AIExecutiveAdvisor({ profile, onRefresh }) {
  const [generating, setGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());

  const recs = getRecommendations(profile).filter((r) => !dismissed.has(r.id));

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      const p = profile;
      const skills = (p.skills || []).slice(0, 10).join(", ");
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a compelling executive summary (3-4 sentences, approximately 80 words) for ${p.full_name || "an executive"}.
Role: ${p.current_role || "Executive"}
Company: ${p.current_company || "N/A"}
Industry: ${p.industry || "Technology"}
Years of experience: ${p.years_experience || "15+"}
Skills: ${skills || "leadership, strategy, operations"}
Target role: ${p.target_role || "senior executive"}
Target company: ${p.target_company || "leading enterprise"}

Make it professional, confident, recruiter-ready, and highlight leadership impact. Write in third person. Do not use placeholders.`,
        response_json_schema: { type: "object", properties: { summary: { type: "string" } } },
      });
      setAiSummary(result?.summary || result);
    } catch (e) {
      toast({ title: "Generation Failed", description: "Could not generate summary.", variant: "destructive" });
    }
    setGenerating(false);
  };

  const handleAcceptSummary = async () => {
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { bio: aiSummary });
      setAiSummary(null);
      await onRefresh?.();
      toast({ title: "Summary Saved", description: "Your executive bio has been updated." });
    } catch (e) {
      toast({ title: "Save Failed", description: "Could not save summary.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDismiss = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">AI Executive Advisor</h3>
        </div>
        <span className="text-[10px] text-white/30">{recs.length} recommendations</span>
      </div>

      <div className="p-5 space-y-3">
        {/* AI Summary Generator */}
        {(!profile?.bio || profile.bio.trim().length < 50) && !aiSummary && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Wand2 size={16} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">Generate AI Executive Summary</div>
                <p className="text-xs text-white/40 mt-0.5">Let AI craft a recruiter-ready executive bio from your profile. ~2 minutes.</p>
                <button onClick={handleGenerateSummary} disabled={generating}
                  className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors disabled:opacity-40">
                  {generating ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                  {generating ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>
          </div>
        )}

        {generating && (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-indigo-400" />
            <span className="text-xs text-white/50">Crafting your executive summary...</span>
          </div>
        )}

        {aiSummary && (
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Check size={14} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">AI-Generated Executive Summary</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{aiSummary}</p>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={handleAcceptSummary} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors disabled:opacity-40">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Accept
              </button>
              <button onClick={() => setAiSummary(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-medium transition-colors">
                <X size={13} /> Dismiss
              </button>
              <button onClick={handleGenerateSummary} disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-medium transition-colors">
                <Wand2 size={13} /> Regenerate
              </button>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recs.length === 0 && !aiSummary ? (
          <div className="text-center py-8">
            <Lightbulb size={28} className="text-emerald-400/50 mx-auto mb-2" />
            <p className="text-sm text-white/50">Your executive profile is in excellent shape.</p>
          </div>
        ) : (
          recs.map((rec) => {
            const sev = SEVERITY_COLORS[rec.severity];
            return (
              <div key={rec.id} className={`p-3 rounded-xl ${sev.bg} border ${sev.border}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-white">{rec.title}</span>
                      <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${sev.bg} ${sev.text}`}>
                        <ArrowUpRight size={9} /> +{rec.impact} ERI
                      </span>
                    </div>
                    <p className="text-xs text-white/40">{rec.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-white/30">{rec.category}</span>
                      <ChevronRight size={10} className="text-white/20" />
                      <span className="text-[10px] text-indigo-400 font-medium">{rec.actionLabel}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDismiss(rec.id)} className="text-white/20 hover:text-white/40 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}