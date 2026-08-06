import React from "react";
import { DollarSign } from "lucide-react";
import { SectionHeader, BetaBanner, fmtCurrency, StatusPill, MetricRow } from "./shared";
import { PLANS } from "@/lib/plans";
import { SIMULATION_CREDIT_PROGRAM, GA_ENTERPRISE_TIERS, VALUE_BASED_PRICING_FACTORS } from "@/lib/enterpriseCommercialArchitecture";
import { Link } from "react-router-dom";

export default function PricingIntelligence({ quotes }) {
  const avgQuote = quotes.length ? quotes.reduce((s, q) => s + (q.annual_value || 0), 0) / quotes.length : 0;
  return (
    <div>
      <SectionHeader icon={DollarSign} title="Pricing Intelligence™" subtitle="Value-based pricing architecture, plan economics, and enterprise quote analytics — without altering existing pricing." />
      <BetaBanner />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-white text-sm font-semibold mb-2">Plan Economics (GA pricing)</h3>
          <div className="space-y-1">
            {Object.values(PLANS).filter((p) => p.visible).map((p) => (
              <MetricRow key={p.id} label={`${p.name} · ${p.enterpriseOnly ? "Custom (CPQ)" : `$${p.monthlyPrice}/mo · $${p.annualPrice}/yr`}`} value={p.enterpriseOnly ? "CPQ" : fmtCurrency(p.annualPrice)} kind="live" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-white text-sm font-semibold mb-2">Enterprise Quote Analytics</h3>
          <div className="space-y-1">
            <MetricRow label="Total Quotes" value={quotes.length} kind="live" />
            <MetricRow label="Average Annual Value" value={fmtCurrency(avgQuote)} kind="live" />
            <MetricRow label="Avg Contract Length" value={`${(quotes.reduce((s, q) => s + (q.contract_length_years || 1), 0) / Math.max(1, quotes.length)).toFixed(1)} yr`} kind="live" />
          </div>
          <Link to="/cpq" className="inline-flex items-center gap-1.5 mt-3 text-xs text-accent-orange hover:text-accent-orange/80">Open CPQ Wizard →</Link>
        </div>
      </div>
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 mb-4">
        <h3 className="text-white text-sm font-semibold mb-2">Value-Based Pricing Factors</h3>
        <div className="flex flex-wrap gap-1.5">{VALUE_BASED_PRICING_FACTORS.map((f) => <span key={f} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.03] border border-white/8 text-white/70">{f}</span>)}</div>
        <p className="text-[11px] text-white/45 mt-2">Customers buy outcomes, not AI. EXECLEAD.AI is positioned around measurable business outcomes — never AI token usage or underlying models.</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4">
        <h3 className="text-white text-sm font-semibold mb-3">GA Enterprise Licensing Tiers (planned)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GA_ENTERPRISE_TIERS.map((t) => (
            <div key={t.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <div className="text-sm text-white font-semibold">{t.name}</div>
              <div className="text-[10px] text-amber-400 mb-1">{t.stage}</div>
              <div className="text-[11px] text-white/50 mb-1">{t.target}</div>
              <div className="text-[11px] text-white/40">{t.purpose}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-white text-sm font-semibold mb-2">Expansion: {SIMULATION_CREDIT_PROGRAM.name}</h3>
        <p className="text-[11px] text-white/55 mb-2">{SIMULATION_CREDIT_PROGRAM.description}</p>
        <div className="text-[11px] text-white/50">Annual allocation per account: {SIMULATION_CREDIT_PROGRAM.annualAllocationPerAccount} credits · {SIMULATION_CREDIT_PROGRAM.bundles.length} expansion bundles (GA).</div>
      </div>
    </div>
  );
}