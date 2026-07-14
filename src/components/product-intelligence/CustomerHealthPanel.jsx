import React from "react";
import { Heart, Users, ShieldCheck, AlertCircle, Trophy, UserX } from "lucide-react";
import { Panel, StatCard, HealthBadge, Empty } from "./Shared";

export default function CustomerHealthPanel({ data }) {
  if (!data) return null;
  const { health } = data;
  const { segments, customers, avgHealthScore, totalCustomers } = health;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Heart} label="Avg Health Score" value={`${avgHealthScore}/100`} color={avgHealthScore >= 70 ? "emerald" : "amber"} />
        <StatCard icon={Users} label="Total Customers" value={totalCustomers} color="indigo" />
        <StatCard icon={Trophy} label="Champions" value={segments.champions} color="purple" />
        <StatCard icon={AlertCircle} label="At Risk" value={segments.atRisk} color="amber" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
          <ShieldCheck className="mx-auto text-emerald-400 mb-2" size={20} />
          <div className="text-2xl font-bold text-emerald-400">{segments.healthy}</div>
          <div className="text-white/40 text-xs mt-1">Healthy (70+)</div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center">
          <AlertCircle className="mx-auto text-amber-400 mb-2" size={20} />
          <div className="text-2xl font-bold text-amber-400">{segments.atRisk}</div>
          <div className="text-white/40 text-xs mt-1">At Risk (40-69)</div>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
          <UserX className="mx-auto text-red-400 mb-2" size={20} />
          <div className="text-2xl font-bold text-red-400">{segments.inactive}</div>
          <div className="text-white/40 text-xs mt-1">Inactive (&lt;40)</div>
        </div>
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-center">
          <Trophy className="mx-auto text-purple-400 mb-2" size={20} />
          <div className="text-2xl font-bold text-purple-400">{segments.champions}</div>
          <div className="text-white/40 text-xs mt-1">Champions (90+)</div>
        </div>
      </div>

      <Panel title="Customer Health Breakdown">
        {customers.length === 0 ? (
          <Empty text="No customer activity recorded yet — health scores will appear after users interact with the platform." />
        ) : (
          <div className="space-y-2">
            {customers.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-white/40 text-xs font-mono">#{i + 1}</span>
                  <span className="text-white/60 text-xs font-mono">{c.sessionId?.slice(0, 12)}</span>
                  <div className="flex gap-3 text-white/30 text-[10px]">
                    <span>{c.events} events</span>
                    <span>{c.daysActive} days</span>
                    <span>{c.modules} modules</span>
                    <span>{c.aiSessions} AI</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${c.score >= 70 ? "bg-emerald-500/60" : c.score >= 40 ? "bg-amber-500/60" : "bg-red-500/60"}`} style={{ width: `${c.score}%` }} />
                  </div>
                  <span className="text-white/60 text-xs font-mono w-8 text-right">{c.score}</span>
                  <HealthBadge score={c.score} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}