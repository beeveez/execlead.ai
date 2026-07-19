import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useExecVerified } from "@/hooks/useExecVerified";
import { VERIFICATION_STATUSES, WORKFLOW_STAGES } from "@/lib/execVerifiedCatalog";
import { ShieldCheck, Clock, CheckCircle2, XCircle, Eye, Loader2, ChevronRight } from "lucide-react";

const ADMIN_ROLES = ["super_admin", "platform_admin", "admin", "developer"];

export default function VerificationAdmin() {
  const { enabled, loading: flagLoading } = useExecVerified();
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    base44.entities.ExecVerification.list("-created_date", 50)
      .then((recs) => setRecords(recs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enabled]);

  if (!flagLoading && !enabled) return <Navigate to="/security" replace />;
  if (loading || flagLoading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /></div>;

  const isAdmin = ADMIN_ROLES.includes(user?.role);
  if (!isAdmin) return <Navigate to="/security" replace />;

  const stats = {
    total: records.length,
    pending: records.filter(r => r.verification_status === "pending").length,
    under_review: records.filter(r => r.verification_status === "under_review").length,
    verified: records.filter(r => r.verification_status === "verified").length,
    rejected: records.filter(r => r.verification_status === "rejected").length,
  };

  const handleApprove = async (record) => {
    setActing(true);
    try {
      const now = new Date().toISOString();
      const expiration = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      let audit = [];
      try { audit = JSON.parse(record.audit_trail_json || "[]"); } catch {}
      audit.push({ timestamp: now, event: "approved", actor: user.email, details: `Level ${record.verification_level_number} approved` });
      await base44.entities.ExecVerification.update(record.id, {
        verification_status: "verified",
        workflow_stage: "approved",
        reviewer_id: user.id,
        reviewer_name: user.email,
        review_date: now,
        verification_date: now,
        expiration_date: expiration,
        renewal_date: expiration,
        audit_trail_json: JSON.stringify(audit),
      });
      setRecords(prev => prev.map(r => r.id === record.id ? { ...r, verification_status: "verified", workflow_stage: "approved" } : r));
      setSelected(null);
    } catch {}
    setActing(false);
  };

  const handleReject = async (record) => {
    setActing(true);
    try {
      const now = new Date().toISOString();
      let audit = [];
      try { audit = JSON.parse(record.audit_trail_json || "[]"); } catch {}
      audit.push({ timestamp: now, event: "rejected", actor: user.email, details: "Application rejected" });
      await base44.entities.ExecVerification.update(record.id, {
        verification_status: "rejected",
        workflow_stage: "rejected",
        reviewer_id: user.id,
        reviewer_name: user.email,
        review_date: now,
        audit_trail_json: JSON.stringify(audit),
      });
      setRecords(prev => prev.map(r => r.id === record.id ? { ...r, verification_status: "rejected", workflow_stage: "rejected" } : r));
      setSelected(null);
    } catch {}
    setActing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <ShieldCheck size={12} className="text-indigo-400" /> EXEC™ Verified Admin
        </div>
        <h1 className="text-2xl font-bold text-white">Verification Queue</h1>
        <p className="text-white/40 text-sm mt-1">Review and manage verification applications.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total" value={stats.total} icon={ShieldCheck} color="indigo" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="blue" />
        <StatCard label="Under Review" value={stats.under_review} icon={Eye} color="amber" />
        <StatCard label="Verified" value={stats.verified} icon={CheckCircle2} color="green" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="red" />
      </div>

      {/* Queue */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck size={28} className="text-white/30 mx-auto mb-3" />
            <p className="text-white/50 text-sm">No verification applications in the queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {records.map((record) => {
              const status = VERIFICATION_STATUSES[record.verification_status] || VERIFICATION_STATUSES.not_available;
              return (
                <div key={record.id} className="flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/80 font-medium">{record.user_name || record.user_email || "Unknown"}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        record.verification_status === "verified" ? "text-emerald-400 bg-emerald-500/10" :
                        record.verification_status === "rejected" ? "text-red-400 bg-red-500/10" :
                        "text-amber-400 bg-amber-500/10"
                      }`}>{status.label}</span>
                    </div>
                    <div className="text-[11px] text-white/30 mt-0.5">
                      Level {record.verification_level_number || 1} · {WORKFLOW_STAGES[record.workflow_stage]?.label || "—"} ·
                      {record.application_date ? ` Applied ${new Date(record.application_date).toLocaleDateString()}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(record)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors"
                  >
                    Review <ChevronRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-white font-semibold">Review Application</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Applicant" value={selected.user_name || selected.user_email} />
                <Detail label="Email" value={selected.user_email} />
                <Detail label="Level" value={`Level ${selected.verification_level_number}`} />
                <Detail label="Stage" value={WORKFLOW_STAGES[selected.workflow_stage]?.label || "—"} />
                <Detail label="Evidence Count" value={String(selected.evidence_count || 0)} />
                <Detail label="Confidence" value={`${selected.evidence_confidence || 0}%`} />
                <Detail label="Identity" value={selected.identity_status || "not_started"} />
                <Detail label="Employment" value={selected.employment_status || "not_started"} />
                <Detail label="Certification" value={selected.certification_status || "not_started"} />
                <Detail label="Executive" value={selected.executive_status || "not_started"} />
              </div>
              {selected.manual_review_notes && (
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Review Notes</div>
                  <p className="text-xs text-white/60">{selected.manual_review_notes}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleReject(selected)}
                  disabled={acting}
                  className="flex-1 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selected)}
                  disabled={acting}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {acting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = { indigo: "text-indigo-400", blue: "text-blue-400", amber: "text-amber-400", green: "text-emerald-400", red: "text-red-400" };
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <Icon size={14} className={colors[color] || "text-white/40"} />
      <div className="text-lg font-bold text-white mt-1">{value}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-white/70 font-medium mt-0.5 capitalize">{value}</div>
    </div>
  );
}