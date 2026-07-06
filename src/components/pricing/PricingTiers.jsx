import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, Users, Sparkles } from "lucide-react";
import { PLAN_CONTENT } from "@/lib/pricingContent";

function Cell({ value, note }) {
  if (value === true) return <Check size={16} className="text-emerald-400" />;
  if (value === "limited") return <span className="text-amber-400 text-xs font-medium">{note || "Limited"}</span>;
  return <span className="text-white/15 text-xs">—</span>;
}

export default function PricingTiers({ plans, cycle, getPrice, authed }) {
  const visiblePlans = plans.filter(p => p.visible !== false && p.id !== "developer_unlimited");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {visiblePlans.map((plan, i) => {
        const content = PLAN_CONTENT[plan.id];
        if (!content) return null;
        const price = getPrice(plan);
        const isCustom = plan.customPricing;
        const isExecutive = plan.id === "executive";

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`relative rounded-2xl flex flex-col bg-gradient-to-b ${content.glow} to-transparent border ${isExecutive ? "border-purple-500/30 ring-1 ring-purple-500/10" : content.ring}`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                {plan.badge}
              </div>
            )}
            {isExecutive && !plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                Best Value
              </div>
            )}

            <div className="p-6 flex flex-col flex-1">
              <div className="text-2xl mb-2">{plan.icon}</div>
              <h3 className="text-white font-bold text-lg">{plan.name}</h3>
              <p className={`text-sm font-medium ${content.accent} mt-1 min-h-[2.5rem]`}>{content.headline}</p>

              <div className="mt-5 mb-1">
                {isCustom ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">Custom</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white tracking-tight">{price === 0 ? "Free" : `$${price}`}</span>
                    {price !== 0 && <span className="text-white/30 text-sm">/{cycle === "monthly" ? "mo" : "yr"}</span>}
                  </div>
                )}
              </div>
              <p className="text-white/30 text-xs min-h-[1.25rem]">
                {isCustom ? `Starting at ${content.startingUsers} users` : cycle === "annual" && price !== 0 ? "Billed annually · 2 months free" : price === 0 ? "Free forever" : "Billed monthly"}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5 min-h-[3.5rem]">
                {content.audience.slice(0, 4).map(a => (
                  <span key={a} className="px-2 py-0.5 bg-white/5 rounded-md text-white/40 text-[10px] font-medium">{a}</span>
                ))}
                {content.audience.length > 4 && <span className="px-2 py-0.5 text-white/30 text-[10px]">+{content.audience.length - 4}</span>}
              </div>

              <div className="mt-4 bg-white/[0.03] border border-white/5 rounded-lg p-3 flex items-start gap-2">
                <Sparkles size={14} className={`${content.accent} flex-shrink-0 mt-0.5`} />
                <p className="text-white/50 text-xs leading-relaxed">{content.roi}</p>
              </div>

              <div className="mt-5 flex-1">
                {isCustom ? (
                  <div className="space-y-2">
                    <Link to="/cpq" className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
                      Request Proposal <ArrowRight size={14} />
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="#demo" className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">
                        Book Demo
                      </Link>
                      <a href="mailto:sales@execlead.ai" className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">
                        Talk to Sales
                      </a>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={authed ? "/billing" : "/register"}
                    className={`flex items-center justify-center gap-1.5 w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isExecutive
                        ? "bg-purple-500 hover:bg-purple-600 text-white"
                        : plan.id === "professional"
                          ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                          : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
                    }`}
                  >
                    {content.cta} <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}