import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import {
  ArrowLeft, Loader2, Save, Send, Sparkles, Upload, X, Wand2, Lightbulb,
  BookOpen, Target, ListChecks
} from "lucide-react";
import { LETTER_CATEGORIES, LEADERSHIP_LEVELS, INDUSTRIES, parseList, arrayToText } from "@/lib/legacyLibrary";

export default function LegacyLetterEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [enhancement, setEnhancement] = useState(null);
  const [showEnhancement, setShowEnhancement] = useState(false);
  const [uploading, setUploading] = useState(null);

  const [form, setForm] = useState({
    title: "", subtitle: "", category: LETTER_CATEGORIES[0], message: "",
    author_position: "", organization: "", industry: "", country: "",
    years_experience: 0, leadership_level: "",
    key_lessons_text: "", advice: "", closing_message: "",
    recommended_books_text: "", recommended_courses_text: "", recommended_habits_text: "",
    quotes_text: "", reflection_questions_text: "",
    photo_url: "", video_url: "", audio_url: "", presentation_url: "", pdf_url: "",
    tags_text: "",
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target?.value ?? e }));

  useEffect(() => {
    if (!id) return;
    base44.entities.LeadershipLetter.filter({ id })
      .then((letters) => {
        const l = letters[0];
        if (!l) { toast({ title: "Letter not found", variant: "destructive" }); navigate("/legacy-library"); return; }
        if (l.author_user_id !== user?.id) { toast({ title: "You can only edit your own letters", variant: "destructive" }); navigate("/legacy-library"); return; }
        setForm({
          title: l.title || "", subtitle: l.subtitle || "", category: l.category || LETTER_CATEGORIES[0],
          message: l.message || "", author_position: l.author_position || "", organization: l.organization || "",
          industry: l.industry || "", country: l.country || "", years_experience: l.years_experience || 0,
          leadership_level: l.leadership_level || "",
          key_lessons_text: arrayToText(l.key_lessons), advice: l.advice || "", closing_message: l.closing_message || "",
          recommended_books_text: arrayToText(l.recommended_books), recommended_courses_text: arrayToText(l.recommended_courses),
          recommended_habits_text: arrayToText(l.recommended_habits), quotes_text: arrayToText(l.quotes),
          reflection_questions_text: arrayToText(l.reflection_questions),
          photo_url: l.photo_url || "", video_url: l.video_url || "", audio_url: l.audio_url || "",
          presentation_url: l.presentation_url || "", pdf_url: l.pdf_url || "",
          tags_text: arrayToText(l.tags),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  const buildPayload = () => ({
    title: form.title, subtitle: form.subtitle, category: form.category, message: form.message,
    author_position: form.author_position, organization: form.organization, industry: form.industry,
    country: form.country, years_experience: Number(form.years_experience) || 0, leadership_level: form.leadership_level,
    key_lessons: parseList(form.key_lessons_text), advice: form.advice, closing_message: form.closing_message,
    recommended_books: parseList(form.recommended_books_text), recommended_courses: parseList(form.recommended_courses_text),
    recommended_habits: parseList(form.recommended_habits_text), quotes: parseList(form.quotes_text),
    reflection_questions: parseList(form.reflection_questions_text),
    photo_url: form.photo_url, video_url: form.video_url, audio_url: form.audio_url,
    presentation_url: form.presentation_url, pdf_url: form.pdf_url,
    tags: parseList(form.tags_text),
  });

  const handleSave = async (submit) => {
    if (!form.title.trim() || !form.message.trim()) {
      toast({ title: "Title and message are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      let res;
      let letterId = id;
      if (id) {
        res = await base44.functions.invoke("manageLegacyLibrary", { action: "update", letter_id: id, fields: payload });
      } else {
        res = await base44.functions.invoke("manageLegacyLibrary", { action: "create", ...payload });
      }
      const d = res.data || res;
      if (d.success) {
        letterId = d.letter?.id || id;
        if (submit) {
          const subRes = await base44.functions.invoke("manageLegacyLibrary", { action: "submit_for_review", letter_id: letterId });
          const subD = subRes.data || subRes;
          if (subD.success) {
            toast({ title: "Submitted for review!" });
            navigate(`/legacy-library/${letterId}`);
          } else {
            toast({ title: subD.error || "Saved but failed to submit", variant: "destructive" });
          }
        } else {
          toast({ title: "Draft saved" });
          if (!id) navigate(`/legacy-library/${letterId}/edit`);
        }
      } else {
        toast({ title: d.error || "Failed to save", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "ai_enhance", title: form.title, message: form.message });
      const d = res.data || res;
      if (d.success) { setEnhancement(d.enhancement); setShowEnhancement(true); }
    } catch (e) { toast({ title: "AI enhance failed", variant: "destructive" }); }
    setEnhancing(false);
  };

  const handleInsights = async () => {
    if (!id) { toast({ title: "Save your letter first to generate insights", variant: "destructive" }); return; }
    setGeneratingInsights(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "ai_insights", letter_id: id });
      const d = res.data || res;
      if (d.success) toast({ title: "AI insights generated!" });
      else toast({ title: d.error || "Failed", variant: "destructive" });
    } catch (e) { toast({ title: "Failed to generate insights", variant: "destructive" }); }
    setGeneratingInsights(false);
  };

  const handleUpload = async (file, field) => {
    if (file.size > 25 * 1024 * 1024) { toast({ title: "File too large (max 25MB)", variant: "destructive" }); return; }
    setUploading(field);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      set(field)(result.file_url);
      toast({ title: "Upload complete" });
    } catch (e) { toast({ title: "Upload failed", variant: "destructive" }); }
    setUploading(null);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/legacy-library" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6">
        <ArrowLeft size={16} /> Back to Library
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">{id ? "Edit Letter" : "Write a Leadership Letter"}</h1>
        <p className="text-white/40 text-sm">Share your executive wisdom with future generations of leaders.</p>
      </div>

      {/* AI Tools */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={handleEnhance} disabled={enhancing || !form.message} className="flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
          {enhancing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} AI Enhance
        </button>
        {id && (
          <button onClick={handleInsights} disabled={generatingInsights} className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
            {generatingInsights ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate AI Insights
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Core Fields */}
        <Section icon={BookOpen} title="Letter Details">
          <div className="space-y-3">
            <Field label="Title" required>
              <input value={form.title} onChange={set("title")} placeholder="e.g. The Leadership Lesson I Learned Too Late" className={inputCls} />
            </Field>
            <Field label="Subtitle">
              <input value={form.subtitle} onChange={set("subtitle")} placeholder="A brief tagline for your letter" className={inputCls} />
            </Field>
            <Field label="Category" required>
              <select value={form.category} onChange={set("category")} className={inputCls}>
                {LETTER_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>)}
              </select>
            </Field>
            <Field label="Message" required>
              <textarea value={form.message} onChange={set("message")} rows={10} placeholder="Write your letter here… Share your story, lessons, and wisdom for future leaders." className={`${inputCls} resize-y`} />
            </Field>
          </div>
        </Section>

        {/* Author Info */}
        <Section icon={Target} title="Author Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Current Position"><input value={form.author_position} onChange={set("author_position")} placeholder="e.g. Chief Technology Officer" className={inputCls} /></Field>
            <Field label="Organization"><input value={form.organization} onChange={set("organization")} placeholder="e.g. Acme Corp" className={inputCls} /></Field>
            <Field label="Industry">
              <select value={form.industry} onChange={set("industry")} className={inputCls}>
                <option value="" className="bg-[#0d0d14]">Select…</option>
                {INDUSTRIES.map((i) => <option key={i} value={i} className="bg-[#0d0d14]">{i}</option>)}
              </select>
            </Field>
            <Field label="Country"><input value={form.country} onChange={set("country")} placeholder="e.g. United States" className={inputCls} /></Field>
            <Field label="Years of Experience"><input type="number" value={form.years_experience} onChange={set("years_experience")} min="0" className={inputCls} /></Field>
            <Field label="Leadership Level">
              <select value={form.leadership_level} onChange={set("leadership_level")} className={inputCls}>
                <option value="" className="bg-[#0d0d14]">Select…</option>
                {LEADERSHIP_LEVELS.map((l) => <option key={l} value={l} className="bg-[#0d0d14]">{l}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* Lessons & Advice */}
        <Section icon={ListChecks} title="Lessons & Advice">
          <div className="space-y-3">
            <Field label="Key Lessons (one per line)"><textarea value={form.key_lessons_text} onChange={set("key_lessons_text")} rows={4} placeholder="Lead with empathy&#10;Hire people smarter than you&#10;..." className={`${inputCls} resize-y`} /></Field>
            <Field label="Advice"><textarea value={form.advice} onChange={set("advice")} rows={3} placeholder="What advice would you give to future leaders?" className={`${inputCls} resize-y`} /></Field>
            <Field label="Closing Message"><textarea value={form.closing_message} onChange={set("closing_message")} rows={2} placeholder="A final message to your readers…" className={`${inputCls} resize-y`} /></Field>
          </div>
        </Section>

        {/* Reflections */}
        <Section icon={Lightbulb} title="Quotes & Reflections">
          <div className="space-y-3">
            <Field label="Memorable Quotes (one per line)"><textarea value={form.quotes_text} onChange={set("quotes_text")} rows={3} placeholder="Leadership is not about authority…" className={`${inputCls} resize-y`} /></Field>
            <Field label="Reflection Questions (one per line)"><textarea value={form.reflection_questions_text} onChange={set("reflection_questions_text")} rows={3} placeholder="What would you do differently?&#10;How do you handle failure?" className={`${inputCls} resize-y`} /></Field>
          </div>
        </Section>

        {/* Recommendations */}
        <Section icon={BookOpen} title="Recommendations">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Books (one per line)"><textarea value={form.recommended_books_text} onChange={set("recommended_books_text")} rows={4} placeholder="Good to Great&#10;The Lean Startup" className={`${inputCls} resize-y`} /></Field>
            <Field label="Courses (one per line)"><textarea value={form.recommended_courses_text} onChange={set("recommended_courses_text")} rows={4} placeholder="Executive Leadership&#10;Strategic Thinking" className={`${inputCls} resize-y`} /></Field>
            <Field label="Habits (one per line)"><textarea value={form.recommended_habits_text} onChange={set("recommended_habits_text")} rows={4} placeholder="Daily journaling&#10;Active listening" className={`${inputCls} resize-y`} /></Field>
          </div>
        </Section>

        {/* Media */}
        <Section icon={Upload} title="Media Attachments (Optional)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MediaField label="Photo" field="photo_url" accept="image/*" form={form} set={set} uploading={uploading} onUpload={handleUpload} />
            <MediaField label="Video" field="video_url" accept="video/*" form={form} set={set} uploading={uploading} onUpload={handleUpload} />
            <MediaField label="Audio" field="audio_url" accept="audio/*" form={form} set={set} uploading={uploading} onUpload={handleUpload} />
            <MediaField label="PDF Document" field="pdf_url" accept=".pdf" form={form} set={set} uploading={uploading} onUpload={handleUpload} />
          </div>
        </Section>

        {/* Tags */}
        <Section icon={Target} title="Tags">
          <Field label="Tags (one per line)"><textarea value={form.tags_text} onChange={set("tags_text")} rows={2} placeholder="leadership&#10;career-growth&#10;mentorship" className={`${inputCls} resize-y`} /></Field>
        </Section>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/5">
          <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit for Review
          </button>
        </div>
        <p className="text-white/30 text-xs">Submitted letters are reviewed by a Platform Admin before public publication.</p>
      </div>

      {/* AI Enhancement Panel */}
      <AnimatePresence>
        {showEnhancement && enhancement && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowEnhancement(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0d0d14] border border-indigo-500/20 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-4">
                <Wand2 size={18} className="text-indigo-400" />
                <h3 className="font-semibold">AI Enhancement Suggestions</h3>
                <button onClick={() => setShowEnhancement(false)} className="ml-auto text-white/30 hover:text-white/60"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-indigo-400 text-xs font-medium mb-1">Tone Analysis</div>
                  <p className="text-white/60 text-sm">{enhancement.tone_note}</p>
                </div>
                <div>
                  <div className="text-indigo-400 text-xs font-medium mb-1">Headline Suggestions</div>
                  <ul className="space-y-1">{enhancement.headline_suggestions?.map((h, i) => <li key={i} className="text-white/60 text-sm">• {h}</li>)}</ul>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-indigo-400 text-xs font-medium">Improved Message</div>
                    <button onClick={() => { set("message")(enhancement.improved_message); setShowEnhancement(false); toast({ title: "Applied improved message" }); }} className="text-xs text-indigo-400 hover:underline">Apply</button>
                  </div>
                  <textarea readOnly value={enhancement.improved_message} rows={8} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white/70 text-sm resize-y" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors";

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className="text-indigo-400" />
        <h2 className="text-white/70 text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-white/50 text-xs font-medium mb-1.5">{label} {required && <span className="text-red-400">*</span>}</label>
      {children}
    </div>
  );
}

function MediaField({ label, field, accept, form, set, uploading, onUpload }) {
  const url = form[field];
  const isUploading = uploading === field;
  return (
    <Field label={label}>
      {url ? (
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2">
          <span className="text-indigo-400 text-xs truncate flex-1">Uploaded</span>
          <button onClick={() => set(field)("")} className="text-white/30 hover:text-red-400"><X size={14} /></button>
        </div>
      ) : (
        <label className={`flex items-center gap-2 bg-white/5 border border-dashed border-white/10 rounded-lg px-3 py-2.5 cursor-pointer hover:border-indigo-500/30 transition-all ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
          {isUploading ? <Loader2 size={14} className="animate-spin text-indigo-400" /> : <Upload size={14} className="text-white/30" />}
          <span className="text-white/30 text-xs">{isUploading ? "Uploading…" : "Click to upload"}</span>
          <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files[0] && onUpload(e.target.files[0], field)} />
        </label>
      )}
    </Field>
  );
}