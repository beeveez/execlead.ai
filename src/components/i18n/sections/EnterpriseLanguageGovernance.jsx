import React from 'react';
import { Building2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

function GovernanceRow({ label, value, locked }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.02] last:border-0">
      <span className="text-xs text-white/40">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-white/80">{value}</span>
        {locked && <span className="text-[9px] text-white/20">🔒</span>}
      </div>
    </div>
  );
}

export default function EnterpriseLanguageGovernance({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Language Hierarchy */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Language Hierarchy™</h3>
        </div>
        <GovernanceRow label="Platform Default" value={data.platformDefault.name} locked={data.platformDefault.locked} />
        <GovernanceRow label="Organization Default" value={data.organizationDefault.name} />
        <GovernanceRow label="Workspace Default" value={data.workspaceDefault.name} />
        <GovernanceRow label="User Override" value={data.userOverride.name} />
      </div>

      {/* Allowed / Restricted */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Language Policy</h3>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/40">Allowed Languages</span>
            <span className="text-white/80">{data.allowedLanguages.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40">Restricted Languages</span>
            <span className="text-white/80">{data.restrictedLanguages.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40">User Override</span>
            {data.languagePolicy.allowUserOverride ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-rose-400" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40">Workspace Override</span>
            {data.languagePolicy.allowWorkspaceOverride ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-rose-400" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40">Canonical Fallback</span>
            {data.languagePolicy.requireCanonicalFallback ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-rose-400" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40">Auto-Detect Browser</span>
            {data.languagePolicy.autoDetectBrowserLanguage ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-rose-400" />}
          </div>
        </div>
      </div>

      {/* Compliance */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Compliance</h3>
        </div>
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-white">{data.compliance.complianceScore}</div>
          <div className="text-[10px] text-white/40">Compliance Score</div>
        </div>
        <GovernanceRow label="Policy Version" value={data.compliance.policyVersion} />
        <GovernanceRow label="Last Audit" value={data.compliance.lastAudit} />
        <GovernanceRow label="Violations" value={data.compliance.violations} />
      </div>
    </div>
  );
}