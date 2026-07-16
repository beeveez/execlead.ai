import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { EXTRACTION_SCHEMA, TRUTH_ENGINE_SCHEMA, buildExtractionPrompt, buildRoadmapPrompt, buildTruthEnginePrompt } from "@/lib/resume";
import { saveResumeVersionSmart, setCurrentVersion, deduplicateVersions } from "@/lib/resumeVersioning";
import ResumeUpload from "@/components/resume/ResumeUpload";
import ExecutiveProfile from "@/components/resume/ExecutiveProfile";
import CareerTimeline from "@/components/resume/CareerTimeline";
import SkillGapAnalysis from "@/components/resume/SkillGapAnalysis";
import LearningRoadmap from "@/components/resume/LearningRoadmap";
import TruthEngineReport from "@/components/resume/TruthEngineReport";
import VersionCompare from "@/components/resume/VersionCompare";
import ResumePrivacy from "@/components/resume/ResumePrivacy";
import ResumeVersionTimeline from "@/components/resume/ResumeVersionTimeline";
import { FileText, Loader2, Target, Clock, ShieldAlert, Compass, GitCompare, GitBranch, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: "profile", label: "Executive Profile", icon: Target },
  { id: "timeline", label: "Career Timeline", icon: Clock },
  { id: "gaps", label: "Skill Gaps", icon: ShieldAlert },
  { id: "roadmap", label: "Learning Roadmap", icon: Compass },
  { id: "truth", label: "Truth Engine", icon: Shield },
  { id: "compare", label: "Version Compare", icon: GitCompare },
  { id: "privacy", label: "Privacy", icon: Shield },
];

const PROCESSING_STEPS = [
  "Extracting resume data with AI...",
  "Running Truth Engine analysis...",
  "Generating personalized roadmap...",
  "Saving results...",
];

export default function ResumeIntelligence() {
  const [profile, setProfile] = useState(null);
  const [versions, setVersions] = useState([]);
  const [current, setCurrent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [activeTab, setActiveTab] = useState("profile");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) setProfile(profiles[0]);
        const vs = await base44.entities.ResumeVersion.list("-created_date", 20);
        setVersions(vs);
        if (vs.length > 0) setCurrent(vs[0]);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  // Deduplicate versions — collapses consecutive versions with identical
  // content so only meaningful resume revisions are shown in the timeline.
  const dedupedVersions = useMemo(() => deduplicateVersions(versions), [versions]);

  const handleRestore = async (version) => {
    try {
      await setCurrentVersion(version.id);
      setCurrent(version);
      const vs = await base44.entities.ResumeVersion.list("-created_date", 20);
      setVersions(vs);
    } catch (e) {}
  };

  let parsedData = null;
  let truthData = null;
  if (current?.extracted_data) {
    try { parsedData = JSON.parse(current.extracted_data); } catch {}
  }
  if (current?.enhancement_report) {
    try { truthData = JSON.parse(current.enhancement_report); } catch { truthData = null; }
  }

  const handleUpload = async (file) => {
    setUploading(true);
    setError("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploading(false);
      setProcessing(true);

      const extracted = await callAI("resume", {
        prompt: buildExtractionPrompt(profile?.target_role, profile?.target_company),
        file_urls: [file_url],
        response_json_schema: EXTRACTION_SCHEMA,
      });

      setProcessStep(1);

      const [truth, road] = await Promise.all([
        callAI("resume", { prompt: buildTruthEnginePrompt(profile?.target_role), file_urls: [file_url], response_json_schema: TRUTH_ENGINE_SCHEMA }),
        callAI("resume", { prompt: buildRoadmapPrompt(extracted, profile) }),
      ]);

      setProcessStep(2);

      const result = await saveResumeVersionSmart({
        fileUrl: file_url,
        fileName: file.name,
        extractedData: extracted,
        createdBy: "user",
        creationReason: "upload",
        learningRoadmap: road,
        enhancementReport: JSON.stringify(truth),
      });
      const version = result?.version;

      setProcessStep(3);

      if (profile) await base44.entities.UserProfile.update(profile.id, { resume_url: file_url });

      const vs = await base44.entities.ResumeVersion.list("-created_date", 20);
      setVersions(vs);
      setCurrent(version);
      setProcessing(false);
      setProcessStep(0);
    } catch (e) {
      setError(e.message || "Failed to process resume. Please try a PDF file.");
      setProcessing(false);
      setUploading(false);
      setProcessStep(0);
    }
  };

  const handleDelete = async () => {
    const vs = await base44.entities.ResumeVersion.list("-created_date", 20);
    setVersions(vs);
    setCurrent(vs[0] || null);
    setActiveTab("profile");
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <FileText size={12} className="text-indigo-400" /> AI Resume Intelligence
        </div>
        <h1 className="text-2xl font-bold text-white">Resume Analysis & Executive Assessment</h1>
        <p className="text-white/40 text-sm mt-1">Your resume powers every module — coaching, interviews, and recommendations adapt to your actual experience</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>}

      <AnimatePresence mode="wait">
        {processing ? (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-12">
            <div className="flex flex-col items-center gap-6">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
              <div className="w-full max-w-sm space-y-3">
                {PROCESSING_STEPS.map((step, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm transition-all ${i <= processStep ? "text-white/70" : "text-white/20"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${i < processStep ? "bg-emerald-500/20 text-emerald-400" : i === processStep ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5"}`}>
                      {i < processStep ? "✓" : i + 1}
                    </div>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : !current ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResumeUpload onUpload={handleUpload} uploading={uploading} versions={versions} selectedId={current?.id} onSelect={setCurrent} />
          </motion.div>
        ) : (
          <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <FileText size={14} className="text-indigo-400" />
                {current.file_name}
              </div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                <GitBranch size={12} /> Upload New Version
                <input type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
              </label>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <div>
              {activeTab === "profile" && <ExecutiveProfile data={parsedData} />}
              {activeTab === "timeline" && <CareerTimeline data={parsedData} />}
              {activeTab === "gaps" && <SkillGapAnalysis data={parsedData} targetRole={profile?.target_role} />}
              {activeTab === "roadmap" && <LearningRoadmap roadmap={current.learning_roadmap} />}
              {activeTab === "truth" && <TruthEngineReport report={truthData || current.enhancement_report} />}
              {activeTab === "compare" && <VersionCompare versions={dedupedVersions} />}
              {activeTab === "privacy" && <ResumePrivacy resumeVersion={current} onDeleted={handleDelete} />}
            </div>

            {dedupedVersions.length > 0 && (
              <ResumeVersionTimeline
                versions={dedupedVersions}
                current={current}
                onSelect={setCurrent}
                onRestore={handleRestore}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}