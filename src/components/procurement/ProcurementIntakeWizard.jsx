import React, { useState, useMemo } from "react";
import { X, ChevronRight, ChevronLeft, Check, Building2, DollarSign, FileText, ShoppingCart } from "lucide-react";
import {
  PROCUREMENT_CATEGORIES, PROCUREMENT_PRIORITIES,
  generateApprovalChain, computeSLADeadline, formatCurrency,
} from "@/lib/procurementEngine";

const STEPS = [
  { id: "details", label: "Request Details", icon: FileText },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "budget", label: "Budget & Vendor", icon: DollarSign },
  { id: "review", label: "Review & Submit", icon: Check },
];

export default function ProcurementIntakeWizard({ open, onClose, onSubmit, organizations, departments, user }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "", description: "", category: "it_equipment", priority: "medium",
    organization_id: organizations?.[0]?.id || "", organization_name: organizations?.[0]?.name || "",
    department_id: "", department_name: "", business_unit_name: "", cost_center: "",
    amount: 0, currency: "USD", budget_amount: 0,
    vendor_name: "", justification: "",
  });

  const approvalChain = useMemo(() => generateApprovalChain(form.amount || 0), [form.amount]);
  const slaDeadline = useMemo(() => computeSLADeadline(form.priority), [form.priority]);
  const budgetValid = (form.budget_amount || 0) >= (form.amount || 0);

  if (!open) return null;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOrgChange = (orgId) => {
    const org = organizations?.find((o) => o.id === orgId);
    update("organization_id", orgId);
    update("organization_name", org?.name || "");
  };

  const handleDeptChange = (deptId) => {
    const dept = departments?.find((d) => d.id === deptId);
    update("department_id", deptId);
    update("department_name", dept?.name || "");
  };

  const canProceed = () => {
    if (step === 0) return form.title && form.category;
    if (step === 1) return form.organization_id;
    if (step === 2) return form.amount > 0 && form.justification;
    return true;
  };

  const handleSubmit = () => {
    onSubmit({ ...form, budget_validated: budgetValid });
    setStep(0);
    setForm({ title: "", description: "", category: "it_equipment", priority: "medium", organization_id: organizations?.[0]?.id || "", organization_name: organizations?.[0]?.name || "", department_id: "", department_name: "", business_unit_name: "", cost_center: "", amount: 0, currency: "USD", budget_amount: 0, vendor_name: "", justification: "" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <ShoppingCart size={18} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Procurement Request Intake</h2>
              <p className="text-white/30 text-xs">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-white/5">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${i === step ? "bg-indigo-500/10 text-indigo-400" : i < step ? "text-emerald-400" : "text-white/20"}`}>
                {i < step ? <Check size={12} /> : <s.icon size={12} />}
                <span className="hidden md:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-emerald-500/30" : "bg-white/5"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-5 space-y-4">
          {step === 0 && (
            <>
              <Field label="Request Title" required>
                <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Q3 Enterprise Software Licenses" className={inputCls} />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Detailed description of what is being procured..." rows={3} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category" required>
                  <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
                    {PROCUREMENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Priority" required>
                  <select value={form.priority} onChange={(e) => update("priority", e.target.value)} className={inputCls}>
                    {PROCUREMENT_PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label} ({p.sla_days}d SLA)</option>)}
                  </select>
                </Field>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <Field label="Organization" required>
                <select value={form.organization_id} onChange={(e) => handleOrgChange(e.target.value)} className={inputCls}>
                  <option value="">Select organization...</option>
                  {organizations?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Department">
                  <select value={form.department_id} onChange={(e) => handleDeptChange(e.target.value)} className={inputCls}>
                    <option value="">Select department...</option>
                    {departments?.filter((d) => !form.organization_id || d.organization_id === form.organization_id).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
                <Field label="Business Unit">
                  <input value={form.business_unit_name} onChange={(e) => update("business_unit_name", e.target.value)} placeholder="e.g. Engineering" className={inputCls} />
                </Field>
              </div>
              <Field label="Cost Center">
                <input value={form.cost_center} onChange={(e) => update("cost_center", e.target.value)} placeholder="e.g. CC-1001-Engineering" className={inputCls} />
              </Field>
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Amount" required>
                  <input type="number" value={form.amount || ""} onChange={(e) => update("amount", parseFloat(e.target.value) || 0)} placeholder="0" className={inputCls} />
                </Field>
                <Field label="Currency">
                  <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className={inputCls}>
                    <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AUD">AUD</option>
                  </select>
                </Field>
                <Field label="Budget Allocation">
                  <input type="number" value={form.budget_amount || ""} onChange={(e) => update("budget_amount", parseFloat(e.target.value) || 0)} placeholder="0" className={inputCls} />
                </Field>
              </div>
              <Field label="Vendor Name">
                <input value={form.vendor_name} onChange={(e) => update("vendor_name", e.target.value)} placeholder="e.g. Microsoft Corporation" className={inputCls} />
              </Field>
              <Field label="Business Justification" required>
                <textarea value={form.justification} onChange={(e) => update("justification", e.target.value)} placeholder="Explain why this procurement is necessary and the business value it delivers..." rows={3} className={inputCls} />
              </Field>
              <div className={`p-3 rounded-lg border text-xs ${budgetValid ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
                {budgetValid ? "✓ Budget validated — request amount is within allocated budget." : `⚠ Budget warning — request amount exceeds allocated budget by ${formatCurrency(form.amount - form.budget_amount, form.currency)}.`}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
                <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Request Summary</div>
                <SummaryRow label="Title" value={form.title} />
                <SummaryRow label="Category" value={PROCUREMENT_CATEGORIES.find((c) => c.id === form.category)?.label} />
                <SummaryRow label="Priority" value={PROCUREMENT_PRIORITIES.find((p) => p.id === form.priority)?.label} />
                <SummaryRow label="Organization" value={form.organization_name} />
                <SummaryRow label="Department" value={form.department_name || "—"} />
                <SummaryRow label="Cost Center" value={form.cost_center || "—"} />
                <SummaryRow label="Amount" value={formatCurrency(form.amount, form.currency)} />
                <SummaryRow label="Vendor" value={form.vendor_name || "—"} />
                <SummaryRow label="Budget" value={formatCurrency(form.budget_amount, form.currency)} />
                <SummaryRow label="Budget Validated" value={budgetValid ? "✓ Yes" : "⚠ No"} />
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Approval Chain™</div>
                <div className="space-y-2">
                  {approvalChain.map((s) => (
                    <div key={s.step} className="flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold">{s.step}</div>
                      <span className="text-white/60">{s.label}</span>
                      <span className="text-white/30 text-[10px]">({s.role})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="text-xs text-white/30 uppercase tracking-wider mb-1">SLA Deadline™</div>
                <p className="text-white/60 text-sm">{new Date(slaDeadline).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-white/5">
          <button onClick={() => step > 0 ? setStep(step - 1) : onClose()} className="flex items-center gap-1 px-4 py-2 text-sm text-white/40 hover:text-white/80 transition-colors">
            <ChevronLeft size={14} /> {step > 0 ? "Back" : "Cancel"}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => canProceed() && setStep(step + 1)} disabled={!canProceed()} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
              <Check size={14} /> Submit Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50";
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/40">{label}</span>
      <span className="text-white/70 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}