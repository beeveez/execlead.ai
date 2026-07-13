import React from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Tag, Shield, Settings, BarChart3, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import BetaHero from "./beta/BetaHero";
import BetaBenefits from "./beta/BetaBenefits";
import ApplicationFlow from "./beta/ApplicationFlow";
import FoundingMemberValueCalc from "./FoundingMemberValueCalc";
import FoundingTimeline from "./beta/FoundingTimeline";
import BetaSpotlight from "./beta/BetaSpotlight";
import BetaFAQ from "./beta/BetaFAQ";

export default function FoundingMemberSection() {
  const { plans, getPrice } = usePricingCatalog();
  const paidPlans = plans.filter((p) => p.monthlyPrice > 0 && !p.enterpriseOnly);

  const scrollToApply = () => {
    document.getElementById("beta-apply")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-orange-500/[0.02] to-transparent p-8 md:p-12 lg:p-16"
    >
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-16 md:space-y-20">
        <BetaHero onApply={scrollToApply} />
        <BetaBenefits />
        <ApplicationFlow />
        <FoundingMemberValueCalc />

        {/* Future GA Pricing */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-amber-400" />
            <h3 className="text-white font-semibold text-lg">Pricing</h3>
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400 font-medium uppercase tracking-wider">
              Future GA Pricing
            </span>
          </div>
          <p className="text-white/40 text-sm mb-6 max-w-2xl">
            Pricing shown reflects future General Availability positioning. Current beta participants
            are not charged during the Founding Private Beta™ unless explicitly stated.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paidPlans.map((plan) => (
              <div key={plan.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                <div className="text-2xl mb-1">{plan.icon}</div>
                <h4 className="text-white font-semibold text-sm mb-1">{plan.name}</h4>
                <div className="text-amber-300 font-bold text-lg mb-3">${getPrice(plan)}<span className="text-white/30 text-xs font-normal">/mo</span></div>
                <button onClick={scrollToApply} className="w-full text-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 font-medium py-2 rounded-lg transition-colors">
                  Apply for Private Beta™
                </button>
              </div>
            ))}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
              <div className="text-2xl mb-1">🏢</div>
              <h4 className="text-white font-semibold text-sm mb-1">Enterprise</h4>
              <div className="text-white/50 font-bold text-lg mb-3">Custom</div>
              <Link to="/beta?tier=enterprise_beta" className="block text-center text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-medium py-2 rounded-lg transition-colors">
                Request Enterprise Beta™
              </Link>
            </div>
          </div>
          <div className="text-center mt-5">
            <button onClick={scrollToApply} className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors">
              View Membership Benefits <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <FoundingTimeline />
        <BetaSpotlight />
        <BetaFAQ />

        {/* Administration & Reporting */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={14} className="text-white/40" />
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Administration</h4>
            </div>
            <p className="text-white/40 text-xs leading-relaxed mb-2">
              Applications are stored in the BetaApplication entity and managed through the Beta Program Center™.
            </p>
            <div className="flex flex-wrap gap-1">
              {["Applied", "Review", "Approve", "Waitlist", "Reject", "Invite", "Activate"].map((s) => (
                <span key={s} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/40">{s}</span>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-white/40" />
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Reporting</h4>
            </div>
            <p className="text-white/40 text-xs leading-relaxed mb-2">
              Executive Beta Reports with geographic, leadership-level, and company distribution analytics.
            </p>
            <div className="flex flex-wrap gap-1">
              {["PDF", "CSV", "Excel"].map((f) => (
                <span key={f} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/40">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}