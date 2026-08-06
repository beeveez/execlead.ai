import React from "react";
import { ShieldAlert, ArrowUp, ArrowRight, TrendingUp } from "lucide-react";
import { SectionHeader, BetaBanner } from "@/components/commercial-revenue/shared";
import { computeThreatLeaderboard, THREAT_DIMENSIONS, THREAT_LEVEL_META } from "@/lib/competitiveIntelligence";

export default function IntelThreatIndex({ competitors }) {
  const board = computeThreatLeaderboard(competitors);
  const trendCount = { rising: 0, stable: 0, declining: 0 };
  board.forEach((b) => { trendCount[b.trend] = (trendCount[b.trend] || 0) + 1; });

  return (
    <div>
      <SectionHeader icon={ShieldAlert} title="Strategic Threat Index™" subtitle="Internal threat assessment across 10 dimensions — market momentum, enterprise adoption, AI innovation, product velocity, brand, platform breadth, executive focus, global presence, enterprise readiness, security. 0–100 score with trend. Public/verified signals only." />
      <BetaBanner />
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="Rising Threats" value={trendCount.rising} color="text-rose-400" />
        <Stat label="Stable" value={trendCount.stable} color="text-sky-400" />
        <Stat label="Declining" value={trendCount.declining} color="text-emerald-400" />
      </div>
      <div className="space-y-3">
        {board.map(({ profile, score, level, dimensions, trend }) => {
          const meta = THREAT_LEVEL_META[level];
          return (
            <div key={profile.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center ${meta.color} ${meta.bg} ${meta.border}`}>
                  <span className="text-lg font-bold leading-none">{score}</span>
                  <span className="text-[8px] uppercase">/100</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-semibold">{profile.company_name}</div>
                  <div className="text-[11px] text-white/45">{profile.category} · {profile.is_ai_native ? "AI-Native" : profile.is_legacy ? "Legacy" : "Other"}</div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full border font-semibold uppercase ${meta.color} ${meta.bg} ${meta.border}`}>{level}</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-white/50">{trend === "rising" ? <ArrowUp size={11} className="text-rose-400" /> : <ArrowRight size={11} className="text-sky-400" />}{trend}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {THREAT_DIMENSIONS.map((d) => {
                  const v = dimensions[d.key] || 0;
                  return (
                    <div key={d.key} className="rounded-lg border border-white/8 bg-white/[0.02] p-2">
                      <div className="text-[9px] uppercase text-white/40 font-semibold mb-1 truncate" title={d.label}>{d.label}</div>
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden"><div className={`h-full ${v >= 7 ? "bg-rose-500" : v >= 4 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${v * 10}%` }} /></div>
                        <span className="text-[10px] text-white/60 font-medium">{v}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {board.length === 0 && <p className="text-white/40 text-sm">No competitor profiles to assess.</p>}
      </div>
      <p className="text-[10px] text-white/35 mt-4">Threat Index is an internal strategic assessment derived from publicly available competitor profile signals. Not a market claim. Review periodically.</p>
    </div>
  );
}

function Stat({ label, value, color }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{label}</div><div className={`text-xl font-bold ${color}`}>{value}</div></div>;
}