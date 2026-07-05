import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { BIO_LENGTHS, BIO_TYPES, buildBioPrompt } from "@/lib/careerStudio";
import { User, Sparkles, Loader2, Save, Trash2 } from "lucide-react";

export default function ExecutiveBio({ profile, resumeContent }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [length, setLength] = useState(BIO_LENGTHS[1].id);
  const [type, setType] = useState(BIO_TYPES[3]);
  const [output, setOutput] = useState("");

  useEffect(() => { loadDocs(); }, []);

  const loadDocs = async () => {
    try { const list = await base44.entities.CareerDocument.filter({ type: "bio" }); setDocs(list); } catch (e) {}
  };

  const generate = async () => {
    setLoading(true);
    try {
      const words = BIO_LENGTHS.find(l => l.id === length)?.words || 100;
      const res = await callAI("resume", { prompt: buildBioPrompt(words, type, resumeContent) });
      setOutput(res);
    } catch (e) {}
    setLoading(false);
  };

  const save = async () => {
    if (!output.trim()) return;
    setSaving(true);
    try {
      await base44.entities.CareerDocument.create({ type: "bio", title: `${type} (${length})`, content: output, subtype: type });
      setOutput("");
      loadDocs();
    } catch (e) {}
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2"><User size={14} className="text-violet-400" /> Executive Bio Generator</h3>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Bio Length</label>
            <div className="grid grid-cols-3 gap-1.5">
              {BIO_LENGTHS.map(l => (
                <button key={l.id} onClick={() => setLength(l.id)} className={`px-3 py-2 rounded-lg text-xs transition-all ${length === l.id ? "bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>{l.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Bio Type</label>
            <div className="space-y-1.5">
              {BIO_TYPES.map(t => (
                <button key={t} onClick={() => setType(t)} className={`w-full px-3 py-2 rounded-lg text-xs text-left transition-all ${type === t ? "bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>{t}</button>
              ))}
            </div>
          </div>
          <button onClick={generate} disabled={loading} className="w-full bg-violet-500 hover:bg-violet-600 disabled:opacity-30 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14} /> Generate Bio</>}
          </button>
        </div>

        {docs.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Saved Bios</h3>
            <div className="space-y-2">
              {docs.map(d => (
                <div key={d.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                  <span className="text-sm text-white/60 truncate">{d.title}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setOutput(d.content)} className="text-xs text-violet-400 hover:text-violet-300">View</button>
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
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Generated Bio</h3>
              <button onClick={save} disabled={saving} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
              </button>
            </div>
            <textarea value={output} onChange={e => setOutput(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-violet-500/50 resize-none" style={{ minHeight: "350px" }} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center py-20">
            <div>
              <User size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Generate executive bios for conferences, boards, and company profiles</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}