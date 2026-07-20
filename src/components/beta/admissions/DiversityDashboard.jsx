import React, { useMemo } from "react";
import { computeDiversityMetrics } from "@/lib/admissionsIntelligenceEngine";
import { Globe, Users, Award, Briefcase, Target, Clock } from "lucide-react";

export default function DiversityDashboard({ records }) {
  const diversity = useMemo(() => computeDiversityMetrics(records), [records]);

  if (diversity.totalRecords === 0) {
    return (
      <div className="text-center py-12">
        <Globe size={28} className="text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/40">No diversity data yet. Data appears as applications are submitted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Globe size={14} className="text-amber-400" />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Executive Diversity Dashboard</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Countries" value={diversity.uniqueCountries} icon={Globe} />
        <SummaryCard label="Leadership Levels" value={diversity.uniqueLeadershipLevels} icon={Award} />
        <SummaryCard label="Team Sizes" value={diversity.teamSizes.length} icon={Users} />
        <SummaryCard label="Primary Goals" value={diversity.primaryGoals.length} icon={Target} />
      </div>

      {/* Breakdown panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BreakdownPanel title="Countries" icon={Globe} data={diversity.countries} />
        <BreakdownPanel title="Leadership Levels" icon={Award} data={diversity.leadershipLevels} />
        <BreakdownPanel title="Years of Experience" icon={Clock} data={diversity.yearsOfExperience} />
        <BreakdownPanel title="Company / Team Size" icon={Users} data={diversity.teamSizes} />
        <BreakdownPanel title="Primary Goals" icon={Target} data={diversity.primaryGoals} />
        <BreakdownPanel title="How They Heard" icon={Briefcase} data={diversity.howHeard || []} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <Icon size={14} className="text-indigo-400" />
      <div className="text-lg font-bold text-white mt-1">{value}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function BreakdownPanel({ title, icon: Icon, data = [] }) {
  const max = data.length > 0 ? data[0][1] : 1;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-indigo-400" />
        <h4 className="text-xs font-semibold text-white/70">{title}</h4>
      </div>
      {data.length === 0 ? (
        <p className="text-[11px] text-white/30 text-center py-4">No data</p>
      ) : (
        <div className="space-y-1.5">
          {data.slice(0, 8).map(([label, count]) => (
            <div key={label} className="flex items-center gap-2 text-[11px]">
              <span className="text-white/50 w-28 truncate capitalize">{label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${(count / max) * 100}%` }} />
              </div>
              <span className="text-white/40 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}