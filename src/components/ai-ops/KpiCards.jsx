import React from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, DollarSign, Cpu, Clock, CheckCircle, XCircle, Wallet, Calculator, Calendar } from "lucide-react";
import { fmtNum, fmtCost, fmtMs, fmtPct } from "@/lib/aiOperations";

const ICONS = { todayTokens: Zap, monthTokens: TrendingUp, monthCost: DollarSign, totalRequests: Cpu,
  avgLatency: Clock, successRate: CheckCircle, failed: XCircle, budget: Wallet, projectedMonthly: Calculator, projectedAnnual: Calendar };

export default function KpiCards({ analytics, budgetState, onDrillDown }) {
  const { totals, latency, projection, successRate } = analytics;
  const cards = [
    { key: "todayTokens", label: "Today's Tokens", value: fmtNum(totals.todayTokens), accent: "text-yellow-400" },
    { key: "monthTokens", label: "Monthly Tokens", value: fmtNum(totals.monthTokens), accent: "text-cyan-400" },
    { key: "monthCost", label: "Estimated Cost", value: fmtCost(totals.monthCost), accent: "text-emerald-400" },
    { key: "totalRequests", label: "Total Requests", value: fmtNum(totals.totalRequests), accent: "text-indigo-400" },
    { key: "avgLatency", label: "Avg Response Time", value: fmtMs(latency.avg), accent: "text-blue-400" },
    { key: "successRate", label: "Success Rate", value: fmtPct(successRate), accent: "text-emerald-400" },
    { key: "failed", label: "Failed Requests", value: fmtNum(totals.errorCount), accent: "text-red-400" },
    { key: "budget", label: "Budget Usage", value: budgetState.monthly > 0 ? fmtPct(budgetState.pct) : "—", accent: budgetState.status === "exceeded" ? "text-red-400" : budgetState.status === "warning" ? "text-amber-400" : "text-white" },
    { key: "projectedMonthly", label: "Projected Monthly", value: fmtCost(projection.projectedMonthlyCost), accent: "text-purple-400" },
    { key: "projectedAnnual", label: "Projected Annual", value: fmtCost(projection.projectedAnnualCost), accent: "text-pink-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => {
        const Icon = ICONS[c.key] || Cpu;
        return (
          <motion.button
            key={c.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onDrillDown(c.key, c.label)}
            className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-left hover:border-white/15 hover:bg-white/[0.05] transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon size={16} className={c.accent} />
              <span className="text-[10px] text-white/0 group-hover:text-white/30 transition-colors">→</span>
            </div>
            <div className="text-xl font-bold text-white">{c.value}</div>
            <div className="text-white/30 text-[11px] mt-0.5">{c.label}</div>
          </motion.button>
        );
      })}
    </div>
  );
}