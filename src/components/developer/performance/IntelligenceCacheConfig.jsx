import React from "react";
import { CACHE_LAYERS, CACHE_TTL, INTELLIGENCE_CACHE_FIELDS, INVALIDATION_TRIGGERS } from "@/lib/intelligenceCache";
import { Database, Layers, RefreshCw } from "lucide-react";

const TTL_LABEL = (seconds) => {
  if (!seconds) return "until changed";
  if (seconds >= 86400) return `${seconds / 86400} day(s)`;
  if (seconds >= 3600) return `${seconds / 3600}h`;
  if (seconds >= 60) return `${seconds / 60}m`;
  return `${seconds}s`;
};

export default function IntelligenceCacheConfig() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-400" />
        Computed Intelligence Cache™
      </h3>

      {/* Cache Layers */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(CACHE_LAYERS).map(([key, layer]) => (
          <div key={key} className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
            <p className="text-xs font-semibold text-indigo-400">{key}</p>
            <p className="text-xs text-white/60">{layer.name}</p>
            <p className="text-xs text-white/40">{layer.ttlSeconds ? `${layer.ttlSeconds}s` : "persistent"}</p>
          </div>
        ))}
      </div>

      {/* TTL Rules */}
      <div>
        <p className="text-xs text-white/40 mb-2">TTL Rules by Category</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(CACHE_TTL).map(([cat, ttl]) => (
            <span key={cat} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/60">
              {cat}: <span className="font-mono text-indigo-300">{TTL_LABEL(ttl)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* L3 Database Cache Fields */}
      <div>
        <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
          <Database className="w-3 h-3" /> L3 Database Cache Fields
        </p>
        <div className="space-y-1">
          {INTELLIGENCE_CACHE_FIELDS.map((f) => (
            <div key={f.entity} className="flex items-center justify-between rounded border border-white/5 bg-white/5 px-2 py-1">
              <span className="text-xs text-white/70">{f.entity}</span>
              <span className="text-xs font-mono text-white/50">{f.field}</span>
              <span className="text-xs text-indigo-300">{TTL_LABEL(f.ttl)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invalidation Triggers */}
      <div>
        <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Invalidation Triggers
        </p>
        <div className="space-y-1">
          {Object.entries(INVALIDATION_TRIGGERS).slice(0, 6).map(([entity, trig]) => (
            <div key={entity} className="flex items-center justify-between rounded border border-white/5 bg-white/5 px-2 py-1">
              <span className="text-xs text-white/70">{entity}</span>
              <span className="text-xs text-white/40">{trig.on.join(", ")}</span>
              <span className="text-xs text-amber-300">→ {trig.invalidate.join(", ")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}