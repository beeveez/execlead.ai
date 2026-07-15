import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { SECTION_ORDER, hasSectionData } from '@/lib/resumeImportEngine';
import ResumeImportUpload from './ResumeImportUpload';
import ResumeImportReview from './ResumeImportReview';
import { CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

export default function ResumeImportWizard() {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [applyResult, setApplyResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (selectedFile) => {
    setStep('analyzing');
    setError(null);
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file: selectedFile });
      setFile({ url: uploadRes.file_url, name: selectedFile.name });
      const response = await base44.functions.invoke('resumeAutoPopulation', {
        action: 'analyze', file_url: uploadRes.file_url, file_name: selectedFile.name,
      });
      const data = response.data.extracted_data;
      setExtractedData(data);
      setExistingProfile(response.data.existing_profile);
      const initial = {};
      SECTION_ORDER.forEach(key => { if (hasSectionData(key, data)) initial[key] = 'accepted'; });
      setDecisions(initial);
      setStep('review');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to analyze resume');
      setStep('upload');
    }
  };

  const handleDecision = (key, decision) => setDecisions(prev => ({ ...prev, [key]: decision }));

  const handleAcceptAll = () => {
    const all = {};
    SECTION_ORDER.forEach(key => { if (extractedData && hasSectionData(key, extractedData)) all[key] = 'accepted'; });
    setDecisions(all);
  };

  const handleRejectAll = () => setDecisions({});

  const handleApply = async () => {
    setStep('applying');
    setError(null);
    try {
      const approved = {}, rejected = {};
      Object.keys(decisions).forEach(key => {
        if (!extractedData[key]) return;
        if (decisions[key] === 'accepted') approved[key] = extractedData[key];
        else if (decisions[key] === 'rejected') rejected[key] = extractedData[key];
      });
      const response = await base44.functions.invoke('resumeAutoPopulation', {
        action: 'apply', file_url: file.url, file_name: file.name,
        approved_sections: approved, rejected_sections: rejected,
        intelligence_report: extractedData.intelligence_report,
        is_reimport: !!existingProfile,
      });
      // Trigger Executive Identity Synchronization Engine™
      let syncResult = null;
      try {
        const syncRes = await base44.functions.invoke('syncExecutiveIdentity', { action: 'sync' });
        syncResult = syncRes.data;
      } catch { /* sync failure shouldn't block import success */ }
      setApplyResult({ ...response.data, sync: syncResult });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to apply changes');
      setStep('review');
    }
  };

  const handleReset = () => {
    setStep('upload'); setFile(null); setExtractedData(null); setExistingProfile(null);
    setDecisions({}); setApplyResult(null); setError(null);
  };

  if (step === 'upload' || step === 'analyzing') {
    return <ResumeImportUpload onFileSelect={handleFileSelect} loading={step === 'analyzing'} error={error} />;
  }

  if (step === 'review' || step === 'applying') {
    return <ResumeImportReview extractedData={extractedData} existingProfile={existingProfile} decisions={decisions} onDecision={handleDecision} onAcceptAll={handleAcceptAll} onRejectAll={handleRejectAll} onApply={handleApply} applying={step === 'applying'} />;
  }

  if (step === 'done' && applyResult) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Profile Updated Successfully</h2>
        <p className="text-sm text-white/40 mt-1">{applyResult.sections_applied.length} section{applyResult.sections_applied.length !== 1 ? 's' : ''} applied to your Executive Profile</p>
        {applyResult.resume_score > 0 && <div className="mt-3 text-xs text-white/50">Resume Score: <span className="font-bold text-indigo-400">{applyResult.resume_score}/100</span></div>}
        {applyResult.sync && applyResult.sync.status === 'success' && (
          <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-lg p-4 max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-white">Executive Identity Synced</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div><div className="text-lg font-bold text-emerald-400">{applyResult.sync.records_imported}</div><div className="text-[9px] text-white/30 uppercase">Imported</div></div>
              <div><div className="text-lg font-bold text-blue-400">{applyResult.sync.records_updated}</div><div className="text-[9px] text-white/30 uppercase">Updated</div></div>
              <div><div className="text-lg font-bold text-amber-400">{applyResult.sync.duplicates_merged}</div><div className="text-[9px] text-white/30 uppercase">Merged</div></div>
              <div><div className="text-lg font-bold" style={{ color: applyResult.sync.sync_errors > 0 ? '#ef4444' : '#10b981' }}>{applyResult.sync.sync_errors}</div><div className="text-[9px] text-white/30 uppercase">Errors</div></div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <Link to="/executive-portfolio" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors">View Portfolio <ArrowRight size={13} /></Link>
          <Link to="/profile" className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-xs font-medium hover:bg-white/10 transition-colors">View Profile</Link>
          <button onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 text-white/60 text-xs font-medium hover:bg-white/10 transition-colors"><RotateCcw size={13} /> Import Another</button>
        </div>
      </div>
    );
  }

  return null;
}