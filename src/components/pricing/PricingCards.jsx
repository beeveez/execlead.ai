import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/payments";

export default function PricingCards({ plans, cycle, getPrice, authed }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan, i) => {
        const price = getPrice(plan);
        const isCustom = plan.customPricing;
        const visibleFeatures = isCustom ? plan.features.slice(0, 10) : plan.features.slice(0, 8);

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-8 flex flex-col ${
              plan.recommended
                ? "bg-gradient-to-b from-indigo-500/10 to-transparent border-2 border-indigo-500/30 relative"
                : "bg-white/[0.02] border border-white/5"
            } ${isCustom ? "lg:row-span-1 border-emerald-500/20" : ""}`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                {plan.badge}
              </div>
            )}
            <div className="text-2xl mb-2">{plan.icon}</div>
            <h3 className="text-white font-semibold text-lg mb-1">{plan.name}</h3>
            <p className="text-white/40 text-xs mb-4 min-h-[2.5rem]">{plan.description}</p>

            <div className="mb-1">
              {isCustom ? (
                <span className="text-2xl font-bold text-white">Custom Pricing</span>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{price === 0 ? "Free" : formatCurrency(price, plan.currency)}</span>
                  {price !== 0 && <span className="text-white/30 text-sm">/ {cycle === "monthly" ? "mo" : "yr"}</span>}
                </div>
              )}
            </div>
            <p className="text-white/30 text-xs mb-6 min-h-[1.25rem]">
              {isCustom ? plan.seatInfo || "Starting at 100 seats" : cycle === "annual" && price !== 0 ? "Billed annually" : price === 0 ? "Free forever" : "Billed monthly"}
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {visibleFeatures.map((f, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-white/50">
                  <Check size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
              {plan.features.length > visibleFeatures.length && (
                <li className="text-xs text-indigo-400 pl-6">+ {plan.features.length - visibleFeatures.length} more features</li>
              )}
            </ul>

            {isCustom ? (
              <div className="space-y-2">
                <a href="#demo" className="block text-center font-medium py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">
                  Book a Demo
                </a>
                <a href="#demo" className="block text-center font-medium py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-colors">
                  Contact Sales
                </a>
              </div>
            ) : (
              <Link
                to={authed ? "/billing" : "/register"}
                className={`block text-center font-medium py-3 rounded-xl transition-colors ${
                  plan.recommended ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "bg-white/5 hover:bg-white/10 text-white/70"
                }`}
              >
                {plan.buttonText}
              </Link>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}