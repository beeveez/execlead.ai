import React, { useState, useCallback } from "react";
import { getFormLookupRegistry, getLeadershipLevelOptions, getTeamSizeOptions, getHowHeardOptions } from "@/lib/betaProgramEngine";
import { Database, RefreshCw, CheckCircle2, XCircle, AlertTriangle, ListChecks } from "lucide-react";

const STATUS_STYLES = {
  loaded: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Loaded" },
  empty: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Empty" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Error" },
};

const VALIDATION_STYLES = {
  passed: { icon: CheckCircle2, color: "text-emerald-400" },
  failed: { icon: XCircle, color: "text-red-400" },
};

const FIELD_GETTERS = {
  "Leadership Level": getLeadershipLevelOptions,
  "Team Size": getTeamSizeOptions,
  "How did you hear about EXECLEAD.AI?": getHowHeardOptions,
};

export default function FormLookupRegistry() {
  const [registry, setRegistry] = useState(() => getFormLookupRegistry());
  const [expandedField, setExpandedField] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRegistry(getFormLookupRegistry());
      setRefreshing(false);
    }, 300);
  }, []);

  const allPassed = registry.every((r) => r.validation_status === "passed");
  const totalOptions = registry.reduce((sum, r) => sum + r.option_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Database size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Form Lookup Registry™</h1>
            <p className="text-xs text-white/40">Beta application dropdown validation & lookup source audit</p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 font-medium transition-colors disabled:opacity-40"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{registry.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Lookup Fields</div>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{totalOptions}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Total Options</div>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
          <div className={`text-2xl font-bold ${allPassed ? "text-emerald-400" : "text-red-400"}`}>{allPassed ? "All" : "Issues"}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Validation</div>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">100%</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Built-in Fallback</div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-white/40 font-medium uppercase tracking-wider">Field Name</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium uppercase tracking-wider">Data Source</th>
                <th className="text-center px-4 py-3 text-white/40 font-medium uppercase tracking-wider">Options</th>
                <th className="text-center px-4 py-3 text-white/40 font-medium uppercase tracking-wider">Load Status</th>
                <th className="text-center px-4 py-3 text-white/40 font-medium uppercase tracking-wider">Validation</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium uppercase tracking-wider">Last Refresh</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium uppercase tracking-wider">Fallback Source</th>
                <th className="text-center px-4 py-3 text-white/40 font-medium uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody>
              {registry.map((row, i) => {
                const statusStyle = STATUS_STYLES[row.load_status] || STATUS_STYLES.error;
                const valStyle = VALIDATION_STYLES[row.validation_status] || VALIDATION_STYLES.failed;
                const StatusIcon = statusStyle.icon;
                const ValIcon = valStyle.icon;
                const isExpanded = expandedField === row.field_name;
                const options = FIELD_GETTERS[row.field_name]?.() || [];

                return (
                  <React.Fragment key={i}>
                    <tr className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${isExpanded ? "bg-white/[0.02]" : ""}`}>
                      <td className="px-4 py-3 text-white font-medium">{row.field_name}</td>
                      <td className="px-4 py-3 text-white/40 font-mono text-[10px]">{row.data_source}</td>
                      <td className="px-4 py-3 text-center text-white/60">{row.option_count}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border} border`}>
                          <StatusIcon size={10} /> {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ValIcon size={14} className={`inline ${valStyle.color}`} />
                      </td>
                      <td className="px-4 py-3 text-white/30 text-[10px]">{new Date(row.last_refresh).toLocaleString()}</td>
                      <td className="px-4 py-3 text-white/40 text-[10px]">{row.fallback_source}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setExpandedField(isExpanded ? null : row.field_name)}
                          className="text-white/40 hover:text-white/70 transition-colors"
                        >
                          <ListChecks size={14} className="inline" />
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {options.length === 0 ? (
                              <span className="text-xs text-red-400">No options available</span>
                            ) : (
                              options.map((opt, idx) => (
                                <span key={opt.value} className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-white/50">
                                  <span className="text-white/30">{idx + 1}.</span> {opt.label} <code className="text-white/20 ml-1">{opt.value}</code>
                                </span>
                              ))
                            )}
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
      </div>

      {/* Notes */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Validation Rules</h3>
        <ul className="space-y-1 text-[11px] text-white/40">
          <li>• No blank rows — null, undefined, empty string, and whitespace-only values are filtered out.</li>
          <li>• No duplicate values — case-insensitive deduplication on option labels.</li>
          <li>• Alphabetical sorting where appropriate ("Other" always pinned last).</li>
          <li>• Keyboard accessible — all dropdowns use Radix UI Select with full ARIA support.</li>
          <li>• Empty-state message displayed when zero valid options are available.</li>
          <li>• All lookups have built-in defaults — no external dependency required.</li>
        </ul>
      </div>
    </div>
  );
}