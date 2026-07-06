import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCPQCatalog } from "@/hooks/useCPQCatalog";
import { calculateQuote, generateProposalNumber } from "@/lib/cpqEngine";
import { logBillingEvent } from "@/lib/payments";
import { sendTransactionalEmail, buildProposalConfirmationEmail, buildSalesNotificationEmail } from "@/lib/emailProvider";
import { generateProposalPDF } from "@/lib/proposalPdf";
import OrgProfileStep from "@/components/cpq/OrgProfileStep";
import ConfigureStep from "@/components/cpq/ConfigureStep";
import PriceSummary from "@/components/cpq/PriceSummary";
import QuoteResult from "@/components/cpq/QuoteResult";
import { ArrowLeft, ArrowRight, FileText, Loader2, Building2, Settings, CheckCircle2, AlertTriangle } from "lucide-react";

const STEPS = [
  { num: 1, label: "Organization", icon: Building2 },
  { num: 2, label: "Configure", icon: Settings },
  { num: 3, label: "Review & Generate", icon: FileText },
];

export default function CPQWizard() {
  const navigate = useNavigate();
  const { catalog, loading } = useCPQCatalog();
  const [step, setStep] = useState(1);
  const [orgProfile, setOrgProfile] = useState({
    organization_name: "", industry: "Technology", country: "US", headquarters: "",
    company_size: "100-250", annual_revenue: "", num_employees: 100,
    expected_active_users: 100, expected_managers: 10, expected_executives: 5,
    implementation_timeline: "Immediate (0-3 months)", current_lms: "", current_hr_platform: "",
    current_identity_provider: "", customer_email: "",
  });
  const [config, setConfig] = useState({
    seats: 100, moduleIds: [], aiPackageId: null, supportPackageId: null,
    serviceIds: [], discountRuleId: null, discountValue: 0,
    currency: "USD", contractLength: 1, taxExempt: false, country: "US",
  });
  const [generatedQuote, setGeneratedQuote] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [emailWarning, setEmailWarning] = useState(false);

  const breakdown = useMemo(() => catalog ? calculateQuote(config, catalog) : null, [config, catalog]);
  const updateConfig = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const canProceed = () => {
    if (step === 1) return orgProfile.organization_name.trim() && orgProfile.customer_email.trim();
    if (step === 2) return config.seats >= 100;
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (config.seats < orgProfile.expected_active_users) {
        updateConfig("seats", orgProfile.expected_active_users);
      }
      updateConfig("country", orgProfile.country);
    }
    setStep(step + 1);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const proposalNumber = generateProposalNumber();
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      const quote = await base44.entities.CPQQuote.create({
        proposal_number: proposalNumber,
        status: "submitted",
        ...orgProfile,
        config_json: JSON.stringify(config),
        breakdown_json: JSON.stringify(breakdown),
        currency: config.currency,
        contract_length_years: config.contractLength,
        annual_value: breakdown.annualEquivalent,
        total_contract_value: breakdown.contractValue,
        grand_total: breakdown.grandTotal,
        valid_until: validUntil.toISOString().split("T")[0],
      });

      if (breakdown.discount.requiresApproval) {
        await base44.entities.CPQApprovalWorkflow.create({
          quote_id: quote.id,
          proposal_number: proposalNumber,
          approval_type: "discount",
          requested_by: orgProfile.customer_email || "system",
          requested_value: breakdown.discount.amount,
          threshold: breakdown.discount.approvalThreshold,
          status: "pending",
        });
      }

      // Show success immediately — side effects run independently below
      setGeneratedQuote(quote);

      const quoteUrl = `${window.location.origin}/cpq/quote/${quote.id}`;
      const totalStr = breakdown.convertedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 });

      // Send confirmation to the logged-in user's account email
      let customerEmail = orgProfile.customer_email;
      try {
        const me = await base44.auth.me();
        if (me?.email) customerEmail = me.email;
      } catch (e) {}

      // Generate proposal PDF and upload
      let pdfUrl = null;
      try {
        pdfUrl = await generateProposalPDF(quote, breakdown, catalog);
        if (pdfUrl) await base44.entities.CPQQuote.update(quote.id, { pdf_url: pdfUrl });
      } catch (e) {}

      // Build and send customer confirmation email (HTML with buttons)
      const customerHtml = buildProposalConfirmationEmail({
        name: orgProfile.organization_name,
        proposalNumber,
        organization: orgProfile.organization_name,
        status: quote.status,
        contractValue: `${breakdown.currency} ${totalStr}`,
        validUntil: quote.valid_until,
        viewUrl: quoteUrl,
        downloadUrl: pdfUrl || quoteUrl,
      });

      // Build and send sales rep notification
      const salesHtml = buildSalesNotificationEmail({
        proposalNumber,
        organization: orgProfile.organization_name,
        industry: orgProfile.industry,
        country: orgProfile.country,
        email: customerEmail,
        seats: breakdown.seats,
        contractLength: breakdown.contractLength,
        currency: breakdown.currency,
        annualValue: breakdown.annualEquivalent.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        total: totalStr,
        requiresApproval: breakdown.discount.requiresApproval,
        quoteUrl,
      });

      // Send emails via the provider abstraction layer
      const [customerResult] = await Promise.all([
        sendTransactionalEmail({
          to: customerEmail,
          subject: `Proposal ${proposalNumber} — EXECLEAD.AI Enterprise`,
          html: customerHtml,
          emailType: "proposal_confirmation",
          entityId: quote.id,
          entityName: orgProfile.organization_name,
        }),
        sendTransactionalEmail({
          to: "sales@execlead.ai",
          subject: `[Sales] New Enterprise Proposal — ${orgProfile.organization_name} (${breakdown.currency} ${totalStr})`,
          html: salesHtml,
          emailType: "proposal_sales_notify",
          entityId: quote.id,
          entityName: orgProfile.organization_name,
        }),
      ]);

      // Show admin warning if email provider not configured
      if (!customerResult.configured) setEmailWarning(true);

      // Create Deal Desk task
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      try {
        await base44.entities.Task.create({
          title: `Review Enterprise Proposal ${proposalNumber}`,
          description: `${orgProfile.organization_name} (${orgProfile.industry}, ${orgProfile.country}) submitted a proposal worth ${breakdown.currency} ${totalStr} over ${breakdown.contractLength} year(s). Contact: ${customerEmail}.${breakdown.discount.requiresApproval ? " Discount approval required." : ""}`,
          assignee: "Deal Desk",
          status: "open",
          priority: breakdown.grandTotal >= 100000 ? "urgent" : breakdown.grandTotal >= 50000 ? "high" : "medium",
          due_date: dueDate.toISOString().split("T")[0],
          related_entity_id: quote.id,
          related_entity_type: "cpq_quote",
          task_type: "deal_desk",
        });
      } catch (e) {}

      // Record billing event + notification (best-effort)
      await Promise.allSettled([
        logBillingEvent({
          event_type: "enterprise_request",
          status: "success",
          amount: breakdown.grandTotal,
          currency: config.currency,
          plan_id: "enterprise",
          billing_cycle: "annual",
          metadata: JSON.stringify({ proposal_number: proposalNumber, contract_length: config.contractLength, email_sent: customerResult.sent }),
        }),
        base44.entities.Notification.create({
          type: "subscription",
          title: "Proposal Submitted",
          message: `Your enterprise proposal ${proposalNumber} for ${orgProfile.organization_name} has been received. Our team will contact you within 24 hours.`,
          icon: "📋",
          action_url: `/cpq/quote/${quote.id}`,
        }),
      ]);
    } catch (e) {
      console.error("[CPQ] Quote generation failed:", e);
    }
    setGenerating(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  if (generatedQuote) return (
    <QuoteResult
      quote={generatedQuote}
      breakdown={breakdown}
      catalog={catalog}
      emailWarning={emailWarning}
      onNewQuote={() => { setGeneratedQuote(null); setStep(1); setConfig({ ...config, moduleIds: [], serviceIds: [] }); }}
      onViewQuotes={() => navigate("/cpq-dashboard")}
    />
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <FileText size={12} className="text-indigo-400" /> Enterprise CPQ
        </div>
        <h1 className="text-2xl font-bold text-white">Configure Your Proposal</h1>
        <p className="text-white/40 text-sm mt-1">Data-driven pricing · Instant recalculation · Multi-currency · Multi-year contracts</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${step === s.num ? "bg-indigo-500/15 text-indigo-400" : step > s.num ? "text-emerald-400" : "text-white/30"}`}>
              {step > s.num ? <CheckCircle2 size={14} /> : <s.icon size={14} />}
              <span className="font-medium hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-px w-8 ${step > s.num ? "bg-emerald-500/30" : "bg-white/10"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && <OrgProfileStep profile={orgProfile} onChange={setOrgProfile} />}

      {step === 2 && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ConfigureStep config={config} updateConfig={updateConfig} catalog={catalog} />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <PriceSummary breakdown={breakdown} catalog={catalog} />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Organization</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-white/30">Name:</span> <span className="text-white/80">{orgProfile.organization_name}</span></div>
                <div><span className="text-white/30">Industry:</span> <span className="text-white/80">{orgProfile.industry}</span></div>
                <div><span className="text-white/30">Country:</span> <span className="text-white/80">{orgProfile.country}</span></div>
                <div><span className="text-white/30">Employees:</span> <span className="text-white/80">{orgProfile.num_employees}</span></div>
                <div><span className="text-white/30">Active Users:</span> <span className="text-white/80">{orgProfile.expected_active_users}</span></div>
                <div><span className="text-white/30">Timeline:</span> <span className="text-white/80">{orgProfile.implementation_timeline}</span></div>
                <div><span className="text-white/30">Email:</span> <span className="text-white/80">{orgProfile.customer_email}</span></div>
                <div><span className="text-white/30">LMS:</span> <span className="text-white/80">{orgProfile.current_lms || "—"}</span></div>
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/30">Seats</span><span className="text-white/80">{breakdown.seats} @ ${breakdown.seatPricePerUser}/user/yr ({breakdown.seatTier})</span></div>
                <div className="flex justify-between"><span className="text-white/30">AI Package</span><span className="text-white/80">{breakdown.aiPackage?.name || "None"}</span></div>
                <div className="flex justify-between"><span className="text-white/30">Support</span><span className="text-white/80">{breakdown.supportPackage?.name || "None"}</span></div>
                <div className="flex justify-between"><span className="text-white/30">Contract</span><span className="text-white/80">{breakdown.contractLength} year(s)</span></div>
                <div className="flex justify-between"><span className="text-white/30">Currency</span><span className="text-white/80">{breakdown.currency}</span></div>
                {breakdown.selectedModules.length > 0 && (
                  <div className="pt-2 border-t border-white/5"><span className="text-white/30">Modules:</span> <span className="text-white/70 text-xs">{breakdown.selectedModules.map(m => `${m.icon} ${m.name}`).join(", ")}</span></div>
                )}
                {breakdown.selectedServices.length > 0 && (
                  <div><span className="text-white/30">Services:</span> <span className="text-white/70 text-xs">{breakdown.selectedServices.map(s => `${s.icon} ${s.name}`).join(", ")}</span></div>
                )}
              </div>
            </div>
            {breakdown.discount.requiresApproval && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle size={20} className="text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-amber-400 font-medium text-sm">Approval Required</div>
                  <div className="text-white/40 text-xs">Discount exceeds ${breakdown.discount.approvalThreshold.toLocaleString()} threshold — an approval request will be created automatically</div>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <PriceSummary breakdown={breakdown} catalog={catalog} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-white/5">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
        ) : <div />}
        {step < 3 ? (
          <button onClick={handleNext} disabled={!canProceed()} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors ml-auto">
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white text-sm font-medium transition-colors ml-auto">
            {generating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><FileText size={16} /> Generate Quote</>}
          </button>
        )}
      </div>
    </div>
  );
}