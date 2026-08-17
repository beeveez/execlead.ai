import React from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Database } from 'lucide-react';

const sections = [
  { key: 'gaps', label: 'Knowledge Gaps', icon: AlertTriangle, color: 'text-amber-400' },
  { key: 'stale', label: 'Stale Entries', icon: Clock3, color: 'text-orange-400' },
  { key: 'conflicts', label: 'Conflicting Entries', icon: AlertTriangle, color: 'text-red-400' },
  { key: 'orphanArticles', label: 'Articles Without Registry Entries', icon: Database, color: 'text-violet-400' },
];

export default function KnowledgeRegistryAudit({ audit }) {
  if (!audit) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(audit.scores).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/35">{key.replace(/([A-Z])/g, ' $1')}</div>
            <div className="mt-1 text-2xl font-bold text-white">{value}%</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {sections.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center gap-2"><Icon size={14} className={color} /><h3 className="text-sm font-semibold text-white">{label} · {audit[key].length}</h3></div>
            {audit[key].length === 0 ? <div className="flex items-center gap-1.5 text-xs text-emerald-400"><CheckCircle2 size={12} /> None detected</div> : (
              <div className="space-y-1.5">{audit[key].slice(0, 8).map((item) => <div key={item.capability_id || item.slug || item.id} className="text-xs text-white/55">{item.capability_name || item.question || item.slug}</div>)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}