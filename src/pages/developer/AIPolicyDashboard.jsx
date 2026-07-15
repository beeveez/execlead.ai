import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  getPolicyAnalytics, AI_POLICY_ENGINE_VERSION, POLICY_CATEGORIES,
  SUBSCRIPTION_POLICIES, WORKSPACE_POLICIES, MODEL_POLICIES,
} from '@/lib/aiPolicyEngine';
import {
  Shield, ShieldCheck, ShieldAlert, Lock, DollarSign, Clock,
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Brain, Building2,
  Fingerprint, Eye, FileText, Scale, Cpu,
} from 'lucide-react';

const POLICY_ICONS = {
  subscription: DollarSign,
  workspace: Building2,
  feature: CheckCircle,
  organization: Building2,
  budget: DollarSign,
  security: Lock,
  trust: Fingerprint,
  privacy: Eye,
  context: FileText,
  compliance: Scale,
};

function StatCard({ icon: Icon, label, value, sublabel, color = "text-white" }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sublabel && <div className="text-[10px] text-white/30 mt-1">{sublabel}</div>}
    </div>
  );
}

function PolicyCategoryRow({ category, count }) {
  const Icon = POLICY_ICONS[category] || Shield;
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-white/[0.03] last:border-0">
      <Icon size={12} className="text-amber-400/60" />
      <span className="text-[11px] text-white/60 flex-1 capitalize">{category}</span>
      <span className="text-[10px] text-white/30">{count} trigger{count !== 1 ? "s" : ""}</span>
      <div className="w-16 h-4 bg-white/[0.02] rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500/30 rounded-full"
          style={{ width: `${Math.min(100, count * 10)}%` }}
        />
      </div>
    </div>
  );
}

function DistributionBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-white/50 w-28 capitalize">{label}</span>
      <div className="flex-1 h-5 bg-white/[0.02] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="text-[10px] text-white/30 w-8 text-right">{count}</span>
      <span className="text-[10px] text-white/20 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function AIPolicyDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    const data = await getPolicyAnalytics(500);
    setAnalytics(data);
    try {
      const recent = await base44.entities.AIPolicyEvent.list("-created_date", 20);
      setEvents(recent);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Shield size={12} className="text-rose-400" />
            Core Platform Service #10
          </div>
          <h1 className="text-2xl font-bold text-white -mt-3">AI Policy Engine™</h1>
          <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
            Enterprise AI Governance &amp; Decision Layer. Enforces subscription, workspace, organization, security,
            trust, privacy, budget, and compliance policies before any AI request is executed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 bg-white/[0.02] border border-white/5 rounded-full px-3 py-1.5">
            v{AI_POLICY_ENGINE_VERSION}
          </span>
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-rose-900 border-t-rose-400 rounded-full animate-spin"></div>
        </div>
      ) : !analytics || analytics.total === 0 ? (
        <div className="text-center py-20">
          <Shield size={32} className="text-rose-400/30 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No policy events yet. Policy evaluations will appear here once AI requests pass through the AI Policy Engine™.</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="bg-gradient-to-br from-rose-500/5 via-orange-500/[0.02] to-transparent border border-rose-500/10 rounded-2xl p-6">
            <div className="flex items-center gap-8 flex-wrap">
              <div className="flex flex-col items-center">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${
                  analytics.approvalRate >= 90 ? "border-emerald-500/30" : analytics.approvalRate >= 70 ? "border-amber-500/30" : "border-rose-500/30"
                }`}>
                  <span className="text-3xl font-bold text-white">{analytics.approvalRate}%</span>
                </div>
                <span className="text-[9px] text-white/40 uppercase tracking-wider mt-2">Approval Rate</span>
              </div>
              <div className="flex-1 min-w-[300px] grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={ShieldCheck} label="Total Requests" value={analytics.total} color="text-rose-400" />
                <StatCard icon={CheckCircle} label="Approved" value={analytics.approved} sublabel={`${analytics.approvalRate}% of requests`} color="text-emerald-400" />
                <StatCard icon={XCircle} label="Blocked" value={analytics.blocked} sublabel={`${analytics.blockRate}% blocked`} color="text-rose-400" />
                <StatCard icon={Clock} label="Avg Eval Time" value={`${analytics.avgEvalTime}ms`} color="text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Violation Breakdown & Policy Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <ShieldAlert size={14} className="text-rose-400" />
                Most Triggered Policies
              </h3>
              {Object.keys(analytics.policyTriggerCounts).length === 0 ? (
                <p className="text-[11px] text-white/30 py-4 text-center">No policy violations detected.</p>
              ) : (
                <div className="space-y-0.5">
                  {Object.entries(analytics.policyTriggerCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => (
                      <PolicyCategoryRow key={cat} category={cat} count={count} />
                    ))}
                </div>
              )}
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-400" />
                Violation Types
              </h3>
              {Object.keys(analytics.violations).length === 0 ? (
                <p className="text-[11px] text-white/30 py-4 text-center">No violations recorded.</p>
              ) : (
                <div className="space-y-2.5">
                  {Object.entries(analytics.violations)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <DistributionBar key={type} label={type} count={count} total={analytics.blocked} color="bg-rose-500/30" />
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Subscription & Workspace Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-400" />
                Subscription Distribution
              </h3>
              <div className="space-y-2.5">
                {Object.entries(analytics.subscriptionDist).map(([plan, count]) => (
                  <DistributionBar key={plan} label={plan} count={count} total={analytics.total} color="bg-emerald-500/30" />
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Building2 size={14} className="text-cyan-400" />
                Workspace Distribution
              </h3>
              <div className="space-y-2.5">
                {Object.entries(analytics.workspaceDist).map(([ws, count]) => (
                  <DistributionBar key={ws} label={ws} count={count} total={analytics.total} color="bg-cyan-500/30" />
                ))}
              </div>
            </div>
          </div>

          {/* Policy Reference */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Brain size={14} className="text-rose-400" />
              Policy Categories &amp; Subscription Tiers
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(SUBSCRIPTION_POLICIES).map(([key, policy]) => (
                <div key={key} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <div className="text-[11px] font-semibold text-white/70 capitalize mb-1">{policy.label}</div>
                  <div className="text-[9px] text-white/30 space-y-0.5">
                    <div>Model: <span className="text-white/50">{policy.model}</span></div>
                    <div>Context: <span className="text-white/50">{policy.contextWindow.toLocaleString()} tok</span></div>
                    <div>Daily: <span className="text-white/50">{policy.maxDailySessions === -1 ? "∞" : policy.maxDailySessions}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex flex-wrap gap-2">
                {POLICY_CATEGORIES.map((cat) => {
                  const Icon = POLICY_ICONS[cat] || Shield;
                  return (
                    <span key={cat} className="flex items-center gap-1 text-[9px] text-white/40 bg-white/[0.02] border border-white/5 rounded-full px-2 py-1 capitalize">
                      <Icon size={9} />
                      {cat}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Cpu size={14} className="text-cyan-400" />
              Recent Policy Decisions
            </h3>
            <div className="space-y-1">
              {events.slice(0, 15).map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                  <div className={`w-2 h-2 rounded-full ${
                    e.status === "approved" ? "bg-emerald-400" :
                    e.status === "blocked" ? "bg-rose-400" : "bg-amber-400"
                  }`} />
                  <span className="text-[11px] text-white/50 flex-1 truncate">{e.request_text || "(no text)"}</span>
                  <span className="text-[9px] text-white/30 capitalize">{e.intent?.replace(/_/g, " ") || "—"}</span>
                  <span className={`text-[9px] uppercase font-medium w-16 text-right ${
                    e.status === "approved" ? "text-emerald-400/60" :
                    e.status === "blocked" ? "text-rose-400/60" : "text-amber-400/60"
                  }`}>
                    {e.status}
                  </span>
                  <span className="text-[9px] text-white/20 w-16 text-right">{e.evaluation_time_ms}ms</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}