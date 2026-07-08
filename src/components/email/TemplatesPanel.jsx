import React from "react";
import { FileText, Mail, Bell, CreditCard, Building2, ShieldCheck } from "lucide-react";

const TEMPLATES = [
  {
    icon: FileText,
    name: "Proposal Confirmation",
    description: "Sent to customers when an enterprise proposal is submitted. Includes proposal number, organization, contract value, and action links.",
    trigger: "Enterprise proposal submission",
    type: "Customer",
  },
  {
    icon: Bell,
    name: "Sales Notification",
    description: "Internal notification to the sales team when a new enterprise proposal is received. Includes full deal details and discount approval alerts.",
    trigger: "New enterprise proposal",
    type: "Internal",
  },
  {
    icon: FileText,
    name: "Contract Pending Signature",
    description: "Notifies customers that their contract is ready for electronic signature. Includes contract value and direct signing link.",
    trigger: "Contract generated",
    type: "Customer",
  },
  {
    icon: CreditCard,
    name: "Payment Confirmation",
    description: "Confirms receipt of payment via bank transfer, credit card, or enterprise invoice. Includes transaction ID and status tracking.",
    trigger: "Payment received",
    type: "Customer",
  },
  {
    icon: Building2,
    name: "Organization Onboarding",
    description: "Welcome email for new enterprise organizations. Highlights subscription details and provides admin portal access.",
    trigger: "Enterprise activation",
    type: "Customer",
  },
  {
    icon: Mail,
    name: "Test Email",
    description: "Diagnostic test email sent from the Test Connection panel to verify provider connectivity and delivery.",
    trigger: "Manual — Test Connection",
    type: "Diagnostic",
  },
];

export default function TemplatesPanel() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Email Templates</h3>
          <p className="text-white/30 text-xs mt-1">System-defined transactional email templates. Templates are code-managed and version-controlled.</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-white/30"><ShieldCheck size={12} /> Code-managed</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map((t, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <t.icon size={16} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-medium ${t.type === "Customer" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : t.type === "Internal" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                    {t.type}
                  </span>
                </div>
                <p className="text-white/40 text-xs mt-1.5 leading-relaxed">{t.description}</p>
              </div>
            </div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider pt-2 border-t border-white/5">
              Trigger: <span className="text-white/50 normal-case">{t.trigger}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}