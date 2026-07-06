import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCPQCatalog } from "@/hooks/useCPQCatalog";
import { calculateQuote, formatCPQPrice } from "@/lib/cpqEngine";
import PriceSummary from "@/components/cpq/PriceSummary";
import { Loader2, ArrowLeft, FileText } from "lucide-react";

export default function CPQQuoteView() {
  const { id } = useParams();
  const { catalog, loading: loadingCatalog } = useCPQCatalog();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

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
  if (config && catalog) {
    breakdown = calculateQuote(config, catalog);
  } else {
    try { breakdown = JSON.parse(quote.breakdown_json); } catch (e) {}
  }

  const statusColor = quote.status === "approved" || quote.status === "accepted"
    ? "bg-emerald-500/10 text-emerald-400"
    : quote.status === "rejected"
      ? "bg-red-500/10 text-red-400"
      : "bg-amber-500/10 text-amber-400";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/cpq-dashboard" className="flex items-center gap-2 text-white/40 hover:text-white/60 text-sm transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
              <FileText size={12} className="text-indigo-400" /> Proposal
            </div>
            <h1 className="text-xl font-bold text-white">{quote.proposal_number}</h1>
            <p className="text-white/30 text-sm mt-1">Version {quote.version_number} · Valid until {quote.valid_until}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${statusColor}`}>{quote.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="text-white/40 text-sm">{quote.organization_name}</div>
          <div className="text-white/40 text-sm">{quote.industry} · {quote.country}</div>
          <div className="text-white/40 text-sm">{quote.expected_active_users} users · {quote.contract_length_years}yr contract</div>
          <div className="text-white/40 text-sm">{quote.currency} · {quote.customer_email}</div>
        </div>
      </div>

      {breakdown && (
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
    </div>
  );
}