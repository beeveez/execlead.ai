import React, { useMemo } from "react";
import { computeActivationMetrics } from "@/lib/admissionsIntelligenceEngine";
import { Mail, CheckCircle2, UserPlus, LogIn, UserCheck, Rocket, Award } from "lucide-react";

export default function ActivationDashboard({ records }) {
  const metrics = useMemo(() => computeActivationMetrics(records), [records]);

  if (metrics.totalApproved === 0) {
    return (
      <div className="text-center py-12">
        <Rocket size={28} className="text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/40">No approved applicants yet. Activation metrics appear once applications are approved.</p>
      </div>
    );
  }

  const steps = [
    { label: "Invitation Sent", value: metrics.invitationSent, icon: Mail, color: "text-cyan-400", pct: metrics.totalApproved > 0 ? Math.round((metrics.invitationSent / metrics.totalApproved) * 100) : 0 },
    { label: "Invitation Accepted", value: metrics.invitationAccepted, icon: CheckCircle2, color: "text-emerald-400", pct: metrics.totalApproved > 0 ? Math.round((metrics.invitationAccepted / metrics.totalApproved) * 100) : 0 },
    { label: "Account Activated", value: metrics.accountActivated, icon: UserPlus, color: "text-emerald-400", pct: metrics.totalApproved > 0 ? Math.round((metrics.accountActivated / metrics.totalApproved) * 100) : 0 },
    { label: "First Login", value: metrics.firstLogin, icon: LogIn, color: "text-indigo-400", pct: metrics.totalApproved > 0 ? Math.round((metrics.firstLogin / metrics.totalApproved) * 100) : 0 },
    { label: "Profile Completion", value: `${metrics.profileCompletion}%`, icon: UserCheck, color: "text-amber-400", pct: metrics.profileCompletion },
    { label: "Journey Started", value: metrics.executiveJourneyStarted, icon: Rocket, color: "text-purple-400", pct: metrics.totalApproved > 0 ? Math.round((metrics.executiveJourneyStarted / metrics.totalApproved) * 100) : 0 },
    { label: "Founding Badge", value: metrics.foundingBadgeAssigned, icon: Award, color: "text-amber-400", pct: metrics.totalApproved > 0 ? Math.round((metrics.foundingBadgeAssigned / metrics.totalApproved) * 100) : 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Rocket size={14} className="text-amber-400" />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Activation Dashboard</span>
        <span className="text-[10px] text-white/30 ml-auto">{metrics.totalApproved} approved applicants</span>
      </div>

      {/* Funnel steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0`}>
              <step.icon size={16} className={step.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70 font-medium">{step.label}</span>
                <span className={`text-sm font-bold ${step.color}`}>{step.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className={`h-full transition-all duration-500`} style={{ width: `${step.pct}%`, backgroundColor: "currentColor" }} />
              </div>
            </div>
            <span className="text-[10px] text-white/30 w-8 text-right">{step.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}