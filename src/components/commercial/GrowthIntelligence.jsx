import React, { useState } from "react";
import { TrendingUp, Target, ArrowUpCircle, Building2, Moon, AlertTriangle, Megaphone, ChevronRight } from "lucide-react";

const ICON_COLORS = { indigo: "text-indigo-400", emerald: "text-emerald-400", amber: "text-amber-400", rose: "text-rose-400", purple: "text-purple-400" };
const PRIORITY_COLORS = { high: "text-rose-400", medium: "text-amber-400", critical: "text-rose-400", low: "text-white/40" };

function ListCard({ title, icon: Icon, items, renderItem, color = "indigo" }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 3);
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${ICON_COLORS[color]}`} />
          <span className="text-sm font-semibold text-white/70">{title}</span>
        </div>
        <span className="text-xs text-white/40">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-white/30 py-4 text-center">None identified</p>
      ) : (
        <div className="space-y-2">
          {visible.map((item, i) => renderItem(item, i))}
          {items.length > 3 && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1">
              {expanded ? "Show less" : `Show ${items.length - 3} more`} <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function GrowthIntelligence({ growth }) {
  if (!growth) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white/70">Fastest Growing Segment</span>
          </div>
          <div className="text-lg font-bold text-white capitalize">{growth.fastestGrowingSegment?.segment || "N/A"}</div>
          <p className="text-xs text-white/40 mt-1">{growth.fastestGrowingSegment?.description}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white/70">Highest Converting Segment</span>
          </div>
          <div className="text-lg font-bold text-white capitalize">{growth.highestConvertingSegment?.segment || "N/A"}</div>
          <p className="text-xs text-white/40 mt-1">{growth.highestConvertingSegment?.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListCard title="Most Likely to Upgrade" icon={ArrowUpCircle} items={growth.likelyToUpgrade || []} color="emerald"
          renderItem={(u, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
              <div className="min-w-0">
                <div className="text-xs text-white/80 truncate">{u.name}</div>
                <div className="text-[10px] text-white/40 truncate">{u.reason}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-white/40 capitalize">{u.currentPlan} → {u.recommendedPlan}</span>
                <span className="text-xs font-bold text-emerald-400">{u.probability}%</span>
              </div>
            </div>
          )} />
        <ListCard title="Enterprise Opportunities" icon={Building2} items={growth.enterpriseOpportunities || []} color="amber"
          renderItem={(u, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
              <div className="min-w-0">
                <div className="text-xs text-white/80 truncate">{u.name}</div>
                <div className="text-[10px] text-white/40 truncate">{u.reason}</div>
              </div>
              <span className="text-[10px] text-amber-400 capitalize shrink-0">{u.currentPlan}</span>
            </div>
          )} />
        <ListCard title="Dormant Users (30+ days)" icon={Moon} items={growth.dormantUsers || []} color="rose"
          renderItem={(u, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
              <div className="text-xs text-white/80 truncate">{u.name}</div>
              <span className="text-xs text-rose-400 shrink-0">{u.daysInactive}d</span>
            </div>
          )} />
        <ListCard title="At-Risk Subscribers" icon={AlertTriangle} items={growth.atRiskSubscribers || []} color="rose"
          renderItem={(u, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
              <div className="min-w-0">
                <div className="text-xs text-white/80 truncate">{u.name}</div>
                <div className="text-[10px] text-white/40 capitalize">{u.plan} · {u.daysInactive}d inactive</div>
              </div>
              <span className={`text-[10px] font-medium capitalize ${PRIORITY_COLORS[u.riskLevel]}`}>{u.riskLevel}</span>
            </div>
          )} />
      </div>

      <ListCard title="Outreach Needed Today" icon={Megaphone} items={growth.outreachNeeded || []} color="indigo"
        renderItem={(u, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
            <div className="min-w-0">
              <div className="text-xs text-white/80 truncate">{u.name}</div>
              <div className="text-[10px] text-white/40 truncate">{u.reason}</div>
            </div>
            <span className={`text-[10px] font-medium capitalize ${PRIORITY_COLORS[u.priority]}`}>{u.priority}</span>
          </div>
        )} />
    </div>
  );
}