import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, X, Check } from "lucide-react";
import ModalShell from "@/components/ui/ModalShell";

export default function CompanyRequestModal({ open, onClose }) {
  const [form, setForm] = useState({ company_name: "", industry: "", country: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (!form.company_name || !form.reason) return;
    setSubmitting(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      await base44.entities.CompanyRequest.create({
        company_name: form.company_name,
        industry: form.industry,
        country: form.country,
        reason: form.reason,
        requester_name: me?.full_name || "",
        requester_email: me?.email || "",
      });
      setDone(true);
      setTimeout(() => { setDone(false); setForm({ company_name: "", industry: "", country: "", reason: "" }); onClose?.(); }, 2500);
    } catch (e) {}
    setSubmitting(false);
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Request Company Intelligence" subtitle="Can't find your company? We'll build it." maxWidth="max-w-md">
      {done ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <Check size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-white font-semibold">Request Received</h3>
          <p className="text-white/40 text-sm mt-1">Our team will research and build an executive intelligence profile for {form.company_name}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Company Name *</label>
            <input value={form.company_name} onChange={e => update("company_name", e.target.value)} placeholder="e.g. Palantir Technologies" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Industry</label>
              <input value={form.industry} onChange={e => update("industry", e.target.value)} placeholder="Technology" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Country</label>
              <input value={form.country} onChange={e => update("country", e.target.value)} placeholder="United States" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Why do you need this profile? *</label>
            <textarea value={form.reason} onChange={e => update("reason", e.target.value)} rows={3} placeholder="e.g. I'm targeting a CIO role at this company and need interview intelligence." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/5 text-sm font-medium transition-colors">Cancel</button>
            <button onClick={submit} disabled={!form.company_name || !form.reason || submitting} className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-40">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Submit Request
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}