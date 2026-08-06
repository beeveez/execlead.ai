import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Building2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CommercialKpiGrid from "@/components/commercial/CommercialKpiGrid";
import { REVENUE_ARCHITECTURE, COMMERCIAL_PRINCIPLE, VALUE_BASED_PRICING_FACTORS } from "@/lib/enterpriseCommercialArchitecture";

async function enterpriseAccounts() {
  try {
    const list = await base44.entities.Subscription.list("-created_date", 200);
    if (!Array.isArray(list)) return null;
    const ent = list.filter(
      (s) =>
        (s.plan_id || "").toLowerCase().includes("enterprise") ||
        (s.tier || "").toLowerCase().includes("enterprise") ||
        (s.plan_name || "").toLowerCase().includes("enterprise")
    );
    return `${ent.length || list.length}`;
  } catch {
    return null;
  }
}

async function enterpriseAdoption() {
  try {
    const list = await base44.entities.User.list("-created_date", 200);
    if (!Array.isArray(list)) return null;
    return list.length >= 200 ? `${list.length}+` : `${list.length}`;
  } catch {
    return null;
  }
}

export default function EnterpriseCommercialIntelligence() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [accounts, adoption] = await Promise.all([enterpriseAccounts(), enterpriseAdoption()]);
      setData({ enterprise_accounts: accounts, enterprise_adoption: adoption });
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080d] text-white p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium mb-3">
            <LineChart size={13} /> Enterprise Commercial Intelligence™
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Commercial Performance</h1>
          <p className="text-white/45 text-sm max-w-2xl">{COMMERCIAL_PRINCIPLE}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={14} className="text-emerald-400" />
            <span className="text-white/70 text-xs font-semibold">Value-Based Pricing Factors</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {VALUE_BASED_PRICING_FACTORS.map((f) => (
              <span key={f} className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">Commercial KPIs</div>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        ) : (
          <CommercialKpiGrid data={data} />
        )}
        <p className="text-white/35 text-[11px] mt-3">
          Revenue KPIs (ARR, MRR, expansion, renewals, churn, ACV, LTV, pipeline) activate when billing instrumentation is live. Enterprise accounts and adoption reflect accessible platform data.
        </p>

        <div className="mt-8">
          <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">Long-Term Revenue Architecture</div>
          <div className="flex flex-wrap items-center gap-2">
            {REVENUE_ARCHITECTURE.map((r, i) => (
              <React.Fragment key={r}>
                <span className="text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70">{r}</span>
                {i < REVENUE_ARCHITECTURE.length - 1 && <span className="text-white/30 text-xs">↓</span>}
              </React.Fragment>
            ))}
          </div>
          <p className="text-white/40 text-[11px] mt-3 max-w-2xl">
            Each revenue engine complements the Executive Leadership Operating System without creating product fragmentation.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link to="/commercial-command-center" className="text-xs text-indigo-400 hover:text-indigo-300">
            Back to Commercial Command Center →
          </Link>
        </div>
      </div>
    </div>
  );
}