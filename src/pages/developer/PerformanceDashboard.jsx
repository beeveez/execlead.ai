import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import PerformanceBudgets from "@/components/developer/performance/PerformanceBudgets";
import LatencyMetrics from "@/components/developer/performance/LatencyMetrics";
import IntelligenceCacheConfig from "@/components/developer/performance/IntelligenceCacheConfig";
import AIOptimizationRules from "@/components/developer/performance/AIOptimizationRules";
import BackgroundJobMonitor from "@/components/developer/performance/BackgroundJobMonitor";
import OptimizationChecklist from "@/components/developer/performance/OptimizationChecklist";
import { Gauge, Loader2, Zap } from "lucide-react";

export default function PerformanceDashboard() {
  const [usageLogs, setUsageLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const logs = await base44.entities.UsageLog.filter({ status: "success" }, "-created_date", 100);
      setUsageLogs(logs);
    } catch {
      // UsageLog might not be accessible — metrics show as "no data"
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-gradient-to-r from-indigo-950/40 via-[#0a0a0f] to-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Gauge className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Performance Dashboard™</h1>
              <p className="text-xs text-white/40">Performance Optimization Program™ · v1.0 · Priority P0</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-xs text-emerald-300">
              <Zap className="w-3 h-3" /> Objective: &lt;150ms avg · &lt;400ms P95 · &lt;800ms P99
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-0.5 text-xs text-indigo-300">
              No functionality changes — optimization only
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <Card title="Latency Metrics"><LatencyMetrics usageLogs={usageLogs} /></Card>
            <Card title="Background Jobs"><BackgroundJobMonitor /></Card>
            <Card title="Intelligence Cache"><IntelligenceCacheConfig /></Card>
            <Card title="Performance Budgets"><PerformanceBudgets /></Card>
            <Card title="AI Optimization"><AIOptimizationRules /></Card>
            <Card title="Optimization Checklist" className="xl:col-span-1"><OptimizationChecklist /></Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.02] p-4 ${className}`}>
      {children}
    </div>
  );
}