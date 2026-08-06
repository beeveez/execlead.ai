import React, { useState } from "react";
import { Users, Sparkles, Loader2, ArrowUpRight, ChevronDown } from "lucide-react";
import { SectionHeader, BetaBanner, fmtNum, StatusPill } from "./shared";
import { expansionScore, renewalRisk, productsOwned, recommendedNextProduct, buildRecommendationPrompt, REC_ACTIONS } from "@/lib/commercialRevenueEngine";
import { base44 } from "@/api/base44Client";

const RISK_COLOR = { High: "text-rose-400 bg-rose-500/10 border-rose-500/25", Medium: "text-amber-400 bg-amber-500/10 border-amber-500/25", Low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", Unknown: "text-white/50 bg-white/5 border-white/10" };

export default function CustomerExpansion({ orgs, subscriptions }) {
  const [openId, setOpenId] = useState(null);
  const [recs, setRecs] = useState({});
  const [loading, setLoading] = useState({});

  const generate = async (org) => {
    setLoading((l) => ({ ...l, [org.id]: true }));
    const owned = productsOwned(org, subscriptions);
    const ctx = { productsOwned: owned, expansionScore: expansionScore(org, subscriptions), renewalRisk: renewalRisk(org) };
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: buildRecommendationPrompt(org, ctx), response_json_schema: { type: "object", properties: { recommendations: { type: "array", items: { type: "object", properties: { action: { type: "string" }, reason: { type: "string" }, estimatedOpportunity: { type: "string" }, customerBenefit: { type: "string" }, confidence: { type: "string" } } } }, summary: { type: "string" } } } });
      setRecs((r) => ({ ...r, [org.id]: (res.data || res) }));
    } catch {}
    setLoading((l) => ({ ...l, [org.id]: false }));
  };

  return (
    <div>
      <SectionHeader icon={Users} title="Customer Expansion Engine™" subtitle="Per-enterprise expansion intelligence: products owned, expansion score, renewal risk, and AI-generated cross-sell recommendations." />
      <BetaBanner />
      {orgs.length === 0 ? (
        <p className="text-white/40 text-sm">No enterprise customers yet. Organizations provisioned via the CPQ flow will appear here with full expansion intelligence.</p>
      ) : (
        <div className="space-y-2">
          {orgs.map((org) => {
            const score = expansionScore(org, subscriptions);
            const risk = renewalRisk(org);
            const owned = productsOwned(org, subscriptions);
            const next = recommendedNextProduct(org, owned);
            const open = openId === org.id;
            return (
              <div key={org.id} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <button onClick={() => setOpenId(open ? null : org.id)} className="w-full flex items-center gap-3 p-3 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{org.name}</div>
                    <div className="text-[11px] text-white/45">{org.industry || "Industry not documented"} · {org.country || org.region || "Region not documented"} · {org.plan || "free"} plan</div>
                  </div>
                  <ScorePill label="Expansion" value={score} color={score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-rose-400"} />
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${RISK_COLOR[risk]}`}>{risk} risk</span>
                  <ChevronDown size={15} className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="p-3 pt-0 border-t border-white/5">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 my-3">
                      <Stat label="Products Owned" value={fmtNum(owned.length)} />
                      <Stat label="Seats Used" value={`${org.seats_used || 0}/${org.seats_total || 0}`} />
                      <Stat label="Recommended Next Product" value={next} />
                      <Stat label="Modules Enabled" value={fmtNum((org.enabled_modules || []).length)} />
                      <Stat label="Adoption (seat util)" value={`${Math.round(((org.seats_used || 0) / Math.max(1, org.seats_total || 1)) * 100)}%`} />
                      <Stat label="Health Score" value={Math.round(score * 0.7 + (risk === "Low" ? 30 : risk === "Medium" ? 15 : 0))} />
                    </div>
                    {owned.length > 0 && <div className="mb-3"><div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1">Current Products</div><div className="flex flex-wrap gap-1.5">{owned.map((p) => <span key={p} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.03] border border-white/8 text-white/70">{p}</span>)}</div></div>}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-white/70"><Sparkles size={13} className="text-amber-400" /> Commercial Recommendations</div>
                      <button onClick={() => generate(org)} disabled={loading[org.id]} className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-lg">{loading[org.id] ? <Loader2 size={12} className="animate-spin" /> : <ArrowUpRight size={12} />} Generate</button>
                    </div>
                    {recs[org.id] && (
                      <div className="space-y-2">
                        {recs[org.id].summary && <p className="text-xs text-white/60">{recs[org.id].summary}</p>}
                        {recs[org.id].recommendations?.map((r, i) => (
                          <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
                            <div className="flex items-center gap-2 mb-1"><span className="text-[11px] text-amber-400 font-semibold">{r.action}</span><StatusPill kind={r.confidence === "High" ? "live" : r.confidence === "Medium" ? "projected" : "architecture"} /></div>
                            <div className="text-[11px] text-white/60">{r.reason}</div>
                            <div className="text-[11px] text-emerald-400/80 mt-0.5">Opportunity: {r.estimatedOpportunity}</div>
                            <div className="text-[11px] text-white/50">Customer benefit: {r.customerBenefit}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-4 text-[10px] text-white/35">Recommended actions catalog: {REC_ACTIONS.join(" · ")}. Recommendations are illustrative and grounded in customer profiles — not guarantees.</div>
    </div>
  );
}

function ScorePill({ label, value, color }) {
  return <div className="text-center"><div className={`text-sm font-bold ${color}`}>{value}</div><div className="text-[9px] uppercase text-white/35">{label}</div></div>;
}
function Stat({ label, value }) {
  return <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2"><div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{label}</div><div className="text-xs text-white/80 font-medium">{value}</div></div>;
}