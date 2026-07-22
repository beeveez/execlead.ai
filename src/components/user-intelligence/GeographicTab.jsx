import React from "react";
import { Globe, MapPin, TrendingUp, Building2 } from "lucide-react";
import { StatCard, SectionCard, DistributionTable, BarChartCard, COLORS, EmptyState } from "./shared";

export default function GeographicTab({ demo }) {
  if (!demo) return <EmptyState />;
  const countries = demo.countryDist?.filter((d) => d.value !== "Unknown") || [];
  const cities = demo.cityDist?.filter((d) => d.value !== "Unknown") || [];
  const maxCount = Math.max(...countries.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Globe} label="Total Countries" value={countries.length} color="#10b981" />
        <StatCard icon={MapPin} label="Total Cities" value={cities.length} color="#06b6d4" />
        <StatCard icon={TrendingUp} label="Top Country" value={countries[0]?.value || "—"} sub={`${countries[0]?.count || 0} users`} color="#6366f1" />
        <StatCard icon={Building2} label="Top City" value={cities[0]?.value || "—"} sub={`${cities[0]?.count || 0} users`} color="#f59e0b" />
      </div>

      {/* Geographic bar map — horizontal bars sized by user count */}
      <SectionCard title="Users by Country — Geographic Distribution" icon={Globe}>
        <div className="space-y-2">
          {countries.slice(0, 20).map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-32 text-xs text-white/60 truncate">{c.value}</div>
              <div className="flex-1 h-7 bg-white/5 rounded-md overflow-hidden relative">
                <div className="h-full rounded-md flex items-center pl-2 transition-all" style={{ width: `${(c.count / maxCount) * 100}%`, backgroundColor: COLORS[i % COLORS.length], minWidth: "40px" }}>
                  <span className="text-[10px] text-white font-medium">{c.count}</span>
                </div>
              </div>
              <div className="text-[10px] text-white/30 w-10 text-right">{((c.count / (countries.reduce((s, d) => s + d.count, 0) || 1)) * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Top Countries" icon={TrendingUp}>
          <BarChartCard data={countries.slice(0, 10)} height={280} />
        </SectionCard>
        <SectionCard title="Top Cities" icon={MapPin}>
          <DistributionTable data={cities} max={12} />
        </SectionCard>
      </div>
    </div>
  );
}