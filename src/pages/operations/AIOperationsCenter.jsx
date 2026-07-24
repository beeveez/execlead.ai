import React, { useState, useMemo } from "react";
import { Brain, Zap, Mic, DollarSign, Activity, GitBranch, Shield, Settings, TrendingUp, Globe, Cpu, Sparkles, Building2, ArrowRight, CheckCircle, Clock, AlertTriangle, Volume2, ShoppingCart, Gift, Crown, FileText, Eye, Brain as BrainIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAIModelManagementData } from "@/hooks/useAIModelManagementData";
import { computeAIAnalytics, computeProfitability, ROUTING_RULES, VOICE_PROVIDERS, AUDIO_PIPELINE, MARKETPLACE_ITEMS, GOVERNANCE_ITEMS, FUTURE_PLATFORM, ENTERPRISE_AI_POLICIES, AI_CAPABILITIES_STATUS } from "@/lib/aiOperationsEngine";
import RecommendationEngine from "@/components/ai-ops/RecommendationEngine";
import ProfitabilityDashboard from "@/components/ai-ops/ProfitabilityDashboard";
import ExperimentLab from "@/components/ai-ops/ExperimentLab";

const OPT_COLORS = { quality: "#10b981", cost: "#06b6d4", latency: "#f59e0b" };
const STATUS_COLORS = { active: "#10b981", available: "#06b6d4", planned: "#6366f1", beta: "#f59e0b" };
const TYPE_COLORS = { credit_pack: "#6366f1", bundle: "#10b981", gift: "#ec4899", promotion: "#f59e0b", enterprise: "#a855f7" };
const RISK_COLORS = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };
const PRIORITY_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#6366f1" };

