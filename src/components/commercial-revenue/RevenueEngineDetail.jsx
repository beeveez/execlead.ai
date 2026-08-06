import React from "react";
import { Store, Code, Award, Briefcase } from "lucide-react";
import { SectionHeader, BetaBanner, fmtNum, MetricRow } from "./shared";
import { REVENUE_ENGINES, computeEngineMetrics } from "@/lib/commercialRevenueEngine";

const ICONS = { marketplace: Store, developer_platform: Code, certifications: Award, professional_services: Briefcase };

export default function RevenueEngineDetail({ engineId, data }) {
  const engine = REVENUE_ENGINES.find((e) => e.id === engineId);
  const Icon = ICONS[engineId] || Store;
  const metrics = computeEngineMetrics(engineId, data);
  return (
    <div>
      <SectionHeader icon={Icon} title={engine.name} subtitle={engine.description} color={engine.color} />
      <BetaBanner />
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4">
        <h3 className="text-white text-sm font-semibold mb-2">Tracked Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          {engine.metrics.map((m) => {
            const v = metrics[m.key];
            const display = v?.kind === "live" && v.value != null ? fmtNum(v.value) : v?.isGroup ? `${Object.keys(v.value || {}).length} segments` : "—";
            return <MetricRow key={m.key} label={m.label} value={display} kind={v?.kind || m.kind} />;
          })}
        </div>
      </div>
      {engineId === "marketplace" && metrics.revenue_by_industry?.isGroup && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-white text-sm font-semibold mb-2">Marketplace Performance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Mini label="Listings" value={fmtNum(data.marketplaceItems?.length || 0)} />
            <Mini label="Purchases" value={fmtNum(data.purchases?.length || 0)} />
            <Mini label="Courses" value={fmtNum((data.marketplaceItems || []).filter((m) => (m.type || m.category || "").toLowerCase().includes("course")).length)} />
            <Mini label="Commission Revenue" value="—" />
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
        <h3 className="text-white text-sm font-semibold mb-1">{engine.name} Revenue Architecture</h3>
        <p className="text-[11px] text-white/55">This revenue engine reinforces the Executive Leadership Operating System without product fragmentation. Detailed revenue, margin, and adoption metrics activate at General Availability.</p>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3"><div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{label}</div><div className="text-base font-bold text-white">{value}</div></div>;
}