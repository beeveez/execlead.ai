import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { LINKEDIN_SCHEMA, buildLinkedInPrompt } from "@/lib/careerStudio";
import { Linkedin, Sparkles, Loader2, Save, TrendingUp } from "lucide-react";

export default function LinkedInOptimizer({ profile, resumeContent }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [role, setRole] = useState(profile?.target_role || "");

  useEffect(() => { if (profile) setRole(profile.target_role || ""); }, [profile]);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await callAI("resume", { prompt: buildLinkedInPrompt(role, resumeContent), response_json_schema: LINKEDIN_SCHEMA });
      setData(res);
    } catch (e) {}
    setLoading(false);
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await base44.entities.CareerDocument.create({ type: "linkedin", title: `LinkedIn Profile - ${role}`, content: JSON.stringify(data), subtype: "optimization" });
      setSaving(false);
    } catch (e) {}
    setSaving(false);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";

  const sections = data ? [
    { label: "Headline", value: data.headline },
    { label: "About Section", value: data.about },
    { label: "Experience", value: data.experience },
    { label: "Featured Content", value: data.featured_content },
    { label: "Recommendations", value: data.recommendations },
    { label: "Banner Suggestion", value: data.banner_suggestion },
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="space-y-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2"><Linkedin size={14} className="text-blue-400" /> LinkedIn Optimizer</h3>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Target Role</label>
            <input value={role} onChange={e => setRole(e.target.value)} className={inputClass} />
          </div>
          <button onClick={generate} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-30 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14} /> Optimize Profile</>}
          </button>
          {data?.seo_score != null && (
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{data.seo_score}</div>
              <div className="text-white/30 text-xs">LinkedIn SEO Score</div>
            </div>
          )}
        </div>

        {data?.skills?.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Recommended Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400">{s}</span>)}
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-2 space-y-3">
        {data && (
          <button onClick={save} disabled={saving} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Optimization
          </button>
        )}
        {sections.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
            <Linkedin size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/30 text-sm">Generate optimized LinkedIn content from your resume</p>
          </div>
        ) : (
          sections.map(s => (
            <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <h3 className="text-sm font-medium text-blue-400 mb-2">{s.label}</h3>
              <textarea value={s.value || ""} readOnly className="w-full bg-transparent text-sm text-white/70 focus:outline-none resize-none" style={{ minHeight: "60px" }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}