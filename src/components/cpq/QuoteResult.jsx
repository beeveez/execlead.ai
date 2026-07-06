import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, FileText, Plus, ArrowRight, AlertTriangle, Mail } from "lucide-react";
import PriceSummary from "./PriceSummary";

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/30">{label}:</span>
      <span className="text-white/80">{value || "—"}</span>
    </div>
  );
}

export default function QuoteResult({ quote, breakdown, catalog, emailWarning, onNewQuote, onViewQuotes }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Proposal Generated</h2>
        <p className="text-white/40 text-sm mb-4">Your enterprise proposal has been created successfully</p>
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
          <FileText size={14} className="text-indigo-400" />
          <span className="text-white font-mono text-sm">{quote.proposal_number}</span>
        </div>
        <div className="mt-4 text-white/30 text-xs">Valid until: {quote.valid_until} · Status: <span className="text-amber-400 capitalize">{quote.status}</span></div>
      </div>

      {emailWarning && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-amber-400 font-medium text-sm">Email provider not configured</div>
            <div className="text-white/40 text-xs mt-0.5">Proposal was submitted successfully, but no email was sent.</div>
          </div>
          <Link to="/email-settings" className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium transition-colors whitespace-nowrap">
            <Mail size={12} /> Configure Email
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Organization</h3>
          <div className="space-y-2 text-sm">
            <Row label="Name" value={quote.organization_name} />
            <Row label="Industry" value={quote.industry} />
            <Row label="Country" value={quote.country} />
            <Row label="Employees" value={quote.num_employees} />
            <Row label="Active Users" value={quote.expected_active_users} />
            <Row label="Timeline" value={quote.implementation_timeline} />
            <Row label="Email" value={quote.customer_email} />
          </div>
        </div>
        <PriceSummary breakdown={breakdown} catalog={catalog} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onNewQuote} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors">
          <Plus size={16} /> New Quote
        </button>
        <button onClick={onViewQuotes} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          View All Quotes <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}