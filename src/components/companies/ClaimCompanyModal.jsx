import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, BadgeCheck, Check } from "lucide-react";

export default function ClaimCompanyModal({ company, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", role: "", website: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.role) return;
    setLoading(true);
    try {
      await base44.entities.CompanyReport.create({
        company_id: company.id,
        company_name: company.name,
        report_type: "verification_request",
        reporter_name: form.name,
        reporter_email: form.email,
        reporter_role: form.role,
        description: `Website: ${form.website}\n\n${form.message}`,
        status: "submitted",
      });
      setDone(true);
    } catch (e) {}
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BadgeCheck size={18} className="text-emerald-400" />
            <h3 className="text-white font-semibold">Claim Company Profile</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-emerald-400" />
            </div>
            <p className="text-white/70 text-sm">Your claim request for <span className="font-semibold text-white">{company.name}</span> has been submitted.</p>
            <p className="text-white/40 text-xs mt-2">Our team will verify your organizational identity and contact you at <span className="text-white/60">{form.email}</span> within 3–5 business days.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">Close</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/40 text-xs leading-relaxed">
              Verified organizations can update factual information, upload an official logo, add executive leadership, publish announcements, and display a "Verified Organization" badge.
            </p>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Your Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Work Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Your Role at {company.name} *</label>
              <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g., VP of Human Resources" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Official Company Website</label>
              <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Verification Message</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Briefly describe your authority to represent this organization..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none" />
            </div>
            <button
              onClick={submit}
              disabled={loading || !form.name || !form.email || !form.role}
              className="w-full h-10 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />}
              Submit Claim Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}