import React, { useState } from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import { DEFAULT_FEATURES } from "@/lib/featureCatalog";
import { Search, RotateCcw } from "lucide-react";

export default function FeatureSimulator() {
  const { featureOverrides, setFeatureOverride, clearFeatureOverride, clearFeatureOverrides } = useDeveloper();
  const [search, setSearch] = useState("");

  const filtered = DEFAULT_FEATURES.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.id.toLowerCase().includes(search.toLowerCase())
  );

  const overrideCount = Object.keys(featureOverrides).length;

  const handleToggle = (featureId) => {
    const current = featureOverrides[featureId];
    if (current === undefined) {
      setFeatureOverride(featureId, false);
    } else if (current === false) {
      setFeatureOverride(featureId, true);
    } else {
      clearFeatureOverride(featureId);
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Feature Simulator</h2>
        {overrideCount > 0 && (
          <button onClick={clearFeatureOverrides} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors">
            <RotateCcw size={12} /> Reset ({overrideCount})
          </button>
        )}
      </div>
      <p className="text-white/30 text-xs mb-4">Toggle individual features ON/OFF for QA testing. 3-state: Default → OFF → ON → Default.</p>
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search features..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {filtered.map((f) => {
          const override = featureOverrides[f.id];
          const hasOverride = override !== undefined;
          return (
            <div key={f.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-white/70 text-sm">{f.name}</div>
                <div className="text-white/30 text-xs truncate">{f.description}</div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                {hasOverride ? (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${override ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {override ? "ON" : "OFF"}
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">DEFAULT</span>
                )}
                <button
                  onClick={() => handleToggle(f.id)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${hasOverride ? (override ? "bg-emerald-500" : "bg-red-500") : "bg-white/10"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${hasOverride ? (override ? "translate-x-4" : "translate-x-0.5") : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}