import React from 'react';
import { Bug, AlertTriangle, ShieldAlert, Ban } from 'lucide-react';

const CARDS = [
  { key: 'openDefects', label: 'Open Defects', icon: Bug, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { key: 'criticalIssues', label: 'Critical Issues', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { key: 'warnings', label: 'Warnings', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { key: 'blockedReleaseItems', label: 'Blocked Release Items', icon: Ban, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
];

export default function IssueSummaryBar({ issues }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {CARDS.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.key} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={c.color} />
              <span className="text-white/40 text-xs">{c.label}</span>
            </div>
            <div className={`text-2xl font-bold ${c.color}`}>{issues[c.key] ?? 0}</div>
          </div>
        );
      })}
    </div>
  );
}