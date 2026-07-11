import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Database,
  Cpu, RefreshCw, Zap, TrendingUp, Shield, ShieldCheck, Boxes, Brain,
  Network, Layers,
} from "lucide-react";
import ExecKnowledgeAudit from "@/components/developer/ExecKnowledgeAudit";
import PlatformManifestDashboard from "@/components/developer/PlatformManifestDashboard";
import WorkspaceIntelligence from "@/components/developer/WorkspaceIntelligence";
import ContextValidation from "@/components/developer/ContextValidation";
import CapabilityRegistryStatus from "@/components/developer/CapabilityRegistryStatus";
import FrameworkRegistry from "@/components/developer/FrameworkRegistry";

export default function Diagnostics() {
  const [journeyData, setJourneyData] = useState(null);
  const [intelData, setIntelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiagnostics = async () => {
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
    fetchDiagnostics();
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

  const isStale = (computedAt, configVersion) => {
    if (!computedAt) return true;
    const age = Date.now() - new Date(computedAt).getTime();
    return age > 24 * 60 * 60 * 1000;
  };

  const StatCard = ({ icon: Icon, label, value, status, subtitle }) => (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon size={16} className="text-white/40" />
        {status === "fresh" && <CheckCircle2 size={14} className="text-emerald-400" />}
        {status === "stale" && <AlertTriangle size={14} className="text-amber-400" />}
        {status === "error" && <AlertTriangle size={14} className="text-red-400" />}
      </div>
      <div className="text-white/80 font-medium text-sm">{label}</div>
      <div className="text-white/40 text-xs mt-1">{value}</div>
      {subtitle && <div className="text-white/30 text-xs mt-0.5">{subtitle}</div>}
    </div>
  );

  const SectionDivider = ({ number, icon: Icon, label, color }) => {
    const colors = {
      purple: "text-purple-400 border-purple-500/20",
      indigo: "text-indigo-400 border-indigo-500/20",
      cyan: "text-cyan-400 border-cyan-500/20",
      amber: "text-amber-400 border-amber-500/20",
      blue: "text-blue-400 border-blue-500/20",
      emerald: "text-emerald-400 border-emerald-500/20",
    };
    return (
      <div className={`flex items-center gap-3 mt-8 mb-4 pb-2 border-b ${colors[color] || colors.indigo}`}>
        {number && (
          <div className={`w-7 h-7 rounded-lg bg-white/5 border ${colors[color]?.split(" ")[1] || "border-white/10"} flex items-center justify-center text-xs font-bold ${colors[color]?.split(" ")[0] || "text-white/60"}`}>
            {number}
          </div>
        )}
        <Icon size={16} className={colors[color]?.split(" ")[0] || "text-white/60"} />
        <h2 className="text-white/80 font-medium text-sm uppercase tracking-wider">{label}</h2>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-widest mb-1">
              <Cpu size={14} /> Developer Diagnostics
            </div>
            <h1 className="text-2xl font-bold text-white">Intelligence Cache Status</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchDiagnostics}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={handleRecompute}
              disabled={recomputing}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Zap size={14} className={recomputing ? "animate-pulse" : ""} /> {recomputing ? "Recomputing..." : "Force Recompute"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-900 border-t-emerald-400 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Cache Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={Clock}
                label="Journey Cache"
                value={journeyData?.cached ? `Cached ${cacheAge(journeyData.computedAt)}` : "Not cached"}
                status={journeyData?.cached ? (isStale(journeyData.computedAt, journeyData.configVersion) ? "stale" : "fresh") : "stale"}
                subtitle={journeyData?.configVersion ? `Config: ${journeyData.configVersion}` : ""}
              />
              <StatCard
                icon={Clock}
                label="Readiness Cache"
                value={intelData?.cached ? `Cached ${cacheAge(intelData.computedAt)}` : "Not cached"}
                status={intelData?.cached ? (isStale(intelData.computedAt, intelData.configVersion) ? "stale" : "fresh") : "stale"}
                subtitle={intelData?.readiness ? `Score: ${intelData.readiness.overallScore}/100` : ""}
              />
              <StatCard
                icon={Shield}
                label="Trust Cache"
                value={intelData?.trust ? `Score: ${intelData.trust.totalScore}/100 (${intelData.trust.tier})` : "N/A"}
                status={intelData?.trust ? "fresh" : "stale"}
              />
              <StatCard
                icon={TrendingUp}
                label="Promotion Forecast"
                value={intelData?.forecast ? `${intelData.forecast.probability}% (${intelData.forecast.confidence})` : "N/A"}
                status={intelData?.forecast ? "fresh" : "stale"}
              />
            </div>

            {/* Computed Values */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Journey Details */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-emerald-400" />
                  <h2 className="text-white/80 font-medium text-sm">Journey Details</h2>
                </div>
                {journeyData && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/40">Total Points</span>
                      <span className="text-white/70 font-medium">{journeyData.totalPoints?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Current Level</span>
                      <span className="text-white/70 font-medium">{journeyData.level?.current?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Next Level</span>
                      <span className="text-white/70 font-medium">{journeyData.level?.next?.title || "Max level"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Points to Next</span>
                      <span className="text-white/70 font-medium">{journeyData.level?.pointsToNext?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Progress</span>
                      <span className="text-white/70 font-medium">{journeyData.level?.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Estimated Days</span>
                      <span className="text-white/70 font-medium">{journeyData.estimatedDays ?? "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Achievements Unlocked</span>
                      <span className="text-white/70 font-medium">
                        {journeyData.achievements?.filter((a) => a.unlocked).length || 0} / {journeyData.achievements?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Timeline Events</span>
                      <span className="text-white/70 font-medium">{journeyData.timeline?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Week Points (Digest)</span>
                      <span className="text-white/70 font-medium">{journeyData.digest?.weekPoints || 0}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Intelligence Details */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Database size={16} className="text-emerald-400" />
                  <h2 className="text-white/80 font-medium text-sm">Intelligence Details</h2>
                </div>
                {intelData && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/40">Readiness Score</span>
                      <span className="text-white/70 font-medium">{intelData.readiness?.overallScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Readiness Confidence</span>
                      <span className="text-white/70 font-medium">{intelData.readiness?.confidence}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Estimated Months</span>
                      <span className="text-white/70 font-medium">{intelData.readiness?.estimatedMonths || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Trust Score</span>
                      <span className="text-white/70 font-medium">{intelData.trust?.totalScore}/100 ({intelData.trust?.tier})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Trust Levels Unlocked</span>
                      <span className="text-white/70 font-medium">
                        {intelData.trust?.levels?.filter((l) => l.unlocked).length || 0} / {intelData.trust?.levels?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Promotion Probability</span>
                      <span className="text-white/70 font-medium">{intelData.forecast?.probability}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Promotion Timeline</span>
                      <span className="text-white/70 font-medium">
                        {intelData.forecast?.timelineLow > 0
                          ? `${intelData.forecast.timelineLow}-${intelData.forecast.timelineHigh} months`
                          : "Ready"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Reputation Score</span>
                      <span className="text-white/70 font-medium">{intelData.reputation?.score} ({intelData.reputation?.tier})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Journey Points</span>
                      <span className="text-white/70 font-medium">{intelData.journey?.points?.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Warnings */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-400" />
                <h2 className="text-white/80 font-medium text-sm">
                  Warnings ({(journeyData?.warnings?.length || 0) + (intelData?.warnings?.length || 0)})
                </h2>
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

            {/* Config Version */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={16} className="text-emerald-400" />
                <h2 className="text-white/80 font-medium text-sm">Configuration</h2>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">Config Version</span>
                  <span className="text-white/70 font-medium font-mono">{journeyData?.configVersion || intelData?.configVersion || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Last Computed</span>
                  <span className="text-white/70 font-medium">{journeyData?.computedAt ? new Date(journeyData.computedAt).toLocaleString() : "Never"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Cache Status</span>
                  <span className={`font-medium ${journeyData?.cached ? "text-emerald-400" : "text-amber-400"}`}>
                    {journeyData?.cached ? "Cached (reading from UserProfile)" : "Fresh (recomputed on request)"}
                  </span>
                </div>
              </div>
            </div>

            {/* ────────────────────────────────────────────────────── */}
            {/* SECTION 1: Platform Manifest™ Dashboard               */}
            {/* ────────────────────────────────────────────────────── */}
            <SectionDivider number={1} icon={Boxes} label="Platform Manifest™ Dashboard" color="purple" />
            <PlatformManifestDashboard />

            {/* ────────────────────────────────────────────────────── */}
            {/* SECTION 2: EXEC™ Knowledge Audit                       */}
            {/* ────────────────────────────────────────────────────── */}
            <SectionDivider number={2} icon={Brain} label="EXEC™ Knowledge Audit" color="indigo" />
            <ExecKnowledgeAudit />

            {/* ────────────────────────────────────────────────────── */}
            {/* SECTION 3: Workspace Intelligence                      */}
            {/* ────────────────────────────────────────────────────── */}
            <SectionDivider number={3} icon={Network} label="Workspace Intelligence" color="cyan" />
            <WorkspaceIntelligence />

            {/* ────────────────────────────────────────────────────── */}
            {/* SECTION 4: Capability Registry Status                  */}
            {/* ────────────────────────────────────────────────────── */}
            <SectionDivider number={4} icon={Zap} label="Capability Registry Status" color="amber" />
            <CapabilityRegistryStatus />

            {/* ────────────────────────────────────────────────────── */}
            {/* SECTION 5: Framework Registry                         */}
            {/* ────────────────────────────────────────────────────── */}
            <SectionDivider number={5} icon={Layers} label="Framework Registry" color="blue" />
            <FrameworkRegistry />

            {/* ────────────────────────────────────────────────────── */}
            {/* CONTEXT VALIDATION                                     */}
            {/* ────────────────────────────────────────────────────── */}
            <SectionDivider icon={ShieldCheck} label="Active Context Validation" color="emerald" />
            <ContextValidation />
          </>
        )}
      </div>
    </div>
  );
}