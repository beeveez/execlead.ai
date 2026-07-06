import React from "react";
import { Check, Download, Share2, MessageSquare, Mail, FileText, Loader2 } from "lucide-react";

export default function ProposalActions({ quote, onAccept, onRequestChanges, onShare, processing }) {
  const isPreAccept = ["submitted", "under_review", "draft"].includes(quote.status);
  const hasPdf = !!quote.pdf_url;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isPreAccept && (
        <button
          onClick={onAccept}
          disabled={processing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
        >
          {processing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Accept Proposal
        </button>
      )}
      {isPreAccept && (
        <button
          onClick={onRequestChanges}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
        >
          <MessageSquare size={14} />
          Request Changes
        </button>
      )}
      <a
        href="mailto:sales@execlead.ai?subject=Enterprise Proposal Inquiry"
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
      >
        <Mail size={14} />
        Contact Sales
      </a>
      {hasPdf && (
        <a
          href={quote.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
        >
          <Download size={14} />
          Download PDF
        </a>
      )}
      <button
        onClick={onShare}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
      >
        <Share2 size={14} />
        Share
      </button>
    </div>
  );
}