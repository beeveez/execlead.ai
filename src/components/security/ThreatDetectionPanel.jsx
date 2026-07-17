import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, Activity, RefreshCw, Loader2, AlertTriangle, TrendingDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const LEVEL_CONFIG = {
  safe: { label: "Safe", color: "#10b981", icon: Shield },
  elevated: { label: "Elevated", color: "#f59e0b", icon: AlertTriangle },
  high: { label: "High", color: "#f97316", icon: ShieldAlert },
  critical: { label: "Critical", color: "#ef4444", icon: ShieldAlert },
};

export default function ThreatDetectionPanel({ isAdmin = false }) {
  const [score, setScore] = useState(null);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scoreRes, threatsRes] = await Promise.all([
        base44.functions.invoke("threatDetection", { action: "get_score" }).catch(() => ({ data: {} })),
        base44.functions.invoke("threatDetection", { action: "get_threats" }).catch(() => ({ data: { threats: [] } })),
      ]);
      setScore(scoreRes.data);
      setThreats(threatsRes.data?.threats || []);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      await base44.functions.invoke("threatDetection", { action: "analyze" });
      await loadData();
    } catch {
      // Non-critical
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  const level = score?.level || "safe";
  const levelCfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.safe;
  const LevelIcon = levelCfg.icon;

  return (
    <div className="space-y-4">
      {/* Threat Score Hero */}
      <div className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            <circle cx="32" cy="32" r="28" fill="none" stroke={levelCfg.color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 - (score?.threat_score || 0) / 100 * 2 * Math.PI * 28}
              className="transition-all duration-500" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white">{score?.threat_score ?? "—"}</span>
            <span className="text-[8px] text-white/30 uppercase tracking-wider">Threat</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <LevelIcon size={16} style={{ color: levelCfg.color }} />
            <span className="text-sm font-medium text-white">Threat Level: {levelCfg.label}</span>
          </div>
          <p className="text-xs text-white/40">
            {score?.total_threats_24h || 0} threats detected in the last 24 hours
          </p>
          <div className="flex gap-2 mt-2 text-[10px]">
            {score?.by_severity && Object.entries(score.by_severity).map(([sev, count]) => (
              count > 0 && (
                <span key={sev} className={`px-2 py-0.5 rounded-full border ${
                  sev === "critical" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                  sev === "high" ? "text-orange-400 bg-orange-500/10 border-orange-500/20" :
                  sev === "medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                  "text-blue-400 bg-blue-500/10 border-blue-500/20"
                }`}>
                  {count} {sev}
                </span>
              )
            ))}
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium border border-indigo-500/20 flex items-center gap-1.5"
          >
            {analyzing ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
            Run Analysis
          </button>
        )}
      </div>

      {/* Recent Threats */}
      <div>
        <h3 className="text-sm font-medium text-white/70 mb-3">Recent Threats</h3>
        {threats.length === 0 ? (
          <div className="text-center py-8 text-xs text-white/30">
            <Shield size={24} className="mx-auto mb-2 text-white/10" />
            No threats detected
          </div>
        ) : (
          <div className="space-y-1.5">
            {threats.slice(0, 20).map(t => {
              let meta = {};
              try { meta = JSON.parse(t.metadata_json || "{}"); } catch {}
              return (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <TrendingDown size={14} className={`mt-0.5 shrink-0 ${
                    t.severity === "critical" ? "text-red-400" :
                    t.severity === "high" ? "text-orange-400" :
                    t.severity === "medium" ? "text-amber-400" : "text-blue-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/30">
                      <span>{meta.threat_label || t.event_type}</span>
                      {t.user_name && <><span>·</span><span>{t.user_name}</span></>}
                      <span>·</span>
                      <span>{t.created_date ? new Date(t.created_date).toLocaleString() : "—"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}