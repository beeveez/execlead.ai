import React from "react";
import { Check, FileText, Send, Mail, UserCheck, FileSignature, CreditCard, DollarSign, Building2 } from "lucide-react";

const STAGES = [
  { key: "created", label: "Proposal Created", icon: FileText },
  { key: "submitted", label: "Proposal Submitted", icon: Send },
  { key: "email", label: "Confirmation Email Sent", icon: Mail },
  { key: "assigned", label: "Assigned to Sales", icon: UserCheck },
  { key: "contract", label: "Contract Generated", icon: FileSignature },
  { key: "invoice", label: "Invoice Issued", icon: CreditCard },
  { key: "payment", label: "Payment Received", icon: DollarSign },
  { key: "activated", label: "Organization Activated", icon: Building2 },
];

export default function ProposalStatusTracker({ quote, emailWarning, pdfUrl }) {
  const status = quote.status || "submitted";
  const invoiceStatuses = ["approved", "accepted", "under_review"];
  const paymentStatuses = ["accepted"];

  const completed = {
    created: true,
    submitted: status !== "draft",
    email: !emailWarning,
    assigned: status !== "draft",
    contract: !!(pdfUrl || quote.pdf_url),
    invoice: invoiceStatuses.includes(status),
    payment: paymentStatuses.includes(status),
    activated: status === "accepted",
  };

  const completedCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Proposal Lifecycle</h3>
        <span className="text-xs text-white/30">{completedCount} / {STAGES.length} complete</span>
      </div>
      <div className="space-y-1">
        {STAGES.map((stage, i) => {
          const done = completed[stage.key];
          const isCurrent = !done && (i === 0 || completed[STAGES[i - 1].key]);
          const Icon = stage.icon;
          return (
            <div key={stage.key} className="flex items-center gap-3 py-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                done
                  ? "bg-emerald-500/15 text-emerald-400"
                  : isCurrent
                    ? "bg-indigo-500/15 text-indigo-400 ring-2 ring-indigo-500/20"
                    : "bg-white/5 text-white/20"
              }`}>
                {done ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <span className={`text-sm transition-colors ${
                done ? "text-white/70" : isCurrent ? "text-white/50" : "text-white/20"
              }`}>{stage.label}</span>
              {done && <span className="ml-auto text-emerald-400/60 text-xs">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}