import React from "react";
import { Check, FileText, Send, UserCheck, FileSignature, CreditCard, DollarSign, Building2, CheckCircle2 } from "lucide-react";

const STAGES = [
  { key: "created", label: "Proposal Created", icon: FileText },
  { key: "submitted", label: "Submitted", icon: Send },
  { key: "accepted", label: "Accepted", icon: UserCheck },
  { key: "contract_signed", label: "Contract Signed", icon: FileSignature },
  { key: "invoice_issued", label: "Invoice Issued", icon: CreditCard },
  { key: "payment_pending", label: "Payment Pending", icon: DollarSign },
  { key: "paid", label: "Paid", icon: Check },
  { key: "provisioned", label: "Organization Provisioned", icon: Building2 },
  { key: "active", label: "Enterprise Active", icon: CheckCircle2 },
];

const STATUS_ORDER = ["draft", "submitted", "under_review", "accepted", "contract_signed", "invoice_issued", "payment_pending", "paid", "provisioned", "active"];

export default function ProposalStatusTracker({ quote }) {
  const status = quote.status || "submitted";
  const currentIdx = STATUS_ORDER.indexOf(status);

  const completed = {};
  STAGES.forEach((stage, i) => {
    completed[stage.key] = i <= currentIdx && currentIdx >= 0;
  });

  const completedCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Order-to-Cash Lifecycle</h3>
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