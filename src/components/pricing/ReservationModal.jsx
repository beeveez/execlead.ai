import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { COUNTRIES } from "@/lib/payments";
import { X, Loader2, CheckCircle, Trophy, Calendar, Globe, Mail, User, MessageSquare } from "lucide-react";

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
    preferred_plan: plan?.id === "executive" ? "executive" : plan?.id === "founding_member" ? "founding_member" : "professional",
    expected_start_date: "",
    comments: "",
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
      const response = await base44.functions.invoke("reserveFoundingMembership", {
        action: "reserve",
        ...form,
        referral_source: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") || "" : "",
      });
      const data = response.data || response;
      if (data.success) {
        setSuccess({
          priority_number: data.priority_number,
          already_reserved: data.already_reserved,
        });
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (e) {
      setError(e.response?.data?.error || "Failed to reserve. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
            <div className="flex items-center gap-2">
              <Trophy size={20} className="text-amber-400" />
              <h3 className="text-lg font-bold text-white">Reserve My Founding Membership</h3>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
          </div>

          {success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <CheckCircle size={32} className="text-amber-400" />
              </div>
              <h4 className="text-white font-bold text-xl mb-2">
                {success.already_reserved ? "You're Already on the List!" : "You're In! 🎉"}
              </h4>
              <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
                {success.already_reserved
                  ? "We found your existing reservation. Your spot is secure!"
                  : "Your Founding Membership spot has been reserved. Check your email for confirmation."}
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <p className="text-amber-400 text-xs font-medium uppercase tracking-wider mb-1">Your Founder Position</p>
                <p className="text-4xl font-bold text-amber-400">#{success.priority_number}</p>
              </div>
              <p className="text-white/30 text-xs mb-6">
                You'll be invited to activate your subscription when payments go live. Your position secures your spot in line.
              </p>
              <button onClick={onClose} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors">
                Got It
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Beta notice */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
                <span className="text-lg">🚀</span>
                <p className="text-white/50 text-xs leading-relaxed">
                  EXECLEAD.AI is currently in <span className="text-amber-400 font-medium">Public Beta</span>. Reserve your Founding Membership today — you'll be invited to activate when payments go live.
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5"><User size={12} /> Full Name</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all"
                  placeholder="Jane Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5"><Mail size={12} /> Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all"
                  placeholder="jane@company.com"
                />
              </div>

              {/* Country + Plan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5"><Globe size={12} /> Country</label>
                  <select
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-amber-500/50 transition-all"
                  >
                    <option value="" className="bg-[#0d0d14]">Select…</option>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code} className="bg-[#0d0d14]">{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Preferred Plan</label>
                  <select
                    value={form.preferred_plan}
                    onChange={(e) => setForm({ ...form, preferred_plan: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-amber-500/50 transition-all"
                  >
                    {Object.entries(PLAN_LABELS).map(([id, label]) => <option key={id} value={id} className="bg-[#0d0d14]">{label}</option>)}
                  </select>
                </div>
              </div>

              {/* Expected start date */}
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5"><Calendar size={12} /> Expected Start Date <span className="text-white/20 normal-case">(optional)</span></label>
                <input
                  type="date"
                  value={form.expected_start_date}
                  onChange={(e) => setForm({ ...form, expected_start_date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>

              {/* Comments */}
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5"><MessageSquare size={12} /> Comments <span className="text-white/20 normal-case">(optional)</span></label>
                <textarea
                  value={form.comments}
                  onChange={(e) => setForm({ ...form, comments: e.target.value })}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                  placeholder="Anything you'd like us to know?"
                />
              </div>

              {error && <p className="text-sm text-red-400 text-center">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Reserving…</> : <><Trophy size={16} /> Reserve My Founding Membership</>}
              </button>
              <p className="text-center text-xs text-white/30">No payment required. You'll be notified when payments go live.</p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}