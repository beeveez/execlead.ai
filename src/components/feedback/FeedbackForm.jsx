import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { toast } from "@/components/ui/use-toast";
import {
  FEEDBACK_TYPES, SEVERITY_LEVELS, FEEDBACK_CATEGORIES,
  ENTERPRISE_PRIORITY_LEVELS, generateFeedbackId,
} from "@/lib/feedbackConfig";
import { captureDiagnostics } from "@/lib/feedbackDiagnostics";
import { runAIAssist } from "@/lib/feedbackAI";
import {
  Upload, X, ChevronDown, ChevronUp, Sparkles, Loader2, CheckCircle2,
  Camera, AlertTriangle, Copy, Eye, FileText, ThumbsUp,
} from "lucide-react";

export default function FeedbackForm({ onSubmitted }) {
  const { user } = useAuth();
  const { profile, subscription } = useSubscription();
  const [type, setType] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [category, setCategory] = useState("UI");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");
  const [steps, setSteps] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isEnterprisePriority, setIsEnterprisePriority] = useState(false);
  const [enterprisePriorityLevel, setEnterprisePriorityLevel] = useState("priority_1");
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const fileInputRef = useRef(null);

  const isEnterprise = !!(profile?.organization_id);
  const diagnostics = captureDiagnostics(user, profile, subscription);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Missing Information", description: "Please provide a title and description.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    try {
      setSubmitStep("Capturing diagnostics...");
      const diag = captureDiagnostics(user, profile, subscription);

      setSubmitStep("Analyzing with AI...");
      let ai = null;
      try {
        const recent = await base44.entities.Feedback.list("-created_date", 50);
        ai = await runAIAssist({ type, title, description, category, severity }, recent);
      } catch (e) { /* AI optional */ }

      setSubmitStep("Uploading attachments...");
      const attachmentUrls = [];
      for (const file of attachments) {
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          attachmentUrls.push({ name: file.name, url: file_url, type: file.type });
        } catch (e) { /* skip */ }
      }

      setSubmitStep("Creating feedback record...");
      const feedbackId = generateFeedbackId();
      const isSecurity = type === "security";
      const record = await base44.entities.Feedback.create({
        feedback_id: feedbackId,
        type,
        title: title.trim(),
        description: description.trim(),
        severity,
        category: (ai && FEEDBACK_CATEGORIES.includes(ai.suggested_category)) ? ai.suggested_category : category,
        expected_behavior: expectedBehavior,
        actual_behavior: actualBehavior,
        steps_to_reproduce: steps,
        browser: diag.browser,
        operating_system: diag.operating_system,
        device: diag.device,
        attachments_json: JSON.stringify(attachmentUrls),
        diagnostics_json: JSON.stringify(diag),
        votes: 0,
        voters_json: "[]",
        watchers_json: JSON.stringify([user?.id].filter(Boolean)),
        comments_json: "[]",
        is_enterprise_priority: isEnterprisePriority,
        enterprise_priority_level: isEnterprisePriority ? enterprisePriorityLevel : "priority_1",
        ai_category: ai?.suggested_category || null,
        ai_priority: ai?.suggested_priority || null,
        ai_summary: ai?.summary || null,
        ai_duplicate_of: ai?.duplicate_of || null,
        ai_responsible_module: ai?.responsible_module || null,
        is_public: !isSecurity,
      });

      try {
        await base44.entities.Notification.create({
          type: "feedback",
          title: `Feedback Submitted: ${feedbackId}`,
          message: `Your ${type} report "${title.trim()}" has been received. Track its progress in My Feedback.`,
          action_url: "/feedback",
          icon: "💬",
        });
      } catch (e) { /* optional */ }

      setSubmitted({ ...record, ai });
      setSubmitting(false);
      toast({ title: "Feedback Submitted", description: `Report ${feedbackId} received. The team has been notified.` });
    } catch (e) {
      setSubmitting(false);
      toast({ title: "Submission Failed", description: e.message || "Could not submit feedback.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setType("bug"); setTitle(""); setDescription(""); setSeverity("medium"); setCategory("UI");
    setExpectedBehavior(""); setActualBehavior(""); setSteps("");
    setIsEnterprisePriority(false); setEnterprisePriorityLevel("priority_1");
    setAttachments([]); setSubmitted(null);
  };

  // ---- Success View ----
  if (submitted) {
    const ai = submitted.ai;
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Feedback Received</h2>
          <p className="text-white/40 text-sm mt-1">Thank you! Your report has been submitted and the team has been notified.</p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <FileText size={14} className="text-indigo-400" />
            <code className="text-sm text-white/70 font-mono">{submitted.feedback_id}</code>
            <button onClick={() => { navigator.clipboard.writeText(submitted.feedback_id); toast({ title: "Copied" }); }} className="text-white/30 hover:text-white/60">
              <Copy size={12} />
            </button>
          </div>
        </div>

        {ai && (
          <div className="bg-indigo-500/[0.05] border border-indigo-500/15 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
            </div>
            <div className="space-y-2 text-sm">
              {ai.summary && (
                <div className="text-white/60"><span className="text-white/40 text-xs uppercase tracking-wide">Summary: </span>{ai.summary}</div>
              )}
              <div className="flex flex-wrap gap-3 text-xs">
                {ai.suggested_category && (
                  <div className="text-white/50">Category: <span className="text-indigo-400">{ai.suggested_category}</span></div>
                )}
                {ai.suggested_priority && (
                  <div className="text-white/50">Priority: <span className="text-amber-400">{ai.suggested_priority}</span></div>
                )}
                {ai.responsible_module && (
                  <div className="text-white/50">Module: <span className="text-white/70">{ai.responsible_module}</span></div>
                )}
              </div>
              {ai.duplicate_of && ai.duplicate_of !== "null" && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-2">
                  <AlertTriangle size={12} /> Possible duplicate of: "{ai.duplicate_of}"
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={resetForm} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">
            <Camera size={14} /> Submit Another
          </button>
          <button onClick={onSubmitted} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
            <ThumbsUp size={14} /> View My Feedback
          </button>
        </div>
      </div>
    );
  }

  // ---- Form ----
  const inputCls = "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors";

  return (
    <div className="space-y-5">
      {/* Type Selection */}
      <div>
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Feedback Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FEEDBACK_TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} type="button"
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${type === t.id ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
              <span className="text-xl">{t.icon}</span>
              <span className={`text-[10px] font-medium text-center ${type === t.id ? "text-indigo-400" : "text-white/40"}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief summary of your feedback" className={inputCls} maxLength={120} />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Description *</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your feedback in detail..." rows={4} className={inputCls} />
      </div>

      {/* Severity + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Severity</label>
          <div className="flex gap-1.5">
            {SEVERITY_LEVELS.map(s => (
              <button key={s.id} onClick={() => setSeverity(s.id)} type="button"
                className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium border transition-all ${severity === s.id ? "border-current" : "border-white/10 text-white/30"}`}
                style={severity === s.id ? { color: s.color, background: `${s.color}15`, borderColor: `${s.color}40` } : {}}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
            {FEEDBACK_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>)}
          </select>
        </div>
      </div>

      {/* Advanced Fields */}
      <button onClick={() => setShowAdvanced(!showAdvanced)} type="button"
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors">
        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Additional Details (optional)
      </button>
      {showAdvanced && (
        <div className="space-y-3 p-4 rounded-lg bg-white/[0.02] border border-white/5">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Expected Behavior</label>
            <input value={expectedBehavior} onChange={e => setExpectedBehavior(e.target.value)} placeholder="What should happen?" className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Actual Behavior</label>
            <input value={actualBehavior} onChange={e => setActualBehavior(e.target.value)} placeholder="What actually happens?" className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Steps to Reproduce</label>
            <textarea value={steps} onChange={e => setSteps(e.target.value)} placeholder="1. Go to...&#10;2. Click...&#10;3. See error..." rows={3} className={inputCls} />
          </div>
        </div>
      )}

      {/* Enterprise Priority */}
      {isEnterprise && (
        <div className="p-4 rounded-lg bg-amber-500/[0.05] border border-amber-500/15">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isEnterprisePriority} onChange={e => setIsEnterprisePriority(e.target.checked)} className="accent-amber-500" />
            <span className="text-sm text-amber-400 font-medium">Mark as Enterprise Priority</span>
          </label>
          {isEnterprisePriority && (
            <select value={enterprisePriorityLevel} onChange={e => setEnterprisePriorityLevel(e.target.value)} className={`${inputCls} mt-2`}>
              {ENTERPRISE_PRIORITY_LEVELS.map(p => <option key={p.id} value={p.id} className="bg-[#0d0d14]">{p.label}</option>)}
            </select>
          )}
        </div>
      )}

      {/* Attachments */}
      <div>
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Screenshots / Attachments</label>
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/5 border border-white/10 group">
              {file.type?.startsWith("image/") ? (
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><FileText size={20} className="text-white/30" /></div>
              )}
              <button onClick={() => removeAttachment(i)} type="button" className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
          <button onClick={() => fileInputRef.current?.click()} type="button"
            className="w-20 h-20 rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/30 hover:text-white/50 hover:border-white/20 transition-colors">
            <Upload size={18} />
            <span className="text-[9px] mt-1">Upload</span>
          </button>
        </div>
        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFiles} className="hidden" />
      </div>

      {/* Diagnostics Preview */}
      <button onClick={() => setShowDiagnostics(!showDiagnostics)} type="button"
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors">
        <Eye size={14} /> {showDiagnostics ? "Hide" : "Preview"} Auto-Diagnostics
      </button>
      {showDiagnostics && (
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 grid grid-cols-2 gap-2 text-[10px] text-white/40">
          <div>URL: <span className="text-white/60">{diagnostics.current_route}</span></div>
          <div>Browser: <span className="text-white/60">{diagnostics.browser}</span></div>
          <div>OS: <span className="text-white/60">{diagnostics.operating_system}</span></div>
          <div>Device: <span className="text-white/60">{diagnostics.device}</span></div>
          <div>Screen: <span className="text-white/60">{diagnostics.screen_resolution}</span></div>
          <div>Timezone: <span className="text-white/60">{diagnostics.timezone}</span></div>
          <div>Plan: <span className="text-white/60">{diagnostics.subscription_plan}</span></div>
          <div>Role: <span className="text-white/60">{diagnostics.user_role}</span></div>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSubmit} disabled={submitting} type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {submitting ? submitStep : "Submit Feedback"}
        </button>
        {submitting && <span className="text-xs text-white/30">AI will analyze and categorize your report...</span>}
      </div>
    </div>
  );
}