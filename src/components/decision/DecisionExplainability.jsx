import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Lightbulb, GitBranch, FileQuestion } from 'lucide-react';

export default function DecisionExplainability({ explainability }) {
  const [activeSection, setActiveSection] = useState('evidence');

  if (!explainability) return null;

  const sections = [
    { key: 'evidence', label: 'Evidence Used', icon: ShieldCheck, count: explainability.evidenceUsed?.length || 0 },
    { key: 'missing', label: 'Missing Evidence', icon: FileQuestion, count: explainability.missingEvidence?.length || 0 },
    { key: 'assumptions', label: 'Assumptions', icon: Lightbulb, count: explainability.assumptions?.length || 0 },
    { key: 'alternatives', label: 'Illustrative Scenarios', icon: GitBranch, count: explainability.alternativeOutcomes?.length || 0 },
    { key: 'risks', label: 'Risk Factors', icon: AlertTriangle, count: explainability.riskFactors?.length || 0 },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="mb-3">
        <h4 className="text-sm font-bold text-white">Decision Explainability™</h4>
        <p className="mt-1 text-[10px] text-white/40">Evidence, assumptions, unknowns, and illustrative scenarios are shown separately.</p>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {sections.map(s => {
          const Icon = s.icon;
          const active = activeSection === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                active ? 'bg-indigo-500/15 text-indigo-300' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <Icon size={12} />
              {s.label}
              {s.count > 0 && <span className="text-[9px] bg-white/10 px-1 rounded">{s.count}</span>}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="space-y-2">
        {activeSection === 'evidence' && <EvidenceUsed items={explainability.evidenceUsed} />}
        {activeSection === 'missing' && <MissingEvidence items={explainability.missingEvidence} />}
        {activeSection === 'assumptions' && <Assumptions items={explainability.assumptions} />}
        {activeSection === 'alternatives' && <AlternativeOutcomes items={explainability.alternativeOutcomes} />}
        {activeSection === 'risks' && <RiskFactors items={explainability.riskFactors} />}
      </div>
    </div>
  );
}

function EvidenceUsed({ items }) {
  if (!items?.length) return <Empty msg="No directly relevant evidence items found in your portfolio." />;
  return items.map((item, i) => (
    <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <ShieldCheck size={14} className={item.verificationStatus === 'verified' ? 'text-emerald-400' : 'text-white/30'} />
      <div className="flex-1">
        <div className="text-xs text-white/80">{item.title}</div>
        <div className="text-[10px] text-white/30">{item.type} · {item.verificationStatus}</div>
      </div>
      <div className="text-[10px] text-white/40">Q: {item.quality}</div>
    </div>
  ));
}

function MissingEvidence({ items }) {
  if (!items?.length) return <Empty msg="No missing evidence — your portfolio covers all required types." />;
  return items.map((item, i) => (
    <div key={i} className="flex items-start gap-3 bg-amber-500/[0.03] border border-amber-500/10 rounded-lg p-2.5">
      <FileQuestion size={14} className="text-amber-400 mt-0.5" />
      <div>
        <div className="text-xs text-white/80">{item.label}</div>
        <div className="text-[10px] text-white/30">{item.impact}</div>
      </div>
    </div>
  ));
}

function Assumptions({ items }) {
  if (!items?.length) return <Empty msg="No assumptions documented." />;
  return items.map((assumption, i) => (
    <div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <Lightbulb size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
      <span className="text-xs text-white/60 leading-relaxed">{assumption}</span>
    </div>
  ));
}

function AlternativeOutcomes({ items }) {
  if (!items?.length) return <Empty msg="No illustrative scenarios modeled." />;
  return items.map((outcome, i) => (
    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <span className="text-xs font-medium text-white/80">{outcome.label}</span>
      <p className="mt-1 text-[11px] text-white/40 leading-relaxed">{outcome.description}</p>
      <p className="mt-2 text-[9px] uppercase tracking-wider text-amber-300">Illustrative scenario — not a prediction</p>
    </div>
  ));
}

function RiskFactors({ items }) {
  if (!items?.length) return <Empty msg="No risk factors identified." />;
  const severityColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
  return items.map((risk, i) => (
    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <AlertTriangle size={12} style={{ color: severityColor[risk.severity] }} />
          <span className="text-xs font-medium text-white/80">{risk.label}</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${severityColor[risk.severity]}20`, color: severityColor[risk.severity] }}>
          {risk.severity}
        </span>
      </div>
      <p className="text-[10px] text-white/30 mb-1">{risk.description}</p>
      <p className="text-[10px] text-white/40"><span className="text-white/30">Mitigation:</span> {risk.mitigation}</p>
    </div>
  ));
}

function Empty({ msg }) {
  return <div className="text-xs text-white/30 text-center py-4">{msg}</div>;
}