import React from "react";
import { ChevronRight, Layers } from "lucide-react";

export default function AIMemoryScoreBreakdown({ dimensions, onInspect }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Layers size={14} className="text-violet-400" />
        <h3 className="text-sm font-bold text-white">Score Breakdown — Contributing Dimensions</h3>
        <span className="text-[10px] text-white/30 ml-auto">Click any row for diagnostics</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 px-2 font-medium">AI Memory Capability</th>
              <th className="text-center py-2 px-2 font-medium">Score</th>
              <th className="text-center py-2 px-2 font-medium">Target</th>
              <th className="text-center py-2 px-2 font-medium">Gap</th>
              <th className="text-center py-2 px-2 font-medium">Potential Gain</th>
              <th className="text-left py-2 px-2 font-medium">Status</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody>
            {dimensions.map((d) => {
              const color = d.gap === 0 ? "#10b981" : d.score === 0 ? "#ef4444" : "#f59e0b";
              return (
                <tr
                  key={d.id}
                  onClick={() => onInspect({ ...d, itemType: "dimension" })}
                  className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-2">
                    <div className="text-white/80 font-medium">{d.label}</div>
                    <div className="text-[9px] text-white/30 truncate max-w-[200px]">{d.description}</div>
                  </td>
                  <td className="text-center py-2.5 px-2">
                    <span className="font-mono font-bold" style={{ color }}>{d.score}/{d.target}</span>
                  </td>
                  <td className="text-center py-2.5 px-2 text-white/50 font-mono">{d.target}/{d.target}</td>
                  <td className="text-center py-2.5 px-2">
                    <span style={{ color: d.gap === 0 ? "#10b981" : "#f59e0b" }}>{d.gap}</span>
                  </td>
                  <td className="text-center py-2.5 px-2">
                    <span className="text-emerald-400">+{d.potentialGain}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full border"
                      style={{
                        color,
                        borderColor: `${color}30`,
                        backgroundColor: `${color}10`,
                      }}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-1">
                    <ChevronRight size={12} className="text-white/20 group-hover:text-violet-400 transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10">
              <td className="py-2.5 px-2 text-white/80 font-bold">Total</td>
              <td className="text-center py-2.5 px-2 font-mono font-bold text-white">{dimensions.reduce((s, d) => s + d.score, 0)}/10</td>
              <td className="text-center py-2.5 px-2 text-white/40 font-mono">10/10</td>
              <td className="text-center py-2.5 px-2 text-amber-400 font-bold">{dimensions.reduce((s, d) => s + d.gap, 0)}</td>
              <td className="text-center py-2.5 px-2 text-emerald-400 font-bold">+{dimensions.reduce((s, d) => s + d.potentialGain, 0)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}