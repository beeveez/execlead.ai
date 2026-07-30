import React, { useState, useMemo } from 'react';
import { ShieldCheck, Shield, LayoutGrid, AlertTriangle, Award, Eye, Package, Lock, Download } from 'lucide-react';
import { getSecurityBaselineSnapshot } from '@/lib/securityBaselineEngine';
import SecurityBaselineHero from '@/components/security-baseline/SecurityBaselineHero';
import SecurityDomainGrid from '@/components/security-baseline/SecurityDomainGrid';
import SecurityDomainDrawer from '@/components/security-baseline/SecurityDomainDrawer';
import SecurityCertificationPanel from '@/components/security-baseline/SecurityCertificationPanel';
import SecurityGuardianIntegration from '@/components/security-baseline/SecurityGuardianIntegration';
import SecurityFindingsTable from '@/components/security-baseline/SecurityFindingsTable';
import ZeroTrustOverview from '@/components/security-baseline/ZeroTrustOverview';
import DependencySecurityPanel from '@/components/security-baseline/DependencySecurityPanel';
import RLSValidationReport from '@/components/security-baseline/RLSValidationReport';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'domains', label: 'Control Domains', icon: ShieldCheck },
  { id: 'findings', label: 'Findings', icon: AlertTriangle },
  { id: 'certification', label: 'Certification', icon: Award },
  { id: 'guardian', label: 'Guardian™', icon: Eye },
  { id: 'rls', label: 'RLS Hardening', icon: Shield },
  { id: 'zero_trust', label: 'Zero Trust', icon: Lock },
];

export default function SecurityBaselineDashboard() {
  const [tab, setTab] = useState('overview');
  const [selectedDomain, setSelectedDomain] = useState(null);

  const snapshot = useMemo(() => getSecurityBaselineSnapshot(), []);
  const selectedDomainData = useMemo(() =>
    selectedDomain ? snapshot.domains.find((d) => d.id === selectedDomain) : null,
    [selectedDomain, snapshot.domains]
  );

  function handleExport() {
    const data = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-baseline-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <ShieldCheck size={12} className="text-indigo-400" /> Platform Security Baseline™ · v1.0 · {snapshot.codename}
          </div>
          <h1 className="text-2xl font-bold text-white">Enterprise Security Hardening Framework</h1>
          <p className="text-white/40 text-sm mt-1">Zero Trust · Always Verify · Least Privilege · Continuous Monitoring</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors border border-white/10">
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* Hero */}
      <SecurityBaselineHero snapshot={snapshot} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 overflow-x-auto">
        {TABS.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === tb.id ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-white/40 hover:text-white/70'
            }`}>
            <tb.icon size={14} /> {tb.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <SecurityDomainGrid domains={snapshot.domains} onDomainClick={setSelectedDomain} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SecurityCertificationPanel certification={snapshot.certification} />
            <ZeroTrustOverview zeroTrust={snapshot.zeroTrust} compliance={snapshot.compliance} />
          </div>
        </div>
      )}

      {tab === 'domains' && (
        <SecurityDomainGrid domains={snapshot.domains} onDomainClick={setSelectedDomain} />
      )}

      {tab === 'findings' && (
        <SecurityFindingsTable findings={snapshot.allFindings} />
      )}

      {tab === 'certification' && (
        <div className="space-y-4">
          <SecurityCertificationPanel certification={snapshot.certification} />
          <DependencySecurityPanel metrics={snapshot.domainResults.dependency_security.metrics} />
        </div>
      )}

      {tab === 'guardian' && (
        <SecurityGuardianIntegration guardian={snapshot.guardian} />
      )}

      {tab === 'rls' && (
        <RLSValidationReport />
      )}

      {tab === 'zero_trust' && (
        <div className="space-y-4">
          <ZeroTrustOverview zeroTrust={snapshot.zeroTrust} compliance={snapshot.compliance} />
          <DependencySecurityPanel metrics={snapshot.domainResults.dependency_security.metrics} />
        </div>
      )}

      {/* Domain Drawer */}
      {selectedDomainData && (
        <SecurityDomainDrawer domain={selectedDomainData} onClose={() => setSelectedDomain(null)} />
      )}
    </div>
  );
}