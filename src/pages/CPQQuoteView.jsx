import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCPQCatalog } from "@/hooks/useCPQCatalog";
import { calculateQuote, formatCPQPrice } from "@/lib/cpqEngine";
import PriceSummary from "@/components/cpq/PriceSummary";
import ProposalStatusTracker from "@/components/cpq/ProposalStatusTracker";
import ProposalActions from "@/components/cpq/ProposalActions";
import AcceptProposalModal from "@/components/cpq/AcceptProposalModal";
import ContractReview from "@/components/cpq/ContractReview";
import PaymentPanel from "@/components/cpq/PaymentPanel";
import ActivationSuccess from "@/components/cpq/ActivationSuccess";
import ShareProposalModal from "@/components/cpq/ShareProposalModal";
import RequestChangesModal from "@/components/cpq/RequestChangesModal";
import {
  acceptProposal, signContract, processQuotePayment,
  activateEnterprise, requestChanges, shareProposal,
} from "@/lib/enterpriseOrder";
import { generateContractPDF } from "@/lib/contractPdf";
import { generateProposalPDF } from "@/lib/proposalPdf";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, FileText, Sparkles, Rocket, RefreshCw } from "lucide-react";

export default function CPQQuoteView() {
  const { id } = useParams();
  const { catalog, loading: loadingCatalog } = useCPQCatalog();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [signing, setSigning] = useState(false);
  const [paying, setPaying] = useState(false);
  const [activating, setActivating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [activationData, setActivationData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.CPQQuote.get(id);
        setQuote(data);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading || loadingCatalog) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  if (!quote) return (
    <div className="text-center py-12">
      <p className="text-white/40">Quote not found</p>
      <Link to="/cpq-dashboard" className="text-indigo-400 text-sm mt-2 inline-block">Back to Dashboard</Link>
    </div>
  );

  let breakdown = null;
  let config = null;
  try { config = JSON.parse(quote.config_json); } catch (e) {}
  if (config && catalog) breakdown = calculateQuote(config, catalog);
  else { try { breakdown = JSON.parse(quote.breakdown_json); } catch (e) {} }

  const status = quote.status;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const result = await acceptProposal(quote, breakdown, catalog);
      setQuote(result.quote);
      setShowAcceptModal(false);
      toast({ title: "Proposal Accepted", description: "Your contract is ready for signature." });
    } catch (e) {
      toast({ title: "Accept Failed", description: e.message || "Could not accept proposal.", variant: "destructive" });
    }
    setAccepting(false);
  };

  const handleSign = async (sigData) => {
    setSigning(true);
    try {
      const updated = await signContract(quote.id, sigData);
      setQuote(updated);
      toast({ title: "Contract Signed", description: "Invoice issued. Proceed to payment to activate." });
    } catch (e) {
      toast({ title: "Signature Failed", description: e.message || "Could not sign contract.", variant: "destructive" });
    }
    setSigning(false);
  };

  const handlePay = async (paymentData) => {
    setPaying(true);
    try {
      const result = await processQuotePayment(quote, paymentData);
      if (result.success) {
        try {
          const activation = await activateEnterprise(result.quote, breakdown);
          setQuote(activation.quote);
          setActivationData({ organization: activation.organization });
          toast({ title: "Enterprise Activated 🎉", description: "Your organization is now live." });
        } catch (e) {
          setQuote(result.quote);
          toast({ title: "Payment Successful", description: "Activation in progress. Click 'Complete Activation'.", variant: "default" });
        }
      } else {
        toast({ title: "Payment Failed", description: result.error || "Payment could not be processed.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Payment Failed", description: e.message || "Could not process payment.", variant: "destructive" });
    }
    setPaying(false);
  };

  const handleActivate = async () => {
    setActivating(true);
    try {
      const activation = await activateEnterprise(quote, breakdown);
      setQuote(activation.quote);
      setActivationData({ organization: activation.organization });
      toast({ title: "Enterprise Activated 🎉", description: "Your organization is now live." });
    } catch (e) {
      toast({ title: "Activation Failed", description: e.message || "Could not activate.", variant: "destructive" });
    }
    setActivating(false);
  };

  const handleShare = async () => {
    try {
      const result = await shareProposal(quote.id);
      setShareUrl(result.shareUrl);
      setShowShareModal(true);
    } catch (e) {
      toast({ title: "Share Failed", description: "Could not generate share link.", variant: "destructive" });
    }
  };

  const handleRequestChanges = async (notes) => {
    try {
      const updated = await requestChanges(quote.id, notes);
      setQuote(updated);
      setShowChangesModal(false);
      toast({ title: "Change Request Sent", description: "Our sales team will respond within 24 hours." });
    } catch (e) {
      toast({ title: "Request Failed", description: "Could not submit change request.", variant: "destructive" });
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const updates = {};
      if (breakdown) {
        const pdfUrl = await generateProposalPDF(quote, breakdown, catalog);
        updates.pdf_url = pdfUrl;
        const contractStages = ["accepted", "contract_signed", "invoice_issued", "payment_pending", "paid", "provisioned", "active"];
        if (contractStages.includes(status)) {
          const contractUrl = await generateContractPDF(quote, breakdown, catalog);
          updates.contract_url = contractUrl;
        }
        const updated = await base44.entities.CPQQuote.update(quote.id, updates);
        setQuote(updated);
        toast({ title: "Documents Regenerated", description: "Your PDFs have been regenerated with the fixed engine." });
      }
    } catch (e) {
      toast({ title: "Regeneration Failed", description: e.message || "Could not regenerate PDFs.", variant: "destructive" });
    }
    setRegenerating(false);
  };

  const statusColor = {
    active: "bg-emerald-500/10 text-emerald-400",
    provisioned: "bg-emerald-500/10 text-emerald-400",
    paid: "bg-indigo-500/10 text-indigo-400",
    accepted: "bg-indigo-500/10 text-indigo-400",
    contract_signed: "bg-indigo-500/10 text-indigo-400",
    invoice_issued: "bg-amber-500/10 text-amber-400",
    payment_pending: "bg-amber-500/10 text-amber-400",
    rejected: "bg-red-500/10 text-red-400",
    under_review: "bg-amber-500/10 text-amber-400",
  }[status] || "bg-white/5 text-white/50";

  const isPreAccept = ["draft", "submitted", "under_review"].includes(status);
  const isContractStage = status === "accepted";
  const isPaymentStage = ["contract_signed", "invoice_issued", "payment_pending"].includes(status);
  const isPaidNotActivated = status === "paid";
  const isActive = ["provisioned", "active"].includes(status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/cpq/quotes" className="flex items-center gap-2 text-white/40 hover:text-white/60 text-sm transition-colors">
        <ArrowLeft size={14} /> Back to My Quotes
      </Link>

      {/* Header */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
              <FileText size={12} className="text-indigo-400" /> Enterprise Proposal
            </div>
            <h1 className="text-xl font-bold text-white">{quote.proposal_number}</h1>
            <p className="text-white/30 text-sm mt-1">Version {quote.version_number} · Valid until {quote.valid_until}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${statusColor}`}>{status.replace(/_/g, " ")}</span>
          <button onClick={handleRegenerate} disabled={regenerating || !breakdown} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white/60 text-xs font-medium transition-colors">
            {regenerating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Regenerate PDFs
          </button>
        </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="text-white/40 text-sm">{quote.organization_name}</div>
          <div className="text-white/40 text-sm">{quote.industry} · {quote.country}</div>
          <div className="text-white/40 text-sm">{quote.expected_active_users} users · {quote.contract_length_years}yr contract</div>
          <div className="text-white/40 text-sm">{quote.currency} · {quote.customer_email}</div>
        </div>
      </div>

      {/* Status Tracker */}
      <ProposalStatusTracker quote={quote} />

      {/* Pricing breakdown (pre-accept and accepted stages) */}
      {breakdown && (isPreAccept || isContractStage) && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Line Items</h3>
            <div className="space-y-2 text-sm">
              {breakdown.selectedModules?.map(m => (
                <div key={m.id} className="flex justify-between"><span className="text-white/40">{m.icon} {m.name}</span><span className="text-white/60">{formatCPQPrice(m.price, quote.currency, catalog?.currencies)}</span></div>
              ))}
              {breakdown.selectedServices?.map(s => (
                <div key={s.id} className="flex justify-between"><span className="text-white/40">{s.icon} {s.name}</span><span className="text-white/60">{formatCPQPrice(s.price, quote.currency, catalog?.currencies)}</span></div>
              ))}
            </div>
          </div>
          <PriceSummary breakdown={breakdown} catalog={catalog} />
        </div>
      )}

      {/* Customer Actions (pre-accept) */}
      {isPreAccept && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-indigo-400" />
            <h3 className="text-sm font-medium text-white/60">Customer Actions</h3>
          </div>
          <ProposalActions
            quote={quote}
            onAccept={() => setShowAcceptModal(true)}
            onRequestChanges={() => setShowChangesModal(true)}
            onShare={handleShare}
            processing={accepting}
          />
        </div>
      )}

      {/* Contract Review (accepted) */}
      {isContractStage && (
        <ContractReview quote={quote} onSigned={handleSign} signing={signing} />
      )}

      {/* Payment (contract signed / invoice issued / payment pending) */}
      {isPaymentStage && (
        <PaymentPanel quote={quote} onPay={handlePay} processing={paying} />
      )}

      {/* Paid but not activated */}
      {isPaidNotActivated && (
        <div className="bg-indigo-500/[0.03] border border-indigo-500/10 rounded-xl p-6 text-center">
          <Rocket size={32} className="text-indigo-400 mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg mb-1">Payment Received</h3>
          <p className="text-white/50 text-sm mb-4">Your payment has been confirmed. Complete the final step to activate your enterprise subscription.</p>
          <button
            onClick={handleActivate}
            disabled={activating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            {activating ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
            Complete Activation
          </button>
        </div>
      )}

      {/* Activation Success */}
      {isActive && (
        <ActivationSuccess quote={quote} organization={activationData?.organization} breakdown={breakdown} />
      )}

      {/* Modals */}
      {showAcceptModal && (
        <AcceptProposalModal
          quote={quote}
          breakdown={breakdown}
          catalog={catalog}
          onAccept={handleAccept}
          onClose={() => setShowAcceptModal(false)}
        />
      )}
      {showShareModal && (
        <ShareProposalModal
          shareUrl={shareUrl}
          proposalNumber={quote.proposal_number}
          onClose={() => setShowShareModal(false)}
        />
      )}
      {showChangesModal && (
        <RequestChangesModal
          proposalNumber={quote.proposal_number}
          onSubmit={handleRequestChanges}
          onClose={() => setShowChangesModal(false)}
        />
      )}
    </div>
  );
}