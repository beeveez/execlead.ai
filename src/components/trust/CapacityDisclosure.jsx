import React from "react";
import { TrendingUp, Cpu, Database, Layers, Server, Info } from "lucide-react";
import { CAPACITY_DISCLOSURE } from "@/lib/trustCenterExtendedData";

const FACTOR_ICONS = {
  "Infrastructure": Server,
  "AI Provider Quota": Cpu,
  "Database Capacity": Database,
  "Architecture": Layers,
};

export default function CapacityDisclosure() {
  const { estimatedConcurrentUsers, basis, note, lastAssessed } = CAPACITY_DISCLOSURE;
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-500/10 to-white/[0.02] border border-indigo-500/10 rounded-xl p-6 text-center">
        <TrendingUp size={28} className="mx-auto text-indigo-400 mb-3" />
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Estimated Concurrent Users</div>
        <div className="text-4xl font-bold text-white">≈{estimatedConcurrentUsers.toLocaleString()}</div>
        <div className="text-[11px] text-white/40 mt-2">Engineering estimate — not a hard limit</div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Estimation Basis</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {basis.map((b) => {
            const Icon = FACTOR_ICONS[b.factor] || Info;
            return (
              <div key={b.factor} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <Icon size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-white/70">{b.factor}</div>
                  <p className="text-[10px] text-white/40 mt-0.5">{b.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
        <p className="text-xs text-white/50 leading-relaxed">{note}</p>
      </div>
      <div className="text-[10px] text-white/30">Last assessed: {lastAssessed}</div>
    </div>
  );
}