import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Package, Bot, Headset, Calendar, Coins, ArrowRight } from "lucide-react";
import { useCPQCatalog } from "@/hooks/useCPQCatalog";
import { calculateQuote } from "@/lib/cpqEngine";

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50";
const labelClass = "text-white/40 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

export default function EnterpriseCalculator() {
  const { catalog, loading } = useCPQCatalog();
  const [config, setConfig] = useState({
    seats: 250,
    moduleIds: ["executive_academy", "executive_coach", "executive_simulator", "career_studio", "leadership_dna"],
    aiPackageId: "professional_ai",
    supportPackageId: "business",
    contractLength: 1,
    currency: "USD",
    country: "US",
    taxExempt: false,
    discountRuleId: null,
    discountValue: 0,
    serviceIds: [],
  });

  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  const toggleModule = (id) => update("moduleIds", config.moduleIds.includes(id) ? config.moduleIds.filter(m => m !== id) : [...config.moduleIds, id]);

  const breakdown = useMemo(() => catalog ? calculateQuote(config, catalog) : null, [config, catalog]);

  if (loading || !breakdown) {
    return <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin" /></div>;
  }

  const currencySymbol = breakdown.currencySymbol || "$";
  const fmt = (n) => `${currencySymbol}${Math.round(n).toLocaleString()}`;
  const monthlyCost = breakdown.grandTotal / (breakdown.contractLength * 12);
  const oneYearTotal = breakdown.annualRecurring + breakdown.servicesCost;
  const savings = breakdown.contractLength > 1 ? (oneYearTotal * breakdown.contractLength) - breakdown.grandTotal : 0;

  const modules = catalog.modules.filter(m => m.type === "module" && m.is_active !== false);

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-3 bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-5">
        <div>
          <label className={labelClass}><Users size={12} /> Active Users</label>
          <input type="range" min="100" max="10000" step="50" value={config.seats} onChange={e => update("seats", Number(e.target.value))} className="w-full accent-emerald-500" />
          <div className="flex justify-between text-xs text-white/30 mt-1"><span>100</span><span className="text-white/60 font-medium">{config.seats} users</span><span>10,000</span></div>
        </div>

        <div>
          <label className={labelClass}><Package size={12} /> Modules</label>
          <div className="grid grid-cols-2 gap-2">
            {modules.map(m => (
              <button
                key={m.module_id}
                onClick={() => toggleModule(m.module_id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-left transition-all ${
                  config.moduleIds.includes(m.module_id) ? "bg-emerald-500/10 border border-emerald-500/30 text-white/80" : "bg-white/5 border border-white/5 text-white/40 hover:text-white/60"
                }`}
              >
                <span>{m.icon}</span>
                <span className="truncate">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}><Bot size={12} /> AI Package</label>
            <select value={config.aiPackageId || ""} onChange={e => update("aiPackageId", e.target.value || null)} className={inputClass}>
              <option value="" className="bg-[#0d0d14]">None</option>
              {catalog.aiPackages.map(p => <option key={p.package_id} value={p.package_id} className="bg-[#0d0d14]">{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}><Headset size={12} /> Support</label>
            <select value={config.supportPackageId || ""} onChange={e => update("supportPackageId", e.target.value || null)} className={inputClass}>
              <option value="" className="bg-[#0d0d14]">None</option>
              {catalog.supportPackages.map(p => <option key={p.package_id} value={p.package_id} className="bg-[#0d0d14]">{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}><Calendar size={12} /> Contract Length</label>
            <div className="flex gap-2">
              {[1, 2, 3].map(y => (
                <button key={y} onClick={() => update("contractLength", y)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${config.contractLength === y ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-white/40"}`}>
                  {y} yr
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}><Coins size={12} /> Currency</label>
            <select value={config.currency} onChange={e => update("currency", e.target.value)} className={inputClass}>
              {catalog.currencies.map(c => <option key={c.code} value={c.code} className="bg-[#0d0d14]">{c.code} ({c.symbol})</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="lg:col-span-2 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-6">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Estimated Annual Contract Value</p>
          <div className="text-3xl font-bold text-emerald-400">{fmt(breakdown.grandTotal)}</div>
          <div className="text-white/30 text-xs mt-2">{breakdown.contractLength} year contract · {config.seats} users</div>
        </motion.div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-sm"><span className="text-white/40">Monthly Equivalent</span><span className="text-white/70 font-medium">{fmt(monthlyCost)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-white/40">Annual Recurring</span><span className="text-white/70 font-medium">{fmt(breakdown.annualRecurring)}</span></div>
          {breakdown.servicesCost > 0 && <div className="flex justify-between text-sm"><span className="text-white/40">Services</span><span className="text-white/70 font-medium">{fmt(breakdown.servicesCost)}</span></div>}
          {breakdown.tax.amount > 0 && <div className="flex justify-between text-sm"><span className="text-white/40">Tax ({(breakdown.tax.rate * 100).toFixed(0)}%)</span><span className="text-white/70 font-medium">{fmt(breakdown.tax.amount)}</span></div>}
          {savings > 0 && (
            <div className="flex justify-between text-sm pt-2 border-t border-white/5">
              <span className="text-emerald-400">Multi-Year Savings</span>
              <span className="text-emerald-400 font-bold">{fmt(savings)}</span>
            </div>
          )}
        </div>

        <Link to="/cpq" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
          Get Full Proposal <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}