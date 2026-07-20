import React, { useState } from "react";
import { Loader2, ListPlus, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function WaitlistForm() {
  const [form, setForm] = useState({ full_name: "", email: "", country: "", profession: "", comments: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const update = (f) => (e) => setForm((s) => ({ ...s, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await base44.entities.FoundingWaitlist.create({
        ...form,
        preferred_plan: "founding_member",
        status: "reserved",
        reservation_date: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to join waitlist. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={24} className="text-emerald-400" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">You're on the Waitlist</h3>
        <p className="text-xs text-white/40 leading-relaxed">We'll notify you as soon as a founding spot opens up. Thank you for your interest.</p>
      </div>
    );
  }

  const inputClass = "w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition-colors";
  const labelClass = "block text-[11px] font-medium text-white/60 mb-1.5";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <ListPlus size={16} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white">Join the Executive Waitlist</h3>
      </div>
      <p className="text-xs text-white/40 mb-5">Founding Beta is full. Join the waitlist and we'll reach out when spots open.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input required value={form.full_name} onChange={update("full_name")} className={inputClass} placeholder="Jane Doe" />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input required type="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="jane@company.com" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Country</label>
            <input value={form.country} onChange={update("country")} className={inputClass} placeholder="United States" />
          </div>
          <div>
            <label className={labelClass}>Current Role</label>
            <input value={form.profession} onChange={update("profession")} className={inputClass} placeholder="VP of Strategy" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Reason for Interest</label>
          <textarea required value={form.comments} onChange={update("comments")} rows={2} className={inputClass} placeholder="Why do you want to join EXECLEAD.AI?" />
        </div>
        {error && <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">{error}</div>}
        <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <ListPlus size={16} />} Join Waitlist
        </button>
      </form>
    </div>
  );
}