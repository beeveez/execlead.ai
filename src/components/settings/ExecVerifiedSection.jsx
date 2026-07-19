import React from "react";
import { Link } from "react-router-dom";
import { useExecVerified } from "@/hooks/useExecVerified";
import { ShieldCheck, ArrowRight, Clock, FileText, CheckCircle2 } from "lucide-react";

export default function ExecVerifiedSection({ verification }) {
  const { enabled, loading } = useExecVerified();

  if (loading || !enabled) return null;

  const hasApplication = !!verification;
  const isVerified = verification?.verification_status === "verified";

  return (
    <div className="bg-white/[0.02] border border-indigo-500/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={16} className="text-indigo-400" />
        <h2 className="text-white font-semibold text-sm">EXEC™ Verified</h2>
        {hasApplication && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            isVerified ? "text-emerald-400 bg-emerald-500/10" :
            verification?.verification_status === "rejected" ? "text-red-400 bg-red-500/10" :
            "text-amber-400 bg-amber-500/10"
          }`}>
            {verification.verification_status?.replace(/_/g, " ") || "pending"}
          </span>
        )}
      </div>

      {hasApplication ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-white/30 uppercase tracking-wider text-[10px]">Level</div>
              <div className="text-white/70 font-medium mt-0.5">Level {verification.verification_level_number || 1}</div>
            </div>
            <div>
              <div className="text-white/30 uppercase tracking-wider text-[10px]">Evidence</div>
              <div className="text-white/70 font-medium mt-0.5">{verification.evidence_count || 0} items · {verification.evidence_confidence || 0}% confidence</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/verification/status" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View Status <ArrowRight size={10} />
            </Link>
            <span className="text-white/20">·</span>
            <Link to="/verification/history" className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
              History
            </Link>
            <span className="text-white/20">·</span>
            <Link to="/verification/evidence" className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
              Evidence
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-white/40 leading-relaxed">
            EXEC™ Verified is a trust framework representing verified executive identity and evidence-backed leadership.
            Verification requires review and cannot be purchased.
          </p>
          <Link to="/verification/apply" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors">
            Apply for Verification <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}