import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { COVER_LETTER_TYPES, buildCoverLetterPrompt } from "@/lib/careerStudio";
import { Mail, Sparkles, Loader2, Save, Trash2 } from "lucide-react";

export default function CoverLetters({ profile, resumeContent }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState(COVER_LETTER_TYPES[0]);
  const [role, setRole] = useState(profile?.target_role || "");
  const [company, setCompany] = useState(profile?.target_company || "");
  const [output, setOutput] = useState("");

  useEffect(() => { loadDocs(); }, []);
  useEffect(() => { if (profile) { setRole(profile.target_role || ""); setCompany(profile.target_company || ""); } }, [profile]);

  const loadDocs = async () => {
    try { const list = await base44.entities.CareerDocument.filter({ type: "cover_letter" }); setDocs(list); } catch (e) {}
    setLoading(false);
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await callAI("resume", { prompt: buildCoverLetterPrompt(type, role, company, resumeContent) });
      setOutput(res);
    } catch (e) {}
    setGenerating(false);
  };

  const save = async () => {
    if (!output.trim()) return;
    setSaving(true);
    try {
      await base44.entities.CareerDocument.create({ type: "cover_letter", title: `${type} - ${company}`, content: output, subtype: type });
      setOutput("");
      loadDocs();
    } catch (e) {}
    setSaving(false);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2"><Mail size={14} className="text-indigo-400" /> Cover Letter Generator</h3>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Role Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {COVER_LETTER_TYPES.map(t => (
                <button key={t} onClick={() => setType(t)} className={`px-3 py-2 rounded-lg text-xs transition-all ${type === t ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Target Role</label>
            <input value={role} onChange={e => setRole(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Target Company</label>
            <input value={company} onChange={e => setCompany(e.target.value)} className={inputClass} />
          </div>
          <button onClick={generate} disabled={generating} className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
            {generating ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14} /> Generate Cover Letter</>}
          </button>
        </div>

        {docs.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Saved Cover Letters</h3>
            <div className="space-y-2">
              {docs.map(d => (
                <div key={d.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                  <span className="text-sm text-white/60 truncate">{d.title}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setOutput(d.content)} className="text-xs text-indigo-400 hover:text-indigo-300">View</button>
                    <button onClick={async () => { await base44.entities.CareerDocument.delete(d.id); loadDocs(); }} className="text-white/30 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        {output ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Generated Letter</h3>
              <button onClick={save} disabled={saving} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
              </button>
            </div>
            <textarea value={output} onChange={e => setOutput(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" style={{ minHeight: "400px" }} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center py-20">
            <div>
              <Mail size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Generate a personalized cover letter based on your resume</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}