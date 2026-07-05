import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Cpu, DollarSign, Zap, TrendingUp, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { useSubscription } from "@/lib/SubscriptionContext";

const MODULE_LABELS = {
  coach: "AI Coach", simulator: "Simulator", challenge: "Challenge", debate: "Debate",
  academy: "Academy", companies: "Companies", career: "Career Advisor", metrics: "Metrics", other: "Other",
};

export default function AIUsage() {
  const { subscription } = useSubscription();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.UsageLog.list("-created_date", 500);
        setLogs(data);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  const today = new Date().toISOString().split("T")[0];
  const thisMonth = new Date().toISOString().slice(0, 7);

  const todayLogs = logs.filter(l => l.created_date?.startsWith(today));
  const monthLogs = logs.filter(l => l.created_date?.startsWith(thisMonth));

  const todayTokens = todayLogs.reduce((a, l) => a + (l.tokens_estimated || 0), 0);
  const monthTokens = monthLogs.reduce((a, l) => a + (l.tokens_estimated || 0), 0);
  const monthCost = monthLogs.reduce((a, l) => a + (l.cost_estimated || 0), 0);

  // By module
  const byModule = {};
  logs.forEach(l => { byModule[l.module] = (byModule[l.module] || 0) + 1; });
  const moduleData = Object.entries(byModule).map(([k, v]) => ({ module: MODULE_LABELS[k] || k, requests: v }));

  // Daily trend (last 14 days)
  const dailyData = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    const dayLogs = logs.filter(l => l.created_date?.startsWith(ds));
    dailyData.push({
      date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      tokens: dayLogs.reduce((a, l) => a + (l.tokens_estimated || 0), 0),
    });
  }

  const stats = [
    { label: "Today's Tokens", value: todayTokens.toLocaleString(), icon: Zap, color: "text-yellow-400" },
    { label: "Monthly Tokens", value: monthTokens.toLocaleString(), icon: TrendingUp, color: "text-cyan-400" },
    { label: "Estimated Cost", value: `$${monthCost.toFixed(4)}`, icon: DollarSign, color: "text-emerald-400" },
    { label: "Total Requests", value: logs.length, icon: Cpu, color: "text-indigo-400" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Cpu size={12} className="text-indigo-400" /> AI Cost Management
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">AI Usage Dashboard</h1>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-xs font-medium" style={{ color: subscription.color }}>
            <span>{subscription.icon}</span> {subscription.planName}
          </span>
        </div>
        <p className="text-white/40 text-sm mt-1">Track token consumption and estimated costs across modules</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <s.icon size={18} className={s.color} />
            <div className="text-2xl font-bold text-white mt-2">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {logs.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Cpu size={32} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/40 text-sm font-medium">No AI usage yet</p>
          <p className="text-white/20 text-xs mt-1">Usage data will appear here as you interact with AI features</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Requests by Module</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={moduleData}>
                <XAxis dataKey="module" tick={{ fill: "#ffffff40", fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#ffffff40", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff20", borderRadius: 8 }} />
                <Bar dataKey="requests" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Daily Token Usage (14 days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" tick={{ fill: "#ffffff40", fontSize: 10 }} />
                <YAxis tick={{ fill: "#ffffff40", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid #ffffff20", borderRadius: 8 }} />
                <Line type="monotone" dataKey="tokens" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}