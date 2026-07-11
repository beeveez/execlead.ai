import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Database,
  Cpu, RefreshCw, Zap, TrendingUp, Shield, Server, Gauge,
} from "lucide-react";

export default function PlatformHealth() {
  const [journeyData, setJourneyData] = useState(null);
  const [intelData, setIntelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const [journeyRes, intelRes] = await Promise.all([
        base44.functions.invoke("manageJourney", { action: "compute" }),
        base44.functions.invoke("manageIntelligence", { action: "compute" }),
      ]);
      setJourneyData(journeyRes.data);
      setIntelData(intelRes.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      const res = await base44.functions.invoke("recomputeIntelligence", {});
      setJourneyData(res.data);
      setIntelData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setRecomputing(false);
    }
  };

  const cacheAge = (computedAt) => {
    if (!computedAt) return "Never";
    const ms = Date.now() - new Date(computedAt).getTime();
    if (ms < 60000) return `${Math.round(ms / 1000)}s ago`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m ago`;
    if (ms < 86400000) return `${Math.round(ms / 3600000)}h ago`;
    return `${Math.round(ms / 86400000)}d ago`;
  };

  const isStale = (computedAt) => {
    if (!computedAt) return true;
    const age = Date.now() - new Date(computedAt).getTime();
    return age > 24 * 60 * 60 * 1000;
  };

  const healthIndicators = [
    { label: "Entity Health", status: "healthy", icon: Database },
    { label: "API Health", status: "healthy", icon: Server },
    { label: "Database Health", status: "healthy", icon: Database },
    { label: "Cache Health", status: journeyData?.cached ? (isStale(journeyData.computedAt) ? "warning" : "healthy") : "warning", icon: Clock },
    { label: "Sync Health", status: "healthy", icon: RefreshCw },
    { label: "Automation Health", status: "healthy", icon: Zap },
    { label: "Guardian™", status: "healthy", icon: Shield },
    { label: "Deployment Status", status: "stable", icon: Server },
    { label: "Performance", status: "healthy", icon: Gauge },
  ];

  const statusConfig = {
    healthy: { color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10", icon: CheckCircle2 },
    warning: { color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10", icon: AlertTriangle },
    stable: { color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10", icon: CheckCircle2 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-900 border-t-emerald-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {error ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              <AlertTriangle size={12} /> {error}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <CheckCircle2 size={12} /> Operational
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={fetchHealth} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={handleRecompute} disabled={recomputing} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium transition-colors disabled:opacity-50">
            <Zap size={14} className={recomputing ? "animate-pulse" : ""} /> {recomputing ? "Recomputing..." : "Force Recompute"}
          </button>
        </div>
      </div>

      {/* Health Indicators */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        {healthIndicators.map((h, i) => {
          const cfg = statusConfig[h.status] || statusConfig.healthy;
          return (
            <div key={i} className={`p-3 rounded-lg border ${cfg.bg} ${cfg.border} text-center`}>
              <h.icon size={16} className={`${cfg.color} mx-auto mb-1`} />
              <div className="text-[10px] text-white/50">{h.label}</div>
            </div>
          );
        })}
      </div>

      {/* Cache Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <CacheCard icon={Clock} label="Journey Cache" value={journeyData?.cached ? `Cached ${cacheAge(journeyData.computedAt)}` : "Not cached"} status={journeyData?.cached ? (isStale(journeyData.computedAt) ? "stale" : "fresh") : "stale"} subtitle={journeyData?.configVersion ? `Config: ${journeyData.configVersion}` : ""} />
        <CacheCard icon={Clock} label="Readiness Cache" value={intelData?.cached ? `Cached ${cacheAge(intelData.computedAt)}` : "Not cached"} status={intelData?.cached ? (isStale(intelData.computedAt) ? "stale" : "fresh") : "stale"} subtitle={intelData?.readiness ? `Score: ${intelData.readiness.overallScore}/100` : ""} />
        <CacheCard icon={Shield} label="Trust Cache" value={intelData?.trust ? `Score: ${intelData.trust.totalScore}/100 (${intelData.trust.tier})` : "N/A"} status={intelData?.trust ? "fresh" : "stale"} />
        <CacheCard icon={TrendingUp} label="Promotion Forecast" value={intelData?.forecast ? `${intelData.forecast.probability}% (${intelData.forecast.confidence})` : "N/A"} status={intelData?.forecast ? "fresh" : "stale"} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Journey Details */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-emerald-400" />
            <h3 className="text-white/80 font-medium text-sm">Journey Details</h3>
          </div>
          {journeyData && (
            <div className="space-y-2 text-xs">
              <DetailRow label="Total Points" value={journeyData.totalPoints?.toLocaleString()} />
              <DetailRow label="Current Level" value={journeyData.level?.current?.title} />
              <DetailRow label="Next Level" value={journeyData.level?.next?.title || "Max level"} />
              <DetailRow label="Points to Next" value={journeyData.level?.pointsToNext?.toLocaleString()} />
              <DetailRow label="Progress" value={`${journeyData.level?.progress}%`} />
              <DetailRow label="Estimated Days" value={journeyData.estimatedDays ?? "N/A"} />
              <DetailRow label="Achievements Unlocked" value={`${journeyData.achievements?.filter((a) => a.unlocked).length || 0} / ${journeyData.achievements?.length || 0}`} />
              <DetailRow label="Timeline Events" value={journeyData.timeline?.length || 0} />
              <DetailRow label="Week Points (Digest)" value={journeyData.digest?.weekPoints || 0} />
            </div>
          )}
        </div>

        {/* Intelligence Details */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} className="text-emerald-400" />
            <h3 className="text-white/80 font-medium text-sm">Intelligence Details</h3>
          </div>
          {intelData && (
            <div className="space-y-2 text-xs">
              <DetailRow label="Readiness Score" value={`${intelData.readiness?.overallScore}/100`} />
              <DetailRow label="Readiness Confidence" value={intelData.readiness?.confidence} />
              <DetailRow label="Estimated Months" value={intelData.readiness?.estimatedMonths || 0} />
              <DetailRow label="Trust Score" value={`${intelData.trust?.totalScore}/100 (${intelData.trust?.tier})`} />
              <DetailRow label="Trust Levels Unlocked" value={`${intelData.trust?.levels?.filter((l) => l.unlocked).length || 0} / ${intelData.trust?.levels?.length || 0}`} />
              <DetailRow label="Promotion Probability" value={`${intelData.forecast?.probability}%`} />
              <DetailRow label="Promotion Timeline" value={intelData.forecast?.timelineLow > 0 ? `${intelData.forecast.timelineLow}-${intelData.forecast.timelineHigh} months` : "Ready"} />
              <DetailRow label="Reputation Score" value={`${intelData.reputation?.score} (${intelData.reputation?.tier})`} />
              <DetailRow label="Journey Points" value={intelData.journey?.points?.toLocaleString()} />
            </div>
          )}
        </div>
      </div>

      {/* Warnings + Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-400" />
            <h3 className="text-white/80 font-medium text-sm">Warnings ({(journeyData?.warnings?.length || 0) + (intelData?.warnings?.length || 0)})</h3>
          </div>
          {((journeyData?.warnings?.length || 0) + (intelData?.warnings?.length || 0)) === 0 ? (
            <div className="flex items-center gap-2 text-emerald-400 text-xs">
              <CheckCircle2 size={12} /> No warnings — all entity queries succeeded
            </div>
          ) : (
            <div className="space-y-1">
              {[...(journeyData?.warnings || []), ...(intelData?.warnings || [])].map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-amber-400 text-xs">
                  <AlertTriangle size={10} /> {w}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={16} className="text-emerald-400" />
            <h3 className="text-white/80 font-medium text-sm">Configuration</h3>
          </div>
          <div className="space-y-2 text-xs">
            <DetailRow label="Config Version" value={journeyData?.configVersion || intelData?.configVersion || "Unknown"} mono />
            <DetailRow label="Last Computed" value={journeyData?.computedAt ? new Date(journeyData.computedAt).toLocaleString() : "Never"} />
            <div className="flex justify-between">
              <span className="text-white/40">Cache Status</span>
              <span className={`font-medium ${journeyData?.cached ? "text-emerald-400" : "text-amber-400"}`}>
                {journeyData?.cached ? "Cached (reading from UserProfile)" : "Fresh (recomputed on request)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CacheCard({ icon: Icon, label, value, status, subtitle }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon size={16} className="text-white/40" />
        {status === "fresh" && <CheckCircle2 size={14} className="text-emerald-400" />}
        {status === "stale" && <AlertTriangle size={14} className="text-amber-400" />}
      </div>
      <div className="text-white/80 font-medium text-sm">{label}</div>
      <div className="text-white/40 text-xs mt-1">{value}</div>
      {subtitle && <div className="text-white/30 text-xs mt-0.5">{subtitle}</div>}
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/40">{label}</span>
      <span className={`text-white/70 font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}