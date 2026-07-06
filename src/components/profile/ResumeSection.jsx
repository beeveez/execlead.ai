import React, { useRef } from "react";
import { SectionCard } from "./FormFields";
import { FileText, Upload, Download, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function ResumeSection({ resumeUrl, onResumeUpload, uploadingResume }) {
  const inputRef = useRef(null);

  return (
    <SectionCard title="Resume" description="Upload, manage, and analyze your resume." icon={FileText}>
      {resumeUrl ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <FileText size={18} className="text-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="text-white/80 text-sm font-medium">Resume on file</div>
              <div className="text-white/30 text-xs">Uploaded and ready for analysis</div>
            </div>
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
              <Download size={12} /> Download
            </a>
          </div>
          <div className="flex gap-2">
            <button onClick={() => inputRef.current?.click()} disabled={uploadingResume} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors disabled:opacity-40">
              {uploadingResume ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Replace Resume
            </button>
            <Link to="/resume" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-colors">
              <ExternalLink size={14} /> Resume Intelligence
            </Link>
          </div>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02] rounded-xl p-10 text-center cursor-pointer transition-all">
          {uploadingResume ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-indigo-400" />
              <p className="text-white/60 text-sm">Uploading resume...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Upload size={20} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Upload your resume</p>
                <p className="text-white/30 text-xs mt-1">PDF or DOCX</p>
              </div>
            </div>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={onResumeUpload} />
    </SectionCard>
  );
}