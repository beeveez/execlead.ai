import React from "react";
import { CheckCircle2, XCircle, Lightbulb, FileText } from "lucide-react";
import { safeParse } from "@/lib/businessIntelligenceEngine";

export default function WeeklyNarrativePanel({ report }) {
  if (!report) return null;

  const whatWorked = safeParse(report.what_worked_json, []);
  const whatDidntWork = safeParse(report.what_didnt_work_json, []);
  const whatShouldChange = safeParse(report.what_should_change_json, []);
  const automationImprovements = safeParse(report.automation_improvements_json, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FileText size={14} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest">Weekly Intelligence</h3>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* What Worked */}
        <NarrativeSection
          icon={CheckCircle2}
          iconColor="text-emerald-400"
          title="What Worked"
          items={whatWorked}
          emptyMessage="No successes identified this week."
          itemRenderer={(item) => (
            <>
              <div className="text-white/80 text-sm font-medium">{item.title}</div>
              <div className="text-white/40 text-xs mt-0.5">{item.description}</div>
              {item.metric && <div className="text-emerald-400/60 text-[10px] mt-1">{item.metric}</div>}
            </>
          )}
        />

        {/* What Didn't Work */}
        <NarrativeSection
          icon={XCircle}
          iconColor="text-red-400"
          title="What Didn't Work"
          items={whatDidntWork}
          emptyMessage="No failures identified this week."
          itemRenderer={(item) => (
            <>
              <div className="text-white/80 text-sm font-medium">{item.title}</div>
              <div className="text-white/40 text-xs mt-0.5">{item.description}</div>
              {item.metric && <div className="text-red-400/60 text-[10px] mt-1">{item.metric}</div>}
            </>
          )}
        />

        {/* What Should Change */}
        <NarrativeSection
          icon={Lightbulb}
          iconColor="text-amber-400"
          title="What Should Change"
          items={whatShouldChange}
          emptyMessage="No changes recommended this week."
          itemRenderer={(item) => (
            <>
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-sm font-medium">{item.title}</span>
                {item.priority && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-widest ${
                    item.priority === "critical" ? "bg-red-500/10 text-red-400" :
                    item.priority === "high" ? "bg-orange-500/10 text-orange-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>
                    {item.priority}
                  </span>
                )}
              </div>
              <div className="text-white/40 text-xs mt-0.5">{item.description}</div>
            </>
          )}
        />
      </div>

      {/* Automation Improvements */}
      {automationImprovements.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={12} className="text-amber-400" />
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Automation Improvements Required</h4>
          </div>
          <div className="space-y-2">
            {automationImprovements.map((imp, idx) => (
              <div key={idx} className="bg-amber-500/[0.03] border border-amber-500/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 text-sm font-medium">{imp.rule_name}</span>
                  <span className="text-amber-400 text-xs font-bold">Score: {imp.current_score}</span>
                </div>
                <div className="text-white/50 text-xs mb-1">{imp.issue}</div>
                <div className="text-amber-400/70 text-xs">→ {imp.recommendation}</div>
                {imp.expected_improvement && (
                  <div className="text-emerald-400/50 text-[10px] mt-1">Expected: {imp.expected_improvement}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NarrativeSection({ icon: Icon, iconColor, title, items, emptyMessage, itemRenderer }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className={iconColor} />
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest">{title}</h4>
      </div>
      {items.length === 0 ? (
        <p className="text-white/20 text-xs">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="border-l-2 border-white/5 pl-3">
              {itemRenderer(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}