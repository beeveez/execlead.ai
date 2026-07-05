import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Trash2, Download, Loader2, AlertTriangle } from "lucide-react";

export default function ResumePrivacy({ resumeVersion, onDeleted }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.entities.ResumeVersion.delete(resumeVersion.id);
      onDeleted();
    } catch (e) {}
    setDeleting(false);
    setConfirming(false);
  };

  const handleDownload = () => {
    if (resumeVersion?.file_url) window.open(resumeVersion.file_url, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-emerald-400" />
          <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Privacy & Data Control</h3>
        </div>
        <p className="text-white/40 text-sm mb-4">Your resume is stored securely and used only to personalize your executive development experience. You can download or delete it at any time.</p>
        <div className="space-y-3">
          <button onClick={handleDownload} disabled={!resumeVersion} className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/60 hover:text-white/80 transition-colors">
            <Download size={16} className="text-indigo-400" /> Download Resume
          </button>
          {!confirming ? (
            <button onClick={() => setConfirming(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/5 hover:bg-red-500/10 rounded-lg text-sm text-red-400 transition-colors">
              <Trash2 size={16} /> Delete Resume
            </button>
          ) : (
            <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-red-400" />
                <p className="text-red-400 text-sm font-medium">Are you sure?</p>
              </div>
              <p className="text-white/40 text-xs mb-3">This permanently deletes your resume and all extracted data. This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirming(false)} className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/50">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5">
                  {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">AI Processing Preferences</h3>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-white/70 text-sm">Allow AI to analyze my resume</p>
            <p className="text-white/30 text-xs mt-0.5">Enables personalized coaching, interview questions, and recommendations</p>
          </div>
          <button onClick={() => setAiEnabled(!aiEnabled)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${aiEnabled ? "bg-indigo-500" : "bg-white/10"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${aiEnabled ? "translate-x-5" : ""}`} />
          </button>
        </label>
      </div>
    </div>
  );
}