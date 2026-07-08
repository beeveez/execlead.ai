import React from "react";
import { ShieldCheck, FileText, CheckCircle2, Clock } from "lucide-react";
import { COMPLIANCE_FRAMEWORKS, getStatusColor } from "@/lib/zeroTrustEngine";
import { SectionCard } from "@/components/security/SecuritySection";

const STATUS_LABELS = {
  compliant: "Compliant",
  in_progress: "In Progress",
  not_started: "Not Started",
};

export default function ComplianceCenter() {
  const avgReadiness = Math.round(COMPLIANCE_FRAMEWORKS.reduce((s, f) => s + f.readiness, 0) / COMPLIANCE_FRAMEWORKS.length);

  return (
    <div className="space-y-4">
      {/* Overall Readiness */}
      <div className="bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-2">
          <ShieldCheck size={14} /> Compliance Readiness
        </div>
        <div className="flex items-center gap-6">
          <div className="text-4xl font-bold text-white">{avgReadiness}%</div>
          <div className="flex-1">
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${avgReadiness}%` }} />
            </div>
            <p className="text-xs text-white/40 mt-2">Average readiness across {COMPLIANCE_FRAMEWORKS.length} compliance frameworks</p>
          </div>
        </div>
      </div>

      {/* Frameworks */}
      <SectionCard icon={FileText} title="Compliance Frameworks" description="Tracking readiness for global security and privacy regulations.">
        <div className="space-y-3">
          {COMPLIANCE_FRAMEWORKS.map((f) => {
            const statusColor = getStatusColor(f.status);
            return (
              <div key={f.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-sm text-white/80 font-medium">{f.name}</div>
                    <div className="text-xs text-white/40 mt-0.5">{f.description}</div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded border flex-shrink-0" style={{ color: statusColor, borderColor: `${statusColor}30`, background: `${statusColor}10` }}>
                    {STATUS_LABELS[f.status] || f.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${f.readiness}%`, background: statusColor }} />
                  </div>
                  <span className="text-xs font-mono text-white/50 w-10 text-right">{f.readiness}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Data Privacy */}
      <SectionCard icon={ShieldCheck} title="Data Privacy Controls" description="Personally identifiable information is encrypted at rest and in transit. Users have full control over their data.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { label: "Data Export", desc: "Users can export all personal data" },
            { label: "Account Deletion", desc: "Full account deletion with data purge" },
            { label: "Consent Management", desc: "Granular consent for data processing" },
            { label: "Privacy Preferences", desc: "User-controlled privacy settings" },
            { label: "Cookie Preferences", desc: "Granular cookie consent management" },
            { label: "Data Retention Policies", desc: "Configurable retention schedules" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-white/80">{item.label}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}