import React, { useState, useMemo } from "react";
import { Brain, Shield, Package, Zap, DollarSign, GitBranch, CheckCircle, Activity, Lock, GitCompare, Map, AlertTriangle, TrendingUp, Clock, Eye, XCircle, Cpu, Globe, Download, FileJson } from "lucide-react";
import { useAIModelManagementData } from "@/hooks/useAIModelManagementData";
import { PROVIDERS, MODEL_CATALOG, RELEASE_WATCH, BENCHMARK_CATEGORIES, BENCHMARK_SCORES, DEPLOYMENT_STAGES, DEPLOYMENT_HISTORY, GOVERNANCE_RECORDS, ROADMAP, AI_SECURITY_METRICS, STATIC_RECOMMENDATIONS, computeOverallBenchmark, getBenchmarkLeaderboard, getComparisonData, computeCostIntelligence, computeModelPerformance, getModelStatusSummary, getAIHealthScore } from "@/lib/aiModelManagementEngine";
import ModelComparisonRadar from "@/components/ai-model-management/ModelComparisonRadar";
import RecommendationEngine from "@/components/ai-model-management/RecommendationEngine";

const STATUS_COLORS = { production: "#10b981", testing: "#f59e0b", deprecated: "#6366f1", retired: "#ef4444" };
const APPROVAL_COLORS = { approved: "#10b981", pending: "#f59e0b", rejected: "#ef4444", archived: "#6366f1" };
const SEV_COLORS = { critical: "#ef4444", high: "#f59e0b", medium: "#eab308", low: "#6366f1" };
const FEATURE_LABELS = { streaming: "Streaming", vision: "Vision", reasoning: "Reasoning", toolCalling: "Tool Calling", structured: "Structured Output", embeddings: "Embeddings", fineTuning: "Fine-tuning" };

