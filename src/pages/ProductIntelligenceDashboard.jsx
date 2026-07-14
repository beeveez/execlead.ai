import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, Heart, TrendingUp, Rocket, Star, Lightbulb, FileText, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { computeProductIntelligence } from "@/lib/productIntelligenceEngine";
import { Spinner } from "@/components/product-intelligence/Shared";
import OverviewPanel from "@/components/product-intelligence/OverviewPanel";
import CustomerHealthPanel from "@/components/product-intelligence/CustomerHealthPanel";
import AdoptionPanel from "@/components/product-intelligence/AdoptionPanel";
import GrowthPanel from "@/components/product-intelligence/GrowthPanel";
import BetaSuccessPanel from "@/components/product-intelligence/BetaSuccessPanel";
import MarketFitPanel from "@/components/product-intelligence/MarketFitPanel";
import RecommendationPanel from "@/components/product-intelligence/RecommendationPanel";
import SuccessReportPanel from "@/components/product-intelligence/SuccessReportPanel";

const TABS = [
  { id: "overview", label: "Executive KPIs", icon: BarChart3 },
  { id: "health", label: "Customer Health", icon: Heart },
  { id: "adoption", label: "Product Adoption", icon: BarChart3 },
  { id: "growth", label: "Executive Growth", icon: TrendingUp },
  { id: "beta", label: "Beta Success", icon: Rocket },
  { id: "marketfit", label: "Product Market Fit", icon: Star },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "reports", label: "Success Reports", icon: FileText },
];

export default function ProductIntelligenceDashboard() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [intelligence, setIntelligence] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        telemetryEvents,
        usageLogs,
        betaApplications,
        lessonProgress,
        executiveReputations,
        userProfiles,
        productInsights,
        feedback,
        journeyEvents,
        subscriptions,
      ] = await Promise.allSettled([
        base44.entities.TelemetryEvent.list("-created_date", 500),
        base44.entities.UsageLog.list("-created_date", 200),
        base44.entities.BetaApplication.list("-created_date", 200),
        base44.entities.LessonProgress.list("-updated_date", 200),
        base44.entities.ExecutiveReputation.list("-updated_date", 200),
        base44.entities.UserProfile.list("-created_date", 200),
        base44.entities.ProductInsight.list("-created_date", 200),
        base44.entities.Feedback.list("-created_date", 100),
        base44.entities.JourneyEvent.list("-created_date", 100),
        base44.entities.Subscription.list("-created_date", 100),
      ]);

      const resolve = (r) => (r.status === "fulfilled" ? r.value : []);

      const data = {
        telemetryEvents: resolve(telemetryEvents),
        usageLogs: resolve(usageLogs),
        betaApplications: resolve(betaApplications),
        lessonProgress: resolve(lessonProgress),
        executiveReputations: resolve(executiveReputations),
        userProfiles: resolve(userProfiles),
        productInsights: resolve(productInsights),
        feedback: resolve(feedback),
        journeyEvents: resolve(journeyEvents),
        subscriptions: resolve(subscriptions),
      };

      setIntelligence(computeProductIntelligence(data));
    } catch {
      // entities may not all be available — compute with partial data
      setIntelligence(computeProductIntelligence({}));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 size={22} className="text-indigo-400" />
              EXEC™ Product Intelligence Platform™
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Platform Health asks "What happened?" · Product Intelligence asks "Did we help the customer become a better leader?"
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {intelligence && !loading && (
          <div className="mb-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-emerald-500/10 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-white/40 text-xs">Overall Customer Success Score™</div>
              <div className={`text-3xl font-bold ${intelligence.overallScore >= 70 ? "text-emerald-400" : intelligence.overallScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                {intelligence.overallScore}<span className="text-white/30 text-lg">/100</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/40 text-xs">Philosophy</div>
              <div className="text-white/60 text-sm max-w-xs">
                Optimizing for customer transformation, not just system availability.
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-1 mb-6 border-b border-white/5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "border-indigo-400 text-indigo-400"
                  : "border-transparent text-white/40 hover:text-white/60"
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {loading || !intelligence ? (
          <Spinner />
        ) : (
          <>
            {tab === "overview" && <OverviewPanel data={intelligence} />}
            {tab === "health" && <CustomerHealthPanel data={intelligence} />}
            {tab === "adoption" && <AdoptionPanel data={intelligence} />}
            {tab === "growth" && <GrowthPanel data={intelligence} />}
            {tab === "beta" && <BetaSuccessPanel data={intelligence} />}
            {tab === "marketfit" && <MarketFitPanel data={intelligence} onSubmitted={fetchData} />}
            {tab === "recommendations" && <RecommendationPanel data={intelligence} />}
            {tab === "reports" && <SuccessReportPanel data={intelligence} />}
          </>
        )}
      </div>
    </div>
  );
}