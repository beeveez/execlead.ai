import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Loader2, Lock, Database, Target, TrendingDown, FolderCheck, Send, Gauge, Sparkles, BarChart3 } from 'lucide-react';
import { recalculateEvidenceScores } from '@/lib/evidenceVaultEngine';
import EvidenceVaultHeader from '@/components/evidence/EvidenceVaultHeader';
import EvidenceExplorer from '@/components/evidence/EvidenceExplorer';
import EvidenceRelationshipGraph from '@/components/evidence/EvidenceRelationshipGraph';
import AIEvidenceReviewer from '@/components/evidence/AIEvidenceReviewer';
import EvidenceQualityScore from '@/components/evidence/EvidenceQualityScore';
import EvidenceTimeline from '@/components/evidence/EvidenceTimeline';
import EvidenceExpirationDashboard from '@/components/evidence/EvidenceExpirationDashboard';
import EvidenceChain from '@/components/evidence/EvidenceChain';
import EvidenceConfidenceDecay from '@/components/evidence/EvidenceConfidenceDecay';
import EvidenceCollections from '@/components/evidence/EvidenceCollections';
import EvidenceRequests from '@/components/evidence/EvidenceRequests';
import EvidenceScore from '@/components/evidence/EvidenceScore';
import EvidenceIntelligence from '@/components/evidence/EvidenceIntelligence';
import EnterpriseEvidenceDashboard from '@/components/evidence/EnterpriseEvidenceDashboard';

const TABS = [
  { key: 'vault', label: 'Evidence Vault™', icon: Database },
  { key: 'intelligence', label: 'Evidence Intelligence™', icon: Sparkles },
  { key: 'enterprise', label: 'Enterprise Dashboard™', icon: BarChart3 },
  { key: 'collections', label: 'Collections™', icon: FolderCheck },
  { key: 'requests', label: 'Evidence Requests™', icon: Send },
];

export default function EvidenceVault() {
  const { user } = useAuth();
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vault');

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const items = await base44.entities.EvidenceItem.list('-created_date', 200);
      const recalced = (items || []).map(recalculateEvidenceScores);
      setEvidenceItems(recalced);
    } catch (e) { /* error */ }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleReviewComplete = async (evidenceId, updates) => {
    setEvidenceItems(prev => prev.map(e => e.id === evidenceId ? recalculateEvidenceScores({ ...e, ...updates }) : e));
    setSelectedEvidence(prev => prev?.id === evidenceId ? recalculateEvidenceScores({ ...prev, ...updates }) : prev);
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

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/5 pb-px">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive ? 'text-white border-indigo-400' : 'text-white/40 border-transparent hover:text-white/60'
              }`}
            >
              <Icon size={12} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'vault' && (
        <>
          {/* Executive Evidence Score™ */}
          <EvidenceScore evidenceItems={evidenceItems} />

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
              <EvidenceChain evidence={selectedEvidence} />
              <EvidenceConfidenceDecay evidence={selectedEvidence} />
              <AIEvidenceReviewer evidence={selectedEvidence} onReviewComplete={handleReviewComplete} />
            </div>
          </div>

          {/* Full-width expiration dashboard */}
          <EvidenceExpirationDashboard evidenceItems={evidenceItems} />
        </>
      )}

      {activeTab === 'intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <EvidenceIntelligence evidenceItems={evidenceItems} />
            <EvidenceScore evidenceItems={evidenceItems} />
          </div>
          <div className="space-y-6">
            <EvidenceChain evidence={selectedEvidence} />
            <EvidenceConfidenceDecay evidence={selectedEvidence} />
          </div>
        </div>
      )}

      {activeTab === 'enterprise' && (
        <EnterpriseEvidenceDashboard evidenceItems={evidenceItems} />
      )}

      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EvidenceCollections evidenceItems={evidenceItems} />
          </div>
          <div className="space-y-6">
            <EvidenceScore evidenceItems={evidenceItems} />
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EvidenceRequests evidenceItems={evidenceItems} />
          </div>
          <div className="space-y-6">
            <EvidenceScore evidenceItems={evidenceItems} />
          </div>
        </div>
      )}

      {/* Governance note */}
      <div className="flex items-start gap-2 text-[11px] text-white/30 bg-white/[0.02] border border-white/5 rounded-lg p-3">
        <Lock size={12} className="flex-shrink-0 mt-0.5 text-white/20" />
        <span>
          Every verification references an Evidence Object — no isolated metadata, no duplicates.
          All evidence is immutable once verified, with full traceability across Verification Center™,
          Executive Trust™, Executive Credentials™, Executive Portfolio™, Executive Identity Graph™,
          Executive Readiness™, Audit Ledger™, and Enterprise Governance™.
        </span>
      </div>
    </div>
  );
}