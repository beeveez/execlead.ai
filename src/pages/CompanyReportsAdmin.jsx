import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Flag, Loader2, Clock, CheckCircle2, XCircle, Eye, Building2,
  Search, ChevronDown, Save, BarChart3, Timer,
} from "lucide-react";
import { REPORT_TYPES } from "@/lib/legalCompliance";

const STATUS_CONFIG = {
  submitted: { label: "Pending", icon: Clock, cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  under_review: { label: "Under Review", icon: Eye, cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  resolved: { label: "Resolved", icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  dismissed: { label: "Dismissed", icon: XCircle, cls: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function CompanyReportsAdmin() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [editState, setEditState] = useState({});

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.CompanyReport.list("-created_date", 500);
      setReports(list);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = {
    pending: reports.filter((r) => r.status === "submitted").length,
    underReview: reports.filter((r) => r.status === "under_review").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
    avgResponseHours: (() => {
      const resolved = reports.filter((r) => r.resolved_at && r.created_date);
      if (resolved.length === 0) return 0;
      const total = resolved.reduce((sum, r) => {
        const diff = new Date(r.resolved_at) - new Date(r.created_date);
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      return Math.round(total / resolved.length);
    })(),
  };

  const filtered = reports.filter((r) => {
    if (fStatus && r.status !== fStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.company_name?.toLowerCase().includes(q) ||
        r.reporter_name?.toLowerCase().includes(q) ||
        r.reporter_email?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getReportTypeLabel = (typeId) =>
    REPORT_TYPES.find((r) => r.id === typeId)?.label || typeId;

  const handleUpdate = async (id) => {
    const edit = editState[id];
    if (!edit) return;
    try {
      const payload = {
        status: edit.status,
        resolution_notes: edit.resolution_notes || "",
      };
      if (edit.status === "resolved" || edit.status === "dismissed") {
        payload.resolved_at = new Date().toISOString();
        const original = reports.find((r) => r.id === id);
        if (original?.created_date) {
          const diff = (new Date() - new Date(original.created_date)) / (1000 * 60 * 60);
          payload.response_time_hours = Math.round(diff);
        }
      }
      await base44.entities.CompanyReport.update(id, payload);
      setExpanded(null);
      setEditState((prev) => ({ ...prev, [id]: undefined }));
      await load();
    } catch (e) {}
  };

  const startEdit = (report) => {
    setExpanded(expanded === report.id ? null : report.id);
    setEditState((prev) => ({
      ...prev,
      [report.id]: {
        status: report.status,
        resolution_notes: report.resolution_notes || "",
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Flag size={12} className="text-amber-400" /> Compliance Administration
        </div>
        <h1 className="text-2xl font-bold text-white">Correction Request Review</h1>
        <p className="text-white/40 text-sm mt-1">
          Manage correction requests, trademark concerns, and compliance reports submitted for company profiles.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Clock} label="Pending" value={stats.pending} cls="text-amber-400 bg-amber-500/10" />
        <StatCard icon={Eye} label="Under Review" value={stats.underReview} cls="text-blue-400 bg-blue-500/10" />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} cls="text-emerald-400 bg-emerald-500/10" />
        <StatCard icon={XCircle} label="Dismissed" value={stats.dismissed} cls="text-red-400 bg-red-500/10" />
        <StatCard icon={Timer} label="Avg Response" value={stats.avgResponseHours > 0 ? `${stats.avgResponseHours}h` : "—"} cls="text-violet-400 bg-violet-500/10" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, reporter, or description..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
        <select
          value={fStatus}
          onChange={(e) => setFStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        >
          <option value="">All Statuses</option>
          <option value="submitted">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 size={24} className="mx-auto text-white/20 mb-2" />
          <p className="text-white/30 text-sm">No correction requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.submitted;
            const StatusIcon = status.icon;
            const isExpanded = expanded === report.id;
            const edit = editState[report.id];
            return (
              <div key={report.id} className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => startEdit(report)}
                  className="w-full flex items-start justify-between gap-3 p-5 text-left hover:bg-white/[0.01] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Building2 size={14} className="text-white/40 shrink-0" />
                      <h3 className="text-white font-semibold text-sm truncate">{report.company_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.cls} flex items-center gap-1`}>
                        <StatusIcon size={10} /> {status.label}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mb-2">{getReportTypeLabel(report.report_type)}</p>
                    <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{report.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                      <span>{report.reporter_name || "Anonymous"}</span>
                      {report.reporter_email && <span>{report.reporter_email}</span>}
                      <span>{new Date(report.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-white/30 transition-transform mt-1 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && edit && (
                  <div className="border-t border-white/5 p-5 bg-white/[0.01] space-y-3">
                    {report.fields_affected?.length > 0 && (
                      <div>
                        <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Fields Affected</div>
                        <div className="flex flex-wrap gap-1.5">
                          {report.fields_affected.map((f, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/50 border border-white/10">{f}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.resolution_notes && !isExpanded && null}

                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Update Status</label>
                      <select
                        value={edit.status}
                        onChange={(e) => setEditState((prev) => ({ ...prev, [report.id]: { ...edit, status: e.target.value } }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      >
                        <option value="submitted">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Resolution Notes</label>
                      <textarea
                        value={edit.resolution_notes}
                        onChange={(e) => setEditState((prev) => ({ ...prev, [report.id]: { ...edit, resolution_notes: e.target.value } }))}
                        rows={3}
                        placeholder="Add notes about the resolution or action taken..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setExpanded(null); setEditState((prev) => ({ ...prev, [report.id]: undefined })); }}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(report.id)}
                        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <Save size={14} /> Save Update
                      </button>
                    </div>
                  </div>
                )}

                {report.resolution_notes && !isExpanded && (
                  <div className="px-5 pb-4">
                    <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Resolution</div>
                    <p className="text-white/50 text-xs leading-relaxed">{report.resolution_notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, cls }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${cls}`}>
        <Icon size={16} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/30 text-xs mt-1">{label}</div>
    </div>
  );
}