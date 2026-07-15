import React from 'react';
import { ShieldCheck, TrendingUp, Clock, AlertTriangle, FileCheck, Database } from 'lucide-react';
import { getEvidenceStats } from '@/lib/evidenceVaultEngine';

export default function EvidenceVaultHeader({ evidenceItems }) {
  const stats = getEvidenceStats(evidenceItems);

  const cards = [
    { icon: Database, label: 'Total Evidence', value: stats.total, sub: `${stats.byType ? Object.keys(stats.byType).length : 0} types`, color: '#6366f1' },
    { icon: ShieldCheck, label: 'Verified', value: stats.verified, sub: `${stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% of total`, color: '#10b981' },
    { icon: TrendingUp, label: 'Avg Quality Score', value: stats.avgQuality, sub: `Confidence: ${stats.avgConfidence}`, color: '#a855f7' },
    { icon: AlertTriangle, label: 'Expiring Soon', value: stats.upcomingExpirations, sub: `${stats.expired} expired`, color: stats.upcomingExpirations > 0 ? '#f59e0b' : '#10b981' },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
        <Database size={12} className="text-indigo-400" /> Executive Evidence Vault™
      </div>
      <h1 className="text-2xl font-bold text-white">Evidence Vault™</h1>
      <p className="text-white/40 text-sm mt-2 max-w-2xl leading-relaxed">
        The authoritative immutable repository for every verified piece of executive evidence.
        Every verification references an Evidence Object — no isolated metadata, no duplicates, full traceability.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={12} style={{ color: c.color }} />
                <span className="text-[10px] uppercase tracking-wider text-white/30">{c.label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{c.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}