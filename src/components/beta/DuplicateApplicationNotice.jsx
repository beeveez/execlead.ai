import React from "react";
import { AlertCircle, Mail, Clock } from "lucide-react";
import { ADMISSIONS_STATUSES } from "@/lib/foundingAdmissionsEngine";

export default function DuplicateApplicationNotice({ application }) {
  if (!application) return null;
  const status = ADMISSIONS_STATUSES[application.status] || ADMISSIONS_STATUSES.submitted;
  const submittedDate = application.created_date ? new Date(application.created_date).toLocaleDateString() : "—";

  return (
    <div className="bg-white/[0.02] border border-amber-500/15 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <AlertCircle size={20} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-1">You have already submitted a Founding Member application</h3>
          <p className="text-xs text-white/40 leading-relaxed">We found an existing application associated with this email address.</p>
        </div>
      </div>

      <div className="space-y-2 bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Application ID</span>
          <span className="text-xs font-bold text-amber-400 font-mono">{application.application_id || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Current Status</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{status.label}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Submission Date</span>
          <span className="text-xs text-white/60 flex items-center gap-1"><Clock size={10} /> {submittedDate}</span>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-2">
        <Mail size={12} className="text-white/30" />
        <span className="text-[11px] text-white/40">Need to update your application?</span>
        <a href="mailto:support@execlead.ai" className="text-[11px] text-amber-400 hover:text-amber-300 ml-auto">Contact Support</a>
      </div>
    </div>
  );
}