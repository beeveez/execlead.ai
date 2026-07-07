import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FEEDBACK_TYPES, FEEDBACK_STATUSES, safeParse, getTypeMeta, getStatusMeta } from "@/lib/feedbackConfig";
import {
  Bug, Lightbulb, Rocket, AlertTriangle, Clock, TrendingUp,
  Loader2, ChevronRight, BarChart3,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function FeedbackAdmin({ onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await base44.entities.Feedback.list("-created_date", 200);
        setItems(results || []);
      } catch (e) { setItems([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>;
  }

  const open = items.filter(i => !["resolved", "closed", "rejected"].includes(i.status));
  const bugs = items.filter(i => i.type === "bug");
  const critical = items.filter(i => i.severity === "critical" && !["resolved", "closed"].includes(i.status));
  const features = items.filter(i => i.type === "feature");
  const ideas = items.filter(i => i.type === "idea");
  const enterprisePriority = items.filter(i => i.is_enterprise_priority && !["resolved", "closed"].includes(i.status));
  const resolved = items.filter(i => ["resolved", "closed"].includes(i.status));

  // Avg resolution time (hours)
  const resolutionTimes = resolved
    .map(i => {
      try { return (new Date(i.updated_date) - new Date(i.created_date)) / 3600000; } catch { return null; }
    })
    .filter(t => t !== null && t >= 0);
  const avgResolution = resolutionTimes.length > 0 ? (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length) : null;

  // Top requested features (by votes)
  const topFeatures = [...features].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 5);

  // Most affected categories
  const catCounts = {};
  items.forEach(i => { catCounts[i.category] = (catCounts[i.category] || 0) + 1; });
  const topCategories = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Status distribution (for pie)
  const statusData = FEEDBACK_STATUSES.map(s => ({ name: s.label, value: items.filter(i => i.status === s.id).length, color: s.color })).filter(d => d.value > 0);

  // Type distribution (for bar)
  const typeData = FEEDBACK_TYPES.map(t => ({ name: t.label, count: items.filter(i => i.type === t.id).length, color: t.color }));

  const stats = [
    { label: "Open Issues", value: open.length, icon: AlertTriangle, color: "#f59e0b" },
    { label: "Open Bugs", value: bugs.filter(b => !["resolved", "closed"].includes(b.status)).length, icon: Bug, color: "#ef4444" },
    { label: "Critical", value: critical.length, icon: AlertTriangle, color: "#dc2626" },
    { label: "Feature Requests", value: features.length, icon: Lightbulb, color: "#f59e0b" },
    { label: "Product Ideas", value: ideas.length, icon: Rocket, color: "#6366f1" },
    { label: "Enterprise P1", value: enterprisePriority.length, icon: AlertTriangle, color: "#f97316" },
    { label: "Resolved", value: resolved.length, icon: TrendingUp, color: "#10b981" },
    { label: "Avg Resolution", value: avgResolution !== null ? (avgResolution < 24 ? `${avgResolution.toFixed(1)}h` : `${(avgResolution / 24).toFixed(1)}d`) : "—", icon: Clock, color: "#06b6d4" },
  ];

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <s.icon size={16} style={{ color: s.color }} />
            <div className="text-2xl font-bold mt-2" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4 flex items-center gap-1"><BarChart3 size={12} /> By Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData}>
              <XAxis dataKey="name" tick={{ fill: "#ffffff40", fontSize: 9 }} axisLine={{ stroke: "#ffffff10" }} tickLine={false} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: "#ffffff40", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff10", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {typeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4 flex items-center gap-1"><BarChart3 size={12} /> Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff10", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusData.map((s, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] text-white/40">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} /> {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Top Features + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1"><TrendingUp size={12} /> Top Requested Features</h3>
          <div className="space-y-2">
            {topFeatures.length === 0 && <p className="text-xs text-white/30">No feature requests yet.</p>}
            {topFeatures.map((f, i) => (
              <div key={f.id} onClick={() => onSelect(f.id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <span className="text-xs text-white/30 w-4">{i + 1}</span>
                <span className="flex-1 text-sm text-white/70 truncate">{f.title}</span>
                <span className="text-xs text-indigo-400 font-medium">{f.votes || 0} 👍</span>
                <ChevronRight size={12} className="text-white/20" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1"><BarChart3 size={12} /> Most Affected Areas</h3>
          <div className="space-y-2">
            {topCategories.map(([cat, count], i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-white/70 w-32 truncate">{cat}</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500/50" style={{ width: `${(count / items.length) * 100}%` }} />
                </div>
                <span className="text-xs text-white/40 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Recent Submissions</h3>
        <div className="space-y-1.5">
          {items.slice(0, 8).map(item => {
            const tMeta = getTypeMeta(item.type);
            const sMeta = getStatusMeta(item.status);
            return (
              <div key={item.id} onClick={() => onSelect(item.id)} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <span className="text-lg">{tMeta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/70 truncate">{item.title}</div>
                  <div className="text-[10px] text-white/30">{item.feedback_id} · {item.category}</div>
                </div>
                {item.is_enterprise_priority && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/15 text-amber-400">P1</span>}
                <span className="px-2 py-0.5 rounded-full text-[9px] font-medium border" style={{ color: sMeta.color, background: `${sMeta.color}15`, borderColor: `${sMeta.color}30` }}>{sMeta.label}</span>
                <ChevronRight size={12} className="text-white/20" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}