import React from "react";
import { CheckCircle2, Mail, Clock, ArrowRight, HelpCircle } from "lucide-react";
import ApplicationTimeline from "@/components/beta/ApplicationTimeline";

export default function ApplicationConfirmation({ application }) {
  if (!application) return null;
  const submittedDate = application.created_date ? new Date(application.created_date).toLocaleDateString() : new Date().toLocaleDateString();

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Application Received</h3>
        <p className="text-sm text-white/40 leading-relaxed max-w-sm mx-auto">
          Thank you for your interest in the EXECLEAD.AI Founding Beta. Your application is now in our review queue.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Application ID</span>
          <span className="text-sm font-bold text-amber-400 font-mono">{application.application_id}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Status</span>
          <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Submitted</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Submission Date</span>
          <span className="text-xs text-white/60">{submittedDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Expected Review Time</span>
          <span className="text-xs text-white/60 flex items-center gap-1"><Clock size={11} /> 3–5 Business Days</span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
        <Mail size={14} className="text-cyan-400 shrink-0" />
        <span className="text-[11px] text-cyan-400/80">A confirmation email has been sent to <strong className="text-cyan-400">{application.email}</strong></span>
      </div>

      <ApplicationTimeline status={application.status} />

      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2">
          <HelpCircle size={12} className="text-white/30" />
          <span className="text-[11px] text-white/40">Need help? Contact our support team.</span>
        </div>
        <a href="mailto:support@execlead.ai" className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1">
          Contact Support <ArrowRight size={10} />
        </a>
      </div>
    </div>
  );
}