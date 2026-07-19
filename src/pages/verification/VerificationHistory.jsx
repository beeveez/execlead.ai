import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useExecVerified } from "@/hooks/useExecVerified";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";

export default function VerificationHistory() {
  const { enabled, loading: flagLoading } = useExecVerified();
  const { user } = useAuth();
  const [verification, setVerification] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !user?.id) { setLoading(false); return; }
    Promise.all([
      base44.entities.ExecVerification.filter({ user_id: user.id }).catch(() => []),
      base44.entities.PlatformActivity.filter({ performed_by_id: user.id, category: "identity" }, "-created_date", 20).catch(() => []),
    ]).then(([records, acts]) => {
      setVerification(records?.[0] || null);
      setActivities(acts || []);
    }).finally(() => setLoading(false));
  }, [enabled, user?.id]);

  if (!flagLoading && !enabled) return <Navigate to="/security" replace />;
  if (loading || flagLoading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /></div>;

  // Parse audit trail from verification record
  let auditEvents = [];
  if (verification?.audit_trail_json) {
    try { auditEvents = JSON.parse(verification.audit_trail_json); } catch {}
  }

  const hasData = auditEvents.length > 0 || activities.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/verification" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 mb-2">
          <ArrowLeft size={12} /> Verification Center
        </Link>
        <h1 className="text-2xl font-bold text-white">Verification History</h1>
        <p className="text-white/40 text-sm mt-1">Timeline of your verification events and audit trail.</p>
      </div>

      {!hasData && (
        <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-xl">
          <Clock size={28} className="text-white/30 mx-auto mb-3" />
          <p className="text-white/50 text-sm">No verification history yet.</p>
        </div>
      )}

      {/* Audit Trail */}
      {auditEvents.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm mb-4">Audit Trail</h2>
          <div className="space-y-3">
            {auditEvents.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5" />
                  {i < auditEvents.length - 1 && <div className="w-0.5 flex-1 bg-white/5 min-h-[24px]" />}
                </div>
                <div className="flex-1 pb-3">
                  <div className="text-sm text-white/80 font-medium">{event.event?.replace(/_/g, " ") || "Event"}</div>
                  {event.details && <div className="text-xs text-white/40 mt-0.5">{event.details}</div>}
                  <div className="text-[10px] text-white/30 mt-0.5">
                    {event.timestamp ? new Date(event.timestamp).toLocaleString() : "—"}
                    {event.actor && ` · ${event.actor}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Activities */}
      {activities.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm mb-4">Related Activities</h2>
          <div className="space-y-1.5">
            {activities.map((act, i) => (
              <div key={act.id || i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.01] border border-white/5">
                <ShieldCheck size={12} className="text-white/30 shrink-0" />
                <span className="text-xs text-white/60 flex-1 truncate">{act.action || "Activity"}</span>
                <span className="text-[10px] text-white/30 shrink-0">
                  {act.created_date ? new Date(act.created_date).toLocaleDateString() : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}