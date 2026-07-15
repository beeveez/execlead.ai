import React, { useState } from 'react';
import { ShieldCheck, Plus, Lock, BadgeCheck, X, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { EVIDENCE_CATEGORIES } from '@/lib/portfolioEngineV2';
import PortfolioSection from './PortfolioSection';

const CAT_COLORS = { award: '#f59e0b', certificate: '#8b5cf6', government_id: '#ef4444', employment_verification: '#3b82f6', promotion_letter: '#10b981', default: '#6366f1' };

export default function EvidenceVault({ user, data }) {
  const [items, setItems] = useState(data.evidenceItems || []);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'certificate', organization: '', date: '', description: '', visibility: 'private' });

  const submit = async () => {
    if (!form.title) return;
    let fileUrl = '';
    if (form.file) {
      setUploading(true);
      try { const res = await base44.integrations.Core.UploadFile({ file: form.file }); fileUrl = res.file_url; } catch {}
      setUploading(false);
    }
    const created = await base44.entities.EvidenceItem.create({ ...form, evidence_file_url: fileUrl, encryption_status: 'encrypted' });
    setItems([created, ...items]);
    await base44.entities.PortfolioVersion.create({ version_number: `v${Date.now()}`, change_description: `Evidence added: ${form.title}`, change_type: 'evidence_added' }).catch(() => {});
    setShowForm(false);
    setForm({ title: '', category: 'certificate', organization: '', date: '', description: '', visibility: 'private' });
  };

  return (
    <PortfolioSection id="evidence" title="Evidence Vault™" icon={ShieldCheck} color="#10b981"
      action={<button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300"><Plus size={10} /> Add</button>}>
      {showForm && (
        <div className="mb-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 space-y-2">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Evidence title" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/30" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white/60">
              {EVIDENCE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} placeholder="Organization" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/30" />
          </div>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/30" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="file" onChange={e => setForm({ ...form, file: e.target.files[0] })} className="hidden" />
            <span className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60"><Upload size={10} /> {form.file ? form.file.name : 'Upload file'}</span>
          </label>
          <div className="flex gap-2">
            <button onClick={submit} disabled={uploading} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">{uploading ? 'Uploading...' : 'Save'}</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs">Cancel</button>
          </div>
        </div>
      )}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((item) => {
            const color = CAT_COLORS[item.category] || CAT_COLORS.default;
            const verified = item.verification_status === 'verified';
            return (
              <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/80 font-medium truncate">{item.title}</div>
                    <div className="text-[10px] text-white/30 truncate">{item.organization || ''}</div>
                  </div>
                  {verified ? <BadgeCheck size={14} className="text-blue-400 flex-shrink-0" /> : <Lock size={14} className="text-white/20 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}15`, color }}>{item.category?.replace(/_/g, ' ')}</span>
                  <span className="text-[8px] text-white/20">{item.visibility?.replace(/_/g, ' ')}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-white/30 text-center py-3">No evidence items yet. Add awards, certificates, documents, and more.</p>
      )}
    </PortfolioSection>
  );
}