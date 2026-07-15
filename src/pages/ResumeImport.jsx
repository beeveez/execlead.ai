import React from 'react';
import ResumeImportWizard from '@/components/resume/ResumeImportWizard';
import IdentitySyncStatusPanel from '@/components/resume/IdentitySyncStatusPanel';
import { Sparkles } from 'lucide-react';

export default function ResumeImport() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3">
            <Sparkles size={12} className="text-indigo-400" />
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-medium">AI Resume Auto-Population Engine™</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Import Your Resume</h1>
          <p className="text-sm text-white/40 mt-1.5 max-w-xl mx-auto">Upload your resume and our AI will extract and populate 80–90% of your Executive Profile automatically. You review and approve every change.</p>
        </div>
        <ResumeImportWizard />
      </div>
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <IdentitySyncStatusPanel />
      </div>
    </div>
  );
}