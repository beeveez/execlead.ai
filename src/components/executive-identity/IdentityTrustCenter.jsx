import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, BadgeCheck, FileCheck2, Activity, Clock, GitBranch } from 'lucide-react';

function MetricRow({ label, value, sub, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl">
      <button onClick={() => children ? setOpen((o) => !o) : undefined} className={`w-full flex items-center justify-between p-3 ${children ? 'hover:bg-white/[0.03]' : ''} transition-colors`}>
        <div className="text-left">
          <div className="text-[11px] uppercase tracking-wider text-white/40">{label}</div>
          <div className="text-sm font-semibold text-white mt-0.5">{value}</div>
          {sub && <div className="text-[10px] text-white/30 mt-0.5">{sub}</div>}
        </div>
        {children && <ChevronDown size={14} className={`text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && children && <div className="px-3 pb-3 text-[11px] text-white/55 leading-relaxed">{children}</div>}
    </div>
  );
}

export default function IdentityTrustCenter({ identity, health }) {
  if (!identity) return null;
  const lastSync = identity.last_updated || identity.generated_date;
  const verificationSources = ['Executive Success Story™', 'Executive Readiness™', 'Leadership DNA™', 'Evidence Ledger™', 'Career Intelligence™'];
  return (
    <div className="bg-gradient-to-br from-emerald-500/8 to-transparent border border-emerald-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-emerald-400" />
        <h2 className="text-sm font-semibold text-white">Identity Trust Center™</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <MetricRow label="Identity Health Score™" value={`${health?.overall || 0}/100`} sub={health?.recommendations?.length ? `${health.recommendations.length} recommendations` : 'All clear'}>
          {health?.recommendations?.slice(0, 4).map((r, i) => (<div key={i} className="mb-1">• {r}</div>))}
        </MetricRow>
        <MetricRow label="Story Confidence™" value={`${identity.story_confidence || 0}%`} sub="Evidence-grounded confidence">
          Derived from verified evidence reliability and outcome attribution.
        </MetricRow>
        <MetricRow label="Verification Status" value={identity.verification_status?.replace(/_/g, ' ') || 'not verified'} sub={`${health?.verificationLevel || 20}% verification level`}>
          Verification level rises as you complete identity, employment, and executive verification.
        </MetricRow>
        <MetricRow label="Evidence Coverage" value={`${identity.evidence_count || 0} records`} sub={`${health?.evidenceCoverage || 0}% coverage`}>
          Evidence records flow from the Evidence Ledger™ and Outcome Intelligence™.
        </MetricRow>
        <MetricRow label="Identity Completeness" value={`${health?.completeness || 0}%`} sub={`${health?.consistency || 0}% consistency`}>
          Completeness measures how many identity sections are populated; consistency checks for conflicting narratives.
        </MetricRow>
        <MetricRow label="Brand Consistency" value={`${health?.brandConsistency || 0}%`} sub="Across all outputs">
          Validates that every professional output aligns with the canonical identity.
        </MetricRow>
        <MetricRow label="Last Synchronization" value={lastSync ? new Date(lastSync).toLocaleString() : '—'} sub="Auto-synced on source changes">
          Identity Synchronization™ re-synthesizes this identity whenever a source changes.
        </MetricRow>
        <MetricRow label="Identity Version" value={`v${identity.version || '1.0'}`} sub={`${identity.identity_id || '—'}`}>
          Every version is immutable. Compare and roll back in the Evolution Timeline.
        </MetricRow>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-white/40 mr-1">Verification Sources:</span>
        {verificationSources.map((s) => (
          <span key={s} className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 flex items-center gap-1"><BadgeCheck size={10} /> {s}</span>
        ))}
      </div>
    </div>
  );
}