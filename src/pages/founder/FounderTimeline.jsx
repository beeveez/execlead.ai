import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useFoundingMember } from "@/hooks/useFoundingMember";
import { Activity, Loader2 } from "lucide-react";
import LifecycleTimeline from "@/components/founder/LifecycleTimeline";

const ACTION_LABELS = {
  benefit_granted: "Benefit Granted",
  benefit_removed: "Benefit Removed",
  discount_applied: "Discount Applied",
  community_joined: "Community Joined",
  certificate_issued: "Certificate Issued",
  badge_updated: "Badge Updated",
  vote_submitted: "Vote Submitted",
  referral_reward: "Referral Reward",
  member_suspended: "Member Suspended",
  member_restored: "Member Restored",
  member_revoked: "Member Revoked",
  member_upgraded: "Member Upgraded",
  founder_number_issued: "Founder Number Issued",
  status_changed: "Status Changed",
};

export default function FounderTimeline() {
  const { member, loading } = useFoundingMember();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (!member?.id) return;
    base44.entities.FoundingMemberAuditLog.filter({ founding_member_id: member.id })
      .then((data) => setLogs(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))))
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  }, [member?.id]);

  if (loading || !member) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Founder Timeline</h1>
        <p className="text-white/40 text-sm">The EXECLEAD.AI journey from Private Beta to General Availability.</p>
      </div>

      <LifecycleTimeline />

      <div>
        <h2 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
          <Activity size={14} className="text-amber-400/60" /> Recent Activity
        </h2>
        {loadingLogs ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-amber-400" /></div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">No activity recorded yet.</div>
        ) : (
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5" />
                    <div className="w-px h-full bg-white/5 mt-1" />
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Activity size={12} className="text-amber-400/60" />
                      <span className="text-amber-400/80 text-[10px] font-medium uppercase tracking-wider">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </div>
                    <div className="text-white/70 text-sm">{log.description}</div>
                    <div className="text-white/30 text-[10px] mt-0.5">
                      {new Date(log.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                      {log.performed_by_name && ` · by ${log.performed_by_name}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}