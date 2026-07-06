import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";

export default function ComingSoonBadge({ featureId, featureName, expectedRelease }) {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNotify = async () => {
    setLoading(true);
    try {
      await base44.entities.FeatureSubscription.create({
        feature_id: featureId,
        feature_name: featureName || featureId,
        email: user?.email || "",
      });
      setSubscribed(true);
    } catch (e) {}
    setLoading(false);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
        Coming Soon
      </span>
      {expectedRelease && (
        <span className="text-white/30 text-xs">Est. {expectedRelease}</span>
      )}
      {subscribed ? (
        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
          <CheckCircle2 size={12} /> You'll be notified
        </span>
      ) : (
        <button
          onClick={handleNotify}
          disabled={loading}
          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors disabled:opacity-40"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
          Notify Me
        </button>
      )}
    </div>
  );
}