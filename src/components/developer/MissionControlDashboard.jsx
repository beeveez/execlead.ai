import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useGuardian } from "@/lib/GuardianContext";
import { PLATFORM_METADATA } from "@/lib/platformManifest";
import { usePlatformState } from "@/lib/PlatformStateContext";
import {
  Activity, ShieldCheck, Brain, RefreshCw, Boxes, Code2,
  Rocket, ClipboardCheck, Zap, Database, Wrench, Cpu,
  Globe, Layers, Calendar, Sparkles, TrendingUp, Server,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Analyze Platform", icon: Activity, target: "self-healing-section", primary: true },
  { label: "Run Guardian™", icon: ShieldCheck, path: "/guardian" },
  { label: "Sync Knowledge", icon: Brain, path: "/elim" },
  { label: "Refresh Cache", icon: RefreshCw, path: "/developer/system-health" },
  { label: "Validate Manifest™", icon: Boxes, target: "manifest-section" },
  { label: "Feature Flags", icon: Code2, path: "/feature-management" },
  { label: "Deployments", icon: Rocket, path: "/developer/deployments" },
  { label: "Audit Logs", icon: ClipboardCheck, path: "/developer/audit-logs" },
];

export default function MissionControlDashboard() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const { coverage, health } = usePlatformState();
  const [lastSelfHealing, setLastSelfHealing] = useState(null);
  const [selfHealingSuccess, setSelfHealingSuccess] = useState(100);
  const [responseTime, setResponseTime] = useState(0);
  const [brief, setBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    base44.entities.SelfHealingEvent.list("-created_date", 10)
      .then((events) => {
        setResponseTime(Date.now() - startTime);
        if (events.length > 0) {
          setLastSelfHealing(events[0]);
          const repairs = events.filter((e) => e.event_type === "repair");
          if (repairs.length > 0) {
            const success = repairs.filter((e) => (e.issues_repaired || 0) > 0).length;
            setSelfHealingSuccess(Math.round((success / repairs.length) * 100));
          }
        }
      })
      .catch(() => setResponseTime(Date.now() - startTime));
  }, []);

  const generateBrief = useCallback(async () => {
    if (!health) return;
    setLoadingBrief(true);
    try {
      const prompt = `You are EXEC™, generating a Mission Brief for the Platform Governance Center™. Provide a concise (2-3 sentence) operational summary.

Platform Data:
- Platform Health: ${health.overall}/100
- Platform Status: ${health.errors > 0 ? "Critical" : health.warnings > 0 ? "Warning" : "Healthy"}
- Manifest Coverage: ${coverage.routeCoverage}%
- Knowledge Coverage: ${health.knowledgeCoverage}%
- Route Coverage: ${health.routeCoverage}%
- Guardian: ${guardian?.pending?.length > 0 ? `${guardian.pending.length} pending` : "Passed"}
- Errors: ${health.errors}
- Warnings: ${health.warnings}
- Environment: ${PLATFORM_METADATA.environment}

Generate a brief, professional mission brief that a platform engineer or founder can read in 5 seconds.`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            alerts: { type: "array", items: { type: "string" } },
          },
        },
      });
      setBrief(res);
    } catch (e) {
      setBrief({
        summary: `Platform Status: ${health.errors > 0 ? "Critical" : health.warnings > 0 ? "Warning" : "Healthy"}. Platform Health: ${health.overall}%. ${health.warnings} warnings require review.`,
        alerts: [],
      });
    }
    setLoadingBrief(false);
  }, [health, coverage, guardian]);

  useEffect(() => {
    if (health) generateBrief();
  }, [health]);

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAction = (action) => {
    if (action.target) scrollToId(action.target);
    else if (action.path) navigate(action.path);
  };

  if (!health) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  const statusLabel = health.errors > 0 ? "Critical" : health.warnings > 0 ? "Warning" : "Healthy";
  const statusColor = health.errors > 0 ? "red" : health.warnings > 0 ? "amber" : "emerald";
  const ringColor = health.overall >= 90 ? "#10b981" : health.overall >= 75 ? "#f59e0b" : health.overall >= 50 ? "#f97316" : "#ef4444";

  const versionItems = [
    { label: "Platform", value: `v${PLATFORM_METADATA.platformVersion}`, icon: Cpu },
    { label: "Manifest", value: `v${PLATFORM_METADATA.manifestVersion}`, icon: Boxes },
    { label: "Knowledge", value: `v${PLATFORM_METADATA.knowledgeVersion}`, icon: Brain },
    { label: "Framework", value: `v${PLATFORM_METADATA.frameworkVersion}`, icon: Layers },
    { label: "Environment", value: PLATFORM_METADATA.environment, icon: Globe },
    { label: "Build", value: PLATFORM_METADATA.buildNumber, icon: Calendar },
  ];

  const metrics = [
    { label: "Uptime", value: "99.9%", icon: Activity, color: "text-emerald-400" },
    { label: "Response", value: `${responseTime}ms`, icon: Zap, color: "text-cyan-400" },
    { label: "Cache Hit", value: "96%", icon: Database, color: "text-indigo-400" },
    { label: "Knowledge Sync", value: "Complete", icon: Brain, color: "text-violet-400" },
    { label: "Self-Healing", value: `${selfHealingSuccess}%`, icon: Wrench, color: "text-amber-400" },
    { label: "Guardian™", value: guardian?.pending?.length > 0 ? `${guardian.pending.length} pending` : "Passed", icon: ShieldCheck, color: "text-teal-400" },
  ];

  return (
    <div className="space-y-4">
      {/* AI Mission Brief */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">EXEC™ Mission Brief</h3>
        </div>
        {loadingBrief ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
            <p className="text-white/40 text-sm">Generating mission brief...</p>
          </div>
        ) : brief ? (
          <div className="space-y-2">
            <p className="text-white/70 text-sm leading-relaxed">{brief.summary}</p>
            {brief.alerts?.length > 0 && (
              <div className="space-y-1">
                {brief.alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-400">
                    <span className="mt-0.5">•</span>
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Health Score + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Health Ring */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col items-center justify-center">
          <div className="relative">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="55" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle
                cx="65" cy="65" r="55" fill="none" stroke={ringColor} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 55 * (health.overall / 100)} ${2 * Math.PI * 55}`}
                strokeLinecap="round" transform="rotate(-90 65 65)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{health.overall}</span>
              <span className="text-[10px] text-white/30 uppercase tracking-wider">/100</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusColor === "emerald" ? "bg-emerald-500" : statusColor === "amber" ? "bg-amber-500" : "bg-red-500"}`} />
            <span className="text-sm font-medium text-white">{statusLabel}</span>
          </div>
          <p className="text-[10px] text-white/30 mt-1">Platform Health Score</p>
        </div>

        {/* Status & Versions */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatusChip label="Platform Status" value={statusLabel} color={statusColor} />
            <StatusChip label="Deployment" value="Stable" color="emerald" />
            <StatusChip label="Last Scan" value={guardian?.lastScan ? "Recent" : "—"} color="emerald" />
            <StatusChip label="Last Self-Healing" value={lastSelfHealing?.created_date ? new Date(lastSelfHealing.created_date).toLocaleDateString() : "—"} color="emerald" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {versionItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50">
                <item.icon size={12} className="text-white/40 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] text-white/30 uppercase tracking-wider">{item.label}</div>
                  <div className="text-xs text-white/80 font-medium truncate">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => handleAction(action)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  action.primary
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                    : "bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon size={14} />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Platform Metrics */}
      <div>
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Platform Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={12} className={metric.color} />
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">{metric.label}</span>
                </div>
                <div className="text-sm font-bold text-white">{metric.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusChip({ label, value, color }) {
  const colors = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
  };
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${colors[color] || colors.emerald}`}>
      <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}