import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Flag, Loader2, Clock, CheckCircle2, XCircle, Eye, Building2, ChevronRight,
} from "lucide-react";
import { REPORT_TYPES } from "@/lib/legalCompliance";

const STATUS_CONFIG = {
  submitted: { label: "Pending Review", icon: Clock, cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  under_review: { label: "Under Review", icon: Eye, cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  resolved: { label: "Resolved", icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  dismissed: { label: "Dismissed", icon: XCircle, cls: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function RequestTracking() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u?.id) {
          const list = await base44.entities.CompanyReport.filter(
            { created_by_id: u.id },
            "-created_date",
            100
          );
          setReports(list);
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const getReportTypeLabel = (typeId) =>
    REPORT_TYPES.find((r) => r.id === typeId)?.label || typeId;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Flag size={12} className="text-amber-400" /> Request Tracking
        </div>
        <h1 className="text-2xl font-bold text-white">My Correction Requests</h1>
        <p className="text-white/40 text-sm mt-1">
          Track the status of reports and correction requests you've submitted for company profiles.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-5">
            <Flag size={28} className="text-white/15" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">No Requests Submitted</h3>
          <p className="text-white/40 text-sm mb-6">
            When you report an issue or request a correction on a company profile, it will appear here with real-time status tracking.
          </p>
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Building2 size={16} /> Browse Company Library
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.submitted;
            const StatusIcon = status.icon;
            return (
              <div
                key={report.id}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-sm truncate">
                        {report.company_name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.cls} flex items-center gap-1`}>
                        <StatusIcon size={10} /> {status.label}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs">{getReportTypeLabel(report.report_type)}</p>
                  </div>
                  <Link
                    to={report.company_id ? `/companies/${report.company_id}` : "/companies"}
                    className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1 shrink-0"
                  >
                    View Profile <ChevronRight size={12} />
                  </Link>
                </div>

                <p className="text-white/50 text-sm leading-relaxed mb-3 line-clamp-3">
                  {report.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span>
                    Submitted {new Date(report.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {report.resolved_at && (
                    <span>
                      Resolved {new Date(report.resolved_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                </div>

                {report.resolution_notes && (
                  <div className="mt-3 pt-3 border-t border-white/5">
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