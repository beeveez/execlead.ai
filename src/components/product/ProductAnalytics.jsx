import React from "react";
import { BarChart3 } from "lucide-react";
import SectionHeader from "@/components/product/SectionHeader";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { SENTIMENTS, formatHours } from "@/lib/productManagement";

const TOOLTIP = { background: "#0d0d14", border: "1px solid #ffffff10", borderRadius: 8, fontSize: 11 };
const AXIS = { fill: "#ffffff40", fontSize: 10 };

export default function ProductAnalytics({ pm }) {
  const a = pm.insights?.analytics || {};
  const trend = a.trend || [];
  const byCategory = a.byCategory || [];
  const byModule = a.byModule || [];
  const sentiments = a.sentimentDistribution || { positive: 0, neutral: 0, negative: 0, mixed: 0 };

  const sentimentData = Object.entries(sentiments).map(([name, value]) => {
    const meta = SENTIMENTS.find(s => s.id === name) || SENTIMENTS[1];
    return { name: meta.label, value, color: meta.color };
  }).filter(d => d.value > 0);

  return (
    <div>
      <SectionHeader icon={BarChart3} title="Product Analytics" description="Feedback distribution, trends, sentiment, and resolution metrics." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Feedback Trend */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Feedback Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="date" tick={AXIS} axisLine={{ stroke: "#ffffff10" }} tickLine={false} tickFormatter={d => d.slice(5)} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={false} name="Total" />
              <Line type="monotone" dataKey="bugs" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Bugs" />
              <Line type="monotone" dataKey="features" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Features" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">AI Sentiment Distribution</h3>
          {sentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45}>
                  {sentimentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-white/30 text-center py-12">Run AI analysis on feedback to see sentiment.</p>}
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {sentimentData.map((s, i) => <span key={i} className="flex items-center gap-1 text-[10px] text-white/40"><span className="w-2 h-2 rounded-full" style={{ background: s.color }} /> {s.name} ({s.value})</span>)}
          </div>
        </div>

        {/* By Category */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Feedback by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCategory.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
              <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={AXIS} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "#ffffff05" }} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Module */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Feedback by Module</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byModule.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
              <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={AXIS} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "#ffffff05" }} />
              <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resolution metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-2xl font-bold text-white">{formatHours(a.avgResolutionTimeHours)}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Avg Resolution Time</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-2xl font-bold text-white">{a.customerSatisfaction || 0}%</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Customer Satisfaction</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-2xl font-bold text-white">{trend.reduce((s, d) => s + d.bugs, 0)}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Bugs (30 days)</div>
        </div>
      </div>
    </div>
  );
}