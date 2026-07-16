import React, { useState } from "react";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { safeParse, getScoreColor, formatMetric } from "@/lib/businessIntelligenceEngine";

export default function AutomationEffectivenessPanel({ report }) {
  const [sortBy, setSortBy] = useState("effectiveness_score");
  const [sortDir, setSortDir] = useState("asc");
  const [expanded, setExpanded] = useState(null);

  if (!report) return null;

  const rules = safeParse(report.automation_effectiveness_json, []);
  if (rules.length === 0) {
    return (
      <div>
        <PanelHeader icon={Zap} title="Automation Effectiveness Scores" />
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-8 text-center text-white/30 text-sm">
          No automation rules evaluated yet.
        </div>
      </div>
    );
  }

  const sorted = [...rules].sort((a, b) => {
    const val = sortDir === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
    return val;
  });

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const SortHeader = ({ col, label }) => (
    <th
      onClick={() => handleSort(col)}
      className="px-3 py-2 text-left cursor-pointer hover:text-white/80 transition-colors"
    >
      <span className="flex items-center gap-1">
        {label}
        {sortBy === col && (sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
      </span>
    </th>
  );

  return (
    <div>
      <PanelHeader icon={Zap} title="Automation Effectiveness Scores" count={rules.length} />
      <div className="overflow-x-auto bg-white/[0.02] border border-white/5 rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/40 border-b border-white/5">
              <SortHeader col="rule_name" label="Rule" />
              <SortHeader col="effectiveness_score" label="Score" />
              <SortHeader col="tasks_created" label="Tasks" />
              <SortHeader col="completion_rate" label="Completion" />
              <SortHeader col="revenue_generated" label="Revenue" />
              <SortHeader col="skip_rate" label="Skip Rate" />
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((rule) => (
              <React.Fragment key={rule.rule_id}>
                <tr
                  className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  onClick={() => setExpanded(expanded === rule.rule_id ? null : rule.rule_id)}
                >
                  <td className="px-3 py-2.5">
                    <div className="text-white/80 font-medium">{rule.rule_name}</div>
                    <div className="text-white/30 text-[10px]">{rule.trigger}</div>
                  </td>
                  <td className={`px-3 py-2.5 font-bold ${getScoreColor(rule.effectiveness_score)}`}>
                    {rule.effectiveness_score}
                  </td>
                  <td className="px-3 py-2.5 text-white/60">{rule.tasks_created}</td>
                  <td className="px-3 py-2.5 text-white/60">{rule.completion_rate}%</td>
                  <td className="px-3 py-2.5 text-emerald-400/80">{formatMetric(rule.revenue_generated, "currency")}</td>
                  <td className="px-3 py-2.5 text-white/60">{rule.skip_rate}%</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${rule.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"}`}>
                      {rule.enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                </tr>
                {expanded === rule.rule_id && (
                  <tr className="bg-white/[0.01]">
                    <td colSpan={7} className="px-3 py-3">
                      <div className="grid grid-cols-4 gap-3 text-[11px]">
                        <Stat label="Execution Count" value={rule.execution_count} />
                        <Stat label="Last Status" value={rule.last_execution_status} />
                        <Stat label="Exec Success" value={`${rule.execution_success_rate}%`} />
                        <Stat label="Expected Revenue" value={formatMetric(rule.expected_revenue, "currency")} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-white/30 uppercase tracking-widest text-[9px] mb-0.5">{label}</div>
      <div className="text-white/70">{value}</div>
    </div>
  );
}

function PanelHeader({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} className="text-indigo-400" />
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest">{title}</h3>
      {count != null && <span className="text-white/30 text-xs">({count})</span>}
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}