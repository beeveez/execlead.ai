import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { COUNTRIES } from "@/lib/payments";
import { X, Loader2, Trophy, Calendar, Globe, Mail, User, Briefcase, CheckCircle, Shield } from "lucide-react";
import ReservationSuccess from "@/components/founding/ReservationSuccess";

const PLAN_LABELS = {
  professional: "Professional",
  executive: "Executive",
  founding_member: "Founding Member",
  enterprise: "Enterprise",
};

export default function ReservationModal({ plan, onClose }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    country: "",
    profession: "",
    preferred_plan: plan?.id === "executive" ? "executive" : plan?.id === "founding_member" ? "founding_member" : "professional",
    expected_start_date: "",
    comments: "",
    public_profile: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.full_name.trim()) {
      setError("Please fill in your name and email");
      return;
    }
    setSubmitting(true);
    try {
      const ref = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") || "" : "";
      const response = await base44.functions.invoke("reserveFoundingMembership", {
        action: "reserve", ...form, referral_source: ref,
      });
      const data = response.data || response;
      if (data.success) {
        setSuccess(data.already_reserved ? { ...data.reservation, already_reserved: true } : data.reservation);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (e) {
      setError(e.response?.data?.error || "Failed to reserve. Please try again.");
    }
    setSubmitting(false);
  };

  const isWide = !!success;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className={`bg-[#0d0d14] border border-white/10 rounded-2xl ${isWide ? "max-w-3xl" : "max-w-lg"} w-full my-8`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Trophy size={20} className="text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                {success ? "Reservation Confirmed" : "Reserve My Founding Membership"}
              </h3>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
          </div>

          {success ? (
            <ReservationSuccess reservation={success} onClose={onClose} />
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
                <span className="text-lg">🚀</span>
                <p className="text-white/50 text-xs leading-relaxed">
                  EXECLEAD.AI is in <span className="text-amber-400 font-medium">Public Beta</span>. Reserve your Founding Membership today — you'll receive a digital certificate and be invited to activate when payments go live.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><User size={12} /> Full Name</label>
                <input type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all" placeholder="Jane Doe" />
              </div>

              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Mail size={12} /> Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all" placeholder="jane@company.com" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Globe size={12} /> Country</label>
                  <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-amber-500/50 transition-all">
                    <option value="" className="bg-[#0d0d14]">Select…</option>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code} className="bg-[#0d0d14]">{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Briefcase size={12} /> Profession</label>
                  <input type="text" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all" placeholder="CTO, CFO, VP…" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Preferred Plan</label>
                  <select value={form.preferred_plan} onChange={(e) => setForm({ ...form, preferred_plan: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-amber-500/50 transition-all">
                    {Object.entries(PLAN_LABELS).map(([id, label]) => <option key={id} value={id} className="bg-[#0d0d14]">{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Calendar size={12} /> Start Date <span className="text-white/20 normal-case">(optional)</span></label>
                  <input type="date" value={form.expected_start_date} onChange={(e) => setForm({ ...form, expected_start_date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-amber-500/50 transition-all" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.public_profile} onChange={(e) => setForm({ ...form, public_profile: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30" />
                <span className="text-xs text-white/50">Show my name in the public <Link to="/founders" className="text-amber-400 hover:underline" onClick={(e) => e.stopPropagation()}>Founder Directory</Link></span>
              </label>

              {error && <p className="text-sm text-red-400 text-center">{error}</p>}

              <button type="submit" disabled={submitting}
                className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Reserving…</> : <><Trophy size={16} /> Reserve My Founding Membership</>}
              </button>
              <p className="text-center text-xs text-white/30 flex items-center justify-center gap-1">
                <Shield size={12} /> No payment required · Unique certificate generated instantly
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}