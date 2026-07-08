import React, { useState, useEffect } from "react";
import { ShieldCheck, Activity, Ban, XCircle, AlertTriangle, Users, Clock, FileWarning, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { calculateSecurityHealthScore, SECURITY_HEALTH_CATEGORIES, ZERO_TRUST_PRINCIPLES } from "@/lib/zeroTrustEngine";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        <Icon size={14} />
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function HealthGauge({ score }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-white/30 text-xs">/ 100</span>
      </div>
    </div>
  );
}

export default function SecurityOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await base44.functions.invoke("manageSecurityOperations", { action: "dashboard_stats" });
        const data = response.data || response;
        setStats(data);
      } catch {
        setStats({ activeSessions: 0, blockedAttacks: 0, failedLogins: 0, riskEvents: 0, verifiedUsers: 0, pendingReviews: 0, openIncidents: 0 });
      }
      setLoading(false);
    };
    load();
  }, []);

  const health = calculateSecurityHealthScore(stats?.healthOverrides || {});

  if (loading) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Health Score + Principles */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-center gap-6 lg:col-span-1">
          <HealthGauge score={health.overall} />
          <div>
            <div className="text-white/30 text-xs uppercase tracking-widest mb-1">Security Health</div>
            <div className="text-white font-bold text-lg">{health.overall >= 90 ? "Excellent" : health.overall >= 75 ? "Good" : "Needs Attention"}</div>
            <div className="text-white/40 text-xs mt-1">Platform-wide score</div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-3">
            <ShieldCheck size={14} /> Zero Trust Principles
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {ZERO_TRUST_PRINCIPLES.map((p, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="text-sm text-white/80 font-medium">{p.name}</div>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard icon={Activity} label="Active Sessions" value={stats?.activeSessions ?? 0} color="#3b82f6" />
        <StatCard icon={Ban} label="Blocked Attacks" value={stats?.blockedAttacks ?? 0} color="#ef4444" />
        <StatCard icon={XCircle} label="Failed Logins" value={stats?.failedLogins ?? 0} color="#f59e0b" />
        <StatCard icon={AlertTriangle} label="Risk Events" value={stats?.riskEvents ?? 0} color="#f97316" />
        <StatCard icon={Users} label="Verified Users" value={stats?.verifiedUsers ?? 0} color="#10b981" />
        <StatCard icon={Clock} label="Pending Reviews" value={stats?.pendingReviews ?? 0} color="#f59e0b" />
        <StatCard icon={FileWarning} label="Open Incidents" value={stats?.openIncidents ?? 0} color="#ef4444" />
      </div>

      {/* Health Breakdown */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-4">
          <Activity size={14} /> Security Health Breakdown
        </div>
        <div className="space-y-3">
          {health.categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3">
              <div className="w-40 text-xs text-white/50 flex-shrink-0">{cat.label}</div>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.score}%`, background: cat.score >= 90 ? "#10b981" : cat.score >= 75 ? "#f59e0b" : "#ef4444" }} />
              </div>
              <div className="w-12 text-right text-xs font-mono text-white/60">{cat.score}%</div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-3 border-t border-white/5">
            <div className="w-40 text-xs text-white/70 font-semibold flex-shrink-0">Overall Security</div>
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${health.overall}%`, background: health.overall >= 90 ? "#10b981" : health.overall >= 75 ? "#f59e0b" : "#ef4444" }} />
            </div>
            <div className="w-12 text-right text-xs font-mono font-bold text-white">{health.overall}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}