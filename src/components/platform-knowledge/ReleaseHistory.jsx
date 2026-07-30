import React from 'react';
import { SectionShell, Badge } from './PKShared';
import { RELEASES } from '@/lib/platformKnowledgeCenter';
import { History, Plus, RefreshCw, AlertTriangle, Bug, Zap, Shield } from 'lucide-react';

export default function ReleaseHistory() {
  return (
    <SectionShell title="Release History™" subtitle="Timeline of platform releases" icon={History}>
      <div className="relative space-y-4 pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-white/10" />
        {RELEASES.map((r) => (
          <div key={r.version} className="relative">
            <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{r.version}</span>
                  <Badge color="#6366f1">{r.date}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                {r.featuresAdded.length > 0 && <ReleaseGroup icon={Plus} color="#10b981" label="Added" items={r.featuresAdded} />}
                {r.featuresImproved.length > 0 && <ReleaseGroup icon={RefreshCw} color="#0ea5e9" label="Improved" items={r.featuresImproved} />}
                {r.breakingChanges.length > 0 && <ReleaseGroup icon={AlertTriangle} color="#ef4444" label="Breaking" items={r.breakingChanges} />}
                {r.bugFixes.length > 0 && <ReleaseGroup icon={Bug} color="#f59e0b" label="Fixes" items={r.bugFixes} />}
                {r.performanceImprovements.length > 0 && <ReleaseGroup icon={Zap} color="#8b5cf6" label="Performance" items={r.performanceImprovements} />}
                {r.securityImprovements.length > 0 && <ReleaseGroup icon={Shield} color="#14b8a6" label="Security" items={r.securityImprovements} />}
              </div>
              {r.migrationNotes && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Migration Notes</div>
                  <div className="text-xs text-white/50">{r.migrationNotes}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function ReleaseGroup({ icon: Icon, color, label, items }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider" style={{ color }}>{label}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((i) => <span key={i} className="text-[11px] text-white/60 bg-white/[0.03] border border-white/5 rounded px-1.5 py-0.5">{i}</span>)}
      </div>
    </div>
  );
}