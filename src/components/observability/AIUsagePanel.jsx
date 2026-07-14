import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bot, CheckCircle, Coins, Clock } from "lucide-react";
import { Spinner, Empty, Panel, BarRow, StatCard } from "./Shared";

export default function AIUsagePanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.UsageLog.list("-created_date", 200)
      .then((data) => setLogs(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const moduleCounts = {};
  logs.forEach((l) => { if (l.module) moduleCounts[l.module] = (moduleCounts[l.module] || 0) + 1; });
  const sortedModules = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]);

  const successCount = logs.filter((l) => l.status === "success").length;
  const successRate = logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0;
  const totalTokens = logs.reduce((sum, l) => sum + (l.input_tokens || 0) + (l.output_tokens || 0), 0);
  const avgResponseTime = logs.length > 0 ? Math.round(logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length) : 0;

  const providerCounts = {};
  logs.forEach((l) => { if (l.provider) providerCounts[l.provider] = (providerCounts[l.provider] || 0) + 1; });
  const sortedProviders = Object.entries(providerCounts).sort((a, b) => b[1] - a[1]);

  const modelCounts = {};
  logs.forEach((l) => { if (l.model) modelCounts[l.model] = (modelCounts[l.model] || 0) + 1; });
  const sortedModels = Object.entries(modelCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Bot} label="AI Requests" value={logs.length} color="purple" />
        <StatCard icon={CheckCircle} label="Success Rate" value={`${successRate}%`} sublabel={`${successCount} success`} color="emerald" />
        <StatCard icon={Coins} label="Total Tokens" value={totalTokens.toLocaleString()} color="amber" />
        <StatCard icon={Clock} label="Avg Response" value={`${avgResponseTime}ms`} color="cyan" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel title="AI Usage by Module">
          {sortedModules.length === 0 ? <Empty text="No AI usage data yet." /> : (
            <div className="space-y-1">
              {sortedModules.map(([mod, count]) => (
                <BarRow key={mod} label={mod} value={count} max={sortedModules[0][1]} color="bg-purple-500/60" />
              ))}
            </div>
          )}
        </Panel>
        <Panel title="AI Providers">
          {sortedProviders.length === 0 ? <Empty text="No provider data yet." /> : (
            <div className="space-y-1">
              {sortedProviders.map(([prov, count]) => (
                <BarRow key={prov} label={prov} value={count} max={sortedProviders[0][1]} color="bg-cyan-500/60" />
              ))}
            </div>
          )}
        </Panel>
      </div>

      {sortedModels.length > 0 && (
        <Panel title="Top AI Models">
          <div className="space-y-1">
            {sortedModels.map(([model, count]) => (
              <BarRow key={model} label={model} value={count} max={sortedModels[0][1]} color="bg-indigo-500/60" />
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}