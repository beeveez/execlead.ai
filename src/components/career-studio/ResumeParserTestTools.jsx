import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SAMPLE_RESUMES, sampleToFile } from "@/lib/sampleResumes";
import {
  subscribe, clearDiagnostics, clearParserCache, recordEvent,
  recordUploadStart, recordUploadCompleted, recordParserStart,
  recordParserFinished, recordError,
} from "@/lib/resumeDiagnostics";
import { defaultResumeContent } from "@/lib/careerStudio";
import { Sparkles, FlaskConical, RotateCcw, FileSearch, Database, Trash2, ChevronDown, Activity, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const HEALTH_LABELS = {
  upload_component: "Upload Component",
  parser_engine: "Parser Engine",
  extraction_engine: "Extraction Engine",
  resume_intelligence: "Resume Intelligence",
};

const HEALTH_COLORS = {
  healthy: "text-emerald-400 bg-emerald-500/10",
  running: "text-indigo-400 bg-indigo-500/10",
  error: "text-red-400 bg-red-500/10",
  unknown: "text-white/40 bg-white/5",
};

const HEALTH_ICONS = {
  healthy: CheckCircle,
  running: Clock,
  error: XCircle,
  unknown: AlertCircle,
};

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    full_name: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    summary: { type: "string" },
    experience: { type: "array", items: { type: "object", properties: { job_title: { type: "string" }, employer: { type: "string" }, dates: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } } },
    skills: { type: "array", items: { type: "string" } },
    education: { type: "array", items: { type: "object", properties: { degree: { type: "string" }, institution: { type: "string" }, year: { type: "string" } } } },
    certifications: { type: "array", items: { type: "string" } },
  },
};

