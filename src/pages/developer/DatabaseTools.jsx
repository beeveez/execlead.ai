import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Database, Loader2 } from "lucide-react";

const ENTITIES = ["User", "Company", "CPQQuote", "Subscription", "Task", "Notification", "UserProfile", "Referral", "ShareEvent", "CompanyAuditLog"];

export default function DatabaseTools() {
  const [selected, setSelected] = useState("User");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    base44.entities[selected].list("-created_date", 20)
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Database size={12} className="text-indigo-400" /> System
        </div>
        <h1 className="text-2xl font-bold text-white">Database Tools</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {ENTITIES.map(name => (
          <button key={name} onClick={() => setSelected(name)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selected === name ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40 hover:text-white/60"}`}>
            {name}
          </button>
        ))}
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-white/30 text-sm">No records found</div>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <pre className="p-4 text-xs text-white/50 font-mono">{JSON.stringify(records, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}