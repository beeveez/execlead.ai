import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { subscribeIntelligenceAnalysis, closeIntelligenceAnalysis } from '@/lib/intelligenceAnalysisStore';
import { getIntelligenceAnalysis } from '@/lib/intelligenceAnalysisData';
import IntelligenceDetailsWorkspace from './workspace/IntelligenceDetailsWorkspace';

/**
 * Executive Intelligence Drill-Down™ — v2.0
 * ----------------------------------------------------------------
 * Global panel that renders the Intelligence Details Workspace™ when
 * any intelligence card across the platform calls openIntelligenceAnalysis().
 *
 * The store API is unchanged — every existing IntelligenceCard caller
 * automatically opens the new full-screen investigation & remediation
 * workspace with tabs for Overview, Issues & Components, Root Cause &
 * Fix, Dependencies, Timeline & Activity, and History & Export.
 *
 * Trigger from any component:
 *   import { openIntelligenceAnalysis } from '@/lib/intelligenceAnalysisStore';
 *   openIntelligenceAnalysis({ metricId: 'drift_health' });
 */
export default function IntelligenceAnalysisPanel() {
  const [state, setState] = useState({ open: false, payload: null });

  useEffect(() => {
    return subscribeIntelligenceAnalysis(setState);
  }, []);

  const analysis = state.payload ? getIntelligenceAnalysis(state.payload.metricId) : null;

  // If no analysis data exists for the requested metric, render nothing
  // (the store will have opened but there's nothing to show).
  if (state.open && !analysis) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={closeIntelligenceAnalysis}>
          <div className="bg-[#0d0d14] border border-white/10 rounded-xl p-6 max-w-sm text-center">
            <p className="text-white/70 text-sm font-medium mb-1">No intelligence data</p>
            <p className="text-white/40 text-xs mb-4">No analysis is available for this metric yet.</p>
            <button onClick={closeIntelligenceAnalysis} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 text-xs font-medium transition-colors">Close</button>
          </div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {state.open && analysis && <IntelligenceDetailsWorkspace key={state.payload?.metricId} payload={state.payload} />}
    </AnimatePresence>
  );
}