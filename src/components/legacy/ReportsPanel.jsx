import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Flag, Check, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { REPORT_TYPES } from "@/lib/legacyLibrary";

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

export default function ReportsPanel() {
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [acting, setActing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { loadReports(); }, [status]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "admin_reports", status });
      const d = res.data || res;
      setReports(d.reports || []);
    } catch (e) { toast({ title: "Failed to load reports", variant: "destructive" }); }
    setLoading(false);
  };

  const handleResolve = async (reportId, resolution, notes) => {
    setActing(reportId);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", { action: "resolve_report", report_id: reportId, resolution, notes });
      const d = res.data || res;
      if (d.success) {
        toast({ title: resolution === "dismiss" ? "Report dismissed" : "Report resolved" });
        loadReports();
      }
    } catch (e) { toast({ title: "Failed to resolve", variant: "destructive" }); }
    setActing(null);
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {STATUS_TABS.map((t) => (
          <button key={t.value} onClick={() => setStatus(t.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${status === t.value ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "bg-white/5 text-white/40 border border-transparent"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16"><Flag size={28} className="text-indigo-400/30 mx-auto mb-3" /><p className="text-white/30 text-sm">No reports in this category.</p></div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[10px] font-medium">
                      {REPORT_TYPES.find((t) => t.value === r.report_type)?.label || r.report_type}
                    </span>
                    <span className="text-white/30 text-[10px]">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.letter_title && <Link to={`/legacy-library/${r.letter_id}`} className="text-white/90 font-medium text-sm hover:text-indigo-400 transition-colors block truncate">{r.letter_title}</Link>}
                  <div className="text-white/40 text-xs mt-0.5">Reported by {r.reporter_name}</div>
                  {r.reason && <p className="text-white/50 text-xs mt-1.5 line-clamp-2">{r.reason}</p>}

                  {r.status !== "pending" && r.resolution_notes && (
                    <div className="mt-2 bg-white/[0.02] border border-white/5 rounded-lg p-2">
                      <p className="text-white/40 text-[10px] font-medium mb-0.5">RESOLUTION NOTES</p>
                      <p className="text-white/60 text-xs">{r.resolution_notes}</p>
                      <p className="text-white/30 text-[10px] mt-1">by {r.resolved_by_name} · {r.resolved_at && new Date(r.resolved_at).toLocaleDateString()}</p>
                    </div>
                  )}

                  {expandedId === r.id && r.status === "pending" && (
                    <ResolutionForm onSubmit={(notes, resolution) => handleResolve(r.id, resolution, notes)} acting={acting === r.id} />
                  )}
                </div>

                {r.status === "pending" && (
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {expandedId === r.id ? (
                      <button onClick={() => setExpandedId(null)} className="flex items-center gap-1 bg-white/5 border border-white/10 text-white/50 text-xs px-2.5 py-1.5 rounded-lg">
                        <ChevronUp size={12} /> Cancel
                      </button>
                    ) : (
                      <>
                        <button onClick={() => setExpandedId(r.id)} className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors">
                          <Check size={12} /> Resolve
                        </button>
                        <button onClick={() => handleResolve(r.id, "dismiss", "Dismissed by moderator")} disabled={acting === r.id} className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                          <X size={12} /> Dismiss
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResolutionForm({ onSubmit, acting }) {
  const [notes, setNotes] = useState("");
  return (
    <div className="mt-2 bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add resolution notes (optional)..."
        rows={2}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/90 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 resize-none mb-2"
      />
      <button onClick={() => onSubmit(notes, "resolve")} disabled={acting} className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-50">
        {acting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Confirm Resolution
      </button>
    </div>
  );
}