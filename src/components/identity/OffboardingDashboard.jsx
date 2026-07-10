import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UserX, Clock, Loader2, AlertTriangle, RefreshCw, X, Shield, Building2 } from "lucide-react";

/**
 * OffboardingDashboard — admin view of members in offboarding grace period.
 *
 * Shows: member name, role, days remaining, trigger reason.
 * Allows admin to track who is transitioning and when grace periods expire.
 */
export default function OffboardingDashboard() {
  const { toast } = useToast();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageIdentityTransfer", { action: "get_offboarding_queue" });
      const d = res.data || res;
      setQueue(d.queue || []);
    } catch {
      toast({ title: "Failed to load offboarding queue", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { loadQueue(); }, []);

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserX size={16} className="text-amber-400" />
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Offboarding Queue</h3>
        </div>
        <button onClick={loadQueue} className="text-white/30 hover:text-white/60">
          <RefreshCw size={14} />
        </button>
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-8">
          <Shield size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-white/30 text-sm">No members currently in offboarding.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {queue.map((t) => {
            const expired = t.expired;
            const urgent = !expired && t.days_remaining <= 7;
            return (
              <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                expired ? "bg-red-500/5 border-red-500/15" :
                urgent ? "bg-amber-500/5 border-amber-500/15" :
                "bg-white/[0.02] border-white/5"
              }`}>
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/50">
                  {(t.user_name || "U").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 font-medium truncate">{t.user_name}</div>
                  <div className="text-xs text-white/30 flex items-center gap-1.5">
                    <span>{t.previous_custom_role || "Enterprise User"}</span>
                    <span>·</span>
                    <span className="capitalize">{(t.trigger_reason || "").replace(/_/g, " ")}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    expired ? "text-red-400" : urgent ? "text-amber-400" : "text-white/50"
                  }`}>
                    <Clock size={11} />
                    {expired ? "Expired" : `${t.days_remaining}d left`}
                  </div>
                  <div className="text-[10px] text-white/20 mt-0.5">Grace period</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}