export default function ResumeParserTestTools({ onCreateResume, processFile }) {
  const [diagnostics, setDiagnostics] = useState(null);
  const [showSamples, setShowSamples] = useState(false);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    const unsub = subscribe(setDiagnostics);
    return unsub;
  }, []);

  const runWithSample = async (resume) => {
    setShowSamples(false);
    const file = sampleToFile(resume);
    recordEvent("file_selected", { filename: file.name, fileSize: file.size, fileType: file.type, source: "sample" });
    setBusy("sample");
    await processFile(file, { source: "sample_resume", sampleId: resume.id });
    setBusy(null);
    toast({ title: "Sample loaded", description: `${resume.label} parsed through the pipeline.` });
  };

  const generateMockResume = () => {
    const random = SAMPLE_RESUMES[Math.floor(Math.random() * SAMPLE_RESUMES.length)];
    runWithSample(random);
  };

  const replayLastUpload = async () => {
    if (!diagnostics?.lastUpload?.fileUrl) {
      toast({ title: "No previous upload", description: "Upload or load a sample resume first.", variant: "destructive" });
      return;
    }
    setBusy("replay");
    try {
      recordEvent("replay_started", { fileUrl: diagnostics.lastUpload.fileUrl });
      recordParserStart();
      const ex = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: diagnostics.lastUpload.fileUrl,
        json_schema: EXTRACTION_SCHEMA,
      });
      let extracted = null;
      if (ex.output) {
        extracted = typeof ex.output === "string" ? JSON.parse(ex.output) : ex.output;
      }
      recordParserFinished(extracted);
      toast({ title: "Replay complete", description: "Last upload re-parsed successfully." });
    } catch (err) {
      recordError(err?.message || "Replay failed");
      toast({ title: "Replay failed", description: err?.message, variant: "destructive" });
    }
    setBusy(null);
  };

  const testParserOnly = async () => {
    const sample = SAMPLE_RESUMES[0];
    const file = sampleToFile(sample);
    setBusy("parser");
    try {
      recordUploadStart({ filename: file.name, fileSize: file.size, fileType: file.type });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      recordUploadCompleted(file_url);
      recordParserStart();
      const ex = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: EXTRACTION_SCHEMA });
      let extracted = null;
      if (ex.output) extracted = typeof ex.output === "string" ? JSON.parse(ex.output) : ex.output;
      recordParserFinished(extracted);
      toast({ title: "Parser test passed", description: `Extracted ${extracted?.experience?.length || 0} experience entries, ${extracted?.skills?.length || 0} skills.` });
    } catch (err) {
      recordError(err?.message || "Parser test failed");
      toast({ title: "Parser test failed", description: err?.message, variant: "destructive" });
    }
    setBusy(null);
  };

  const testExtractionOnly = async () => {
    setBusy("extraction");
    try {
      recordEvent("extraction_test_started");
      const mockData = {
        full_name: "Test Candidate",
        email: "test@example.com",
        phone: "(555) 000-0000",
        summary: "Test extraction validation.",
        experience: [{ job_title: "Test Role", employer: "Test Corp", dates: "2020 - Present", bullets: ["Test achievement"] }],
        skills: ["Testing", "Validation", "Extraction"],
        education: [{ degree: "BS Test", institution: "Test University", year: "2020" }],
        certifications: ["Test Cert"],
      };
      const imported = defaultResumeContent();
      imported.personal = { ...imported.personal, full_name: mockData.full_name, email: mockData.email, phone: mockData.phone };
      imported.summary = mockData.summary;
      imported.experience = mockData.experience;
      imported.skills = [{ category: "Technical", items: mockData.skills }];
      imported.education = mockData.education;
      imported.certifications = mockData.certifications.map(c => ({ name: c, issuer: "", year: "", expiration: "" }));
      await onCreateResume(imported);
      recordEvent("extraction_test_passed", { entities: mockData.experience.length + mockData.education.length + mockData.certifications.length });
      toast({ title: "Extraction test passed", description: "Mock data mapped to resume structure successfully." });
    } catch (err) {
      recordError(err?.message || "Extraction test failed");
      toast({ title: "Extraction test failed", description: err?.message, variant: "destructive" });
    }
    setBusy(null);
  };

  const handleClearCache = () => {
    clearParserCache();
    toast({ title: "Parser cache cleared" });
  };

  const handleClearDiagnostics = () => {
    clearDiagnostics();
    toast({ title: "Diagnostics cleared" });
  };

  const events = diagnostics?.events || [];
  const recentEvents = [...events].slice(-12).reverse();
  const lastUpload = diagnostics?.lastUpload;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <FlaskConical size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Resume Parser Test Tools™</h3>
        <span className="text-[10px] text-indigo-400/60 bg-indigo-500/10 px-1.5 py-0.5 rounded">Developer Mode</span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <button
            onClick={() => setShowSamples(!showSamples)}
            disabled={busy === "sample"}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium disabled:opacity-30 transition-colors"
          >
            <Sparkles size={13} /> Load Sample Resume <ChevronDown size={12} />
          </button>
          {showSamples && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSamples(false)} />
              <div className="absolute left-0 top-full mt-1 w-56 bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl z-50 p-1.5 max-h-72 overflow-y-auto">
                {SAMPLE_RESUMES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => runWithSample(r)}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-white/70 hover:bg-white/5 hover:text-white/90 transition-colors"
                  >
                    <div className="font-medium">{r.label}</div>
                    <div className="text-[10px] text-white/30">{r.role}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button onClick={generateMockResume} disabled={!!busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-xs font-medium disabled:opacity-30 transition-colors">
          <Sparkles size={13} /> Generate Mock
        </button>

        <button onClick={replayLastUpload} disabled={!!busy || !lastUpload} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-xs font-medium disabled:opacity-30 transition-colors">
          <RotateCcw size={13} /> Replay Last
        </button>

        <button onClick={testParserOnly} disabled={!!busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-xs font-medium disabled:opacity-30 transition-colors">
          <FileSearch size={13} /> Test Parser
        </button>

        <button onClick={testExtractionOnly} disabled={!!busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-xs font-medium disabled:opacity-30 transition-colors">
          <Database size={13} /> Test Extraction
        </button>

        <button onClick={handleClearCache} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-xs font-medium transition-colors">
          <Trash2 size={13} /> Clear Cache
        </button>
      </div>

      {/* Health checks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(HEALTH_LABELS).map(([key, label]) => {
          const status = diagnostics?.health?.[key] || "unknown";
          const Icon = HEALTH_ICONS[status] || AlertCircle;
          return (
            <div key={key} className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs ${HEALTH_COLORS[status]}`}>
              <Icon size={12} />
              <div>
                <div className="font-medium leading-tight">{label}</div>
                <div className="text-[10px] capitalize opacity-70 leading-tight">{status}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last upload summary */}
      {lastUpload && (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity size={12} className="text-indigo-400" />
            <span className="text-xs font-medium text-white/70">Last Upload</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ml-auto ${
              lastUpload.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
              lastUpload.status === "error" ? "bg-red-500/10 text-red-400" :
              "bg-indigo-500/10 text-indigo-400"
            }`}>{lastUpload.status}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <div className="text-white/30 text-[10px]">Filename</div>
              <div className="text-white/70 truncate">{lastUpload.filename || "—"}</div>
            </div>
            <div>
              <div className="text-white/30 text-[10px]">File Size</div>
              <div className="text-white/70">{lastUpload.fileSize ? `${(lastUpload.fileSize / 1024).toFixed(1)} KB` : "—"}</div>
            </div>
            <div>
              <div className="text-white/30 text-[10px]">Entities Extracted</div>
              <div className="text-white/70">{lastUpload.entitiesExtracted || 0}</div>
            </div>
            <div>
              <div className="text-white/30 text-[10px]">Skills Extracted</div>
              <div className="text-white/70">{lastUpload.skillsExtracted || 0}</div>
            </div>
            <div>
              <div className="text-white/30 text-[10px]">Experience Parsed</div>
              <div className="text-white/70">{lastUpload.experienceParsed || 0}</div>
            </div>
            <div>
              <div className="text-white/30 text-[10px]">Execution Time</div>
              <div className="text-white/70">{lastUpload.executionTimeMs ? `${lastUpload.executionTimeMs}ms` : "—"}</div>
            </div>
            {lastUpload.errors?.length > 0 && (
              <div className="col-span-2">
                <div className="text-red-400/60 text-[10px]">Errors</div>
                <div className="text-red-400 text-[10px] truncate">{lastUpload.errors.map(e => e.message).join("; ")}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event timeline */}
      {recentEvents.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/70">Diagnostics Timeline</span>
            <button onClick={handleClearDiagnostics} className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Clear</button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {recentEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className="text-white/30 font-mono">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                <span className={`px-1.5 py-0.5 rounded font-medium ${
                  ev.type === "error" ? "bg-red-500/10 text-red-400" :
                  ev.type.includes("completed") || ev.type.includes("finished") || ev.type.includes("passed") ? "bg-emerald-500/10 text-emerald-400" :
                  "bg-indigo-500/10 text-indigo-400"
                }`}>{ev.type}</span>
                {ev.filename && <span className="text-white/40 truncate">{ev.filename}</span>}
                {ev.entitiesExtracted !== undefined && <span className="text-white/40">{ev.entitiesExtracted} entities</span>}
                {ev.message && <span className="text-white/40 truncate">{ev.message}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}