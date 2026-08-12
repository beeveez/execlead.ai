import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { OUTCOME_TYPES } from '@/lib/outcomeValidationConfig';

const initial = { type: 'promotion', date: new Date().toISOString().slice(0, 10), description: '', baseline: '', result: '', feedback: '' };
export default function OutcomeCaptureForm({ user, onSaved }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    const config = OUTCOME_TYPES.find((item) => item.key === form.type);
    try {
      await base44.entities.ExecutiveOutcome.create({ outcome_id: `OC-${Date.now()}`, user_id: user.id, outcome_category: config.category, outcome_type: config.key, outcome_title: config.label, outcome_description: form.description, outcome_date: form.date, baseline_value: Number(form.baseline) || 0, resulting_value: Number(form.result) || 0, outcome_value: (Number(form.result) || 0) - (Number(form.baseline) || 0), outcome_unit: config.unit, status: 'achieved', verification_source: 'self_reported', verified: false, metadata_json: JSON.stringify({ manager_or_mentor_feedback: form.feedback || null }) });
      setForm(initial); onSaved();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  return <form onSubmit={save} className="space-y-3"><select value={form.type} onChange={update('type')} className="form-input">{OUTCOME_TYPES.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select><div className="grid grid-cols-3 gap-2"><input type="date" value={form.date} onChange={update('date')} className="form-input" required /><input type="number" value={form.baseline} onChange={update('baseline')} placeholder="Before value" className="form-input" /><input type="number" value={form.result} onChange={update('result')} placeholder="Current value" className="form-input" /></div><textarea value={form.description} onChange={update('description')} placeholder="What changed in your real-world leadership role?" className="form-input min-h-20" required /><textarea value={form.feedback} onChange={update('feedback')} placeholder="Optional manager or mentor feedback" className="form-input min-h-16" />{error && <p className="text-xs text-rose-400">{error}</p>}<button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Record outcome</button></form>;
}