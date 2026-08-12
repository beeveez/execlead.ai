import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function ManualMismatchReview({ items, onSaved }) {
  const [saving, setSaving] = useState('');
  const save = async (item, verdict) => {
    setSaving(item.key); const me = await base44.auth.me();
    const payload = { review_key: `founding:${item.key}`, scope: 'founding_cohort', behavior_key: item.key, finding_type: 'high_confidence_mismatch', verdict, reviewed_by: me.id, reviewed_at: new Date().toISOString() };
    if (item.review?.id) await base44.entities.CalibrationReview.update(item.review.id, payload); else await base44.entities.CalibrationReview.create(payload);
    setSaving(''); onSaved();
  };
  return <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"><h2 className="text-sm font-semibold text-white mb-2">Manual Mismatch-Detection Review</h2><p className="text-[10px] text-white/35 mb-4">Aggregate review only; no member-level data is exposed.</p>{items.length ? items.map((item) => <div key={item.key} className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 border-b border-white/5"><div><div className="text-xs text-white/70">{item.label}</div><div className="text-[10px] text-white/35">{item.unsupportedHighCount} unsupported of {item.highConfidenceCount} high-confidence patterns · Current: {item.review?.verdict || 'pending'}</div></div><div className="flex gap-2"><button disabled={saving === item.key} onClick={() => save(item, 'confirmed_false_positive')} className="rounded-lg bg-rose-500/10 px-3 py-2 text-[10px] text-rose-300">Confirm false positive</button><button disabled={saving === item.key} onClick={() => save(item, 'not_false_positive')} className="rounded-lg bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-300">Not false positive</button><button disabled={saving === item.key} onClick={() => save(item, 'needs_more_evidence')} className="rounded-lg bg-white/5 px-3 py-2 text-[10px] text-white/50">Needs evidence</button></div></div>) : <p className="text-xs text-white/40">No high-confidence mismatches currently require review.</p>}</section>;
}