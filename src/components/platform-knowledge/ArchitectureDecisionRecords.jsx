import React, { useState } from 'react';
import { SectionShell, Badge, EmptyState } from './PKShared';
import { ADRS } from '@/lib/platformKnowledgeCenter';
import { FileCode, ChevronDown } from 'lucide-react';

const STATUS_COLORS = { accepted: '#10b981', proposed: '#f59e0b', superseded: '#ef4444', deprecated: '#64748b' };

export default function ArchitectureDecisionRecords() {
  const [open, setOpen] = useState(ADRS[0]?.id);
  return (
    <SectionShell title="Architecture Decision Records™" subtitle="Every significant architectural decision and its reasoning" icon={FileCode}>
      <div className="space-y-2">
        {ADRS.map((adr) => {
          const isOpen = open === adr.id;
          return (
            <div key={adr.id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : adr.id)} className="w-full flex items-center gap-3 p-4 text-left">
                <span className="text-[10px] font-mono text-indigo-400 flex-shrink-0">{adr.id}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{adr.title}</div>
                  <div className="text-[10px] text-white/30">{adr.date} · {adr.approver}</div>
                </div>
                <Badge color={STATUS_COLORS[adr.status]}>{adr.status}</Badge>
                <ChevronDown size={16} className={`text-white/40 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5">
                  <Field label="Problem" text={adr.problem} />
                  <Field label="Decision" text={adr.decision} highlight />
                  <Field label="Alternatives" text={adr.alternatives.join('; ')} />
                  <Field label="Reasoning" text={adr.reasoning} />
                  <Field label="Trade-offs" text={adr.tradeoffs} />
                  <div className="flex flex-wrap gap-1.5">
                    {adr.impactedModules.map((m) => <Badge key={m} color="#6366f1">{m}</Badge>)}
                  </div>
                  {adr.futureReview !== 'N/A' && <Field label="Future Review" text={adr.futureReview} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {ADRS.length === 0 && <EmptyState text="No architecture decisions recorded." />}
    </SectionShell>
  );
}

function Field({ label, text, highlight }) {
  return (
    <div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xs ${highlight ? 'text-indigo-300' : 'text-white/60'}`}>{text}</div>
    </div>
  );
}