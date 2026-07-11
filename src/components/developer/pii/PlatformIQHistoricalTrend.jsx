import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const RANGES = [
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "week", label: "Week", days: 7 },
  { id: "month", label: "Month", days: 30 },
  { id: "quarter", label: "Quarter", days: 90 },
  { id: "all", label: "All Time", days: null },
];

function formatLabel(date, rangeId) {
  const d = new Date(date);
  if (rangeId === "all" || rangeId === "quarter")
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[#0d0d14] border border-white/10 rounded-lg p-2 text-xs">
      <div className="text-white/50 mb-0.5">
        {p.label === "Now" ? "Now" : new Date(p.date).toLocaleString()}
      </div>
      <div className="text-white font-bold">PIQ: {p.score}</div>
    </div>
  );
}

export default function PlatformIQHistoricalTrend({ currentScore }) {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selected = RANGES.find((r) => r.id === range);
    let cancelled = false;
    const fetchTrend = async () => {
      setLoading(true);
      try {
        const events = await base44.entities.PlatformStateEvent.list("-created_date", 500);
        let filtered = [...events];
        if (selected.days) {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - selected.days);
          filtered = filtered.filter((e) => new Date(e.created_date) >= cutoff);
        }
        filtered.reverse();
        const chartData = filtered.map((e) => ({
          date: new Date(e.created_date),
          score: e.health || 0,
          label: formatLabel(e.created_date, range),
        }));
        chartData.push({ date: new Date(), score: currentScore, label: "Now" });
        if (!cancelled) setData(chartData);
      } catch (err) {
        if (!cancelled) setData([{ date: new Date(), score: currentScore, label: "Now" }]);
      }
      if (!cancelled) setLoading(false);
    };
    fetchTrend();
    return () => { cancelled = true; };
  }, [range, currentScore]);

  const firstScore = data.length > 1 ? data[0].score : currentScore;
  const delta = currentScore - firstScore;
  const deltaUp = delta >= 0;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Historical Trend — Platform IQ™</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-white">{currentScore}</span>
            {data.length > 1 && (
              <span className={`flex items-center gap-0.5 text-sm font-medium ${deltaUp ? "text-emerald-400" : "text-red-400"}`}>
                {deltaUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {deltaUp ? "+" : ""}{delta}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                range === r.id
                  ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300"
                  : "bg-white/[0.02] border border-white/5 text-white/50 hover:text-white/70"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[240px]">
          <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="piqGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="url(#piqGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}