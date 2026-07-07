import React, { useState, useMemo } from "react";
import { Search, ExternalLink } from "lucide-react";
import { ROUTE_REGISTRY } from "@/lib/routeRegistry";

const STATUS_COLOR = {
  live: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  beta: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  preview: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  deprecated: "text-red-400 bg-red-500/10 border-red-500/20",
  archived: "text-white/40 bg-white/5 border-white/10",
};

export default function RouteRegistryTable() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return ROUTE_REGISTRY.filter((r) => {
      if (filter === "public" && !r.public) return false;
      if (filter === "protected" && !r.permissionRaw) return false;
      if (filter === "deprecated" && !r.deprecated) return false;
      if (filter === "feature" && !r.feature) return false;
      if (!q) return true;
      const hay = `${r.name} ${r.url} ${r.component} ${r.feature || ""} ${r.plan} ${r.owner}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [q, filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search routes, components, features…" className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50" />
        </div>
        {["all", "public", "protected", "feature", "deprecated"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? "bg-indigo-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>{f}</button>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Component</th>
                <th className="px-4 py-3 font-medium">Feature</th>
                <th className="px-4 py-3 font-medium">Permission</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Ver</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.url + i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-white/80 text-xs">{r.url}</code>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/50"><ExternalLink size={11} /></a>
                    </div>
                    <div className="text-[10px] text-white/30 mt-0.5">{r.name}</div>
                  </td>
                  <td className="px-4 py-3"><code className="text-indigo-300 text-xs">{r.component}</code></td>
                  <td className="px-4 py-3 text-xs text-white/60">{r.feature || <span className="text-white/20">—</span>}</td>
                  <td className="px-4 py-3 text-xs text-white/50">{r.permission === "authenticated" ? <span className="text-white/30">auth</span> : <span className="text-purple-300">{r.permission}</span>}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">{r.plan}</span></td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLOR[r.status] || STATUS_COLOR.live}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-xs text-white/40">{r.owner}</td>
                  <td className="px-4 py-3 text-xs text-white/30">{r.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 text-xs text-white/30 border-t border-white/5">{filtered.length} of {ROUTE_REGISTRY.length} routes</div>
      </div>
    </div>
  );
}