export default function AIModelManagement() {
  const { data, loading, error } = useAIModelManagementData();
  const [tab, setTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [compareModels, setCompareModels] = useState(["GPT-6", "Claude Opus 4.8", "Gemini 3.1 Pro", "Grok 4"]);

  const cost = useMemo(() => computeCostIntelligence(data?.usageLogs), [data]);
  const performance = useMemo(() => computeModelPerformance(data?.usageLogs), [data]);
  const leaderboard = useMemo(() => getBenchmarkLeaderboard(), []);
  const comparisonData = useMemo(() => getComparisonData(compareModels), [compareModels]);
  const statusSummary = useMemo(() => getModelStatusSummary(), []);
  const healthScore = useMemo(() => getAIHealthScore(performance, cost), [performance, cost]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>;
  if (error) return <div className="py-20 text-center text-white/40 text-sm">Unable to load AI model data.</div>;

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: Brain },
    { id: "providers", label: "Provider Registry", icon: Globe },
    { id: "catalog", label: "Model Catalog", icon: Package },
    { id: "releases", label: "Release Watch", icon: Zap },
    { id: "benchmarks", label: "Benchmarks", icon: TrendingUp },
    { id: "cost", label: "Cost Intelligence", icon: DollarSign },
    { id: "deployment", label: "Deployment", icon: GitBranch },
    { id: "governance", label: "Governance", icon: Shield },
    { id: "performance", label: "Performance", icon: Activity },
    { id: "security", label: "AI Security", icon: Lock },
    { id: "comparison", label: "Comparison", icon: GitCompare },
    { id: "roadmap", label: "Roadmap", icon: Map },
  ];

  const filteredModels = MODEL_CATALOG.filter((m) => {
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Brain size={12} className="text-indigo-400" /> Operations Workspace · AI Model Management Center™ v1.0
          </div>
          <h1 className="text-2xl font-bold text-white">AI Model Management Center™</h1>
          <p className="text-white/40 text-sm mt-1">Enterprise control tower for AI model discovery, evaluation, approval, deployment, and lifecycle governance.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${tab === t.id ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Dashboard */}
      {tab === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Brain} label="AI Health Score™" value={`${healthScore}/100`} color={healthScore >= 80 ? "#10b981" : healthScore >= 60 ? "#f59e0b" : "#ef4444"} />
            <KpiCard icon={CheckCircle} label="Production Models" value={statusSummary.production} color="#10b981" />
            <KpiCard icon={Eye} label="Under Evaluation" value={statusSummary.testing} color="#f59e0b" />
            <KpiCard icon={Clock} label="Pending Approvals" value={statusSummary.pending} color="#ec4899" />
            <KpiCard icon={DollarSign} label="Avg Cost / 1K Tokens" value={`$${(cost.totalCost / Math.max(cost.totalTokens / 1000, 1)).toFixed(4)}`} color="#06b6d4" />
            <KpiCard icon={Activity} label="Avg Response Time" value={`${performance.avgLatency}ms`} color="#6366f1" />
            <KpiCard icon={DollarSign} label="Monthly AI Spend" value={`$${cost.totalCost.toFixed(2)}`} sub={`${cost.budgetUtilization}% of budget`} color="#a855f7" />
            <KpiCard icon={Globe} label="Active Providers" value={PROVIDERS.filter((p) => p.status === "active").length} color="#14b8a6" />
          </div>

          {/* Provider Health + Latest Releases */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Globe size={14} className="text-indigo-400" /> Provider Health</h3>
              <div className="space-y-2">
                {PROVIDERS.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.connectivity === "healthy" ? "#10b981" : "#f59e0b" }} />
                      <span className="text-white/60">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/40">
                      <span>{p.models} models</span>
                      <span>{p.latency}ms</span>
                      <span className="text-emerald-400/70">{p.availability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Zap size={14} className="text-amber-400" /> Latest Model Releases</h3>
              <div className="space-y-2">
                {RELEASE_WATCH.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/[0.01] border border-white/[0.03] rounded-md p-2.5">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: SEV_COLORS[r.impact] || "#6366f1" }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-white/80">{r.provider} — {r.modelName}</span>
                        <span className="text-[9px] text-white/30">{r.date}</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-0.5">{r.description}</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${SEV_COLORS[r.impact]}20`, color: SEV_COLORS[r.impact] }}>{r.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <RecommendationEngine leaderboard={leaderboard} cost={cost} performance={performance} />
        </div>
      )}

      {/* Tab 2: Provider Registry */}
      {tab === "providers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROVIDERS.map((p) => (
            <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.connectivity === "healthy" ? "#10b981" : "#f59e0b" }} />
                  <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: p.status === "active" ? "#10b98120" : "#6366f120", color: p.status === "active" ? "#10b981" : "#6366f1" }}>{p.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <MiniStat label="Auth" value={p.auth} />
                <MiniStat label="Connectivity" value={p.connectivity} />
                <MiniStat label="Models" value={p.models} />
                <MiniStat label="Latency" value={`${p.latency}ms`} />
                <MiniStat label="Availability" value={`${p.availability}%`} />
                <MiniStat label="Last Check" value={new Date(p.lastHealthCheck).toLocaleDateString()} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(p.features).map(([key, supported]) => (
                  <span key={key} className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${supported ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/20"}`}>
                    {supported ? "✓" : "✕"} {FEATURE_LABELS[key]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Model Catalog */}
      {tab === "catalog" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <input type="text" placeholder="Search models…" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 flex-1 min-w-[200px]" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-indigo-500/40">
              <option value="all">All Statuses</option>
              <option value="production">Production</option>
              <option value="testing">Testing</option>
              <option value="deprecated">Deprecated</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Provider</th><th className="text-left py-2 px-2">Model</th><th className="text-left py-2 px-2">Release</th><th className="text-left py-2 px-2">Context</th><th className="text-right py-2 px-2">Input $/1K</th><th className="text-right py-2 px-2">Output $/1K</th><th className="text-center py-2 px-2">Status</th><th className="text-center py-2 px-2">Approval</th>
              </tr></thead>
              <tbody>
                {filteredModels.map((m) => (
                  <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2 px-2 text-white/60">{m.provider}</td>
                    <td className="py-2 px-2 text-white/80">{m.name}</td>
                    <td className="py-2 px-2 text-white/40">{m.releaseDate}</td>
                    <td className="py-2 px-2 text-white/40">{(m.contextWindow / 1000).toFixed(0)}K</td>
                    <td className="py-2 px-2 text-right text-white/40">${m.inputPrice.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right text-white/40">${m.outputPrice.toFixed(2)}</td>
                    <td className="py-2 px-2 text-center"><span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[m.status]}20`, color: STATUS_COLORS[m.status] }}>{m.status}</span></td>
                    <td className="py-2 px-2 text-center"><span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${APPROVAL_COLORS[m.approval]}20`, color: APPROVAL_COLORS[m.approval] }}>{m.approval}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Release Watch */}
      {tab === "releases" && (
        <div className="space-y-4">
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-400">Automated Release Monitoring — Daily Scan Active</h3>
              <p className="text-xs text-white/40 mt-1">EXECLEAD.AI monitors all providers daily. New models are never automatically enabled — every release requires review, benchmark, security validation, and governance approval.</p>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Zap size={14} className="text-amber-400" /> Detected Changes</h3>
            <div className="space-y-2">
              {RELEASE_WATCH.map((r, i) => (
                <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{r.provider}</span>
                      <span className="text-[10px] text-white/30">{r.type.replace(/_/g, " ")}</span>
                      <span className="text-xs text-indigo-400">{r.modelName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${SEV_COLORS[r.impact]}20`, color: SEV_COLORS[r.impact] }}>{r.impact}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: r.status === "review_required" ? "#f59e0b20" : "#10b98120", color: r.status === "review_required" ? "#f59e0b" : "#10b981" }}>{r.status.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40">{r.description}</p>
                  <p className="text-[9px] text-white/30 mt-1">Detected: {r.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Benchmark Center */}
      {tab === "benchmarks" && (
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-indigo-400" /> Benchmark Leaderboard — Overall Benchmark Score™</h3>
            <div className="space-y-2">
              {leaderboard.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-white/30 w-6">#{i + 1}</span>
                  <span className="text-xs text-white/80 w-40">{m.model}</span>
                  <span className="text-[10px] text-white/40 w-24">{m.provider}</span>
                  <div className="flex-1 h-6 bg-white/5 rounded-md overflow-hidden">
                    <div className="h-full rounded-md flex items-center pl-2" style={{ width: `${m.overall}%`, backgroundColor: i === 0 ? "#10b981" : i === 1 ? "#06b6d4" : i === 2 ? "#6366f1" : "#a855f7", minWidth: "50px" }}>
                      <span className="text-[10px] text-white font-medium">{m.overall}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[m.status]}20`, color: STATUS_COLORS[m.status] }}>{m.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Category Breakdown — Top 3 Models</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-white/40 border-b border-white/5">
                  <th className="text-left py-2 px-2">Category</th>
                  {leaderboard.slice(0, 3).map((m) => <th key={m.model} className="text-center py-2 px-2">{m.model}</th>)}
                </tr></thead>
                <tbody>
                  {BENCHMARK_CATEGORIES.map((cat) => (
                    <tr key={cat} className="border-b border-white/[0.03]">
                      <td className="py-2 px-2 text-white/60">{cat}</td>
                      {leaderboard.slice(0, 3).map((m) => {
                        const score = m.scores[cat] || 0;
                        return <td key={m.model} className="py-2 px-2 text-center"><span className="font-medium" style={{ color: score >= 90 ? "#10b981" : score >= 80 ? "#06b6d4" : "#f59e0b" }}>{score}</span></td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Cost Intelligence */}
      {tab === "cost" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={DollarSign} label="Total Spend" value={`$${cost.totalCost.toFixed(2)}`} color="#10b981" />
            <KpiCard icon={DollarSign} label="Budget Utilization" value={`${cost.budgetUtilization}%`} sub={`of $${cost.monthlyBudget}`} color={cost.budgetUtilization > 80 ? "#ef4444" : "#06b6d4"} />
            <KpiCard icon={DollarSign} label="Avg Cost / User" value={`$${cost.avgCostPerUser.toFixed(2)}`} color="#6366f1" />
            <KpiCard icon={Activity} label="Total Tokens" value={cost.totalTokens.toLocaleString()} color="#a855f7" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Spend by Provider</h3>
              {cost.providerSpend.length > 0 ? (
                <div className="space-y-2">
                  {cost.providerSpend.map((p, i) => {
                    const max = cost.providerSpend[0]?.amount || 1;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-white/60 w-24 capitalize">{p.provider}</span>
                        <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
                          <div className="h-full rounded-md" style={{ width: `${(p.amount / max) * 100}%`, backgroundColor: "#6366f1", minWidth: "30px" }} />
                        </div>
                        <span className="text-xs text-white/40 w-16 text-right">${p.amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-white/30 text-xs">No spend data available.</p>}
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Spend by Feature</h3>
              {cost.moduleSpend.length > 0 ? (
                <div className="space-y-2">
                  {cost.moduleSpend.slice(0, 8).map((m, i) => {
                    const max = cost.moduleSpend[0]?.amount || 1;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-white/60 w-24 capitalize">{m.module}</span>
                        <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
                          <div className="h-full rounded-md" style={{ width: `${(m.amount / max) * 100}%`, backgroundColor: "#10b981", minWidth: "30px" }} />
                        </div>
                        <span className="text-xs text-white/40 w-16 text-right">${m.amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-white/30 text-xs">No feature spend data available.</p>}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Cost Optimization Recommendations</h3>
            <ul className="space-y-2">
              {STATIC_RECOMMENDATIONS.filter((r) => r.type === "cost" || r.type === "recommendation").map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs"><span className="text-amber-400">→</span><div><span className="text-white/70">{r.title}</span><p className="text-[10px] text-white/40 mt-0.5">{r.action}</p></div></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 7: Deployment Manager */}
      {tab === "deployment" && (
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><GitBranch size={14} className="text-indigo-400" /> Deployment Pipeline</h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {DEPLOYMENT_STAGES.map((stage, i) => (
                <div key={stage} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: i < 5 ? "#10b98120" : i === 5 ? "#f59e0b20" : "#6366f120", color: i < 5 ? "#10b981" : i === 5 ? "#f59e0b" : "#6366f1", border: `1px solid ${i < 5 ? "#10b98140" : i === 5 ? "#f59e0b40" : "#6366f140"}` }}>{i < 5 ? "✓" : i + 1}</div>
                    <span className="text-[9px] text-white/40 mt-1 text-center">{stage}</span>
                  </div>
                  {i < DEPLOYMENT_STAGES.length - 1 && <div className="h-px w-8 bg-white/10" />}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Deployment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-white/40 border-b border-white/5">
                  <th className="text-left py-2 px-2">Model</th><th className="text-left py-2 px-2">Provider</th><th className="text-left py-2 px-2">Date</th><th className="text-left py-2 px-2">Stage</th><th className="text-left py-2 px-2">Strategy</th><th className="text-left py-2 px-2">Status</th><th className="text-left py-2 px-2">Notes</th>
                </tr></thead>
                <tbody>
                  {DEPLOYMENT_HISTORY.map((d, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td className="py-2 px-2 text-white/80">{d.model}</td>
                      <td className="py-2 px-2 text-white/50">{d.provider}</td>
                      <td className="py-2 px-2 text-white/40">{d.date}</td>
                      <td className="py-2 px-2 text-white/50">{d.stage}</td>
                      <td className="py-2 px-2 text-white/40">{d.strategy}</td>
                      <td className="py-2 px-2"><span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: d.status === "completed" ? "#10b98120" : "#f59e0b20", color: d.status === "completed" ? "#10b981" : "#f59e0b" }}>{d.status}</span></td>
                      <td className="py-2 px-2 text-white/40">{d.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Governance */}
      {tab === "governance" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3 mb-4 flex items-start gap-2">
            <Shield size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-white/50">Every deployment requires: Benchmark → Security Validation → Cost Review → Governance Approval → Deployment Record → Audit Log → Rollback Plan.</p>
          </div>
          <h3 className="text-sm font-semibold text-white mb-3">Approval History & Change Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Model</th><th className="text-left py-2 px-2">Action</th><th className="text-left py-2 px-2">Requester</th><th className="text-left py-2 px-2">Approver</th><th className="text-left py-2 px-2">Date</th><th className="text-center py-2 px-2">Risk</th><th className="text-center py-2 px-2">Status</th><th className="text-left py-2 px-2">Expiry</th>
              </tr></thead>
              <tbody>
                {GOVERNANCE_RECORDS.map((g, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="py-2 px-2 text-white/80">{g.model}</td>
                    <td className="py-2 px-2 text-white/50 capitalize">{g.action}</td>
                    <td className="py-2 px-2 text-white/50">{g.requester}</td>
                    <td className="py-2 px-2 text-white/50">{g.approver}</td>
                    <td className="py-2 px-2 text-white/40">{g.date}</td>
                    <td className="py-2 px-2 text-center"><span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${SEV_COLORS[g.risk]}20`, color: SEV_COLORS[g.risk] }}>{g.risk}</span></td>
                    <td className="py-2 px-2 text-center"><span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: g.status === "approved" ? "#10b98120" : "#f59e0b20", color: g.status === "approved" ? "#10b981" : "#f59e0b" }}>{g.status}</span></td>
                    <td className="py-2 px-2 text-white/40">{g.expiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 9: Performance */}
      {tab === "performance" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Activity} label="Success Rate" value={`${performance.successRate}%`} color="#10b981" />
            <KpiCard icon={XCircle} label="Failure Rate" value={`${performance.failureRate}%`} color="#ef4444" />
            <KpiCard icon={Clock} label="Avg Latency" value={`${performance.avgLatency}ms`} color="#06b6d4" />
            <KpiCard icon={AlertTriangle} label="Timeouts" value={performance.timeoutCount} color="#f59e0b" />
            <KpiCard icon={Activity} label="Total Requests" value={performance.requestCount.toLocaleString()} color="#6366f1" />
            <KpiCard icon={Cpu} label="Total Tokens" value={performance.totalTokens.toLocaleString()} color="#a855f7" />
            <KpiCard icon={Shield} label="Rate Limited" value={performance.rateLimitedCount} color="#ec4899" />
            <KpiCard icon={TrendingUp} label="Hallucination Reports" value="3" color="#f59e0b" />
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Model Performance Breakdown</h3>
            {performance.modelStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-white/40 border-b border-white/5">
                    <th className="text-left py-2 px-2">Model</th><th className="text-right py-2 px-2">Requests</th><th className="text-right py-2 px-2">Avg Latency</th><th className="text-right py-2 px-2">Success Rate</th><th className="text-right py-2 px-2">Failure Rate</th><th className="text-right py-2 px-2">Tokens</th>
                  </tr></thead>
                  <tbody>
                    {performance.modelStats.map((m, i) => (
                      <tr key={i} className="border-b border-white/[0.03]">
                        <td className="py-2 px-2 text-white/80">{m.model}</td>
                        <td className="py-2 px-2 text-right text-white/60">{m.count}</td>
                        <td className="py-2 px-2 text-right text-white/60">{m.avgLatency}ms</td>
                        <td className="py-2 px-2 text-right text-emerald-400">{m.successRate}%</td>
                        <td className="py-2 px-2 text-right text-red-400">{m.failureRate}%</td>
                        <td className="py-2 px-2 text-right text-white/40">{m.tokens.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-white/30 text-xs">No performance data available.</p>}
          </div>
        </div>
      )}

      {/* Tab 10: AI Security */}
      {tab === "security" && (
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Lock size={14} className="text-indigo-400" /> AI Security Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AI_SECURITY_METRICS.map((s) => (
                <div key={s.id} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/80">{s.label}</span>
                    <span className="text-sm font-bold" style={{ color: s.score >= 90 ? "#10b981" : s.score >= 80 ? "#06b6d4" : "#f59e0b" }}>{s.score}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: s.score >= 90 ? "#10b981" : s.score >= 80 ? "#06b6d4" : "#f59e0b" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-white/40">{s.description}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: s.count > 0 ? "#f59e0b20" : "#10b98120", color: s.count > 0 ? "#f59e0b" : "#10b981" }}>{s.count} detected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Shield size={14} className="text-emerald-400" /> Security Recommendations™</h3>
            <ul className="space-y-2">
              {STATIC_RECOMMENDATIONS.filter((r) => r.type === "security").map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs"><span className="text-red-400">→</span><div><span className="text-white/70">{r.title}</span><p className="text-[10px] text-white/40 mt-0.5">{r.action}</p></div></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 11: Model Comparison */}
      {tab === "comparison" && (
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><GitCompare size={14} className="text-indigo-400" /> Model Comparison — Radar Chart</h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(BENCHMARK_SCORES).map((model) => (
                  <button key={model} onClick={() => setCompareModels((prev) => prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model])} className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${compareModels.includes(model) ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-white/5 text-white/30 border border-white/5"}`}>{model}</button>
                ))}
              </div>
            </div>
            <ModelComparisonRadar data={comparisonData} models={compareModels} />
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Side-by-Side Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-white/40 border-b border-white/5">
                  <th className="text-left py-2 px-2">Metric</th>
                  {compareModels.map((m) => <th key={m} className="text-center py-2 px-2">{m}</th>)}
                </tr></thead>
                <tbody>
                  {["Executive Coaching", "Reasoning", "Speed", "Cost Efficiency", "Reliability", "Overall"].map((metric) => (
                    <tr key={metric} className="border-b border-white/[0.03]">
                      <td className="py-2 px-2 text-white/60">{metric}</td>
                      {compareModels.map((m) => {
                        const val = comparisonData.find((d) => d.axis === metric)?.[m] || 0;
                        return <td key={m} className="py-2 px-2 text-center"><span className="font-medium" style={{ color: val >= 90 ? "#10b981" : val >= 80 ? "#06b6d4" : "#f59e0b" }}>{val}</span></td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 12: Roadmap */}
      {tab === "roadmap" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Map size={14} className="text-indigo-400" /> AI Roadmap™ — Future Releases & Migration Plans</h3>
          <div className="space-y-3">
            {ROADMAP.map((r, i) => (
              <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: SEV_COLORS[r.impact] || "#6366f1" }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white/80">{r.item}</span>
                    <span className="text-[9px] text-white/30">{r.eta}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] text-white/40">{r.type.replace(/_/g, " ")}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${SEV_COLORS[r.impact]}20`, color: SEV_COLORS[r.impact] }}>{r.impact}</span>
                    <span className="text-[9px] text-white/30">Status: {r.status.replace(/_/g, " ")}</span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">{r.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} style={{ color }} />
      <div className="text-xl font-bold text-white mt-2">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
      {sub && <div className="text-[10px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-2">
      <div className="text-[9px] text-white/30">{label}</div>
      <div className="text-xs text-white/70">{value}</div>
    </div>
  );
}