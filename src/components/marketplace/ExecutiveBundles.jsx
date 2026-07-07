import React from "react";
import { Package, ChevronRight } from "lucide-react";

export default function ExecutiveBundles({ bundles, onSelect }) {
  if (bundles.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Package size={14} className="text-purple-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Executive Bundles</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundles.map((bundle) => (
          <button
            key={bundle.id}
            onClick={() => onSelect(bundle)}
            className="text-left bg-gradient-to-br from-purple-500/5 to-transparent hover:from-purple-500/10 border border-purple-500/10 hover:border-purple-500/20 rounded-xl p-5 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{bundle.icon || "📦"}</span>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-medium">BUNDLE</span>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-purple-400 transition-colors">{bundle.title}</h3>
            <p className="text-white/30 text-xs line-clamp-2 mb-3">{bundle.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">{bundle.executive_level || "Executive"}</span>
              <span className="text-purple-400 font-medium">${bundle.price}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-white/30 mt-2">
              View bundle <ChevronRight size={9} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}