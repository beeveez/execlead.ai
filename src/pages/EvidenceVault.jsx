import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Loader2, Lock } from 'lucide-react';
import { recalculateEvidenceScores } from '@/lib/evidenceVaultEngine';
import EvidenceVaultHeader from '@/components/evidence/EvidenceVaultHeader';
import EvidenceExplorer from '@/components/evidence/EvidenceExplorer';
import EvidenceRelationshipGraph from '@/components/evidence/EvidenceRelationshipGraph';
import AIEvidenceReviewer from '@/components/evidence/AIEvidenceReviewer';
import EvidenceQualityScore from '@/components/evidence/EvidenceQualityScore';
import EvidenceTimeline from '@/components/evidence/EvidenceTimeline';
import EvidenceExpirationDashboard from '@/components/evidence/EvidenceExpirationDashboard';

export default function EvidenceVault() {
  const { user } = useAuth();
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const items = await base44.entities.EvidenceItem.list('-created_date', 200);
      // Recalculate scores client-side for display
      const recalced = (items || []).map(recalculateEvidenceScores);
      setEvidenceItems(recalced);
    } catch (e) { /* error */ }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleReviewComplete = async (evidenceId, updates) => {
    // Update local state immediately
    setEvidenceItems(prev => prev.map(e => e.id === evidenceId ? recalculateEvidenceScores({ ...e, ...updates }) : e));
    setSelectedEvidence(prev => prev?.id === evidenceId ? recalculateEvidenceScores({ ...prev, ...updates }) : prev);

    // Persist to database
    try {
      await base44.entities.EvidenceItem.update(evidenceId, updates);
    } catch (e) { /* error */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      <EvidenceVaultHeader evidenceItems={evidenceItems} />

      {/* Two-column layout: Explorer + side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EvidenceExplorer
            evidenceItems={evidenceItems}
            onSelectEvidence={setSelectedEvidence}
            selectedId={selectedEvidence?.id}
          />
          <EvidenceRelationshipGraph evidenceItems={evidenceItems} />
          <EvidenceTimeline evidenceItems={evidenceItems} />
        </div>

        <div className="space-y-6">
          <EvidenceQualityScore evidence={selectedEvidence} />
          <AIEvidenceReviewer evidence={selectedEvidence} onReviewComplete={handleReviewComplete} />
        </div>
      </div>

      {/* Full-width expiration dashboard */}
      <EvidenceExpirationDashboard evidenceItems={evidenceItems} />

      {/* Governance note */}
      <div className="flex items-start gap-2 text-[11px] text-white/30 bg-white/[0.02] border border-white/5 rounded-lg p-3">
        <Lock size={12} className="flex-shrink-0 mt-0.5 text-white/20" />
        <span>
          Every verification references an Evidence Object — no isolated metadata, no duplicates.
          All evidence is immutable once verified, with full traceability across Verification Center™,
          Executive Trust™, Executive Portfolio™, Executive Credentials™, Audit Ledger™, and Enterprise Governance.
        </span>
      </div>
    </div>
  );
}