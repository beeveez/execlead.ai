import React from "react";
import { Code, Lock, Webhook, CheckCircle2 } from "lucide-react";
import { API_SECURITY_CONTROLS } from "@/lib/zeroTrustEngine";
import { SectionCard, ChipList } from "@/components/security/SecuritySection";

const AI_SECURITY_CONTROLS = [
  "Rate Limit AI Requests", "Prompt Abuse Detection", "Model Access Controls",
  "Token Monitoring", "Sensitive Prompt Logging", "Server-Side AI Logic Protection",
];

export default function APISecurity() {
  return (
    <div className="space-y-4">
      {/* API Security Controls */}
      <SectionCard icon={Code} title="API Security Controls" description="Every API endpoint is protected with layered authentication and verification. No request is trusted by default.">
        <div className="grid sm:grid-cols-2 gap-2">
          {API_SECURITY_CONTROLS.map((c) => (
            <div key={c.id} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-white/80 font-medium">{c.label}</div>
                <div className="text-xs text-white/40 mt-0.5">{c.description}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Webhook Verification */}
      <SectionCard icon={Webhook} title="Webhook Verification" description="All inbound webhooks are signature-verified to prevent spoofing and replay attacks.">
        <ChipList items={["Stripe Webhooks", "Resend Webhooks", "OAuth Callbacks", "HMAC Signature Verification", "Timestamp Validation", "Replay Protection"]} />
      </SectionCard>

      {/* AI Security */}
      <SectionCard icon={Lock} title="AI Security" description="AI services are protected against abuse, prompt injection, and unauthorized model access.">
        <div className="grid sm:grid-cols-2 gap-2">
          {AI_SECURITY_CONTROLS.map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <Lock size={12} className="text-violet-400 flex-shrink-0" />
              <span className="text-sm text-white/60">{c}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Document Security */}
      <SectionCard icon={Lock} title="Document Security" description="All uploaded documents are encrypted. Encryption keys are stored separately from document data. Document URLs are never exposed publicly.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {["Government IDs", "Passports", "Driver Licenses", "Contracts", "Invoices", "Certificates", "Resumes", "Enterprise Documents"].map((d, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <Lock size={10} className="text-emerald-400" />
              <span className="text-xs text-white/60">{d}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}