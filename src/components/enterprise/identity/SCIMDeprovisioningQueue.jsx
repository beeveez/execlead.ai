import React, { useState, useEffect } from "react";
import { Loader2, Clock, UserX, CheckCircle2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

function daysRemaining(endDate) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function SCIMDeprovisioningQueue({ organization }) {
  const { toast } = useToast();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const items = await base44.entities.ExecutiveIdentityTransfer.filter(
        { organization_id: organization.id, status: "grace_period" }, "-created_date", 50
      );
      setQueue(items);
    } catch (e) { console.error("Deprovisioning queue load failed:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (organization?.id) load(); }, [organization?.id]);

  const completeDeprovisioning = async (item) => {
    try {
      await base44.entities.ExecutiveIdentityTransfer.update(item.id, {
        status: "completed",
        completed_at: new Date().toISOString(),
        enterprise_features_revoked: true,
      });
      setQueue((prev) => prev.filter((q) => q.id !== item.id));
      toast({ title: "Deprovisioning completed", description: "User access has been fully revoked." });
    } catch (e) {
      toast({ title: "Failed to complete", description: e.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-400" size={20} /></div>;

  if (queue.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
        <CheckCircle2 size={28} className="text-emerald-400/30 mx-auto mb-2" />
        <p className="text-white/30 text-sm">No users pending deprovisioning. All SCIM-managed users are active.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <UserX size={14} className="text-amber-400" />
        <h4 className="text-white/80 text-xs font-semibold uppercase tracking-wider">Deprovisioning Queue</h4>
        <span className="text-white/30 text-xs ml-auto">{queue.length} pending</span>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {queue.map((item) => {
          const days = daysRemaining(item.grace_period_ends_at);
          const urgent = days <= 7;
          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${urgent ? "bg-red-500/10" : "bg-amber-500/10"}`}>
                {urgent ? <AlertTriangle size={14} className="text-red-400" /> : <Clock size={14} className="text-amber-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-xs font-medium truncate">{item.user_name || item.user_id}</div>
                <div className="text-white/30 text-[11px]">{item.trigger_reason.replace(/_/g, " ")} • {days} day{days !== 1 ? "s" : ""} remaining</div>
              </div>
              <button
                onClick={() => completeDeprovisioning(item)}
                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium transition-colors shrink-0"
              >
                Revoke Now
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}