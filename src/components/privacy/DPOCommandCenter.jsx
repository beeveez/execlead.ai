import React from "react";
import { ShieldCheck, AlertTriangle, Clock, FileText, Calendar, Activity, UserCog } from "lucide-react";
import { DPO_COMMAND_CENTER } from "@/lib/privacyEngine";

export default function DPOCommandCenter() {
  const d = DPO_COMMAND_CENTER;
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
          <ShieldCheck size={16} className="text-emerald-400 mb-2" />
          <div className="text-2xl font-bold text-emerald-400">{d.privacy_readiness}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Privacy Readiness</div>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
          <AlertTriangle size={16} className="text-amber-400 mb-2" />
          <div className="text-2xl font-bold text-amber-400">{d.open_risks}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Open Risks</div>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
          <Clock size={16} className="text-indigo-400 mb-2" />
          <div className="text-2xl font-bold text-indigo-400">{d.pending_reviews}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Pending Reviews</div>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
          <FileText size={16} className="text-purple-400 mb-2" />
          <div className="text-2xl font-bold text-purple-400">{d.policies_published}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Policies Published</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compliance Calendar */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-indigo-400" />
            <h3 className="text-white font-semibold text-sm">Compliance Calendar</h3>
          </div>
          <div className="space-y-2">
            {d.compliance_calendar.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg text-xs">
                <div>
                  <div className="text-white/60">{item.event}</div>
                  <div className="text-white/30 text-[10px]">{new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/40 capitalize">{item.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit History */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-emerald-400" />
            <h3 className="text-white font-semibold text-sm">Audit History</h3>
          </div>
          <div className="space-y-2">
            {d.audit_history.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg text-xs">
                <div>
                  <div className="text-white/60">{item.event}</div>
                  <div className="text-white/30 text-[10px]">{item.date}</div>
                </div>
                <span className="text-emerald-400 text-[10px]">{item.result}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Timeline */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-red-400" />
          <h3 className="text-white font-semibold text-sm">Incident Timeline</h3>
        </div>
        <div className="text-center py-6 text-white/30 text-sm">
          <ShieldCheck size={28} className="mx-auto mb-2 text-emerald-400/40" />
          No privacy incidents recorded.
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-white/30">
        <span>Last Audit: {d.last_audit}</span>
        <span>Next Review: {d.upcoming_review}</span>
      </div>
    </div>
  );
}