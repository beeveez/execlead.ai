import React, { useState } from "react";
import { FileSignature, Download, ExternalLink, Check, Loader2, Shield } from "lucide-react";
import SignaturePad from "@/components/cpq/SignaturePad";

export default function ContractReview({ quote, onSigned, signing }) {
  const [showFullContract, setShowFullContract] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FileSignature size={18} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">Contract Ready for Signature</h3>
              <p className="text-white/40 text-xs mt-0.5">Master Service Agreement + Subscription Agreement</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-medium uppercase tracking-wider">
            Awaiting Signature
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="text-white/30 text-xs mb-1">Agreement Reference</div>
            <div className="text-white/70">{quote.proposal_number}</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="text-white/30 text-xs mb-1">Contract Value</div>
            <div className="text-emerald-400 font-medium">{quote.currency} {(quote.grand_total || 0).toLocaleString()}</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="text-white/30 text-xs mb-1">Contract Length</div>
            <div className="text-white/70">{quote.contract_length_years || 1} year(s)</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="text-white/30 text-xs mb-1">Accepted By</div>
            <div className="text-white/70">{quote.accepted_by_name || "—"}</div>
          </div>
        </div>

        <div className="flex gap-2">
          {quote.contract_url && (
            <a
              href={quote.contract_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-colors"
            >
              <Download size={14} /> Download Contract PDF
            </a>
          )}
          <button
            onClick={() => setShowFullContract(!showFullContract)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-sm font-medium transition-colors"
          >
            <ExternalLink size={14} /> {showFullContract ? "Hide" : "Review"} Contract Summary
          </button>
        </div>

        {showFullContract && (
          <div className="mt-4 p-4 bg-white/[0.02] rounded-lg text-xs text-white/40 space-y-2 border border-white/5">
            <div className="text-white/60 font-medium mb-2">Contract Summary</div>
            <p>This Master Service Agreement (MSA) governs the provision of EXECLEAD.AI Enterprise services to {quote.organization_name}.</p>
            <p><strong className="text-white/50">Services:</strong> Full access to the EXECLEAD.AI Enterprise platform including executive coaching, leadership simulation, career intelligence, and analytics.</p>
            <p><strong className="text-white/50">Term:</strong> {quote.contract_length_years || 1} year(s), auto-renewing unless 60-day notice given.</p>
            <p><strong className="text-white/50">Fees:</strong> {quote.currency} {(quote.grand_total || 0).toLocaleString()} total contract value.</p>
            <p><strong className="text-white/50">Data Protection:</strong> SOC 2 compliant, GDPR/CCPA compliant, encryption at rest and in transit.</p>
            <p><strong className="text-white/50">Termination:</strong> 30-day notice for material breach; 30-day data export window upon termination.</p>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl">
        <Shield size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          Please review the contract PDF before signing. Your electronic signature is legally binding under the ESIGN Act and UETA. After signing, an invoice will be issued and you'll proceed to payment.
        </p>
      </div>

      <SignaturePad onSigned={onSigned} disabled={signing} />

      {signing && (
        <div className="flex items-center justify-center gap-2 py-3 text-white/50 text-sm">
          <Loader2 size={16} className="animate-spin" /> Processing signature...
        </div>
      )}
    </div>
  );
}