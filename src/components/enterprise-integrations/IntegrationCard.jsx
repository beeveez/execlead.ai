import React from "react";
import { ShieldCheck, Lock, RefreshCw, Clock, Eye, Scale, CheckCircle2, AlertTriangle, Plug, Power, FileText } from "lucide-react";

const STATUS = {
  connected: { label: "Connected", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", dot: "bg-emerald-400" },
  available: { label: "Available", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25", dot: "bg-indigo-400" },
  custom_required: { label: "Custom Integration", color: "text-amber-400 bg-amber-500/10 border-amber-500/25", dot: "bg-amber-400" },
  disabled: { label: "Enterprise Disabled", color: "text-rose-400 bg-rose-500/10 border-rose-500/25", dot: "bg-rose-400" },
};

const CLASSIFICATION = {
  Public: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  Internal: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25",
  Confidential: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  Restricted: "text-rose-400 bg-rose-500/10 border-rose-500/25",
};

const PHASE = { phase_1: "Phase 1 · P0", phase_2: "Phase 2 · P1" };

export default function IntegrationCard({ item, onToggle }) {
  const status = STATUS[item.connection_status] || STATUS.available;
  const disabled = !item.enterprise_enabled;
  const cls = CLASSIFICATION[item.data_classification] || CLASSIFICATION.Confidential;
  const scopes = (item.oauth_scopes || "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className={`rounded-2xl border bg-white/[0.02] p-4 transition-colors ${disabled ? "border-rose-500/20 opacity-75" : "border-white/10"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${disabled ? "bg-rose-500/10" : "bg-white/5"}`}>
            <Plug size={16} className={disabled ? "text-rose-400" : "text-white/60"} />
          </div>
          <div>
            <div className="text-white text-sm font-semibold flex items-center gap-2">
              {item.display_name}
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 uppercase tracking-wide">{PHASE[item.phase]}</span>
            </div>
            <div className="text-[11px] text-white/45 capitalize">{item.category}</div>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full border font-semibold ${disabled ? STATUS.disabled.color : status.color}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${disabled ? "bg-rose-400" : status.dot}`} />
          {disabled ? "Enterprise Disabled" : status.label}
        </span>
      </div>

      {item.value_proposition && <p className="text-[11px] text-white/55 mb-3 leading-relaxed">{item.value_proposition}</p>}

      <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-white/35 font-semibold mb-0.5 flex items-center gap-1"><Lock size={9} /> Permission Scope</div>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {scopes.length ? scopes.map((s) => <span key={s} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/60 text-[10px]">{s}</span>) : <span className="text-white/35">Custom</span>}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-white/35 font-semibold mb-0.5 flex items-center gap-1"><Scale size={9} /> Data Classification</div>
          <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${cls}`}>{item.data_classification}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
        <Meta icon={ShieldCheck} label="Security Status" value={item.security_status?.replace("_", " ") || "—"} ok={item.security_status === "verified"} />
        <Meta icon={Eye} label="Scope Review" value={item.scope_review_status?.replace("_", " ") || "—"} ok={item.scope_review_status === "current"} />
        <Meta icon={RefreshCw} label="Last Sync" value={item.last_synchronized ? new Date(item.last_synchronized).toLocaleDateString() : "—"} />
        <Meta icon={Clock} label="Last Used" value={item.last_used_timestamp ? new Date(item.last_used_timestamp).toLocaleDateString() : "—"} />
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-white/8">
        <div className="flex items-center gap-3 text-[10px] text-white/45">
          <span className="flex items-center gap-1"><FileText size={10} /> Owner: {item.connection_owner || "Unassigned"}</span>
          {item.webhook_supported && <span className="flex items-center gap-1 text-emerald-400/70"><CheckCircle2 size={10} /> Webhooks</span>}
        </div>
        <button
          onClick={() => onToggle(item)}
          disabled={item.connection_status === "custom_required"}
          title={item.connection_status === "custom_required" ? "Custom integrations cannot be toggled until built" : "Enterprise disable / enable switch"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${item.connection_status === "custom_required" ? "text-white/25 cursor-not-allowed" : disabled ? "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/25" : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/25"}`}
        >
          <Power size={10} /> {disabled ? "Disabled" : "Enabled"}
        </button>
      </div>

      {item.compliance_tags && <div className="mt-2 text-[10px] text-white/40"><span className="font-semibold text-white/50">Compliance:</span> {item.compliance_tags}</div>}
      {item.least_privilege_notes && <div className="mt-1 text-[10px] text-white/35 flex items-start gap-1"><AlertTriangle size={10} className="mt-0.5 shrink-0" /> {item.least_privilege_notes}</div>}
    </div>
  );
}

function Meta({ icon: Icon, label, value, ok }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-white/35 font-semibold mb-0.5 flex items-center gap-1"><Icon size={9} /> {label}</div>
      <div className={`capitalize ${ok ? "text-emerald-400" : "text-white/65"}`}>{value}</div>
    </div>
  );
}