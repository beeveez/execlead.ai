import React, { useState } from "react";
import { Cpu, Shield, Loader2 } from "lucide-react";
import { useAIOperations } from "@/hooks/useAIOperations";
import FilterBar from "@/components/ai-ops/FilterBar";
import KpiCards from "@/components/ai-ops/KpiCards";
import ProviderHealth from "@/components/ai-ops/ProviderHealth";
import ModelAnalytics from "@/components/ai-ops/ModelAnalytics";
import TokenAnalytics from "@/components/ai-ops/TokenAnalytics";
import CostAnalytics from "@/components/ai-ops/CostAnalytics";
import BudgetPanel from "@/components/ai-ops/BudgetPanel";
import ModuleAnalytics from "@/components/ai-ops/ModuleAnalytics";
import DailyTrend from "@/components/ai-ops/DailyTrend";
import MonthlyTrend from "@/components/ai-ops/MonthlyTrend";
import TopUsers from "@/components/ai-ops/TopUsers";
import ActivityFeed from "@/components/ai-ops/ActivityFeed";
import PerformanceStats from "@/components/ai-ops/PerformanceStats";
import ErrorAnalytics from "@/components/ai-ops/ErrorAnalytics";
import HealthScore from "@/components/ai-ops/HealthScore";
import UsageForecast from "@/components/ai-ops/UsageForecast";
import SubscriptionLimits from "@/components/ai-ops/SubscriptionLimits";
import ExportCenter from "@/components/ai-ops/ExportCenter";
import AdminInsights from "@/components/ai-ops/AdminInsights";
import DrillDown from "@/components/ai-ops/DrillDown";

const SCOPE_LABELS = { global: "Global", organization: "Organization", personal: "Personal" };

export default function AIUsage() {
  const ops = useAIOperations();
  const [drillDown, setDrillDown] = useState(null);

  if (ops.loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  const { analytics } = ops;
  const hasData = ops.logs.length > 0;

  const handleDrillDown = (metricKey, label) => setDrillDown({ metricKey, label });
  const handleSelectModule = (module) => ops.updateFilter({ module });

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Cpu size={12} className="text-indigo-400" /> AI Operations Center
          </div>
          <h1 className="text-2xl font-bold text-white">AI Operations Center</h1>
          <p className="text-white/40 text-sm mt-1 max-w-2xl">
            Monitor AI performance, operational health, token consumption, costs, and business intelligence across the EXECLEAD.AI platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-xs font-medium text-white/60">
            <Shield size={12} className="text-indigo-400" /> {SCOPE_LABELS[ops.scope] || "Personal"} View
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: ops.subscription?.color }}>
            <span>{ops.subscription?.icon}</span> {ops.subscription?.planName}
          </span>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filter={ops.filter}
        updateFilter={ops.updateFilter}
        resetFilter={ops.resetFilter}
        autoRefresh={ops.autoRefresh}
        setAutoRefresh={ops.setAutoRefresh}
        refresh={ops.refresh}
        lastRefresh={ops.lastRefresh}
        scope={SCOPE_LABELS[ops.scope]}
      />

      {/* KPI Summary */}
      <KpiCards analytics={analytics} budgetState={ops.budgetState} onDrillDown={handleDrillDown} />

      {ops.error ? (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm font-medium">Failed to load AI operations data</p>
          <p className="text-white/30 text-xs mt-1">{ops.error}</p>
          <button onClick={ops.refresh} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300">Retry</button>
        </div>
      ) : !hasData ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Cpu size={32} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/40 text-sm font-medium">No AI usage recorded for this period</p>
          <p className="text-white/20 text-xs mt-1">Usage data will appear here as AI features are used. Try expanding the date range.</p>
        </div>
      ) : (
        <>
          {/* Provider Health */}
          <ProviderHealth analytics={analytics} />

          {/* Trends + Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><DailyTrend analytics={analytics} /></div>
            <HealthScore analytics={analytics} budgetState={ops.budgetState} />
          </div>

          {/* Token / Cost / Budget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TokenAnalytics analytics={analytics} />
            <CostAnalytics analytics={analytics} />
            <BudgetPanel budgetState={ops.budgetState} saveBudget={ops.saveBudget} />
          </div>

          {/* Module Analytics */}
          <ModuleAnalytics analytics={analytics} onSelectModule={handleSelectModule} />

          {/* Model Analytics */}
          <ModelAnalytics analytics={analytics} />

          {/* Monthly Trend + Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><MonthlyTrend analytics={analytics} /></div>
            <PerformanceStats analytics={analytics} />
          </div>

          {/* Errors + Subscription */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><ErrorAnalytics analytics={analytics} /></div>
            <SubscriptionLimits token={ops.token} subscription={ops.subscription} />
          </div>

          {/* Forecast + Export */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <UsageForecast analytics={analytics} budgetState={ops.budgetState} />
            <div className="lg:col-span-2"><ExportCenter logs={ops.logs} analytics={analytics} /></div>
          </div>

          {/* Admin Insights — global scope only */}
          {ops.isGlobalScope && <AdminInsights analytics={analytics} />}

          {/* Top Users — enterprise / global only */}
          {(ops.isGlobalScope || ops.isEnterprisePlan) && <TopUsers analytics={analytics} />}

          {/* Recent Activity */}
          <ActivityFeed analytics={analytics} />
        </>
      )}

      {/* Drill-Down Modal */}
      <DrillDown
        open={!!drillDown}
        metricKey={drillDown?.metricKey}
        label={drillDown?.label}
        analytics={analytics}
        onClose={() => setDrillDown(null)}
      />
    </div>
  );
}