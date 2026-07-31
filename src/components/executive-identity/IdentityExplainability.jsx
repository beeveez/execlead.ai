import React, { useState } from 'react';
import { Eye, ChevronDown, BadgeCheck, Sparkles, FileText } from 'lucide-react';
import { explainSection } from '@/lib/identityIntelligenceEngine';

const SECTIONS = [
  { key: 'professional_headline', label: 'Professional Headline' },
  { key: 'executive_summary', label: 'Executive Summary' },
  { key: 'leadership_narrative', label: 'Leadership Narrative' },
  { key: 'core_value_proposition', label: 'Core Value Proposition' },
  { key: 'leadership_philosophy', label: 'Leadership Philosophy' },
  { key: 'executive_brand_statement', label: 'Executive Brand Statement' },
  { key: 'top_competencies', label: 'Top Competencies' },
  { key: 'leadership_strengths', label: 'Leadership Strengths' },
  { key: 'executive_differentiators', label: 'Executive Differentiators' },
  { key: 'career_highlights', label: 'Career Highlights' },
  { key: 'executive_readiness', label: 'Executive Readiness' },
  { key: 'story_confidence', label: 'Story Confidence' },
];

const SOURCE_BADGE = {
  verified: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  ai_assisted: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  ai_generated: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
};

export default function IdentityExplainability({ identity }) {
  const [open, setOpen] = useState(null);
  if (!identity) return null;
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1"><Eye size={16} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Identity Explainability™</h2></div>
      <p className="text-[11px] text-white/40 mb-4">Every generated section answers "Why was this generated?" — with source evidence, AI contribution, and reasoning.</p>
      <div className="space-y-1.5">
        {SECTIONS.map((s) => {
          const exp = explainSection(identity, s.key);
          const isOpen = open === s.key;
          return (
            <div key={s.key} className="bg-white/[0.02] border border-white/8 rounded-xl">
              <button onClick={() => setOpen(isOpen ? null : s.key)} className="w-full flex items-center justify-between p-3 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/75 font-medium">{s.label}</span>
                  <span className={`px-1.5 py-0.5 rounded border text-[9px] font-medium ${SOURCE_BADGE[exp.sourceLabel] || SOURCE_BADGE.ai_generated}`}>{exp.sourceLabel.replace(/_/g, ' ')}</span>
                </div>
                <ChevronDown size={13} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-3 pb-3 space-y-2">
                  <Row icon={FileText} label="Generated from" value={exp.generatedFrom.join(' · ')} />
                  <Row icon={Sparkles} label="AI contribution" value={exp.aiContribution} />
                  <Row icon={BadgeCheck} label="Verified records" value={`${exp.verifiedRecords} evidence records`} />
                  <Row icon={BadgeCheck} label="Confidence" value={`${exp.confidence}%`} />
                  <div className="text-[11px] text-white/55 leading-relaxed pt-1 border-t border-white/8"><span className="text-white/40">Reasoning: </span>{exp.reasoning}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 text-[11px]">
      <Icon size={12} className="text-white/40 mt-0.5 shrink-0" />
      <div><span className="text-white/40">{label}: </span><span className="text-white/70">{value}</span></div>
    </div>
  );
}