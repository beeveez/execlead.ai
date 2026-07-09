import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Loader2, Trophy, XCircle, ArrowRight } from "lucide-react";
import FoundingCertificate from "@/components/founding/FoundingCertificate";

const PLAN_LABELS = { professional: "Professional", executive: "Executive", founding_member: "Founding Member", enterprise: "Enterprise" };

export default function CertificateVerify() {
  const { verificationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    base44.functions.invoke("reserveFoundingMembership", { action: "verify", verification_id: verificationId })
      .then((res) => {
        const d = res.data || res;
        if (d.valid) { setData(d); setValid(true); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [verificationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle size={40} className="text-red-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white mb-2">Certificate Not Found</h1>
          <p className="text-white/40 text-sm mb-6">This verification ID is invalid or the reservation no longer exists.</p>
          <Link to="/" className="inline-flex items-center gap-1.5 text-amber-400 text-sm hover:underline">
            Return to EXECLEAD.AI <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const reservation = {
    founding_member_number: data.founding_member_number,
    certificate_id: data.certificate_id,
    verification_id: verificationId,
    full_name: data.full_name,
    preferred_plan: data.preferred_plan,
    status: data.status,
    reservation_date: data.reservation_date,
    activated: data.activated,
    pricing_expires_at: data.pricing_expires_at,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-20">
        {/* Verified badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Certificate Verified — Authentic</span>
          </div>
        </motion.div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Trophy size={20} className="text-amber-400" />
            <h1 className="text-xl font-bold">EXECLEAD.AI Founding Member</h1>
          </div>
          <p className="text-white/40 text-sm">This certificate has been verified as authentic and valid.</p>
        </div>

        {/* Certificate */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="overflow-x-auto pb-2">
          <FoundingCertificate reservation={reservation} />
        </motion.div>

        {/* Verification details */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-white/80 text-sm font-semibold mb-3">Verification Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/30 text-xs uppercase tracking-wider mb-0.5">Founder Number</p>
              <p className="text-amber-400 font-semibold">{data.founding_member_number}</p>
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-wider mb-0.5">Status</p>
              <p className="text-white/80 capitalize">{data.activated ? "Activated" : data.status}</p>
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-wider mb-0.5">Plan</p>
              <p className="text-white/80">{PLAN_LABELS[data.preferred_plan] || data.preferred_plan}</p>
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-wider mb-0.5">Reserved On</p>
              <p className="text-white/80">{new Date(data.reservation_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <Link to="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-medium transition-colors">
            <Trophy size={16} /> Reserve Your Own Founding Membership
          </Link>
        </div>
      </div>
    </div>
  );
}