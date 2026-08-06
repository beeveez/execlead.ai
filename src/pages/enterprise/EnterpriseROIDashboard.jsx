import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EnterpriseROIMetrics from "@/components/enterprise/EnterpriseROIMetrics";
import EnterpriseSimulationCredits from "@/components/enterprise/EnterpriseSimulationCredits";
import EnterpriseUpgradeTriggers from "@/components/enterprise/EnterpriseUpgradeTriggers";
import { SIMULATION_CREDIT_PROGRAM, GA_ENTERPRISE_TIERS } from "@/lib/enterpriseCommercialArchitecture";

const LIMIT = 200;

async function count(entity) {
  try {
    const list = await base44.entities[entity].list("-created_date", LIMIT);
    if (!Array.isArray(list)) return null;
    return list.length >= LIMIT ? `${list.length}+` : `${list.length}`;
  } catch {
    return null;
  }
}

async function readinessAvg() {
  try {
    const list = await base44.entities.ReadinessAssessment.list("-created_date", LIMIT);
    if (!Array.isArray(list) || !list.length) return null;
    const sum = list.reduce((a, r) => a + (r.overall_score || 0), 0);
    return `${Math.round(sum / list.length)}/100`;
  } catch {
    return null;
  }
}

export default function EnterpriseROIDashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [assessments, simulations, succession, engagement, learning, readinessAvgVal, promotion] = await Promise.all([
        count("ReadinessAssessment"),
        count("DecisionAttempt"),
        count("SuccessionPlan"),
        count("JourneyEvent"),
        count("LessonProgress"),
        readinessAvg(),
        count("PromotionForecast"),
      ]);
      setData({
        assessment_completion: assessments,
        simulation_participation: simulations,
        succession_pipeline: succession,
        leadership_engagement: engagement,
        learning_progress: learning,
        readiness_improvement: readinessAvgVal,
        promotion_readiness: promotion,
      });
      setLoading(false);
    })();
  }, []);

  const assessmentCount = data.assessment_completion ? parseInt(data.assessment_completion) : 0;
  const utilization = {
    simulationCreditsUsed: 0,
    simulationCreditsTotal: SIMULATION_CREDIT_PROGRAM.annualAllocationPerAccount,
    assessmentCapacityUsed: assessmentCount,
    assessmentCapacityTotal: 200,
  };

  return (
    <div className="min-h-screen bg-[#08080d] text-white p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/20 rounded-full text-xs text-accent-orange font-medium mb-3">
            <BarChart3 size={13} /> Enterprise ROI Dashboard™
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Measurable Business Outcomes</h1>
          <p className="text-white/45 text-sm max-w-2xl">
            Customers buy outcomes, not AI. This dashboard surfaces the leadership outcomes your organization is producing through EXECLEAD.AI. Metrics collecting live data are shown in real time; others activate as enterprise instrumentation matures.
          </p>
        </div>

        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">Upgrade Triggers</div>
          <EnterpriseUpgradeTriggers utilization={utilization} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <EnterpriseSimulationCredits used={undefined} />
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={15} className="text-amber-400" />
              <h3 className="text-white text-sm font-semibold">General Availability Enterprise Licensing</h3>
            </div>
            <p className="text-white/50 text-xs mb-4">
              Private Beta keeps the current simple pricing model. These value-based enterprise tiers activate at General Availability.
            </p>
            <div className="space-y-2.5">
              {GA_ENTERPRISE_TIERS.map((t) => (
                <div key={t.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-semibold">{t.name}</span>
                    <span className="text-[10px] text-white/40">{t.stage}</span>
                  </div>
                  <div className="text-[11px] text-white/45 mb-1">Target: {t.target}</div>
                  <div className="text-[11px] text-white/55">{t.purpose}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">Outcome Metrics</div>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-white/10 border-t-accent-orange rounded-full animate-spin" />
          </div>
        ) : (
          <EnterpriseROIMetrics data={data} />
        )}

        <div className="mt-8 text-center">
          <Link to="/enterprise" className="text-xs text-accent-orange hover:text-accent-orange/80">
            Back to Enterprise →
          </Link>
        </div>
      </div>
    </div>
  );
}