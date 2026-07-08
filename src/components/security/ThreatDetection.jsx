import React from "react";
import { Shield, Ban, FileScan, AlertTriangle, CheckCircle2 } from "lucide-react";
import { WAF_RULES, FILE_SECURITY_STEPS, RISK_FACTORS, getStatusColor } from "@/lib/zeroTrustEngine";
import { SectionCard } from "@/components/security/SecuritySection";

export default function ThreatDetection() {
  return (
    <div className="space-y-4">
      {/* WAF */}
      <SectionCard icon={Shield} title="Web Application Firewall" description="Real-time protection against common web application attacks. All rules are active and blocking.">
        <div className="grid sm:grid-cols-2 gap-2">
          {WAF_RULES.map((rule) => (
            <div key={rule.id} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-white/80 font-medium">{rule.label}</div>
                <div className="text-xs text-white/40 mt-0.5">{rule.description}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* File Security Pipeline */}
      <SectionCard icon={FileScan} title="File Security Pipeline" description="Every uploaded file passes through a multi-stage security pipeline before storage.">
        <div className="space-y-0">
          {FILE_SECURITY_STEPS.map((step, i) => (
            <div key={step.id} className="flex items-stretch">
              <div className="flex flex-col items-center mr-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                </div>
                {i < FILE_SECURITY_STEPS.length - 1 && <div className="w-px flex-1 bg-emerald-500/10 my-1" />}
              </div>
              <div className="flex-1 pb-3">
                <div className="text-sm font-medium text-white/80">{step.label}</div>
                <p className="text-xs text-white/40 mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Risk Factors */}
      <SectionCard icon={AlertTriangle} title="Login Risk Engine — Detection Factors" description="Every login is automatically evaluated against these risk factors. High-risk logins require additional verification.">
        <div className="grid sm:grid-cols-2 gap-2">
          {RISK_FACTORS.map((factor) => (
            <div key={factor.id} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <Ban size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white/80 font-medium">{factor.label}</span>
                  <span className="text-[10px] font-mono text-white/30">+{factor.weight}</span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">{factor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}