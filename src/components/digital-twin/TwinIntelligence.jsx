import React, { useState } from 'react';
import {
  AlertTriangle, ShieldAlert, FileSearch, Award, Ban, CheckCircle2, Lightbulb,
  ChevronDown, ChevronRight,
} from 'lucide-react';

const CATEGORY_META = {
  missing_evidence: { label: 'Missing Evidence', icon: FileSearch, color: '#f97316' },
  leadership_risk: { label: 'Leadership Risk', icon: AlertTriangle, color: '#ef4444' },
  trust_risk: { label: 'Trust Risk', icon: ShieldAlert, color: '#dc2626' },
  credential_opportunity: { label: 'Credential Opportunity', icon: Award, color: '#8b5cf6' },
  promotion_blocker: { label: 'Promotion Blocker', icon: Ban, color: '#ef4444' },
  strength: { label: 'Executive Strength', icon: CheckCircle2, color: '#10b981' },
};

const SEVERITY_COLORS = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#64748b', positive: '#10b981',
};

function IntelligenceGroup({ title, items, icon: Icon, color, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        {open ? <ChevronDown size={14} className="text-white/30" /> : <ChevronRight size={14} className="text-white/30" />}
        <Icon size={14} style={{ color }} />
        <span className="text-sm font-medium text-white/80">{title}</span>
        <span className="text-[10px] text-white/30 ml-auto">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2">
          {items.map((item, i) => {
            const sevColor = SEVERITY_COLORS[item.severity] || '#64748b';
            return (
              <div key={i} className="flex items-start gap-2 py-1.5 border-t border-white/[0.03]">
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: sevColor + '15' }}>
                  <Icon size={10} style={{ color: sevColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-white/70">{item.label}</span>
                    <span className="text-[8px] uppercase px-1 py-0.5 rounded" style={{ backgroundColor: sevColor + '15', color: sevColor }}>
                      {item.severity}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/40 mt-0.5">{item.message}</div>
                  <div className="text-[10px] text-white/50 mt-0.5 flex items-start gap-1">
                    <Lightbulb size={9} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    {item.recommendation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TwinIntelligence({ intelligence }) {
  const total = intelligence.total;
  const positive = intelligence.positiveCount;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-amber-400" />
        <h2 className="text-lg font-bold text-white">Twin Intelligence™</h2>
        <div className="flex items-center gap-3 ml-auto text-[10px]">
          <span className="text-red-400">{total} risk{total !== 1 ? 's' : ''}</span>
          <span className="text-white/20">·</span>
          <span className="text-emerald-400">{positive} strength{positive !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        <IntelStat label="Missing Evidence" count={intelligence.missingEvidence.length} color="#f97316" />
        <IntelStat label="Leadership Risks" count={intelligence.leadershipRisks.length} color="#ef4444" />
        <IntelStat label="Trust Risks" count={intelligence.trustRisks.length} color="#dc2626" />
        <IntelStat label="Credential Opps" count={intelligence.credentialOpportunities.length} color="#8b5cf6" />
        <IntelStat label="Promotion Blockers" count={intelligence.promotionBlockers.length} color="#ef4444" />
        <IntelStat label="Strengths" count={intelligence.strengths.length} color="#10b981" />
      </div>

      <div className="space-y-2">
        {intelligence.promotionBlockers.length > 0 && (
          <IntelligenceGroup title="Promotion Blockers" items={intelligence.promotionBlockers} icon={Ban} color="#ef4444" defaultOpen />
        )}
        {intelligence.trustRisks.length > 0 && (
          <IntelligenceGroup title="Trust Risks" items={intelligence.trustRisks} icon={ShieldAlert} color="#dc2626" defaultOpen />
        )}
        {intelligence.missingEvidence.length > 0 && (
          <IntelligenceGroup title="Missing Evidence" items={intelligence.missingEvidence} icon={FileSearch} color="#f97316" />
        )}
        {intelligence.leadershipRisks.length > 0 && (
          <IntelligenceGroup title="Leadership Risks" items={intelligence.leadershipRisks} icon={AlertTriangle} color="#ef4444" />
        )}
        {intelligence.credentialOpportunities.length > 0 && (
          <IntelligenceGroup title="Credential Opportunities" items={intelligence.credentialOpportunities} icon={Award} color="#8b5cf6" />
        )}
        {intelligence.strengths.length > 0 && (
          <IntelligenceGroup title="Executive Strengths" items={intelligence.strengths} icon={CheckCircle2} color="#10b981" defaultOpen />
        )}
        {total === 0 && positive === 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
            <CheckCircle2 size={24} className="text-emerald-400/50 mx-auto mb-2" />
            <p className="text-sm text-white/40">No risks or opportunities detected. Your digital twin is healthy.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function IntelStat({ label, count, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 text-center">
      <div className="text-lg font-bold" style={{ color: count > 0 ? color : '#64748b' }}>{count}</div>
      <div className="text-[8px] text-white/30 uppercase tracking-wider leading-tight mt-0.5">{label}</div>
    </div>
  );
}