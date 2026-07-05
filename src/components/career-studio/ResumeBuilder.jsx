import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { RESUME_TEMPLATES, defaultResumeContent } from "@/lib/careerStudio";
import { Plus, Copy, Trash2, Save, Loader2, Layout, FileUp, ChevronDown } from "lucide-react";
import ResumeSectionEditor from "@/components/career-studio/ResumeSectionEditor";
import ResumePreview from "@/components/career-studio/ResumePreview";

export default function ResumeBuilder({ activeResume, onResumeChange }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(defaultResumeContent());
  const [template, setTemplate] = useState("executive_modern");
  const [title, setTitle] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showList, setShowList] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const list = await base44.entities.CareerResume.list("-updated_date", 50);
      setResumes(list);
      if (list.length > 0) onResumeChange(list[0]);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    if (activeResume) {
      try { setContent(JSON.parse(activeResume.content) || defaultResumeContent()); } catch { setContent(defaultResumeContent()); }
      setTemplate(activeResume.template || "executive_modern");
      setTitle(activeResume.title || "");
    }
  }, [activeResume?.id]);

  const createResume = async (importData = null) => {
    let initialContent = defaultResumeContent();
    if (importData) {
      initialContent = importData;
    } else {
      try {
        const rvs = await base44.entities.ResumeVersion.list("-created_date", 1);
        if (rvs.length > 0) {
          const ex = JSON.parse(rvs[0].extracted_data);
          initialContent.personal = {
            full_name: ex.personal_info?.full_name || "", email: ex.personal_info?.email || "",
            phone: ex.personal_info?.phone || "", location: ex.personal_info?.country || "",
            linkedin: ex.personal_info?.linkedin || "", portfolio: ex.personal_info?.portfolio || "",
          };
          initialContent.summary = ex.career_history?.[0]?.description || "";
          initialContent.experience = (ex.career_history || []).map(h => ({
            job_title: h.job_title || "", employer: h.employer || "", location: "", dates: `${h.start_date || ""} - ${h.end_date || (h.current ? "Present" : "")}`, current: h.current || false, bullets: h.key_achievements || [],
          }));
          initialContent.education = (ex.education || []).map(e => ({ degree: e.degree || "", institution: e.institution || "", year: e.year || "", honors: e.honors || "" }));
          initialContent.certifications = (ex.certifications || []).map(c => ({ name: typeof c === "string" ? c : c.name, issuer: typeof c === "string" ? "" : c.issuer, year: "", expiration: typeof c === "string" ? "" : c.expiration_date }));
        }
      } catch (e) {}
    }
    const newResume = await base44.entities.CareerResume.create({ title: "New Executive Resume", template: "executive_modern", content: JSON.stringify(initialContent) });
    setResumes(prev => [newResume, ...prev]);
    onResumeChange(newResume);
    setShowList(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const ex = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: { type: "object", properties: { full_name: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, summary: { type: "string" }, experience: { type: "array", items: { type: "object", properties: { job_title: { type: "string" }, employer: { type: "string" }, dates: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } } }, skills: { type: "array", items: { type: "string" } }, education: { type: "array", items: { type: "object", properties: { degree: { type: "string" }, institution: { type: "string" }, year: { type: "string" } } } }, certifications: { type: "array", items: { type: "string" } } } } });
      const imported = defaultResumeContent();
      if (ex.output) {
        const d = typeof ex.output === "string" ? JSON.parse(ex.output) : ex.output;
        imported.personal = { ...imported.personal, full_name: d.full_name || "", email: d.email || "", phone: d.phone || "" };
        imported.summary = d.summary || "";
        imported.experience = (d.experience || []).map(x => ({ ...x, bullets: x.bullets || [] }));
        imported.skills = [{ category: "Technical", items: d.skills || [] }];
        imported.education = (d.education || []).map(x => ({ ...x, honors: "" }));
        imported.certifications = (d.certifications || []).map(c => ({ name: c, issuer: "", year: "", expiration: "" }));
      }
      await createResume(imported);
    } catch (e) {}
    setUploading(false);
  };

  const duplicateResume = async (resume) => {
    const dup = await base44.entities.CareerResume.create({ title: resume.title + " (Copy)", template: resume.template, content: resume.content });
    setResumes(prev => [dup, ...prev]);
    onResumeChange(dup);
    setShowList(false);
  };

  const deleteResume = async (resume) => {
    await base44.entities.CareerResume.delete(resume.id);
    const remaining = resumes.filter(r => r.id !== resume.id);
    setResumes(remaining);
    if (activeResume?.id === resume.id) { onResumeChange(remaining[0] || null); }
  };

  const save = async () => {
    if (!activeResume) return;
    setSaving(true);
    try {
      const updated = await base44.entities.CareerResume.update(activeResume.id, { title, template, content: JSON.stringify(content) });
      onResumeChange(updated);
      setResumes(prev => prev.map(r => r.id === updated.id ? updated : r));
    } catch (e) {}
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  const currentTemplate = RESUME_TEMPLATES.find(t => t.id === template) || RESUME_TEMPLATES[0];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <button onClick={() => setShowList(!showList)} className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70 transition-colors">
            {title || "Select Resume"} <ChevronDown size={14} className="text-white/40" />
          </button>
          {showList && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowList(false)} />
              <div className="absolute left-0 top-full mt-2 w-72 bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl z-50 p-2">
                {resumes.map(r => (
                  <div key={r.id} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 ${activeResume?.id === r.id ? "bg-indigo-500/10" : ""}`} onClick={() => { onResumeChange(r); setShowList(false); }}>
                    <span className="text-sm text-white/70 truncate">{r.title}</span>
                    <div className="flex gap-1">
                      <button onClick={e => { e.stopPropagation(); duplicateResume(r); }} className="p-1 text-white/30 hover:text-white/60"><Copy size={12} /></button>
                      <button onClick={e => { e.stopPropagation(); deleteResume(r); }} className="p-1 text-white/30 hover:text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/5 mt-2 pt-2 space-y-1">
                  <button onClick={() => createResume()} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-indigo-400 hover:bg-indigo-500/10"><Plus size={14} /> New Resume</button>
                  <label className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-indigo-400 hover:bg-indigo-500/10 cursor-pointer">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />} Upload Resume
                    <input type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleUpload} />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Resume title" className="flex-1 min-w-[150px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />

        <button onClick={() => setShowTemplates(!showTemplates)} className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70 transition-colors">
          <Layout size={14} /> {currentTemplate.name}
        </button>

        <button onClick={save} disabled={saving || !activeResume} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-lg text-sm font-medium transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
        </button>
      </div>

      {/* Template Picker */}
      {showTemplates && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-3">
          {RESUME_TEMPLATES.map(tpl => (
            <button key={tpl.id} onClick={() => { setTemplate(tpl.id); setShowTemplates(false); }} className={`p-3 rounded-lg text-left transition-all ${template === tpl.id ? "bg-indigo-500/10 ring-1 ring-indigo-500/30" : "bg-white/5 hover:bg-white/10"}`}>
              <div className="w-full h-12 rounded mb-2 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${tpl.accent}30, ${tpl.accent}10)`, borderLeft: `3px solid ${tpl.accent}` }}>
                <div className="w-8 h-1 rounded-full" style={{ background: tpl.accent }} />
              </div>
              <div className="text-xs font-medium text-white/70">{tpl.name}</div>
              <div className="text-[10px] text-white/30">{tpl.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Editor + Preview */}
      {activeResume ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResumeSectionEditor content={content} setContent={setContent} />
          <div className="lg:sticky lg:top-4 lg:self-start">
            <ResumePreview content={content} template={template} />
          </div>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <p className="text-white/40 text-sm mb-4">No resume yet. Create one to get started.</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => createResume()} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium"><Plus size={14} /> Create from Scratch</button>
            <label className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-sm font-medium cursor-pointer">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />} Upload Existing
              <input type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}