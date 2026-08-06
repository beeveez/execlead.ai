import React, { useEffect, useState } from "react";
import { Loader2, DollarSign, Boxes, TrendingUp, Users, LineChart, BarChart3, Handshake, Store, Code, Award, Briefcase, FileDown, Landmark } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { computeKPIs } from "@/lib/commercialRevenueEngine";
import CommercialDashboard from "@/components/commercial-revenue/CommercialDashboard";
import RevenueEngines from "@/components/commercial-revenue/RevenueEngines";
import RecurringRevenue from "@/components/commercial-revenue/RecurringRevenue";
import CustomerExpansion from "@/components/commercial-revenue/CustomerExpansion";
import RevenueForecast from "@/components/commercial-revenue/RevenueForecast";
import CommercialAnalytics from "@/components/commercial-revenue/CommercialAnalytics";
import PricingIntelligence from "@/components/commercial-revenue/PricingIntelligence";
import PartnerRevenue from "@/components/commercial-revenue/PartnerRevenue";
import RevenueEngineDetail from "@/components/commercial-revenue/RevenueEngineDetail";
import FinancialReports from "@/components/commercial-revenue/FinancialReports";
import InvestorDashboard from "@/components/commercial-revenue/InvestorDashboard";

const NAV = [
  { key: "dashboard", label: "Commercial Dashboard™", icon: DollarSign },
  { key: "engines", label: "Revenue Engines™", icon: Boxes },
  { key: "arr", label: "ARR Intelligence™", icon: TrendingUp },
  { key: "mrr", label: "MRR Intelligence™", icon: TrendingUp },
  { key: "expansion", label: "Customer Expansion™", icon: Users },
  { key: "forecast", label: "Revenue Forecast™", icon: LineChart },
  { key: "analytics", label: "Commercial Analytics™", icon: BarChart3 },
  { key: "pricing", label: "Pricing Intelligence™", icon: DollarSign },
  { key: "partner", label: "Partner Revenue™", icon: Handshake },
  { key: "marketplace", label: "Marketplace™", icon: Store },
  { key: "api", label: "API Commercial™", icon: Code },
  { key: "certifications", label: "Certification Revenue™", icon: Award },
  { key: "professional_services", label: "Professional Services™", icon: Briefcase },
  { key: "reports", label: "Financial Reports™", icon: FileDown },
  { key: "investor", label: "Investor Dashboard™", icon: Landmark },
];

export default function CommercialRevenueEngine() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState({ subscriptions: [], billingEvents: [], quotes: [], orgs: [], certificates: [], marketplaceItems: [], purchases: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const safe = async (fn) => { try { return (await fn()) || []; } catch { return []; } };
      const [subscriptions, billingEvents, quotes, orgs, certificates, marketplaceItems, purchases] = await Promise.all([
        safe(() => base44.entities.Subscription.list("-created_date", 200)),
        safe(() => base44.entities.BillingEvent.list("-created_date", 200)),
        safe(() => base44.entities.CPQQuote.list("-created_date", 200)),
        safe(() => base44.entities.Organization.list("-created_date", 200)),
        safe(() => base44.entities.Certificate.list("-created_date", 200)),
        safe(() => base44.entities.MarketplaceItem.list("-created_date", 200)),
        safe(() => base44.entities.Purchase.list("-created_date", 200)),
      ]);
      setData({ subscriptions, billingEvents, quotes, orgs, certificates, marketplaceItems, purchases });
      setLoading(false);
    })();
  }, []);

  const kpis = computeKPIs(data);

  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-medium mb-3">
          <DollarSign size={13} /> Commercial Revenue Engine™ · Enterprise Commercial Intelligence Platform · v1.0
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Commercial Revenue Engine™</h1>
        <p className="text-white/45 text-sm max-w-3xl mb-6">The financial operating system for EXECLEAD.AI — one unified view of how every revenue engine creates, expands, and retains recurring revenue. Connects the Enterprise ROI Calculator™, CPQ, and CRM into a single commercial architecture.</p>

        <div className="flex flex-col lg:flex-row gap-4">
          <nav className="lg:w-64 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-4 rounded-2xl border border-white/10 bg-white/[0.02] p-2 flex lg:flex-col gap-1 overflow-x-auto">
              {NAV.map((n) => (
                <button key={n.key} onClick={() => setTab(n.key)} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap lg:whitespace-normal transition-colors ${tab === n.key ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "text-white/55 hover:text-white/80 hover:bg-white/5 border border-transparent"}`}>
                  <n.icon size={15} className="flex-shrink-0" /> {n.label}
                </button>
              ))}
            </div>
          </nav>
          <main className="flex-1 min-w-0 rounded-2xl border border-white/10 bg-[#0d0d14]/50 p-4 lg:p-6">
            {loading ? <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin text-white/40" /></div> : (
              <>
                {tab === "dashboard" && <CommercialDashboard kpis={kpis} data={data} />}
                {tab === "engines" && <RevenueEngines data={data} />}
                {tab === "arr" && <RecurringRevenue mode="arr" kpis={kpis} subscriptions={data.subscriptions} quotes={data.quotes} orgs={data.orgs} />}
                {tab === "mrr" && <RecurringRevenue mode="mrr" kpis={kpis} subscriptions={data.subscriptions} quotes={data.quotes} orgs={data.orgs} />}
                {tab === "expansion" && <CustomerExpansion orgs={data.orgs} subscriptions={data.subscriptions} />}
                {tab === "forecast" && <RevenueForecast kpis={kpis} />}
                {tab === "analytics" && <CommercialAnalytics kpis={kpis} quotes={data.quotes} subscriptions={data.subscriptions} orgs={data.orgs} />}
                {tab === "pricing" && <PricingIntelligence quotes={data.quotes} />}
                {tab === "partner" && <PartnerRevenue />}
                {tab === "marketplace" && <RevenueEngineDetail engineId="marketplace" data={data} />}
                {tab === "api" && <RevenueEngineDetail engineId="developer_platform" data={data} />}
                {tab === "certifications" && <RevenueEngineDetail engineId="certifications" data={data} />}
                {tab === "professional_services" && <RevenueEngineDetail engineId="professional_services" data={data} />}
                {tab === "reports" && <FinancialReports kpis={kpis} data={data} />}
                {tab === "investor" && <InvestorDashboard kpis={kpis} orgs={data.orgs} />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}