import React from "react";
import { ShieldCheck, Shield, TrendingUp, Award, CheckCircle2, Lock, Brain, FileText } from "lucide-react";
import { EXECUTIVE_TRUST_SUMMARY } from "@/lib/privacyEngine";

export default function ExecutiveTrustSummary() {
  const s = EXECUTIVE_TRUST_SUMMARY;
  const metrics = [
    { label: 'Privacy Readiness', value: `${s.privacy_readiness}`, icon: ShieldCheck, color: 'text-emerald-400' },
    { label: 'Security Score', value: `${s.security_score}`, icon: Shield, color: 'text-blue-400' },
    { label: 'Responsible AI', value: `${s.responsible_ai}`, icon: Brain, color: 'text-purple-400' },
    { label: 'Identity Protection', value: `${s.identity_protection}`, icon: Lock, color: 'text-indigo-400' },
    { label: 'Encryption', value: `${s.encryption}`, icon: Lock, color: 'text-emerald-400' },
    { label: 'Audit Status', value: s.audit_status, icon: FileText, color: 'text-emerald-400' },
    { label: 'Certification', value: s.certification_status, icon: Award, color: 'text-emerald-400' },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 via-emerald-500/5 to-transparent border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <ShieldCheck size={18} className="text-emerald-400" />
        <h3 className="text-white font-bold text-sm">Executive Trust Summary™</h3>
        <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={10} /> Enterprise-Grade
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
            <m.icon size={14} className={`${m.color} mx-auto mb-1.5`} />
            <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      <p className="text-white/40 text-xs leading-relaxed">{s.summary}</p>
    </div>
  );
}