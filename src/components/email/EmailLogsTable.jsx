import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import {
  CheckCircle, XCircle, AlertTriangle, MailOpen, MousePointerClick,
  RotateCw, Ban, Inbox, Send, ChevronDown, ChevronRight, Trash2,
  RefreshCw, Filter, X, Archive, Clock,
} from "lucide-react";

const STATUS_META = {
  queued: { icon: Inbox, color: "text-slate-400", bg: "bg-slate-500/10" },
  sending: { icon: Send, color: "text-blue-400", bg: "bg-blue-500/10" },
  delivered: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  sent: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  opened: { icon: MailOpen, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  clicked: { icon: MousePointerClick, color: "text-teal-400", bg: "bg-teal-500/10" },
  bounced: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
  spam: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  retry: { icon: RotateCw, color: "text-amber-400", bg: "bg-amber-500/10" },
  cancelled: { icon: Ban, color: "text-white/40", bg: "bg-white/5" },
  not_configured: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
};

const FAILED_STATUSES = ["failed", "bounced", "spam", "not_configured"];
const STATUS_OPTIONS = ["queued", "sending", "delivered", "sent", "opened", "clicked", "bounced", "spam", "failed", "retry", "cancelled", "not_configured"];

export default function EmailLogsTable({ events, settings, onReload }) {
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTemplate, setFilterTemplate] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [retryingId, setRetryingId] = useState(null);
  const [retryingAll, setRetryingAll] = useState(false);
  const [deletingOld, setDeletingOld] = useState(false);

  const templates = useMemo(() => {
    const set = new Set();
    events.forEach(e => { if (e.template || e.email_type) set.add(e.template || e.email_type); });
    return Array.from(set).sort();
  }, [events]);

  const isHistorical = (evt) => evt.delivery_status === "not_configured" || evt.provider === "none" || evt.provider === "";

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (filterStatus && e.delivery_status !== filterStatus) return false;
      if (filterTemplate && (e.template || e.email_type) !== filterTemplate) return false;
      if (filterDate) {
        const eventDate = new Date(e.created_date).toISOString().split("T")[0];
        if (eventDate !== filterDate) return false;
      }
      return true;
    });
  }, [events, filterStatus, filterTemplate, filterDate]);

  const failedEvents = filtered.filter(e => FAILED_STATUSES.includes(e.delivery_status) && !isHistorical(e));

  const handleRetry = async (evt) => {
    setRetryingId(evt.id);
    try {
      await base44.entities.EmailEvent.update(evt.id, {
        delivery_status: "retry",
        retry_count: (evt.retry_count || 0) + 1,
      });

      try {
        await base44.integrations.Core.SendEmail({
          to: evt.recipient,
          subject: evt.subject,
          body: `[Retry] ${evt.subject}`,
          from_name: settings?.from_name || "EXECLEAD.AI",
        });
        await base44.entities.EmailEvent.update(evt.id, {
          delivery_status: "delivered",
          provider_response: "Retry: Delivered successfully",
          error_message: "",
        });
        toast({ title: "Retry Successful", description: `Email re-sent to ${evt.recipient}`, variant: "success" });
      } catch (sendErr) {
        await base44.entities.EmailEvent.update(evt.id, {
          delivery_status: "failed",
          provider_response: `Retry failed: ${sendErr.message}`,
          error_message: sendErr.message,
        });
        toast({ title: "Retry Failed", description: sendErr.message, variant: "error" });
      }
    } catch (e) {
      toast({ title: "Retry Error", description: e.message, variant: "error" });
    }
    setRetryingId(null);
    if (onReload) onReload();
  };

  const handleRetryAll = async () => {
    if (failedEvents.length === 0) {
      toast({ title: "No Failed Emails", description: "There are no failed emails to retry.", variant: "info" });
      return;
    }
    if (!window.confirm(`Retry ${failedEvents.length} failed email(s)? This will attempt to re-send each one.`)) return;
    setRetryingAll(true);
    let success = 0, fail = 0;
    for (const evt of failedEvents) {
      try {
        await base44.entities.EmailEvent.update(evt.id, {
          delivery_status: "retry",
          retry_count: (evt.retry_count || 0) + 1,
        });
        try {
          await base44.integrations.Core.SendEmail({
            to: evt.recipient,
            subject: evt.subject,
            body: `[Retry] ${evt.subject}`,
            from_name: settings?.from_name || "EXECLEAD.AI",
          });
          await base44.entities.EmailEvent.update(evt.id, {
            delivery_status: "delivered",
            provider_response: "Retry: Delivered successfully",
            error_message: "",
          });
          success++;
        } catch (sendErr) {
          await base44.entities.EmailEvent.update(evt.id, {
            delivery_status: "failed",
            provider_response: `Retry failed: ${sendErr.message}`,
            error_message: sendErr.message,
          });
          fail++;
        }
      } catch (e) {
        fail++;
      }
    }
    setRetryingAll(false);
    if (onReload) onReload();
    toast({ title: "Bulk Retry Complete", description: `${success} succeeded, ${fail} failed`, variant: success > 0 ? "success" : "error" });
  };

  const handleDelete = async (evt) => {
    if (!window.confirm(`Delete log entry for "${evt.subject}"?`)) return;
    try {
      await base44.entities.EmailEvent.delete(evt.id);
      toast({ title: "Log Deleted", variant: "success" });
      if (onReload) onReload();
    } catch (e) {
      toast({ title: "Delete Failed", description: e.message, variant: "error" });
    }
  };

  const handleDeleteOld = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const oldEvents = events.filter(e => new Date(e.created_date) < thirtyDaysAgo);
    if (oldEvents.length === 0) {
      toast({ title: "No Old Logs", description: "No logs older than 30 days found.", variant: "info" });
      return;
    }
    if (!window.confirm(`Delete ${oldEvents.length} log(s) older than 30 days? This cannot be undone.`)) return;
    setDeletingOld(true);
    try {
      await base44.entities.EmailEvent.deleteMany({ id: { $in: oldEvents.map(e => e.id) } });
      toast({ title: "Old Logs Deleted", description: `${oldEvents.length} log(s) removed`, variant: "success" });
      if (onReload) onReload();
    } catch (e) {
      toast({ title: "Delete Failed", description: e.message, variant: "error" });
    }
    setDeletingOld(false);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterTemplate("");
    setFilterDate("");
  };

  const hasFilters = filterStatus || filterTemplate || filterDate;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      {/* Header + Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Delivery Logs</h3>
          <span className="text-xs text-white/30">{filtered.length} of {events.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRetryAll}
            disabled={retryingAll || failedEvents.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-medium transition-colors disabled:opacity-30"
          >
            {retryingAll ? <RotateCw size={12} className="animate-spin" /> : <RefreshCw size={12} />} Retry All Failed ({failedEvents.length})
          </button>
          <button
            onClick={handleDeleteOld}
            disabled={deletingOld}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 text-xs font-medium transition-colors disabled:opacity-30"
          >
            {deletingOld ? <RotateCw size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete Old (30d+)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1 text-white/30 text-xs"><Filter size={12} /> Filters:</div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <select value={filterTemplate} onChange={e => setFilterTemplate(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
          <option value="">All Templates</option>
          {templates.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 [color-scheme:dark]" />
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 text-xs transition-colors">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-12">No email events match the current filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2 text-xs text-white/40 uppercase w-8"></th>
                <th className="px-3 py-2 text-xs text-white/40 uppercase">Recipient</th>
                <th className="px-3 py-2 text-xs text-white/40 uppercase">Subject</th>
                <th className="px-3 py-2 text-xs text-white/40 uppercase">Template</th>
                <th className="px-3 py-2 text-xs text-white/40 uppercase">Status</th>
                <th className="px-3 py-2 text-xs text-white/40 uppercase">Timestamp</th>
                <th className="px-3 py-2 text-xs text-white/40 uppercase">Retries</th>
                <th className="px-3 py-2 text-xs text-white/40 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(evt => {
                const meta = STATUS_META[evt.delivery_status] || STATUS_META.failed;
                const historical = isHistorical(evt);
                const isFailed = FAILED_STATUSES.includes(evt.delivery_status);
                const expanded = expandedId === evt.id;
                return (
                  <React.Fragment key={evt.id}>
                    <tr className="border-t border-white/5 hover:bg-white/[0.01]">
                      <td className="px-3 py-2">
                        <button onClick={() => setExpandedId(expanded ? null : evt.id)} className="text-white/30 hover:text-white/60">
                          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-white/60">{evt.recipient}</td>
                      <td className="px-3 py-2 text-white/50 max-w-[200px] truncate" title={evt.subject}>{evt.subject}</td>
                      <td className="px-3 py-2 text-white/50">{evt.template || evt.email_type || "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${meta.bg} ${meta.color}`}>
                            <meta.icon size={10} /> {evt.delivery_status.replace("_", " ")}
                          </span>
                          {historical && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider" title="Occurred before provider configuration">
                              <Archive size={8} /> Historical
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-white/30 text-xs whitespace-nowrap">{new Date(evt.created_date).toLocaleString()}</td>
                      <td className="px-3 py-2 text-white/40 text-xs">{evt.retry_count || 0}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {isFailed && !historical && (
                            <button
                              onClick={() => handleRetry(evt)}
                              disabled={retryingId === evt.id}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors disabled:opacity-30"
                              title="Retry send"
                            >
                              {retryingId === evt.id ? <RotateCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(evt)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
                            title="Delete log"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-white/[0.01]">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <div className="text-white/30 uppercase tracking-wider mb-1">Provider</div>
                              <div className="text-white/60 capitalize">{evt.provider || "—"}</div>
                            </div>
                            <div>
                              <div className="text-white/30 uppercase tracking-wider mb-1">Entity</div>
                              <div className="text-white/60">{evt.entity_name ? `${evt.entity_name} (${evt.entity_id?.slice(0, 8) || "—"}...)` : "—"}</div>
                            </div>
                            <div>
                              <div className="text-white/30 uppercase tracking-wider mb-1">Error Message</div>
                              <div className="text-red-400/70 break-words">{evt.error_message || "—"}</div>
                            </div>
                            <div>
                              <div className="text-white/30 uppercase tracking-wider mb-1">Retry Count</div>
                              <div className="text-white/60">{evt.retry_count || 0}</div>
                            </div>
                            <div className="sm:col-span-2">
                              <div className="text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Clock size={10} /> Detailed Provider Response
                              </div>
                              <pre className="bg-black/30 border border-white/5 rounded-lg p-3 text-white/50 text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono">
                                {evt.provider_response || "No provider response recorded"}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}