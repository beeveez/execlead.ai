import React from "react";
import { Check, Zap, HardDrive, Clock, Cpu, Headphones, UserCheck } from "lucide-react";

export default function PackageSelector({ packages, selectedId, onSelect, type = "ai" }) {
  const sorted = [...(packages || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {sorted.map(p => {
        const selected = selectedId === p.package_id;
        return (
          <button
            key={p.package_id}
            onClick={() => onSelect(selected ? null : p.package_id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selected ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/5 bg-white/[0.02] hover:border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm font-medium">{p.name}</span>
              {selected && <Check size={14} className="text-indigo-400" />}
            </div>
            <p className="text-white/30 text-xs mb-3 line-clamp-2">{p.description}</p>
            <div className="text-lg font-bold text-white">
              ${(p.annual_price || 0).toLocaleString()}
              <span className="text-xs text-white/30">{p.is_per_user !== false ? "/user/yr" : "/yr"}</span>
            </div>
            {type === "ai" && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-white/40"><Zap size={10} /> {p.monthly_requests === 0 ? "Unlimited" : p.monthly_requests.toLocaleString()} req/mo</div>
                <div className="flex items-center gap-1.5 text-xs text-white/40"><HardDrive size={10} /> {p.storage_gb}GB storage</div>
                {p.advanced_models && <div className="flex items-center gap-1.5 text-xs text-emerald-400"><Cpu size={10} /> Advanced models</div>}
                {p.priority_processing && <div className="flex items-center gap-1.5 text-xs text-emerald-400"><Clock size={10} /> Priority processing</div>}
              </div>
            )}
            {type === "support" && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-white/40"><Clock size={10} /> {p.response_sla_hours}hr SLA</div>
                {p.support_24x7 && <div className="flex items-center gap-1.5 text-xs text-emerald-400"><Headphones size={10} /> 24x7 support</div>}
                {p.dedicated_csm && <div className="flex items-center gap-1.5 text-xs text-emerald-400"><UserCheck size={10} /> Dedicated CSM</div>}
                {p.technical_account_manager && <div className="flex items-center gap-1.5 text-xs text-emerald-400"><UserCheck size={10} /> Technical Account Manager</div>}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}