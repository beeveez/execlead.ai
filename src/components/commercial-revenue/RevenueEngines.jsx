import React from "react";
import { Boxes, Building2, Cpu, Cloud, Award, Briefcase, Store, Code } from "lucide-react";
import { SectionHeader, BetaBanner, fmtNum, StatusPill } from "./shared";
import { REVENUE_ENGINES, computeEngineMetrics } from "@/lib/commercialRevenueEngine";

const ICONS = { Building2, Cpu, Cloud, Award, Briefcase, Store, Code };

export default function RevenueEngines({ data }) {
  return (
    <div>
      <SectionHeader icon={Boxes} title="Revenue Engines™" subtitle="Seven complementary recurring revenue engines that reinforce the Executive Leadership Operating System." />
      <BetaBanner />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {REVENUE_ENGINES.map((e) => {
          const Icon = ICONS[e.icon] || Boxes;
          const metrics = computeEngineMetrics(e.id, data);
          const liveCount = Object.values(metrics).filter((m) => m.kind === "live" && m.value).length;
          return (
            <div key={e.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-1.5"><Icon size={18} className={e.color} /><h3 className="text-white text-base font-semibold">{e.name}</h3><span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">{liveCount} live</span></div>
              <p className="text-white/45 text-xs mb-3">{e.description}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {e.metrics.slice(0, 8).map((m) => {
                  const v = metrics[m.key];
                  return (
                    <div key={m.key} className="flex items-center justify-between text-[11px] py-1">
                      <span className="text-white/55">{m.label}</span>
                      <div className="flex items-center gap-1.5"><span className="text-white/75 font-medium">{v?.kind === "live" && v.value ? fmtNum(v.value) : "—"}</span><StatusPill kind={v?.kind || m.kind} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}