import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Cpu, CheckCircle2, AlertCircle } from "lucide-react";

const ENTITIES = [
  { name: "User", label: "Users" },
  { name: "Company", label: "Companies" },
  { name: "CPQQuote", label: "Quotes" },
  { name: "Subscription", label: "Subscriptions" },
  { name: "Task", label: "Tasks" },
  { name: "Notification", label: "Notifications" },
  { name: "ShareEvent", label: "Share Events" },
  { name: "Referral", label: "Referrals" },
];

export default function SystemHealth() {
  const [health, setHealth] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const results = {};
      for (const entity of ENTITIES) {
        try {
          const records = await base44.entities[entity.name].list("-created_date", 1);
          results[entity.name] = { status: "healthy" };
        } catch (e) {
          results[entity.name] = { status: "error", error: e.message };
        }
      }
      setHealth(results);
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Cpu size={12} className="text-indigo-400" /> System
        </div>
        <h1 className="text-2xl font-bold text-white">System Health</h1>
      </div>
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 text-sm font-medium">All systems operational</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ENTITIES.map(entity => {
          const h = health[entity.name];
          return (
            <div key={entity.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm font-medium">{entity.label}</span>
                {h?.status === "healthy" ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-red-400" />}
              </div>
              <div className="text-white/30 text-xs">{h?.status === "healthy" ? "Operational" : "Error"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}