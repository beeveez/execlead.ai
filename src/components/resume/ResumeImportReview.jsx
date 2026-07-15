import React from 'react';
import { CheckCheck, XCircle, Sparkles, ArrowRight } from 'lucide-react';
import { SECTION_ORDER, hasSectionData } from '@/lib/resumeImportEngine';
import ResumeImportSectionCard from './ResumeImportSectionCard';
import ResumeIntelligenceReport from './ResumeIntelligenceReport';

export default function ResumeImportReview({ extractedData, existingProfile, decisions, onDecision, onAcceptAll, onRejectAll, onApply, applying }) {
  const availableSections = SECTION_ORDER.filter(key => hasSectionData(key, extractedData));
  const acceptedCount = Object.values(decisions).filter(d => d === 'accepted').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Review Extracted Data</h2>
          <p className="text-xs text-white/40 mt-0.5">{acceptedCount} of {availableSections.length} sections accepted · AI confidence shown per section</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAcceptAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors">
            <CheckCheck size={13} /> Accept All
          </button>
          <button onClick={onRejectAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/40 text-xs font-medium hover:bg-white/10 transition-colors">
            <XCircle size={13} /> Skip All
          </button>
        </div>
      </div>

      {extractedData.intelligence_report && <ResumeIntelligenceReport report={extractedData.intelligence_report} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {availableSections.map(key => (
          <ResumeImportSectionCard key={key} sectionKey={key} extractedData={extractedData} existingProfile={existingProfile} decision={decisions[key]} onDecision={onDecision} />
        ))}
      </div>

      <div className="sticky bottom-4 z-10">
        <button onClick={onApply} disabled={acceptedCount === 0 || applying} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {applying ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying changes...</> : <><Sparkles size={15} /> Apply {acceptedCount} Section{acceptedCount !== 1 ? 's' : ''} to Profile <ArrowRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}