import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { COMPANIES, CAREER_PATHS, COUNTRIES } from "@/lib/constants";
import { EXTRACTION_SCHEMA, TRUTH_ENGINE_SCHEMA, buildExtractionPrompt, buildTruthEnginePrompt, buildRoadmapPrompt, getResumeHealthScore } from "@/lib/resume";
import { motion, AnimatePresence } from "framer-motion";
import { Target, ArrowRight, Check, Search, FileUp, Loader2, Sparkles, SkipForward, ShieldAlert, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Onboarding() {
  const [step, setStep] = useState("welcome");
  const [form, setForm] = useState({ full_name: "", country: "", target_company: "", target_role: "" });
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const [truthEngine, setTruthEngine] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const filteredCompanies = COMPANIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(pdf|docx?|PDF|DOCX?)$/)) {
      setUploadError("Please upload a PDF or DOCX file.");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(file_url);
      setFileName(file.name);
      setUploading(false);
      runAnalysis(file_url);
    } catch (e) {
      setUploading(false);
      setUploadError(e?.message || "Failed to upload your resume. Please try again.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const runAnalysis = async (url) => {
    setAnalyzing(true);
    setStep("analyzing");
    try {
      setAnalysisStep(0);
      const extracted = await callAI("resume", {
        prompt: buildExtractionPrompt(form.target_role, form.target_company),
        file_urls: [url],
        response_json_schema: EXTRACTION_SCHEMA,
      });
      setResumeData(extracted);

      setAnalysisStep(1);
      const [truth, road] = await Promise.all([
        callAI("resume", { prompt: buildTruthEnginePrompt(form.target_role), file_urls: [url], response_json_schema: TRUTH_ENGINE_SCHEMA }),
        callAI("resume", { prompt: buildRoadmapPrompt(extracted, form) }),
      ]);
      setTruthEngine(truth);
      setRoadmap(road);

      setAnalysisStep(2);
      setTimeout(() => setStep("results"), 500);
    } catch (e) { setAnalyzing(false); }
  };

  const skipResume = async () => {
    setSaving(true);
    try {
      const planRes = await callAI("resume", {
        prompt: `Create a concise 6-month executive growth plan for someone targeting ${form.target_role} at ${form.target_company}. Include phases, focus areas, and recommended starting point. Under 300 words.`,
      });
      await base44.entities.UserProfile.create({
        ...form,
        growth_plan: planRes,
        ai_personality: "executive_mentor",
        sessions_completed: 0, challenges_completed: 0, streak_days: 0, xp_points: 0,
        interview_readiness: 0, promotion_readiness: 0, leadership_maturity: 0,
        commercial_maturity: 0, communication_growth: 0, executive_presence: 0, confidence: 0,
        weak_areas: [], strong_areas: [],
        subscription_plan: "free", subscription_status: "active", subscription_cycle: "monthly",
      });
      window.location.href = "/dashboard";
    } catch (e) { setSaving(false); }
  };

  const finalize = async () => {
    setSaving(true);
    try {
      await base44.entities.ResumeVersion.create({
        file_url: fileUrl, file_name: fileName, version_number: 1,
        extracted_data: JSON.stringify(resumeData),
        learning_roadmap: roadmap,
        enhancement_report: JSON.stringify(truthEngine),
      });

      await base44.entities.UserProfile.create({
        ...form,
        resume_url: fileUrl,
        growth_plan: roadmap,
        ai_personality: "executive_mentor",
        sessions_completed: 0, challenges_completed: 0, streak_days: 0, xp_points: 50,
        interview_readiness: resumeData.executive_readiness_score || 0,
        promotion_readiness: resumeData.promotion_readiness || 0,
        leadership_maturity: resumeData.leadership_maturity || 0,
        commercial_maturity: resumeData.commercial_maturity || 0,
        communication_growth: resumeData.communication_assessment || 0,
        executive_presence: resumeData.executive_presence || 0,
        confidence: 0,
        weak_areas: (resumeData.skill_gaps || []).map(g => typeof g === "string" ? g : g.gap),
        strong_areas: (resumeData.technical_skills || []).slice(0, 5).map(s => typeof s === "string" ? s : s.skill),
        subscription_plan: "free", subscription_status: "active", subscription_cycle: "monthly",
      });

      await base44.entities.Notification.create({
        type: "achievement", title: "Resume Analyzed!",
        message: `Your executive profile is ready. Health Score: ${getResumeHealthScore(resumeData)}/100. Check your personalized roadmap!`,
        icon: "🎯", action_url: "/resume",
      });

      window.location.href = "/dashboard";
    } catch (e) { setSaving(false); }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";
  const labelClass = "text-white/40 text-xs uppercase tracking-wider mb-2 block";

  const scores = resumeData ? [
    { label: "Executive Readiness", value: resumeData.executive_readiness_score, color: "#6366f1" },
    { label: "Promotion Readiness", value: resumeData.promotion_readiness, color: "#10b981" },
    { label: "Leadership Maturity", value: resumeData.leadership_maturity, color: "#a855f7" },
    { label: "Commercial Maturity", value: resumeData.commercial_maturity, color: "#06b6d4" },
    { label: "Executive Presence", value: resumeData.executive_presence, color: "#f59e0b" },
    { label: "Communication", value: resumeData.communication_assessment, color: "#ec4899" },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1">
            <span className="text-indigo-400">EXEC</span><span className="text-white/80">LEAD</span><span className="text-indigo-400">.</span>
            <span className="text-[10px] text-white/30 ml-2 tracking-widest">AI</span>
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto">
                <Sparkles className="text-indigo-400" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Personalized Executive Leadership OS</h2>
                <p className="text-white/40 text-sm max-w-sm mx-auto">Upload your resume and let AI build a personalized development journey based on your actual career experience.</p>
              </div>
              <button onClick={() => setStep("target")} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                Get Started <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {step === "target" && (
            <motion.div key="target" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="text-center mb-4">
                <Target className="mx-auto mb-2 text-indigo-400" size={24} />
                <h2 className="text-lg font-semibold text-white">What's your target?</h2>
              </div>
              <div>
                <label className={labelClass}>Full Name</label>
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className={inputClass}>
                  <option value="" className="bg-[#0d0d14]">Select</option>
                  {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Target Company</label>
                <div className="relative mb-2">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                  {filteredCompanies.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, target_company: c }))} className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${form.target_company === c ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Target Role</label>
                <select value={form.target_role} onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))} className={inputClass}>
                  <option value="" className="bg-[#0d0d14]">Select role</option>
                  {CAREER_PATHS.map(r => <option key={r} value={r} className="bg-[#0d0d14]">{r}</option>)}
                </select>
              </div>
              <button disabled={!form.full_name || !form.target_company || !form.target_role} onClick={() => setStep("upload")} className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                Continue <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {step === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="text-center mb-4">
                <FileUp className="mx-auto mb-2 text-indigo-400" size={24} />
                <h2 className="text-lg font-semibold text-white">Upload your resume</h2>
                <p className="text-white/40 text-sm mt-1">Unlock personalized coaching, interviews, and recommendations</p>
              </div>
              <div onClick={() => !uploading && fileInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }} className="border-2 border-dashed border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 rounded-xl p-10 text-center cursor-pointer transition-all">
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={28} className="animate-spin text-indigo-400" />
                    <p className="text-white/60 text-sm">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <FileUp size={20} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Drop your resume here</p>
                      <p className="text-white/30 text-xs mt-1">PDF or DOCX</p>
                    </div>
                  </div>
                )}
              </div>
              {uploadError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                  <ShieldAlert size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-xs">{uploadError}</p>
                </div>
              )}
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-4">
                <p className="text-white/50 text-xs leading-relaxed">
                  <Zap size={12} className="inline text-indigo-400 mb-0.5" /> <strong className="text-white/70">What you unlock:</strong> Executive readiness scoring, skill gap analysis, personalized interview questions, adaptive coaching, tailored learning roadmap, and resume truth engine analysis.
                </p>
              </div>
              <button onClick={skipResume} disabled={saving} className="w-full flex items-center justify-center gap-2 text-white/30 hover:text-white/60 text-sm py-2 transition-colors">
                <SkipForward size={14} /> Skip for now {saving && <Loader2 size={14} className="animate-spin" />}
              </button>
            </motion.div>
          )}

          {step === "analyzing" && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <Loader2 size={32} className="animate-spin text-indigo-400 mx-auto mb-6" />
              <div className="space-y-4 max-w-sm mx-auto">
                {["Extracting resume data with AI...", "Running Truth Engine analysis...", "Generating personalized roadmap..."].map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm transition-all ${i <= analysisStep ? "text-white/70" : "text-white/20"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i < analysisStep ? "bg-emerald-500/20 text-emerald-400" : i === analysisStep ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5"}`}>
                      {i < analysisStep ? <Check size={12} /> : i + 1}
                    </div>
                    {s}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "results" && resumeData && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <Check className="text-emerald-400" size={24} />
                </div>
                <h2 className="text-lg font-semibold text-white">Your Executive Profile</h2>
                <p className="text-white/30 text-sm">Based on your resume analysis</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-500/10 to-white/[0.02] border border-indigo-500/10 rounded-xl p-5 text-center">
                <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Resume Health Score</p>
                <div className={`text-4xl font-bold ${(getResumeHealthScore(resumeData) || 0) >= 70 ? "text-emerald-400" : (getResumeHealthScore(resumeData) || 0) >= 40 ? "text-amber-400" : "text-red-400"}`}>{getResumeHealthScore(resumeData)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {scores.map(s => (
                  <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value || 0}</div>
                    <div className="text-white/30 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {resumeData.skill_gaps?.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert size={14} className="text-red-400" />
                    <h3 className="text-xs font-medium text-red-400 uppercase tracking-wider">Key Gaps for {form.target_role}</h3>
                  </div>
                  <ul className="space-y-1">
                    {resumeData.skill_gaps.slice(0, 4).map((g, i) => (
                      <li key={i} className="text-white/50 text-xs flex items-start gap-1.5"><span className="text-red-400">•</span> {typeof g === "string" ? g : g.gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {roadmap && (
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-3">Your Personalized Roadmap</h3>
                  <div className="text-white/60 text-xs leading-relaxed prose prose-invert prose-sm max-w-none max-h-48 overflow-y-auto">
                    <ReactMarkdown>{roadmap}</ReactMarkdown>
                  </div>
                </div>
              )}

              <button onClick={finalize} disabled={saving} className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Start My Journey</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}