export default function AIOperationsCenter() {
  const { data, loading, error } = useAIModelManagementData();
  const [tab, setTab] = useState("dashboard");

  const analytics = useMemo(() => computeAIAnalytics(data?.usageLogs), [data]);
  const profitability = useMemo(() => computeProfitability(data?.usageLogs), [data]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>;
  if (error) return <div className="py-20 text-center text-white/40 text-sm">Unable to load AI operations data.</div>;

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: Brain },
    { id: "routing", label: "Routing Engine™", icon: GitBranch },
    { id: "voice-infra", label: "Voice Infra™", icon: Mic },
    { id: "marketplace", label: "Credit Marketplace™", icon: ShoppingCart },
    { id: "usage", label: "AI Usage Center™", icon: Activity },
    { id: "profitability", label: "Profitability™", icon: DollarSign },
    { id: "experiments", label: "Experiment Lab™", icon: Sparkles },
    { id: "governance", label: "AI Governance™", icon: Shield },
    { id: "recommendations", label: "Recommendations™", icon: TrendingUp },
    { id: "analytics", label: "AI Analytics™", icon: BarChartIcon },
    { id: "enterprise", label: "Enterprise AI™", icon: Building2 },
    { id: "future", label: "Future AI™", icon: Globe },
  ];

  const MODULE_LINKS = [
    { path: "/operations/ai-models", label: "AI Model Management Center™", icon: Cpu, description: "Provider registry, model catalog, benchmarks, deployment", color: "#6366f1" },
    { path: "/operations/ai-compute", label: "AI Compute Center™", icon: Zap, description: "AI Packs, credits, billing, entitlements", color: "#f59e0b" },
    { path: "/voice-interview", label: "Voice Interview™", icon: Mic, description: "AI-powered voice interview simulator", color: "#ec4899" },
    { path: "/operations/security", label: "Security Operations Center™", icon: Shield, description: "Continuous security intelligence", color: "#10b981" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Brain size={12} className="text-indigo-400" /> Operations Workspace · AI Platform Architecture v1.0
        </div>
        <h1 className="text-2xl font-bold text-white">AI Operations Center™</h1>
        <p className="text-white/40 text-sm mt-1">The AI operating backbone for EXECLEAD.AI — governance, orchestration, infrastructure, commercialization, and operations in one command center.</p>
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
          {/* Overview KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Activity} label="Total AI Requests" value={analytics.totalRequests.toLocaleString()} color="#06b6d4" />
            <KpiCard icon={Zap} label="Total Tokens" value={analytics.totalTokens.toLocaleString()} color="#a855f7" />
            <KpiCard icon={DollarSign} label="Monthly AI Cost" value={`$${analytics.totalCost.toFixed(2)}`} color="#f59e0b" />
            <KpiCard icon={TrendingUp} label="Success Rate" value={`${analytics.successRate}%`} color="#10b981" />
            <KpiCard icon={Clock} label="Avg Latency" value={`${analytics.avgLatency}ms`} color="#6366f1" />
            <KpiCard icon={AlertTriangle} label="Error Rate" value={`${analytics.errorRate}%`} color="#ef4444" />
            <KpiCard icon={DollarSign} label="Gross Margin" value={`${profitability.grossMargin}%`} color="#14b8a6" />
            <KpiCard icon={Cpu} label="Active Models" value={analytics.modelPerformance.length} color="#ec4899" />
          </div>

          {/* Module navigation cards */}
          <div>
            <h2 className="text-sm font-semibold text-white mb-3">AI Platform Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULE_LINKS.map((m) => (
                <Link key={m.path} to={m.path} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-center gap-4 hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${m.color}15` }}><m.icon size={24} style={{ color: m.color }} /></div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">{m.label}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{m.description}</p>
                  </div>
                  <ArrowRight size={18} className="text-white/20 group-hover:text-white/40 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* AI Capabilities Status */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Cpu size={14} className="text-indigo-400" /> AI Capabilities Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {AI_CAPABILITIES_STATUS.map((c, i) => (
                <div key={i} className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                  <div>
                    <div className="text-xs text-white/80">{c.capability}</div>
                    <div className="text-[10px] text-white/30">{c.provider} · {c.model}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.latency > 0 && <span className="text-[10px] text-white/40">{c.latency}ms</span>}
                    {c.health > 0 && <span className="text-[10px] text-emerald-400">{c.health}%</span>}
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[c.status]}20`, color: STATUS_COLORS[c.status] }}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <RecommendationEngine analytics={analytics} profitability={profitability} />
        </div>
      )}

      {/* Tab 2: Routing Engine */}
      {tab === "routing" && (
        <div className="space-y-4">
          <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 flex items-start gap-3">
            <GitBranch size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <div><h3 className="text-sm font-medium text-indigo-400">AI Routing Engine™</h3><p className="text-xs text-white/40 mt-1">Automatically routes AI requests to the optimal provider and model based on cost, quality, and latency optimization. Supports automatic failover and load balancing.</p></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center"><div className="text-lg font-bold text-emerald-400">{ROUTING_RULES.filter((r) => r.optimization === "quality").length}</div><div className="text-[10px] text-white/40">Quality Optimized</div></div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center"><div className="text-lg font-bold text-cyan-400">{ROUTING_RULES.filter((r) => r.optimization === "cost").length}</div><div className="text-[10px] text-white/40">Cost Optimized</div></div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center"><div className="text-lg font-bold text-amber-400">{ROUTING_RULES.filter((r) => r.optimization === "latency").length}</div><div className="text-[10px] text-white/40">Latency Optimized</div></div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Active Routing Rules</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-white/40 border-b border-white/5"><th className="text-left py-2 px-2">Feature</th><th className="text-left py-2 px-2">Provider</th><th className="text-left py-2 px-2">Model</th><th className="text-center py-2 px-2">Optimization</th><th className="text-left py-2 px-2">Failover</th><th className="text-center py-2 px-2">Traffic</th></tr></thead>
                <tbody>
                  {ROUTING_RULES.map((r, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td className="py-2 px-2 text-white/80">{r.feature}</td>
                      <td className="py-2 px-2 text-white/50">{r.provider}</td>
                      <td className="py-2 px-2 text-white/50">{r.model}</td>
                      <td className="py-2 px-2 text-center"><span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${OPT_COLORS[r.optimization]}20`, color: OPT_COLORS[r.optimization] }}>{r.optimization}</span></td>
                      <td className="py-2 px-2 text-white/40">{r.failover}</td>
                      <td className="py-2 px-2 text-center text-white/60">{r.traffic}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Voice Infrastructure */}
      {tab === "voice-infra" && (
        <div className="space-y-4">
          <div className="bg-pink-500/5 border border-pink-500/15 rounded-xl p-4 flex items-start gap-3">
            <Mic size={16} className="text-pink-400 shrink-0 mt-0.5" />
            <div><h3 className="text-sm font-medium text-pink-400">Voice Infrastructure™</h3><p className="text-xs text-white/40 mt-1">Engineering layer for speech-to-text, text-to-speech, audio processing, storage, and multi-provider fallback.</p></div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Voice Provider Registry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {VOICE_PROVIDERS.map((p) => (
                <div key={p.id} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${p.type === "STT" ? "bg-cyan-500/15 text-cyan-400" : "bg-pink-500/15 text-pink-400"}`}>{p.type}</span><span className="text-xs text-white/80">{p.name}</span></div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[p.status]}20`, color: STATUS_COLORS[p.status] }}>{p.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-white/40">
                    <div><span className="text-white/60 font-medium">{p.latency}ms</span> latency</div>
                    <div><span className="text-white/60 font-medium">{p.type === "STT" ? p.accuracy + "%" : p.quality + "%"}</span> {p.type === "STT" ? "accuracy" : "quality"}</div>
                    <div><span className="text-white/60 font-medium">${p.cost}</span> /req</div>
                  </div>
                  <p className="text-[10px] text-white/30 mt-1">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Audio Processing Pipeline</h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {AUDIO_PIPELINE.map((stage, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[120px]">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20"><CheckCircle size={16} className="text-emerald-400" /></div>
                    <span className="text-[10px] text-white/60 mt-1 font-medium">{stage.stage}</span>
                    <span className="text-[9px] text-white/30">{stage.latency}ms</span>
                  </div>
                  {i < AUDIO_PIPELINE.length - 1 && <div className="h-px w-6 bg-white/10" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Credit Marketplace */}
      {tab === "marketplace" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MARKETPLACE_ITEMS.map((item) => (
              <div key={item.id} className={`bg-white/[0.02] border rounded-xl p-5 ${item.popular ? "border-indigo-500/30" : "border-white/5"}`}>
                {item.popular && <div className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-medium inline-block mb-2">Most Popular</div>}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${TYPE_COLORS[item.type]}20`, color: TYPE_COLORS[item.type] }}>{item.type.replace(/_/g, " ")}</span>
                </div>
                {item.description && <p className="text-[10px] text-white/40 mb-3">{item.description}</p>}
                {item.credits && (
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-indigo-400">{item.credits.toLocaleString()}</div>
                    <div className="text-[10px] text-white/30">credits{item.bonus > 0 && <span className="text-emerald-400"> + {item.bonus} bonus</span>}</div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-white">{item.price === 0 ? "Free" : `$${item.price}`}</div>
                  <button className="text-[10px] px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-colors font-medium">{item.type === "gift" ? "Send Gift" : item.type === "promotion" ? "Claim" : "Purchase"}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Usage Center */}
      {tab === "usage" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Zap} label="Credits Used" value={analytics.totalRequests * 5} color="#f59e0b" />
            <KpiCard icon={Mic} label="Voice Minutes" value={Math.round(analytics.totalRequests * 0.5)} color="#ec4899" />
            <KpiCard icon={Activity} label="Remaining Sessions" value={Math.max(0, 500 - analytics.totalRequests)} color="#10b981" />
            <KpiCard icon={DollarSign} label="Total Cost" value={`$${analytics.totalCost.toFixed(2)}`} color="#a855f7" />
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Usage by Feature</h3>
            {analytics.modelPerformance.length > 0 ? (
              <div className="space-y-2">
                {analytics.modelPerformance.slice(0, 8).map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-white/60 w-32 truncate">{m.model}</span>
                    <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
                      <div className="h-full rounded-md" style={{ width: `${(m.count / (analytics.modelPerformance[0]?.count || 1)) * 100}%`, backgroundColor: "#6366f1", minWidth: "30px" }} />
                    </div>
                    <span className="text-xs text-white/40 w-16 text-right">{m.count} reqs</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-white/30 text-xs">No usage data available.</p>}
          </div>
        </div>
      )}

      {/* Tab 6: Profitability */}
      {tab === "profitability" && <ProfitabilityDashboard profitability={profitability} />}

      {/* Tab 7: Experiment Lab */}
      {tab === "experiments" && <ExperimentLab />}

      {/* Tab 8: Governance */}
      {tab === "governance" && (
        <div className="space-y-4">
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
            <Shield size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div><h3 className="text-sm font-medium text-amber-400">AI Governance™ — Strict Policy</h3><p className="text-xs text-white/40 mt-1">Every model deployment requires: benchmark → security validation → cost review → governance approval → deployment record → audit log → rollback plan. Never deploy automatically.</p></div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Governance Records</h3>
            <div className="space-y-2">
              {GOVERNANCE_ITEMS.map((g) => (
                <div key={g.id} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-white/80">{g.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${RISK_COLORS[g.risk]}20`, color: RISK_COLORS[g.risk] }}>{g.risk} risk</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: g.status === "approved" ? "#10b98120" : g.status === "pending" ? "#f59e0b20" : "#06b6d420", color: g.status === "approved" ? "#10b981" : g.status === "pending" ? "#f59e0b" : "#06b6d4" }}>{g.status.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40">{g.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-[9px] text-white/30">
                    <span>Requester: {g.requester}</span><span>Approver: {g.approver}</span><span>Date: {g.date}</span><span className="capitalize">Type: {g.type.replace(/_/g, " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Recommendations */}
      {tab === "recommendations" && <RecommendationEngine analytics={analytics} profitability={profitability} />}

      {/* Tab 10: Analytics */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Clock} label="Avg Latency" value={`${analytics.avgLatency}ms`} color="#06b6d4" />
            <KpiCard icon={Zap} label="Total Tokens" value={analytics.totalTokens.toLocaleString()} color="#a855f7" />
            <KpiCard icon={Activity} label="Total Requests" value={analytics.totalRequests.toLocaleString()} color="#6366f1" />
            <KpiCard icon={AlertTriangle} label="Errors" value={analytics.errorCount} color="#ef4444" />
            <KpiCard icon={CheckCircle} label="Success Rate" value={`${analytics.successRate}%`} color="#10b981" />
            <KpiCard icon={AlertTriangle} label="Error Rate" value={`${analytics.errorRate}%`} color="#f59e0b" />
            <KpiCard icon={DollarSign} label="Total Cost" value={`$${analytics.totalCost.toFixed(2)}`} color="#ec4899" />
            <KpiCard icon={Cpu} label="Active Models" value={analytics.modelPerformance.length} color="#14b8a6" />
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Model Performance Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-white/40 border-b border-white/5"><th className="text-left py-2 px-2">Model</th><th className="text-right py-2 px-2">Requests</th><th className="text-right py-2 px-2">Tokens</th><th className="text-right py-2 px-2">Avg Latency</th><th className="text-right py-2 px-2">Success Rate</th><th className="text-right py-2 px-2">Error Rate</th><th className="text-right py-2 px-2">Cost</th></tr></thead>
                <tbody>
                  {analytics.modelPerformance.map((m, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td className="py-2 px-2 text-white/80">{m.model}</td>
                      <td className="py-2 px-2 text-right text-white/60">{m.count}</td>
                      <td className="py-2 px-2 text-right text-white/60">{m.tokens.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right text-white/60">{m.avgLatency}ms</td>
                      <td className="py-2 px-2 text-right text-emerald-400">{m.successRate}%</td>
                      <td className="py-2 px-2 text-right text-red-400">{m.errorRate}%</td>
                      <td className="py-2 px-2 text-right text-white/40">${m.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 11: Enterprise AI */}
      {tab === "enterprise" && (
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Building2 size={14} className="text-cyan-400" /> Enterprise AI Management™</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-white/40 border-b border-white/5"><th className="text-left py-2 px-2">Organization</th><th className="text-left py-2 px-2">Policy</th><th className="text-left py-2 px-2">Monthly Credits</th><th className="text-center py-2 px-2">Dept Budgets</th><th className="text-center py-2 px-2">BYO AI</th><th className="text-center py-2 px-2">Private LLMs</th><th className="text-center py-2 px-2">Approval Workflow</th></tr></thead>
                <tbody>
                  {ENTERPRISE_AI_POLICIES.map((e, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td className="py-2 px-2 text-white/80">{e.org}</td>
                      <td className="py-2 px-2 text-white/50">{e.policy}</td>
                      <td className="py-2 px-2 text-white/60">{e.monthlyCredits}</td>
                      <td className="py-2 px-2 text-center">{e.deptBudgets ? <CheckCircle size={14} className="text-emerald-400 mx-auto" /> : <span className="text-white/20">—</span>}</td>
                      <td className="py-2 px-2 text-center">{e.byoAi ? <CheckCircle size={14} className="text-emerald-400 mx-auto" /> : <span className="text-white/20">—</span>}</td>
                      <td className="py-2 px-2 text-center">{e.privateLlms ? <CheckCircle size={14} className="text-emerald-400 mx-auto" /> : <span className="text-white/20">—</span>}</td>
                      <td className="py-2 px-2 text-center">{e.approvalWorkflow ? <CheckCircle size={14} className="text-emerald-400 mx-auto" /> : <span className="text-white/20">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Enterprise Policies", "Department Credits", "Shared Pools", "Unlimited Plans", "Budget Controls", "Approval Workflows", "BYO AI Provider", "Private LLMs"].map((f, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400 shrink-0" /><span className="text-xs text-white/60">{f}</span></div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 12: Future AI Platform */}
      {tab === "future" && (
        <div className="space-y-4">
          <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4 flex items-start gap-3">
            <Globe size={16} className="text-purple-400 shrink-0 mt-0.5" />
            <div><h3 className="text-sm font-medium text-purple-400">Future AI Platform™</h3><p className="text-xs text-white/40 mt-1">Architecture prepared for unlimited future AI capabilities — video, multimodal, avatars, and private enterprise models without architectural changes.</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FUTURE_PLATFORM.map((f, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{f.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${PRIORITY_COLORS[f.priority]}20`, color: PRIORITY_COLORS[f.priority] }}>{f.priority}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium">{f.eta}</span>
                  </div>
                </div>
                <p className="text-[11px] text-white/40">{f.description}</p>
                <div className="text-[9px] text-white/30 mt-2">Category: {f.category}</div>
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

function BarChartIcon(props) {
  return <Activity {...props} />;
}