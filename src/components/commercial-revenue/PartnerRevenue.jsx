import React from "react";
import { Handshake } from "lucide-react";
import { SectionHeader, BetaBanner, MetricRow } from "./shared";

export default function PartnerRevenue() {
  return (
    <div>
      <SectionHeader icon={Handshake} title="Partner Revenue™" subtitle="Partner-sourced revenue, referral commissions, and marketplace partner economics." />
      <BetaBanner />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-white text-sm font-semibold mb-2">Partner Revenue Metrics</h3>
          <div className="space-y-1">
            {["Active Partners", "Partner-Sourced ARR", "Partner Commission Revenue", "Referral Conversions", "Partner Pipeline Value", "Co-Sell Motions"].map((m) => <MetricRow key={m} label={m} value="—" kind="architecture" />)}
          </div>
          <p className="text-[11px] text-white/45 mt-2">Partner economics activate at General Availability. The referral program and wallet track ambassador commissions live.</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <h3 className="text-white text-sm font-semibold mb-2">Partner Architecture</h3>
          <ul className="text-[11px] text-white/55 space-y-1 list-disc list-inside">
            <li>Referral / ambassador program (live via Executive Wallet™)</li>
            <li>Marketplace partner revenue share (GA)</li>
            <li>Implementation partner certifications (GA)</li>
            <li>Co-sell enterprise motions (GA)</li>
            <li>Channel partner tiers (GA)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}