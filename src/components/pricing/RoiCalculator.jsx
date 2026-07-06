import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, Wallet, TrendingDown, TrendingUp, RefreshCw, Calculator, Gauge, Award } from "lucide-react";

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";
const labelClass = "text-white/40 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

export default function RoiCalculator() {
  const [inputs, setInputs] = useState({
    employees: 500,
    avgSalary: 80000,
    leadershipBudget: 100000,
    externalCoachingCost: 5000,
    promotionRate: 10,
    turnoverRate: 15,
  });

  const set = (field) => (e) => setInputs(prev => ({ ...prev, [field]: Number(e.target.value) }));

  const results = useMemo(() => {
    const managers = Math.round(inputs.employees * 0.1);
    const totalExternalCoaching = managers * inputs.externalCoachingCost;
    const turnoverCost = inputs.employees * (inputs.turnoverRate / 100) * inputs.avgSalary * 0.5;
    const turnoverReduction = 0.20;
    const turnoverSavings = turnoverCost * turnoverReduction;
    const productivityGains = inputs.employees * inputs.avgSalary * 0.02;
    const totalSavings = totalExternalCoaching + turnoverSavings + productivityGains;
    const roi = inputs.leadershipBudget > 0 ? ((totalSavings - inputs.leadershipBudget) / inputs.leadershipBudget) * 100 : 0;
    const paybackMonths = totalSavings > 0 ? (inputs.leadershipBudget / (totalSavings / 12)) : 0;
    const promotionIncrease = inputs.promotionRate * 0.4;
    const newPromotionRate = inputs.promotionRate + promotionIncrease;

    return {
      savings: Math.round(totalSavings),
      roi: Math.round(roi),
      payback: Math.max(0, Math.round(paybackMonths * 10) / 10),
      productivityGains: Math.round(productivityGains),
      promotionIncrease: Math.round(promotionIncrease * 10) / 10,
      newPromotionRate: Math.round(newPromotionRate * 10) / 10,
      managers,
      externalCoaching: Math.round(totalExternalCoaching),
      turnoverSavings: Math.round(turnoverSavings),
    };
  }, [inputs]);

  const fmt = (n) => `$${n.toLocaleString()}`;

  const outputCards = [
    { label: "Annual Savings", value: fmt(results.savings), icon: TrendingDown, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Leadership ROI", value: `${results.roi}%`, icon: Award, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Payback Period", value: `${results.payback} mo`, icon: RefreshCw, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Productivity Gains", value: fmt(results.productivityGains), icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Promotion Increase", value: `+${results.promotionIncrease}%`, sub: `${inputs.promotionRate}% → ${results.newPromotionRate}%`, icon: Gauge, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Calculator size={18} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Your Organization</h3>
        </div>
        <div>
          <label className={labelClass}><Users size={12} /> Number of Employees</label>
          <input type="number" value={inputs.employees} onChange={set("employees")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}><DollarSign size={12} /> Average Salary</label>
          <input type="number" value={inputs.avgSalary} onChange={set("avgSalary")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}><Wallet size={12} /> Annual Leadership Budget</label>
          <input type="number" value={inputs.leadershipBudget} onChange={set("leadershipBudget")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}><DollarSign size={12} /> External Coaching Cost / Executive / Year</label>
          <input type="number" value={inputs.externalCoachingCost} onChange={set("externalCoachingCost")} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}><TrendingUp size={12} /> Current Promotion Rate (%)</label>
            <input type="number" value={inputs.promotionRate} onChange={set("promotionRate")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}><RefreshCw size={12} /> Turnover Rate (%)</label>
            <input type="number" value={inputs.turnoverRate} onChange={set("turnoverRate")} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {outputCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white/[0.02] border border-white/5 rounded-2xl p-4 ${i === 4 ? "col-span-2" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                  <card.icon size={18} className={card.color} />
                </div>
                <div>
                  <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
                  <div className="text-white/30 text-xs">{card.label}</div>
                  {card.sub && <div className="text-white/20 text-[10px] mt-0.5">{card.sub}</div>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Savings Breakdown</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-white/40">Managers / Executives (10%)</span><span className="text-white/70">{results.managers}</span></div>
            <div className="flex justify-between"><span className="text-white/40">External Coaching Replaced</span><span className="text-emerald-400">{fmt(results.externalCoaching)}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Turnover Cost Reduction (20%)</span><span className="text-emerald-400">{fmt(results.turnoverSavings)}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Productivity Gains (2%)</span><span className="text-emerald-400">{fmt(results.productivityGains)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}