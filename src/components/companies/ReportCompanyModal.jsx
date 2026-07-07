import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Flag, Check } from "lucide-react";
import { REPORT_TYPES } from "@/lib/legalCompliance";

export default function ReportCompanyModal({ company, onClose }) {
  const [form, setForm] = useState({ type: "", name: "", email: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!form.type || !form.description) return;
    setLoading(true);
    try {
      await base44.entities.CompanyReport.create({
        company_id: company.id,
        company_name: company.name,
        report_type: form.type,
        reporter_name: form.name,
        reporter_email: form.email,
        reporter_role: "Reporter",
        description: form.description,
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
            <Flag size={18} className="text-amber-400" />
            <h3 className="text-white font-semibold">Report or Request Update</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-amber-400" />
            </div>
            <p className="text-white/70 text-sm">Your report has been submitted and an audit record has been created.</p>
            <p className="text-white/40 text-xs mt-2">Our team will review your request regarding <span className="text-white/60">{company.name}</span> and take appropriate action.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">Close</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/40 text-xs leading-relaxed">
              Organizations and individuals may request factual corrections, report outdated information, request logo removal, submit verification, or report copyright concerns. All requests generate an audit record for review.
            </p>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Report Type *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50">
                <option value="">Select a type...</option>
                {REPORT_TYPES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Your Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe the issue or correction needed..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none" />
            </div>
            <button
              onClick={submit}
              disabled={loading || !form.type || !form.description}
              className="w-full h-10 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />}
              Submit Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}