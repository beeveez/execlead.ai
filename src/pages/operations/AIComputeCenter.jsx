import React, { useState, useMemo } from "react";
import { Zap, DollarSign, Activity, Users, Clock, Brain, Settings, Shield, Building2, Mic, TrendingUp, AlertTriangle, Crown, Gift, CheckCircle, Cpu } from "lucide-react";
import { useAIComputeData } from "@/hooks/useAIComputeData";
import { AI_COMPUTE_PACKS, FUTURE_PACKS, CREDIT_RULES, VOICE_SESSIONS, ENTITLEMENT_TIERS, ENTERPRISE_CONFIGS, computeUsageAnalytics, computeCostIntelligence, getCreditSummary } from "@/lib/aiComputeEngine";
import PackCard from "@/components/ai-compute/PackCard";
import CostIntelligencePanel from "@/components/ai-compute/CostIntelligencePanel";

const SEV_COLORS = { high: "#f59e0b", medium: "#06b6d4", low: "#10b981", critical: "#ef4444" };

export default function AIComputeCenter() {
  const { data, loading, error } = useAIComputeData();
  const [tab, setTab] = useState("dashboard");

  const analytics = useMemo(() => computeUsageAnalytics(data?.usageLogs), [data]);
  const cost = useMemo(() => computeCostIntelligence(data?.usageLogs), [data]);
  const credits = useMemo(() => getCreditSummary(AI_COMPUTE_PACKS, data?.usageLogs), [data]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>;
  if (error) return <div className="py-20 text-center text-white/40 text-sm">Unable to load AI compute data.</div>;

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: Zap },
    { id: "packs", label: "AI Compute Packs™", icon: Cpu },
    { id: "credits", label: "AI Credit System™", icon: Gift },
    { id: "consumption", label: "Credit Consumption™", icon: Settings },
    { id: "voice", label: "Voice Sessions™", icon: Mic },
    { id: "analytics", label: "Usage Analytics™", icon: Activity },
    { id: "cost", label: "Cost Intelligence™", icon: DollarSign },
    { id: "entitlements", label: "Entitlements", icon: Shield },
    { id: "enterprise", label: "Enterprise", icon: Building2 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Zap size={12} className="text-amber-400" /> Operations Workspace · AI Compute Management™ v1.0
        </div>
        <h1 className="text-2xl font-bold text-white">AI Compute Center™</h1>
        <p className="text-white/40 text-sm mt-1">Monetize, track, and govern high-compute AI capabilities through AI Compute Packs™ and the AI Credit System™.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${tab === t.id ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Dashboard */}
      {tab === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Zap} label="Credits Used Today" value={analytics.creditsToday} color="#f59e0b" />
            <KpiCard icon={Activity} label="Monthly Credits Used" value={analytics.totalCredits.toLocaleString()} color="#06b6d4" />
            <KpiCard icon={DollarSign} label="Estimated Monthly AI Cost" value={`$${analytics.totalCost.toFixed(2)}`} color="#a855f7" />
            <KpiCard icon={Cpu} label="Active AI Packs" value={AI_COMPUTE_PACKS.filter((p) => p.status === "active").length} color="#10b981" />
            <KpiCard icon={Mic} label="Voice Minutes Consumed" value={analytics.voiceMinutes} color="#ec4899" />
            <KpiCard icon={TrendingUp} label="Avg Credits / Session" value={analytics.avgCreditsPerSession} color="#6366f1" />
            <KpiCard icon={DollarSign} label="Pack Revenue (MRR)" value={`$${cost.packRevenue}`} color="#10b981" />
            <KpiCard icon={Users} label="Credit Utilization" value={`${credits.utilization}%`} color={credits.utilization > 80 ? "#ef4444" : "#14b8a6"} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Cpu size={14} className="text-indigo-400" /> Active AI Compute Packs™</h3>
              <div className="space-y-2">
                {AI_COMPUTE_PACKS.filter((p) => p.status === "active" || p.status === "beta").map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{p.name}</span>
                    <div className="flex items-center gap-3 text-white/40">
                      <span>${p.price}/mo</span>
                      <span>{p.credits} credits</span>
                      <span className="text-emerald-400/70">{p.margin}% margin</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><DollarSign size={14} className="text-emerald-400" /> Pack Gross Margins</h3>
              <div className="space-y-2">
                {cost.packMargins.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-white/60 w-32 truncate">{p.name}</span>
                    <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
                      <div className="h-full rounded-md" style={{ width: `${p.margin}%`, backgroundColor: p.margin >= 75 ? "#10b981" : p.margin >= 65 ? "#06b6d4" : "#f59e0b", minWidth: "30px" }} />
                    </div>
                    <span className="text-xs text-white/40 w-10 text-right">{p.margin}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Compute Packs™ */}
      {tab === "packs" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_COMPUTE_PACKS.map((pack) => <PackCard key={pack.id} pack={pack} />)}
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Brain size={14} className="text-indigo-400" /> Future AI Packs™ — Roadmap</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FUTURE_PACKS.map((p, i) => (
                <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/80">{p.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium">{p.eta}</span>
                  </div>
                  <p className="text-[10px] text-white/40">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI Credit System™ */}
      {tab === "credits" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Gift} label="Credits Allocated" value={credits.allocated.toLocaleString()} color="#06b6d4" />
            <KpiCard icon={Zap} label="Credits Consumed" value={credits.consumed.toLocaleString()} color="#f59e0b" />
            <KpiCard icon={CheckCircle} label="Credits Remaining" value={credits.remaining.toLocaleString()} color="#10b981" />
            <KpiCard icon={Activity} label="Utilization" value={`${credits.utilization}%`} color={credits.utilization > 80 ? "#ef4444" : "#14b8a6"} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><Crown size={14} className="text-amber-400" /><span className="text-sm font-medium text-white">Bonus Credits</span></div>
              <div className="text-2xl font-bold text-amber-400">{credits.bonusCredits.toLocaleString()}</div>
              <div className="text-[10px] text-white/30 mt-1">From referrals, achievements, and promotions</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><DollarSign size={14} className="text-emerald-400" /><span className="text-sm font-medium text-white">Purchased Credits</span></div>
              <div className="text-2xl font-bold text-emerald-400">{credits.purchasedCredits.toLocaleString()}</div>
              <div className="text-[10px] text-white/30 mt-1">Directly purchased add-on credits</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><Gift size={14} className="text-indigo-400" /><span className="text-sm font-medium text-white">Promotional Credits</span></div>
              <div className="text-2xl font-bold text-indigo-400">{credits.promotionalCredits.toLocaleString()}</div>
              <div className="text-[10px] text-white/30 mt-1">From campaigns and beta participation</div>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Credit Allocation by Pack</h3>
            <div className="space-y-2">
              {AI_COMPUTE_PACKS.filter((p) => p.status === "active" || p.status === "beta").map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-xs text-white/60 w-40 truncate">{p.name}</span>
                  <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
                    <div className="h-full rounded-md flex items-center pl-2" style={{ width: `${(p.credits / 1000) * 100}%`, backgroundColor: "#6366f1", minWidth: "40px" }}>
                      <span className="text-[10px] text-white font-medium">{p.credits}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/30 w-20 text-right">${p.price}/mo</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Credit Consumption™ */}
      {tab === "consumption" && (
        <div className="space-y-4">
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
            <Settings size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-400">Configurable Credit Consumption Engine™</h3>
              <p className="text-xs text-white/40 mt-1">Credit values are configurable through Platform Settings — not hard-coded. Every AI feature consumes credits based on compute intensity.</p>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Credit Consumption Rules</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-white/40 border-b border-white/5">
                  <th className="text-left py-2 px-2">Feature</th><th className="text-left py-2 px-2">Category</th><th className="text-center py-2 px-2">Compute Intensity</th><th className="text-center py-2 px-2">Credits</th><th className="text-center py-2 px-2">Status</th>
                </tr></thead>
                <tbody>
                  {CREDIT_RULES.map((r, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td className="py-2 px-2 text-white/80">{r.feature}</td>
                      <td className="py-2 px-2 text-white/50">{r.category}</td>
                      <td className="py-2 px-2 text-center text-white/40">{r.intensity}</td>
                      <td className="py-2 px-2 text-center"><span className="font-bold text-indigo-400">{r.credits}</span></td>
                      <td className="py-2 px-2 text-center">{r.future ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium">Future</span> : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">Active</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Voice Sessions™ */}
      {tab === "voice" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Mic} label="Voice Sessions" value={VOICE_SESSIONS.length} color="#ec4899" />
            <KpiCard icon={Clock} label="Total Voice Minutes" value={VOICE_SESSIONS.reduce((s, v) => s + v.duration, 0)} color="#06b6d4" />
            <KpiCard icon={Zap} label="Credits Consumed" value={VOICE_SESSIONS.reduce((s, v) => s + v.creditsConsumed, 0)} color="#f59e0b" />
            <KpiCard icon={Activity} label="Avg Communication Score" value={Math.round(VOICE_SESSIONS.reduce((s, v) => s + v.communicationScore, 0) / VOICE_SESSIONS.length)} color="#10b981" />
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Mic size={14} className="text-pink-400" /> Voice Session Management™</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-white/40 border-b border-white/5">
                  <th className="text-left py-2 px-2">Session ID</th><th className="text-left py-2 px-2">User</th><th className="text-center py-2 px-2">Duration</th><th className="text-center py-2 px-2">Credits</th><th className="text-center py-2 px-2">Comm Score</th><th className="text-center py-2 px-2">Confidence</th><th className="text-center py-2 px-2">Pace (WPM)</th><th className="text-center py-2 px-2">Fillers</th><th className="text-left py-2 px-2">Date</th>
                </tr></thead>
                <tbody>
                  {VOICE_SESSIONS.map((v) => (
                    <tr key={v.id} className="border-b border-white/[0.03]">
                      <td className="py-2 px-2 text-white/40 font-mono">{v.id}</td>
                      <td className="py-2 px-2 text-white/80">{v.user}</td>
                      <td className="py-2 px-2 text-center text-white/60">{v.duration} min</td>
                      <td className="py-2 px-2 text-center text-amber-400">{v.creditsConsumed}</td>
                      <td className="py-2 px-2 text-center"><span className="font-medium" style={{ color: v.communicationScore >= 85 ? "#10b981" : v.communicationScore >= 75 ? "#06b6d4" : "#f59e0b" }}>{v.communicationScore}</span></td>
                      <td className="py-2 px-2 text-center"><span className="font-medium" style={{ color: v.confidenceScore >= 85 ? "#10b981" : v.confidenceScore >= 75 ? "#06b6d4" : "#f59e0b" }}>{v.confidenceScore}</span></td>
                      <td className="py-2 px-2 text-center text-white/60">{v.speakingPace}</td>
                      <td className="py-2 px-2 text-center text-white/60">{v.fillerWords}</td>
                      <td className="py-2 px-2 text-white/40">{new Date(v.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Usage Analytics™ */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Zap} label="Credits Used Today" value={analytics.creditsToday} color="#f59e0b" />
            <KpiCard icon={Activity} label="Monthly Credits" value={analytics.totalCredits.toLocaleString()} color="#06b6d4" />
            <KpiCard icon={TrendingUp} label="Avg Credits / Session" value={analytics.avgCreditsPerSession} color="#6366f1" />
            <KpiCard icon={Mic} label="Voice Minutes" value={analytics.voiceMinutes} color="#ec4899" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Feature Usage by Category</h3>
              {analytics.categoryUsage.length > 0 ? (
                <div className="space-y-2">
                  {analytics.categoryUsage.map((c, i) => {
                    const max = analytics.categoryUsage[0]?.credits || 1;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-white/60 w-24 capitalize">{c.category}</span>
                        <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
                          <div className="h-full rounded-md" style={{ width: `${(c.credits / max) * 100}%`, backgroundColor: "#6366f1", minWidth: "30px" }} />
                        </div>
                        <span className="text-xs text-white/40 w-12 text-right">{c.credits}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-white/30 text-xs">No usage data available.</p>}
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Most Expensive AI Features</h3>
              {analytics.expensiveFeatures.length > 0 ? (
                <div className="space-y-2">
                  {analytics.expensiveFeatures.slice(0, 8).map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-white/60 capitalize">{f.feature}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400">{f.credits} credits</span>
                        <span className="text-emerald-400/70">${f.cost.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-white/30 text-xs">No feature cost data available.</p>}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Users size={14} className="text-indigo-400" /> Top Power Users</h3>
            {analytics.topUsers.length > 0 ? (
              <div className="space-y-2">
                {analytics.topUsers.map((u, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="text-white/30 w-6">#{i + 1}</span>
                    <span className="text-white/80 flex-1 truncate">{u.user}</span>
                    <span className="text-amber-400 font-medium">{u.credits} credits</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-white/30 text-xs">No user data available.</p>}
          </div>
        </div>
      )}

      {/* Tab 7: Cost Intelligence™ */}
      {tab === "cost" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={DollarSign} label="Total AI Cost" value={`$${cost.totalCost.toFixed(2)}`} color="#ef4444" />
            <KpiCard icon={DollarSign} label="Pack Revenue" value={`$${cost.packRevenue}`} color="#10b981" />
            <KpiCard icon={TrendingUp} label="Gross Margin" value={`${cost.grossMargin}%`} color="#06b6d4" />
            <KpiCard icon={TrendingUp} label="Forecasted Spend" value={`$${cost.forecastedSpend.toFixed(2)}`} color="#f59e0b" />
            <KpiCard icon={Activity} label="Budget Utilization" value={`${cost.budgetUtilization}%`} color={cost.budgetUtilization > 80 ? "#ef4444" : "#14b8a6"} />
            <KpiCard icon={Zap} label="Credit Burn Rate" value={cost.burnRate} sub="credits/request" color="#a855f7" />
            <KpiCard icon={DollarSign} label="Avg Cost / User" value={`$${cost.avgCostPerUser.toFixed(2)}`} color="#6366f1" />
            <KpiCard icon={DollarSign} label="Monthly Budget" value={`$${cost.monthlyBudget}`} color="#14b8a6" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Cost by Provider</h3>
              {cost.providerCosts.length > 0 ? (
                <div className="space-y-2">
                  {cost.providerCosts.map((p, i) => {
                    const max = cost.providerCosts[0]?.cost || 1;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-white/60 w-24 capitalize">{p.provider}</span>
                        <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
                          <div className="h-full rounded-md" style={{ width: `${(p.cost / max) * 100}%`, backgroundColor: "#6366f1", minWidth: "30px" }} />
                        </div>
                        <span className="text-xs text-white/40 w-16 text-right">${p.cost.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-white/30 text-xs">No provider cost data.</p>}
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Cost by AI Model</h3>
              {cost.modelCosts.length > 0 ? (
                <div className="space-y-2">
                  {cost.modelCosts.slice(0, 8).map((m, i) => {
                    const max = cost.modelCosts[0]?.cost || 1;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-white/60 w-32 truncate">{m.model}</span>
                        <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
                          <div className="h-full rounded-md" style={{ width: `${(m.cost / max) * 100}%`, backgroundColor: "#10b981", minWidth: "30px" }} />
                        </div>
                        <span className="text-xs text-white/40 w-16 text-right">${m.cost.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-white/30 text-xs">No model cost data.</p>}
            </div>
          </div>

          <CostIntelligencePanel cost={cost} analytics={analytics} />
        </div>
      )}

      {/* Tab 8: Entitlements */}
      {tab === "entitlements" && (
        <div className="space-y-4">
          <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 flex items-start gap-3">
            <Shield size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-indigo-400">Entitlement Hierarchy</h3>
              <p className="text-xs text-white/40 mt-1">Subscriptions determine which packs a user is eligible to purchase. Packs determine which premium AI capabilities are unlocked. Credits determine how much of those capabilities can be consumed.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ENTITLEMENT_TIERS.map((t) => (
              <div key={t.tier} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-2">{t.tier}</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: t.tier === "Enterprise" ? "#10b981" : t.tier === "Executive" ? "#06b6d4" : t.tier === "Professional" ? "#6366f1" : "#64748b" }}>
                  {t.credits === -1 ? "∞" : t.credits.toLocaleString()}
                </div>
                <div className="text-[10px] text-white/30 mb-2">{t.credits === -1 ? "Unlimited (Fair Use)" : "credits/month"}</div>
                <div className="text-[10px] text-white/40 mb-2">{t.description}</div>
                <div className="pt-2 border-t border-white/[0.03]">
                  <div className="text-[9px] text-white/30 mb-1">Eligible Packs:</div>
                  {t.eligiblePacks.length > 0 ? (
                    <ul className="space-y-0.5">{t.eligiblePacks.map((p, i) => <li key={i} className="text-[10px] text-emerald-400/70">✓ {p}</li>)}</ul>
                  ) : <span className="text-[10px] text-white/20">None</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Purchase Models Supported</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Individual Purchases", "Enterprise Licenses", "Promotional Bundles", "Trial Packs", "Gift Credits", "Department Allocations"].map((m, i) => (
                <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3 text-center">
                  <CheckCircle size={16} className="text-emerald-400 mx-auto mb-1" />
                  <span className="text-[10px] text-white/50">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Enterprise */}
      {tab === "enterprise" && (
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Building2 size={14} className="text-cyan-400" /> Enterprise AI Configurations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-white/40 border-b border-white/5">
                  <th className="text-left py-2 px-2">Organization</th><th className="text-left py-2 px-2">Plan</th><th className="text-left py-2 px-2">Credits Pool</th><th className="text-center py-2 px-2">Dept Budgets</th><th className="text-center py-2 px-2">Approval Workflow</th><th className="text-left py-2 px-2">Cost Allocation</th><th className="text-left py-2 px-2">Monthly Quota</th>
                </tr></thead>
                <tbody>
                  {ENTERPRISE_CONFIGS.map((e, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td className="py-2 px-2 text-white/80">{e.org}</td>
                      <td className="py-2 px-2 text-white/50">{e.plan}</td>
                      <td className="py-2 px-2 text-white/60">{e.creditsPool}</td>
                      <td className="py-2 px-2 text-center">{e.departmentalBudget ? <CheckCircle size={14} className="text-emerald-400 mx-auto" /> : <span className="text-white/20">—</span>}</td>
                      <td className="py-2 px-2 text-center">{e.approvalWorkflow ? <CheckCircle size={14} className="text-emerald-400 mx-auto" /> : <span className="text-white/20">—</span>}</td>
                      <td className="py-2 px-2 text-white/50">{e.costAllocation}</td>
                      <td className="py-2 px-2 text-white/40">{e.monthlyQuota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["Shared AI Credit Pools", "Departmental Budgets", "Usage Quotas", "Approval Workflows", "Cost Allocation by Business Unit", "Fair Usage Policy Enforcement"].map((f, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                <span className="text-xs text-white/60">{f}</span>
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