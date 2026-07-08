import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Loader2, Search, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import VerificationAdminTable from "@/components/trust/VerificationAdminTable";

const TABS = [
  { id: "pending", label: "Pending Reviews", icon: Clock },
  { id: "approved", label: "Approved", icon: CheckCircle },
  { id: "rejected", label: "Rejected", icon: XCircle },
  { id: "audit", label: "Audit History", icon: FileText },
];

export default function IdentityVerificationAdmin() {
  const [tab, setTab] = useState("pending");
  const [verifications, setVerifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("manageIdentityVerification", { action: "list" });
      const data = response.data || response;
      const all = data.verifications || [];
      setVerifications(all);
      setStats({
        pending: all.filter(v => ["submitted", "under_review", "pending_upload"].includes(v.identity_status)).length,
        approved: all.filter(v => v.identity_status === "verified" || v.identity_status === "approved").length,
        rejected: all.filter(v => v.identity_status === "rejected").length,
      });

      if (tab === "audit") {
        const logResponse = await base44.functions.invoke("manageIdentityVerification", { action: "get_logs" });
        const logData = logResponse.data || logResponse;
        setLogs(logData.logs || []);
      }
    } catch (e) {}
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleAction = () => { load(); };

  const filtered = verifications.filter(v => {
    if (tab === "pending") return ["submitted", "under_review"].includes(v.identity_status);
    if (tab === "approved") return ["verified", "approved"].includes(v.identity_status);
    if (tab === "rejected") return v.identity_status === "rejected";
    return false;
  });

  const searchFiltered = search
    ? filtered.filter(v =>
        (v.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (v.user_email || "").toLowerCase().includes(search.toLowerCase())
      )
    : filtered;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <ShieldCheck size={12} className="text-violet-400" /> Platform · Identity Verification Management
        </div>
        <h1 className="text-2xl font-bold text-white">Identity Verification Management</h1>
        <p className="text-white/40 text-sm mt-2">Review and approve identity verification requests across the platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-1"><Clock size={14} /> Pending</div>
          <div className="text-2xl font-bold text-white">{stats.pending}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-1"><CheckCircle size={14} /> Approved</div>
          <div className="text-2xl font-bold text-white">{stats.approved}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400 text-xs font-medium mb-1"><XCircle size={14} /> Rejected</div>
          <div className="text-2xl font-bold text-white">{stats.rejected}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === t.id ? "bg-violet-500/15 text-violet-400" : "text-white/40 hover:text-white/70"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {tab !== "audit" && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
        </div>
      ) : tab === "audit" ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          {logs.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-6">No audit entries yet.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={log.id || i} className="flex items-start gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                  <FileText size={14} className="text-white/30 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-white/70 font-medium">{log.user_name || "Unknown"}</span>
                      <span className="text-[10px] text-white/30">{log.action.replace(/_/g, " ")}</span>
                    </div>
                    {log.reviewer_name && <p className="text-[11px] text-white/30">Reviewer: {log.reviewer_name}</p>}
                    {log.reason && <p className="text-[11px] text-white/40 mt-0.5">{log.reason}</p>}
                    {log.created_date && <p className="text-[10px] text-white/20 mt-0.5">{new Date(log.created_date).toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <VerificationAdminTable verifications={searchFiltered} onAction={handleAction} />
      )}
    </div>
  );
}