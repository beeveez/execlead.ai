import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ToggleLeft, Loader2 } from "lucide-react";

export default function FeatureFlagsPanel() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Feature.list("sort_order", 200)
      .then(setFeatures)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const aiFeatures = features.filter(f =>
    f.feature_id?.includes('ai') || f.category?.includes('ai') || f.name?.toLowerCase().includes('ai')
  );
  const display = aiFeatures.length > 0 ? aiFeatures : features.slice(0, 10);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Feature Flags</h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-white/30" /></div>
      ) : (
        <div className="space-y-2">
          {display.map(f => (
            <div key={f.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
              <ToggleLeft size={16} className={f.is_enabled ? 'text-emerald-400' : 'text-white/20'} />
              <div className="flex-1 min-w-0">
                <span className="text-white text-sm font-medium">{f.name}</span>
                <span className="text-white/30 text-xs ml-2 font-mono">{f.feature_id}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${f.is_enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                {f.is_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          ))}
          {display.length === 0 && <p className="text-white/20 text-xs text-center py-4">No feature flags found</p>}
        </div>
      )}
    </div>
  );
}