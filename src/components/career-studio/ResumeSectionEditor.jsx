import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { RESUME_SECTIONS, SECTION_FIELDS, buildExecutiveRewritePrompt } from "@/lib/careerStudio";
import { Plus, Trash2, Sparkles, Loader2, X, Star } from "lucide-react";
import AchievementWriter from "@/components/career-studio/AchievementWriter";

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";

export default function ResumeSectionEditor({ content, setContent }) {
  const [activeSection, setActiveSection] = useState("personal");
  const [aiLoading, setAiLoading] = useState(null);
  const [showAchievementWriter, setShowAchievementWriter] = useState(false);

  const update = (field, value) => setContent(prev => ({ ...prev, [field]: value }));

  const improveText = async (sectionId, text, field) => {
    if (!text?.trim()) return;
    setAiLoading(`${sectionId}.${field || "main"}`);
    try {
      const sectionLabel = RESUME_SECTIONS.find(s => s.id === sectionId)?.label || sectionId;
      const res = await callAI("resume", { prompt: buildExecutiveRewritePrompt(text, sectionLabel) });
      if (sectionId === "summary") {
        update("summary", res);
      }
    } catch (e) {}
    setAiLoading(null);
  };

  const improveBullet = async (sectionId, itemIdx, bulletIdx, text) => {
    if (!text?.trim()) return;
    setAiLoading(`${sectionId}.${itemIdx}.${bulletIdx}`);
    try {
      const res = await callAI("resume", { prompt: buildExecutiveRewritePrompt(text, "Experience Bullet Point") });
      setContent(prev => {
        const items = [...(prev[sectionId] || [])];
        const item = { ...items[itemIdx] };
        const bullets = [...(item.bullets || [])];
        bullets[bulletIdx] = res;
        item.bullets = bullets;
        items[itemIdx] = item;
        return { ...prev, [sectionId]: items };
      });
    } catch (e) {}
    setAiLoading(null);
  };

  const addItem = (sectionId) => {
    const fields = SECTION_FIELDS[sectionId];
    if (!fields) return;
    const newItem = {};
    fields.forEach(f => { newItem[f.name] = f.type === "bullets" || f.type === "tags" ? [] : f.type === "checkbox" ? false : ""; });
    newItem._id = Date.now() + Math.random();
    update(sectionId, [...(content[sectionId] || []), newItem]);
  };

  const updateItem = (sectionId, idx, field, value) => {
    setContent(prev => {
      const items = [...(prev[sectionId] || [])];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, [sectionId]: items };
    });
  };

  const removeItem = (sectionId, idx) => {
    setContent(prev => ({ ...prev, [sectionId]: (prev[sectionId] || []).filter((_, i) => i !== idx) }));
  };

  const addBullet = (sectionId, idx) => {
    setContent(prev => {
      const items = [...(prev[sectionId] || [])];
      items[idx] = { ...items[idx], bullets: [...(items[idx].bullets || []), ""] };
      return { ...prev, [sectionId]: items };
    });
  };

  const updateBullet = (sectionId, itemIdx, bulletIdx, value) => {
    setContent(prev => {
      const items = [...(prev[sectionId] || [])];
      const item = { ...items[itemIdx] };
      const bullets = [...(item.bullets || [])];
      bullets[bulletIdx] = value;
      item.bullets = bullets;
      items[itemIdx] = item;
      return { ...prev, [sectionId]: items };
    });
  };

  const removeBullet = (sectionId, itemIdx, bulletIdx) => {
    setContent(prev => {
      const items = [...(prev[sectionId] || [])];
      const item = { ...items[itemIdx] };
      item.bullets = (item.bullets || []).filter((_, i) => i !== bulletIdx);
      items[itemIdx] = item;
      return { ...prev, [sectionId]: items };
    });
  };

  const addTag = (sectionId, idx) => {
    setContent(prev => {
      const items = [...(prev[sectionId] || [])];
      items[idx] = { ...items[idx], items: [...(items[idx].items || []), ""] };
      return { ...prev, [sectionId]: items };
    });
  };

  const section = RESUME_SECTIONS.find(s => s.id === activeSection);
  const fields = SECTION_FIELDS[activeSection];

  return (
    <div className="space-y-3">
      {/* Section Nav */}
      <div className="flex flex-wrap gap-1">
        {RESUME_SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeSection === s.id ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
        {activeSection === "personal" && (
          <div className="space-y-3">
            {Object.keys(content.personal || {}).map(f => (
              <div key={f}>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">{f.replace(/_/g, " ")}</label>
                <input value={content.personal?.[f] || ""} onChange={e => update("personal", { ...content.personal, [f]: e.target.value })} className={inputClass} />
              </div>
            ))}
          </div>
        )}

        {activeSection === "summary" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/40 text-xs uppercase tracking-wider">Professional Summary</label>
              <button onClick={() => improveText("summary", content.summary)} disabled={aiLoading === "summary.main" || !content.summary?.trim()} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-30">
                {aiLoading === "summary.main" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Improve with AI
              </button>
            </div>
            <textarea value={content.summary || ""} onChange={e => update("summary", e.target.value)} rows={5} placeholder="Write your executive summary..." className={`${inputClass} resize-none`} />
          </div>
        )}

        {fields && activeSection !== "personal" && activeSection !== "summary" && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/60">{section.label}</h3>
              <div className="flex gap-2">
                {activeSection === "achievements" && (
                  <button onClick={() => setShowAchievementWriter(true)} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
                    <Star size={12} /> Achievement Writer
                  </button>
                )}
                <button onClick={() => addItem(activeSection)} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>
            {(content[activeSection] || []).length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">No entries yet. Click Add to get started.</p>
            ) : (
              (content[activeSection] || []).map((item, idx) => (
                <div key={item._id || idx} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
                  <div className="flex justify-end">
                    <button onClick={() => removeItem(activeSection, idx)} className="text-white/30 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                  {fields.map(f => {
                    if (f.type === "text") return (
                      <div key={f.name}>
                        <label className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5 block">{f.label}</label>
                        <input value={item[f.name] || ""} onChange={e => updateItem(activeSection, idx, f.name, e.target.value)} className={inputClass} />
                      </div>
                    );
                    if (f.type === "textarea") return (
                      <div key={f.name}>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-white/40 text-[10px] uppercase tracking-wider">{f.label}</label>
                          {activeSection === "achievements" && f.name === "bullet" && (
                            <button onClick={() => improveText(activeSection, item.bullet, f.name)} disabled={aiLoading === `${activeSection}.${idx}.main` || !item.bullet?.trim()} className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 disabled:opacity-30">
                              {aiLoading === `${activeSection}.${idx}.main` ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Improve
                            </button>
                          )}
                        </div>
                        <textarea value={item[f.name] || ""} onChange={e => updateItem(activeSection, idx, f.name, e.target.value)} rows={2} className={`${inputClass} resize-none`} />
                      </div>
                    );
                    if (f.type === "checkbox") return (
                      <label key={f.name} className="flex items-center gap-2 text-sm text-white/60">
                        <input type="checkbox" checked={item[f.name] || false} onChange={e => updateItem(activeSection, idx, f.name, e.target.checked)} className="rounded" />
                        {f.label}
                      </label>
                    );
                    if (f.type === "bullets") return (
                      <div key={f.name}>
                        <label className="text-white/40 text-[10px] uppercase tracking-wider mb-1 block">{f.label}</label>
                        <div className="space-y-1.5">
                          {(item.bullets || []).map((b, bIdx) => (
                            <div key={bIdx} className="flex gap-1">
                              <span className="text-indigo-400 mt-2 text-xs">•</span>
                              <textarea value={b} onChange={e => updateBullet(activeSection, idx, bIdx, e.target.value)} rows={1} className={`${inputClass} resize-none text-xs`} />
                              <button onClick={() => improveBullet(activeSection, idx, bIdx, b)} disabled={aiLoading === `${activeSection}.${idx}.${bIdx}`} className="text-indigo-400 hover:text-indigo-300 p-1.5 disabled:opacity-30">
                                {aiLoading === `${activeSection}.${idx}.${bIdx}` ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                              </button>
                              <button onClick={() => removeBullet(activeSection, idx, bIdx)} className="text-white/30 hover:text-red-400 p-1.5"><X size={10} /></button>
                            </div>
                          ))}
                          <button onClick={() => addBullet(activeSection, idx)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><Plus size={10} /> Add Bullet</button>
                        </div>
                      </div>
                    );
                    if (f.type === "tags") return (
                      <div key={f.name}>
                        <label className="text-white/40 text-[10px] uppercase tracking-wider mb-1 block">{f.label}</label>
                        <div className="flex flex-wrap gap-1.5">
                          {(item.items || []).map((tag, tIdx) => (
                            <div key={tIdx} className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 rounded-full">
                              <input value={tag} onChange={e => { const items = [...(item.items || [])]; items[tIdx] = e.target.value; updateItem(activeSection, idx, "items", items); }} className="bg-transparent text-xs text-indigo-400 outline-none w-20" />
                              <button onClick={() => { const items = (item.items || []).filter((_, i) => i !== tIdx); updateItem(activeSection, idx, "items", items); }} className="text-white/30 hover:text-red-400"><X size={10} /></button>
                            </div>
                          ))}
                          <button onClick={() => addTag(activeSection, idx)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><Plus size={10} /> Add</button>
                        </div>
                      </div>
                    );
                    return null;
                  })}
                </div>
              ))
            )}
          </>
        )}
      </div>

      {showAchievementWriter && (
        <AchievementWriter onClose={() => setShowAchievementWriter(false)} onAdd={(bullet) => {
          const newAch = { _id: Date.now(), title: "", bullet };
          update("achievements", [...(content.achievements || []), newAch]);
          setShowAchievementWriter(false);
        }} />
      )}
    </div>
  );
}