import React from 'react';
import { ShieldCheck, ShieldAlert, Sprout } from 'lucide-react';

const STYLES = {
  'High Confidence': 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
  'Moderate Confidence': 'bg-amber-500/10 border-amber-500/25 text-amber-300',
  'Emerging Signal': 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300',
};

export default function GrowthConfidenceBadge({ confidence, showScore = false }) {
  if (!confidence) return null;
  const Icon = confidence.level === 'High Confidence' ? ShieldCheck : confidence.level === 'Moderate Confidence' ? ShieldAlert : Sprout;
  return (
    <span title={`${confidence.sampleSize} completed actions support this signal`} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-semibold whitespace-nowrap ${STYLES[confidence.level]}`}>
      <Icon size={10} /> {confidence.level}{showScore ? ` · ${confidence.score}/100` : ''}
    </span>
  );
}