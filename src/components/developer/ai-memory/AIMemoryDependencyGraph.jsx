import React from "react";
import { GitBranch, ExternalLink } from "lucide-react";

export default function AIMemoryDependencyGraph({ chain, onInspect }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <GitBranch size={14} className="text-cyan-400" />
        <h3 className="text-sm font-bold text-white">Dependency Graph</h3>
      </div>

      <div className="flex flex-col items-center">
        {chain.map((node, i) => {
          const isLast = i === chain.length - 1;
          const isRoot = i === 0;
          return (
            <React.Fragment key={node.id}>
              <button
                onClick={() => onInspect({ ...node, itemType: "dependency" })}
                className={`relative flex items-center gap-3 w-full max-w-xs border rounded-xl px-3 py-2.5 transition-all hover:scale-[1.01] group ${
                  isRoot
                    ? "bg-violet-500/5 border-violet-500/20"
                    : "bg-white/[0.02] border-white/5"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isRoot ? "bg-violet-500/10 border border-violet-500/20" : "bg-white/5 border border-white/5"
                }`}>
                  <GitBranch size={12} className={isRoot ? "text-violet-400" : "text-cyan-400"} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className={`text-xs font-bold ${isRoot ? "text-violet-300" : "text-white/70"}`}>{node.label}</div>
                  <div className="text-[9px] text-white/30 truncate">{node.description}</div>
                </div>
                <ExternalLink size={10} className="text-white/20 group-hover:text-cyan-400 shrink-0 transition-colors" />
              </button>
              {!isLast && (
                <div className="w-px h-5 bg-gradient-to-b from-white/10 to-white/5" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}