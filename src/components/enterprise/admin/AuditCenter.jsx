import React, { useState, useEffect } from "react";
import { Shield, Loader2, Search, Download, FileText, AlertTriangle, Activity, Cpu } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const SOURCES = [
  { key: "subscription", label: "User & License", entity: "SubscriptionAuditLog", field: "user_id", typeField: "event_type", reasonField: "reason", tsField: "timestamp" },
  { key: "reputation", label: "Reputation", entity: "ReputationAuditLog", field: "user_id", typeField: "event_type", reasonField: "reason", tsField: "timestamp" },
  { key: "guardian", label: "Guardian™", entity: "GuardianActivity", field: "user_id", typeField: "activity_type", reasonField: "description", tsField: "created_date" },
  { key: "platform", label: "Platform Events", entity: "PlatformStateEvent", field: "user_id", typeField: "trigger", reasonField: "description", tsField: "created_date" },
];

export default function AuditCenter({ organization }) {
  const { toast } = useToast();
  const [source, setSource] = useState("subscription");
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, [source]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const src = SOURCES.find((s) => s.key === source);
      const recs = await base44.entities[src.entity].list("-" + (src.tsField || "created_date"), 200);
      setLogs(recs || []);
    } catch (e) {
      console.error("Audit load failed:", e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return JSON.stringify(l).toLowerCase().includes(q);
  });

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const src = SOURCES.find((s) => s.key === source);
    const headers = ["type", "reason", "user", "timestamp"];
    const rows = filtered.map((l) => [l[src.typeField], l[src.reasonField], l.user_name || l.user_id || "", l[src.tsField]]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${source}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export ready", description: `${filtered.length} records exported.` });
  };

  const src = SOURCES.find((s) => s.key === source);

  return (
    <div className="space-y-4">
      {/* Source tabs */}
      <div className="flex items-center gap-1 border-b border-white/5 overflow-x-auto">
        {SOURCES.map((s) => (
          <button key={s.key} onClick={() => setSource(s.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${source === s.key ? "border-indigo-500 text-white" : "border-transparent text-white/40 hover:text-white/70"}`}>
            <SourceIcon k={s.key} /> {s.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit logs..."
            className="w-full pl-9 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500" />
        </div>
        <button onClick={exportCSV} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm flex items-center gap-2 border border-white/10">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Logs */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {filtered.map((l) => (
              <div key={l.id} className="flex items-start gap-3 p-4 hover:bg-white/[0.02]">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <SourceIcon k={source} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white/80 text-sm font-medium capitalize">{(l[src.typeField] || "event").replace(/_/g, " ")}</span>
                    {l.source && <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/40 text-xs">{l.source}</span>}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5 truncate">{l[src.reasonField] || l.description || "—"}</p>
                  <div className="text-white/30 text-xs mt-1">{l.user_name || l.user_id || "system"}</div>
                </div>
                <div className="text-white/30 text-xs shrink-0">
                  {l[src.tsField] ? new Date(l[src.tsField]).toLocaleString() : ""}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center text-white/30 py-12">No audit records found.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function SourceIcon({ k }) {
  const map = {
    subscription: FileText, reputation: Shield, guardian: AlertTriangle, platform: Activity,
  };
  const Icon = map[k] || Cpu;
  return <Icon size={14} className="text-white/50" />;
}