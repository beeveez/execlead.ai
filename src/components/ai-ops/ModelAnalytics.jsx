import React from "react";
import Panel from "./Panel";
import { Cpu } from "lucide-react";
import { modelLabel, PROVIDER_META, fmtNum, fmtCost, fmtMs, fmtPct } from "@/lib/aiOperations";

export default function ModelAnalytics({ analytics }) {
  const models = analytics.byModel;
  if (models.length === 0) return null;
  return (
    <Panel title="AI Model Analytics" icon={Cpu}>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/30 border-b border-white/5">
              <th className="text-left font-medium py-2 px-2">Model</th>
              <th className="text-right font-medium px-2">Requests</th>
              <th className="text-right font-medium px-2">Input Tok</th>
              <th className="text-right font-medium px-2">Output Tok</th>
              <th className="text-right font-medium px-2">Total Tok</th>
              <th className="text-right font-medium px-2">Cost</th>
              <th className="text-right font-medium px-2">Avg Latency</th>
              <th className="text-right font-medium px-2">Success</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => {
              const meta = PROVIDER_META[m.provider] || PROVIDER_META.unknown;
              return (
                <tr key={m.model} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="text-white font-medium">{modelLabel(m.model)}</span>
                    </div>
                  </td>
                  <td className="text-right text-white/60 px-2">{fmtNum(m.requests)}</td>
                  <td className="text-right text-white/60 px-2">{fmtNum(m.inputTokens)}</td>
                  <td className="text-right text-white/60 px-2">{fmtNum(m.outputTokens)}</td>
                  <td className="text-right text-white/80 font-medium px-2">{fmtNum(m.totalTokens)}</td>
                  <td className="text-right text-emerald-400/80 px-2">{fmtCost(m.cost)}</td>
                  <td className="text-right text-white/60 px-2">{fmtMs(m.avgLatency)}</td>
                  <td className={`text-right font-medium px-2 ${m.successRate < 95 ? "text-amber-400" : "text-emerald-400"}`}>{fmtPct(m.successRate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}