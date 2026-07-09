import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ShieldCheck, Loader2, Search, Clock, CheckCircle, XCircle, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import VerificationAdminTable from "@/components/trust/VerificationAdminTable";

const PAGE_SIZE = 10;

// ============================================================
// SINGLE SOURCE OF TRUTH — KPI counters and table filters use
// the SAME status groups, guaranteeing they never diverge.
// ============================================================
const PENDING_STATUSES = ["pending_upload", "submitted", "under_review"];
const APPROVED_STATUSES = ["approved", "verified"];
const REJECTED_STATUSES = ["rejected"];

const STATUS_GROUPS = {
  pending: PENDING_STATUSES,
  approved: APPROVED_STATUSES,
  rejected: REJECTED_STATUSES,
};

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
  const [page, setPage] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("manageIdentityVerification", { action: "list" });
      const data = response.data || response;
      const all = data.verifications || [];
      setVerifications(all);

      const newStats = {
        pending: all.filter(v => PENDING_STATUSES.includes(v.identity_status)).length,
        approved: all.filter(v => APPROVED_STATUSES.includes(v.identity_status)).length,
        rejected: all.filter(v => REJECTED_STATUSES.includes(v.identity_status)).length,
      };
      setStats(newStats);

      console.log("[IdentityVerification] Data loaded:", {
        totalRecords: all.length,
        pendingCount: newStats.pending,
        approvedCount: newStats.approved,
        rejectedCount: newStats.rejected,
      });

      if (tab === "audit") {
        const logResponse = await base44.functions.invoke("manageIdentityVerification", { action: "get_logs" });
        const logData = logResponse.data || logResponse;
        setLogs(logData.logs || []);
      }
    } catch (e) {
      console.error("[IdentityVerification] Load error:", e);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  // Reset to first page whenever tab or search changes
  useEffect(() => { setPage(0); }, [tab, search]);

  const handleAction = () => { load(); };

  // Clicking a KPI card filters the table to that status group
  const handleStatClick = (statTab) => {
    setSearch("");
    setTab(statTab);
  };

  // Table filter uses the SAME status groups as the KPI counters
  const filtered = useMemo(() => {
    if (tab === "audit") return [];
    const statuses = STATUS_GROUPS[tab] || [];
    return verifications.filter(v => statuses.includes(v.identity_status));
  }, [verifications, tab]);

  const searchFiltered = useMemo(() => {
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(v =>
      (v.user_name || "").toLowerCase().includes(q) ||
      (v.user_email || "").toLowerCase().includes(q)
    );
  }, [filtered, search]);

  // Pagination — clamp page if records shrink after an action
  const totalPages = Math.ceil(searchFiltered.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(0, totalPages - 1));
  const paginated = searchFiltered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // Console logging — total pending count, rows returned, current filters
  useEffect(() => {
    if (loading || tab === "audit") return;
    console.log("[IdentityVerification] Current view:", {
      tab,
      appliedFilters: {
        statusGroup: tab,
        statuses: STATUS_GROUPS[tab] || [],
        search: search || "(blank)",
      },
      totalPending: stats.pending,
      rowsReturned: searchFiltered.length,
      rowsOnPage: paginated.length,
      page: currentPage + 1,
      totalPages: Math.max(1, totalPages),
    });
  }, [tab, search, searchFiltered, paginated, stats, loading, currentPage, totalPages]);

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

      {/* Stats — clickable to filter the table by status group */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleStatClick("pending")}
          className={`text-left bg-white/[0.02] border rounded-xl p-4 transition-all hover:bg-white/[0.04] cursor-pointer ${
            tab === "pending" ? "border-amber-500/30" : "border-white/5"
          }`}
        >
          <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-1"><Clock size={14} /> Pending</div>
          <div className="text-2xl font-bold text-white">{stats.pending}</div>
        </button>
        <button
          onClick={() => handleStatClick("approved")}
          className={`text-left bg-white/[0.02] border rounded-xl p-4 transition-all hover:bg-white/[0.04] cursor-pointer ${
            tab === "approved" ? "border-emerald-500/30" : "border-white/5"
          }`}
        >
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-1"><CheckCircle size={14} /> Approved</div>
          <div className="text-2xl font-bold text-white">{stats.approved}</div>
        </button>
        <button
          onClick={() => handleStatClick("rejected")}
          className={`text-left bg-white/[0.02] border rounded-xl p-4 transition-all hover:bg-white/[0.04] cursor-pointer ${
            tab === "rejected" ? "border-red-500/30" : "border-white/5"
          }`}
        >
          <div className="flex items-center gap-2 text-red-400 text-xs font-medium mb-1"><XCircle size={14} /> Rejected</div>
          <div className="text-2xl font-bold text-white">{stats.rejected}</div>
        </button>
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

      {/* Search — defaults to blank on first load */}
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
        <>
          <VerificationAdminTable verifications={paginated} onAction={handleAction} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-white/40">
                Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, searchFiltered.length)} of {searchFiltered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span className="text-xs text-white/40 min-w-[80px] text-center">Page {currentPage + 1} of {totalPages}</span>
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}